import { NextRequest, NextResponse } from 'next/server';
import type { 
  ArchitectRequest,
  ArchitectResponse,
  ExecutorRequest,
  ExecutorResponse,
  ExecutorInstruction,
  DualAgentState,
  SystemHealth
} from '@/types/dual-agent';
import { appConfig } from '@/config/app.config';

// Orchestrator manages the flow between architect and executor
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { 
      userMessage, 
      mode = 'auto', // 'auto', 'architect-only', 'executor-only'
      dryRun = false,
      streamResponse = false 
    } = await request.json();
    
    if (!userMessage) {
      return NextResponse.json({
        error: 'Message utilisateur requis'
      }, { status: 400 });
    }

    console.log('[orchestrator] Processing request in mode:', mode);
    
    // Initialize response tracking
    const orchestratorResponse = {
      sessionId: `session-${Date.now()}`,
      mode,
      phases: [] as any[],
      totalTime: 0,
      success: false,
      results: {
        filesCreated: [] as string[],
        filesModified: [] as string[],
        packagesInstalled: [] as string[],
      },
    };

    // Phase 1: Architect Analysis (if not executor-only)
    if (mode !== 'executor-only') {
      console.log('[orchestrator] Phase 1: Architect analysis');
      
      const architectStartTime = Date.now();
      
      try {
        // Call architect API
        const architectRequest: ArchitectRequest = {
          userMessage,
          context: {
            recentChanges: global.existingFiles ? Array.from(global.existingFiles) : [],
            currentFocus: global.conversationState?.context?.messages?.slice(-1)[0]?.metadata?.editType,
          },
        };
        
        const architectResponse = await fetch(
          `${request.nextUrl.origin}/api/dual-agent-architect`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(architectRequest),
          }
        );
        
        if (!architectResponse.ok) {
          throw new Error(`Architect failed: ${architectResponse.statusText}`);
        }
        
        const architectData: ArchitectResponse = await architectResponse.json();
        
        orchestratorResponse.phases.push({
          phase: 'architect',
          duration: Date.now() - architectStartTime,
          message: architectData.architectMessage,
          instructionCount: architectData.instructions.length,
          estimatedTime: architectData.estimatedTime,
        });
        
        // If architect-only mode or dry run, return here
        if (mode === 'architect-only' || dryRun) {
          orchestratorResponse.success = true;
          orchestratorResponse.totalTime = Date.now() - startTime;
          
          return NextResponse.json({
            ...orchestratorResponse,
            architectInstructions: architectData.instructions,
            message: architectData.architectMessage,
          });
        }
        
        // Phase 2: Execute Instructions
        console.log('[orchestrator] Phase 2: Executing instructions');
        
        const executionResults = [];
        
        for (const instruction of architectData.instructions) {
          const execStartTime = Date.now();
          
          console.log(`[orchestrator] Executing instruction ${instruction.id}`);
          
          try {
            // Call executor API
            const executorRequest: ExecutorRequest = {
              instruction,
              sandboxId: global.activeSandbox?.sandboxId,
              dryRun: false,
            };
            
            const executorResponse = await fetch(
              `${request.nextUrl.origin}/api/dual-agent-executor`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(executorRequest),
              }
            );
            
            if (!executorResponse.ok) {
              console.error(`[orchestrator] Executor failed for instruction ${instruction.id}`);
              executionResults.push({
                instructionId: instruction.id,
                status: 'failed',
                duration: Date.now() - execStartTime,
                error: `Executor failed: ${executorResponse.statusText}`,
              });
              continue;
            }
            
            const executorData: ExecutorResponse = await executorResponse.json();
            
            executionResults.push({
              instructionId: instruction.id,
              status: executorData.report.status,
              duration: Date.now() - execStartTime,
              filesModified: executorData.report.results.filesModified,
              packagesInstalled: executorData.report.results.packagesInstalled,
              metrics: executorData.report.metrics,
            });
            
            // Update orchestrator results
            if (executorData.report.results.filesModified) {
              orchestratorResponse.results.filesModified.push(
                ...executorData.report.results.filesModified.map(f => f.path)
              );
            }
            if (executorData.report.results.packagesInstalled) {
              orchestratorResponse.results.packagesInstalled.push(
                ...executorData.report.results.packagesInstalled
              );
            }
            
            // If streaming, send intermediate update
            if (streamResponse) {
              // In a real implementation, this would use Server-Sent Events or WebSockets
              console.log('[orchestrator] Streaming update:', {
                instructionId: instruction.id,
                status: executorData.report.status,
              });
            }
            
          } catch (error) {
            console.error(`[orchestrator] Error executing instruction ${instruction.id}:`, error);
            executionResults.push({
              instructionId: instruction.id,
              status: 'failed',
              duration: Date.now() - execStartTime,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }
        
        orchestratorResponse.phases.push({
          phase: 'execution',
          duration: Date.now() - architectStartTime - orchestratorResponse.phases[0].duration,
          executionResults,
          successRate: executionResults.filter(r => r.status === 'success').length / executionResults.length,
        });
        
      } catch (error) {
        console.error('[orchestrator] Architect phase failed:', error);
        orchestratorResponse.phases.push({
          phase: 'architect',
          duration: Date.now() - architectStartTime,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        
        // Fallback to single agent if configured
        if (appConfig.ai.dualAgent.fallback.enabled && appConfig.ai.dualAgent.fallback.triggerOnArchitectError) {
          console.log('[orchestrator] Falling back to single agent mode');
          return fallbackToSingleAgent(userMessage, request);
        }
        
        throw error;
      }
    }
    
    // Phase 3: Validation and Cleanup
    console.log('[orchestrator] Phase 3: Validation');
    
    const validationStartTime = Date.now();
    
    // Check if sandbox needs refresh
    if (global.activeSandbox && orchestratorResponse.results.filesModified.length > 0) {
      // Trigger iframe refresh
      console.log('[orchestrator] Triggering sandbox refresh');
      
      // In a real implementation, this would notify the frontend
      orchestratorResponse.phases.push({
        phase: 'validation',
        duration: Date.now() - validationStartTime,
        sandboxRefreshed: true,
      });
    }
    
    // Calculate final metrics
    orchestratorResponse.totalTime = Date.now() - startTime;
    orchestratorResponse.success = orchestratorResponse.phases.every(p => !p.error);
    
    // Build final message
    const finalMessage = buildFinalMessage(orchestratorResponse);
    
    return NextResponse.json({
      ...orchestratorResponse,
      message: finalMessage,
    });
    
  } catch (error) {
    console.error('[orchestrator] Fatal error:', error);
    
    return NextResponse.json({
      error: 'Orchestration failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
    }, { status: 500 });
  }
}

// GET endpoint for system health
export async function GET(request: NextRequest) {
  const healthData: SystemHealth = {
    architects: {
      active: true,
      lastResponse: global.architectDocumentation ? Date.now() : 0,
      queueLength: 0,
      averageResponseTime: 2000, // Mock value
    },
    executors: {
      active: true,
      currentTask: global.executorCurrentTask?.id,
      tasksCompleted: global.executorResetCount || 0,
      errorRate: global.executorErrorCount ? global.executorErrorCount / 10 : 0,
    },
    overall: {
      status: 'healthy',
      uptime: process.uptime() * 1000,
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
    },
  };
  
  // Check API quota if available
  if (process.env.ANTHROPIC_API_KEY) {
    // In a real implementation, this would check actual API usage
    healthData.overall.apiQuota = {
      used: 1000, // Mock value
      limit: 10000, // Mock value
    };
  }
  
  return NextResponse.json(healthData);
}

// Fallback to single agent mode
async function fallbackToSingleAgent(userMessage: string, request: NextRequest): Promise<NextResponse> {
  console.log('[orchestrator] Using fallback single agent');
  
  try {
    // Use the existing generate-ai-code-stream endpoint
    const response = await fetch(
      `${request.nextUrl.origin}/api/generate-ai-code-stream`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          model: appConfig.ai.dualAgent.fallback.singleAgentModel,
          isEdit: !!global.existingFiles?.size,
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Fallback failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      mode: 'fallback',
      success: true,
      message: 'Traité en mode agent unique (fallback)',
      results: data,
    });
    
  } catch (error) {
    console.error('[orchestrator] Fallback failed:', error);
    throw error;
  }
}

// Build final user message
function buildFinalMessage(response: any): string {
  const executionPhase = response.phases.find((p: any) => p.phase === 'execution');
  
  if (!executionPhase) {
    return 'Analyse architecturale complétée. Prêt pour l\'exécution.';
  }
  
  const successCount = executionPhase.executionResults.filter((r: any) => r.status === 'success').length;
  const totalCount = executionPhase.executionResults.length;
  
  if (successCount === totalCount) {
    return `✅ Toutes les ${totalCount} instructions ont été exécutées avec succès. ${response.results.filesModified.length} fichiers modifiés.`;
  } else if (successCount > 0) {
    return `⚠️ ${successCount}/${totalCount} instructions exécutées. Certaines ont échoué, vérifiez les détails.`;
  } else {
    return `❌ Échec de l'exécution. Aucune instruction n'a pu être complétée.`;
  }
}