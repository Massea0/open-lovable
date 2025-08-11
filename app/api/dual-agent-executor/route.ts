import { NextRequest, NextResponse } from 'next/server';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText, streamText } from 'ai';
import type { 
  ExecutorRequest, 
  ExecutorResponse, 
  ExecutorReport,
  ExecutorInstruction,
  TaskMetrics 
} from '@/types/dual-agent';
import { appConfig } from '@/config/app.config';

// Initialize Anthropic client for Claude 3.5 Sonnet
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1',
});

// Global state for executor
declare global {
  var executorResetCount: number;
  var executorLastReset: number;
  var executorErrorCount: number;
  var executorCurrentTask: ExecutorInstruction | null;
}

// Initialize executor state
if (!global.executorResetCount) global.executorResetCount = 0;
if (!global.executorErrorCount) global.executorErrorCount = 0;

// Reset executor if needed
function shouldResetExecutor(): boolean {
  const config = appConfig.ai.dualAgent.executor;
  
  if (!config.autoReset) return false;
  
  // Reset if too many consecutive errors
  if (global.executorErrorCount >= config.resetThreshold) {
    console.log('[executor] Resetting due to error threshold');
    return true;
  }
  
  return false;
}

// Reset executor state
function resetExecutor(): void {
  global.executorResetCount++;
  global.executorLastReset = Date.now();
  global.executorErrorCount = 0;
  global.executorCurrentTask = null;
  console.log(`[executor] Reset #${global.executorResetCount} completed`);
}

// Generate executor system prompt
function getExecutorSystemPrompt(instruction: ExecutorInstruction): string {
  const targetFiles = instruction.context.targetFiles.join(', ') || 'Non spécifiés';
  const constraints = instruction.context.constraints?.join('\n') || 'Aucune';
  
  return `# 🔧 VOUS ÊTES CLAUDE 3.5 SONNET - L'EXÉCUTANT TECHNIQUE

## VOTRE MISSION
Vous êtes l'exécutant technique qui reçoit des instructions précises de l'architecte (Claude Opus). 
Votre rôle est d'implémenter EXACTEMENT ce qui est demandé, sans interprétation ni ajout.

## INSTRUCTION ACTUELLE
${instruction.instructions.join('\n')}

## CONTEXTE TECHNIQUE
- Fichiers cibles: ${targetFiles}
- Priorité: ${instruction.priority}
- Temps estimé: ${instruction.metadata.estimatedTime}ms
${instruction.context.searchPatterns ? `- Patterns à rechercher: ${instruction.context.searchPatterns.join(', ')}` : ''}
${instruction.context.dependencies ? `- Dépendances requises: ${instruction.context.dependencies.join(', ')}` : ''}

## CONTRAINTES
${constraints}

## CRITÈRES DE VALIDATION
${instruction.validation.expectedChanges.join('\n')}

## RÈGLES D'EXÉCUTION STRICTES

1. **SUIVRE L'INSTRUCTION À LA LETTRE**
   - Pas d'interprétation créative
   - Pas d'ajout de fonctionnalités
   - Pas d'optimisation non demandée

2. **GÉNÉRER DU CODE PROPRE**
   - Syntaxe correcte et moderne
   - Conventions React/Vite standards
   - Tailwind CSS classes uniquement

3. **STRUCTURE DE RÉPONSE**
   - Commencer par <EXPLANATION> pour expliquer l'approche
   - Puis <FILE path="..."> pour chaque fichier
   - Terminer par <PACKAGES> si des dépendances sont nécessaires

4. **GESTION DES ERREURS**
   - Si instruction ambiguë: implémenter la version la plus simple
   - Si fichier introuvable: le créer
   - Si conflit: privilégier la cohérence existante

## FORMAT DE SORTIE ATTENDU

<EXPLANATION>
Brève explication de ce qui va être fait (2-3 phrases max)
</EXPLANATION>

<FILE path="src/components/Example.jsx">
// Code complet du fichier
</FILE>

<PACKAGES>
package1 package2
</PACKAGES>

<VALIDATION>
- Point de validation 1 ✓
- Point de validation 2 ✓
</VALIDATION>

IMPORTANT: 
- Répondez UNIQUEMENT avec le format ci-dessus
- Pas de markdown, pas de commentaires additionnels
- Code immédiatement exécutable`;
}

// Parse executor output
function parseExecutorOutput(output: string): {
  explanation: string;
  files: Array<{ path: string; content: string }>;
  packages: string[];
  validation: string[];
} {
  const result = {
    explanation: '',
    files: [] as Array<{ path: string; content: string }>,
    packages: [] as string[],
    validation: [] as string[],
  };

  // Extract explanation
  const explanationMatch = output.match(/<EXPLANATION>([\s\S]*?)<\/EXPLANATION>/);
  if (explanationMatch) {
    result.explanation = explanationMatch[1].trim();
  }

  // Extract files
  const fileMatches = output.matchAll(/<FILE path="([^"]+)">([\s\S]*?)<\/FILE>/g);
  for (const match of fileMatches) {
    result.files.push({
      path: match[1],
      content: match[2].trim(),
    });
  }

  // Extract packages
  const packagesMatch = output.match(/<PACKAGES>([\s\S]*?)<\/PACKAGES>/);
  if (packagesMatch) {
    result.packages = packagesMatch[1].trim().split(/\s+/).filter(Boolean);
  }

  // Extract validation
  const validationMatch = output.match(/<VALIDATION>([\s\S]*?)<\/VALIDATION>/);
  if (validationMatch) {
    result.validation = validationMatch[1]
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-'))
      .map(line => line.substring(1).trim());
  }

  return result;
}

// Calculate task metrics
function calculateMetrics(
  startTime: number,
  parsed: ReturnType<typeof parseExecutorOutput>
): TaskMetrics {
  const executionTime = Date.now() - startTime;
  
  // Calculate lines changed (approximate)
  const linesChanged = parsed.files.reduce((total, file) => {
    return total + file.content.split('\n').length;
  }, 0);

  return {
    executionTime,
    linesChanged,
    filesAffected: parsed.files.length,
    codeQuality: {
      complexity: linesChanged > 500 ? 3 : linesChanged > 200 ? 2 : 1,
      maintainability: parsed.explanation ? 8 : 5,
    },
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { instruction, sandboxId, dryRun = false }: ExecutorRequest = await request.json();
    
    if (!instruction) {
      return NextResponse.json({
        error: 'Instruction requise'
      }, { status: 400 });
    }

    // Check if executor needs reset
    if (shouldResetExecutor()) {
      resetExecutor();
    }

    // Set current task
    global.executorCurrentTask = instruction;
    
    console.log('[executor] Executing instruction:', instruction.id);
    console.log('[executor] Target files:', instruction.context.targetFiles);

    // Generate code based on instruction
    const response = await generateText({
      model: anthropic(appConfig.ai.dualAgent.executor.model),
      temperature: appConfig.ai.dualAgent.executor.temperature,
      maxTokens: appConfig.ai.dualAgent.executor.maxTokens,
      messages: [
        {
          role: 'system',
          content: getExecutorSystemPrompt(instruction),
        },
        {
          role: 'user',
          content: 'Exécutez l\'instruction fournie. Générez le code nécessaire.',
        },
      ],
    });

    // Parse the output
    const parsed = parseExecutorOutput(response.text);
    
    if (parsed.files.length === 0) {
      global.executorErrorCount++;
      
      return NextResponse.json({
        error: 'No files generated',
        rawResponse: response.text
      }, { status: 500 });
    }

    // Calculate metrics
    const metrics = calculateMetrics(startTime, parsed);

    // Build executor report
    const report: ExecutorReport = {
      instructionId: instruction.id,
      timestamp: Date.now(),
      status: 'success',
      results: {
        filesModified: parsed.files.map(f => ({
          path: f.path,
          changes: f.content.split('\n').length,
        })),
        packagesInstalled: parsed.packages,
      },
      metrics,
      feedback: {
        discoveredPatterns: [],
      },
    };

    // Reset error count on success
    global.executorErrorCount = 0;

    // If dry run, don't apply to sandbox
    if (dryRun) {
      console.log('[executor] Dry run completed');
      return NextResponse.json({
        report,
        codeGenerated: response.text,
        nextSteps: ['Review generated code', 'Apply to sandbox if satisfied'],
      });
    }

    // Apply to sandbox if provided
    if (sandboxId && global.activeSandbox) {
      console.log('[executor] Applying to sandbox:', sandboxId);
      
      try {
        // Write files to sandbox
        for (const file of parsed.files) {
          await global.activeSandbox.files.write(file.path, file.content);
          console.log(`[executor] Wrote file: ${file.path}`);
        }

        // Install packages if needed
        if (parsed.packages.length > 0) {
          const installCmd = `npm install ${parsed.packages.join(' ')} --legacy-peer-deps`;
          const result = await global.activeSandbox.commands.run(installCmd);
          console.log('[executor] Package installation:', result.exitCode === 0 ? 'success' : 'failed');
          
          if (result.exitCode !== 0) {
            report.issues = [{
              type: 'warning',
              message: `Package installation failed: ${result.stderr}`,
            }];
            report.status = 'partial';
          }
        }
      } catch (error) {
        console.error('[executor] Sandbox application failed:', error);
        report.status = 'partial';
        report.issues = [{
          type: 'error',
          message: `Sandbox error: ${error instanceof Error ? error.message : 'Unknown'}`,
        }];
      }
    }

    // Build response
    const executorResponse: ExecutorResponse = {
      report,
      codeGenerated: response.text,
      nextSteps: parsed.validation.filter(v => !v.includes('✓')),
    };

    return NextResponse.json(executorResponse);

  } catch (error) {
    global.executorErrorCount++;
    console.error('[executor] Error:', error);
    
    // Build error report
    const errorReport: ExecutorReport = {
      instructionId: global.executorCurrentTask?.id || 'unknown',
      timestamp: Date.now(),
      status: 'failed',
      results: {
        filesModified: [],
      },
      issues: [{
        type: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }],
      metrics: {
        executionTime: Date.now() - startTime,
        linesChanged: 0,
        filesAffected: 0,
      },
    };

    return NextResponse.json({
      report: errorReport,
      error: 'Execution failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// GET endpoint for executor status
export async function GET() {
  return NextResponse.json({
    status: 'active',
    currentTask: global.executorCurrentTask?.id || null,
    resetCount: global.executorResetCount,
    lastReset: global.executorLastReset || null,
    errorCount: global.executorErrorCount,
    config: {
      model: appConfig.ai.dualAgent.executor.model,
      autoReset: appConfig.ai.dualAgent.executor.autoReset,
      resetThreshold: appConfig.ai.dualAgent.executor.resetThreshold,
    },
  });
}