import { NextRequest, NextResponse } from 'next/server';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import type { 
  ArchitectRequest, 
  ArchitectResponse, 
  ArchitectDocumentation,
  ExecutorInstruction,
  DualAgentState 
} from '@/types/dual-agent';
import { appConfig } from '@/config/app.config';
import fs from 'fs/promises';
import path from 'path';

// Initialize Anthropic client for Claude Opus
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1',
});

// Global state for architect documentation
declare global {
  var architectState: DualAgentState | null;
  var architectDocumentation: ArchitectDocumentation | null;
}

// Initialize or load architect documentation
async function loadArchitectDocumentation(): Promise<ArchitectDocumentation> {
  if (global.architectDocumentation) {
    return global.architectDocumentation;
  }

  const docPath = path.join(process.cwd(), appConfig.ai.dualAgent.architect.documentationPath);
  
  try {
    const docFile = path.join(docPath, 'documentation.json');
    const data = await fs.readFile(docFile, 'utf-8');
    global.architectDocumentation = JSON.parse(data);
    return global.architectDocumentation!;
  } catch (error) {
    // Initialize new documentation
    global.architectDocumentation = {
      projectOverview: {
        vision: '',
        objectives: [],
        constraints: [],
        techStack: ['React', 'Vite', 'Tailwind CSS'],
        lastUpdated: Date.now(),
      },
      architecturalDecisions: [],
      componentRegistry: new Map(),
      taskHistory: [],
      knowledgeBase: {
        patterns: new Map(),
        antiPatterns: new Map(),
        optimizations: new Map(),
      },
    };
    return global.architectDocumentation;
  }
}

// Save architect documentation
async function saveArchitectDocumentation(doc: ArchitectDocumentation): Promise<void> {
  if (!appConfig.ai.dualAgent.architect.persistDocumentation) return;

  const docPath = path.join(process.cwd(), appConfig.ai.dualAgent.architect.documentationPath);
  
  try {
    await fs.mkdir(docPath, { recursive: true });
    const docFile = path.join(docPath, 'documentation.json');
    
    // Convert Maps to objects for JSON serialization
    const serializable = {
      ...doc,
      componentRegistry: Object.fromEntries(doc.componentRegistry),
      knowledgeBase: {
        patterns: Object.fromEntries(doc.knowledgeBase.patterns),
        antiPatterns: Object.fromEntries(doc.knowledgeBase.antiPatterns),
        optimizations: Object.fromEntries(doc.knowledgeBase.optimizations),
      },
    };
    
    await fs.writeFile(docFile, JSON.stringify(serializable, null, 2));
  } catch (error) {
    console.error('[architect] Failed to save documentation:', error);
  }
}

// Generate architect system prompt
function getArchitectSystemPrompt(documentation: ArchitectDocumentation): string {
  const recentTasks = documentation.taskHistory.slice(-5);
  const knownPatterns = Array.from(documentation.knowledgeBase.patterns.entries());
  const antiPatterns = Array.from(documentation.knowledgeBase.antiPatterns.entries());

  return `# 🏛️ VOUS ÊTES CLAUDE OPUS - L'ARCHITECTE PRINCIPAL

## VOTRE RÔLE
Vous êtes l'architecte en chef d'un système de développement web. Votre responsabilité est d'analyser les requêtes utilisateur, maintenir la vision architecturale, et donner des instructions ULTRA-PRÉCISES à votre exécutant (Claude 3.5 Sonnet).

## DOCUMENTATION ACTUELLE DU PROJET
${documentation.projectOverview.vision ? `Vision: ${documentation.projectOverview.vision}` : ''}
Tech Stack: ${documentation.projectOverview.techStack.join(', ')}
${documentation.architecturalDecisions.length > 0 ? `
Décisions Architecturales Récentes:
${documentation.architecturalDecisions.slice(-3).map(d => `- ${d.decision}: ${d.rationale}`).join('\n')}
` : ''}

## HISTORIQUE DES TÂCHES RÉCENTES
${recentTasks.map(t => `- ${t.request} → ${t.result} (${t.metrics.executionTime}ms)`).join('\n') || 'Aucune tâche précédente'}

## PATTERNS DÉCOUVERTS
${knownPatterns.map(([k, v]) => `- ${k}: ${v}`).join('\n') || 'Aucun pattern encore'}

## ANTI-PATTERNS À ÉVITER
${antiPatterns.map(([k, v]) => `- ${k}: ${v}`).join('\n') || 'Aucun anti-pattern détecté'}

## PROTOCOLE DE RÉPONSE OBLIGATOIRE

Pour CHAQUE requête utilisateur, vous devez:

1. **ANALYSER** (1-2 phrases)
   - Identifier l'intention exacte
   - Évaluer la complexité (simple/modérée/complexe)
   - Déterminer les composants impactés

2. **DÉCOMPOSER** en instructions atomiques
   - Maximum 5 instructions par tâche
   - Chaque instruction = 1 action précise
   - Ordre logique d'exécution

3. **FORMULER** des instructions chirurgicales
   Format EXACT pour chaque instruction:
   - QUOI: L'action spécifique (ex: "Ajouter un bouton")
   - OÙ: Le fichier et la localisation exacte
   - COMMENT: La méthode technique précise
   - VALIDATION: Le résultat attendu

4. **DOCUMENTER** les décisions
   - Nouvelle décision architecturale si pertinent
   - Mise à jour du registre de composants
   - Patterns ou anti-patterns découverts

## RÈGLES D'INSTRUCTIONS

✅ BON: "Dans Header.jsx, ligne 15-20, ajouter un bouton dark mode avec useState pour toggle"
❌ MAUVAIS: "Implémenter le dark mode dans l'application"

✅ BON: "Créer Newsletter.jsx avec formulaire email et validation regex /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/"
❌ MAUVAIS: "Ajouter une newsletter"

## LIMITES STRICTES
- Max 500 caractères par instruction
- Max 5 instructions par réponse
- Pas de code dans les instructions (juste les directives)
- Toujours spécifier les fichiers exacts

## FORMAT DE SORTIE JSON

Vous devez TOUJOURS répondre avec ce format JSON:
{
  "analysis": {
    "intent": "description courte de l'intention",
    "complexity": "simple|moderate|complex",
    "estimatedTasks": nombre
  },
  "instructions": [
    {
      "id": "unique-id",
      "priority": "high|medium|low",
      "instruction": "instruction précise en 1 phrase",
      "targetFiles": ["fichier1.jsx", "fichier2.css"],
      "validation": "ce qui doit être vérifié après"
    }
  ],
  "documentation": {
    "decision": "nouvelle décision architecturale si applicable",
    "rationale": "pourquoi cette approche",
    "newPattern": "pattern découvert si applicable",
    "componentUpdate": {
      "name": "nom du composant",
      "purpose": "son rôle"
    }
  },
  "message": "Message explicatif pour l'utilisateur en français"
}`;
}

export async function POST(request: NextRequest) {
  try {
    const { userMessage, context }: ArchitectRequest = await request.json();
    
    if (!userMessage) {
      return NextResponse.json({
        error: 'Message utilisateur requis'
      }, { status: 400 });
    }

    // Load current documentation
    const documentation = await loadArchitectDocumentation();
    
    // Generate architect analysis
    console.log('[architect] Analyzing user request...');
    
    const response = await generateText({
      model: anthropic(appConfig.ai.dualAgent.architect.model),
      temperature: appConfig.ai.dualAgent.architect.temperature,
      maxTokens: appConfig.ai.dualAgent.architect.maxTokens,
      messages: [
        {
          role: 'system',
          content: getArchitectSystemPrompt(documentation),
        },
        {
          role: 'user',
          content: `Requête utilisateur: ${userMessage}
          
${context?.recentChanges ? `Changements récents: ${context.recentChanges.join(', ')}` : ''}
${context?.currentFocus ? `Focus actuel: ${context.currentFocus}` : ''}

Analysez cette requête et générez les instructions pour l'exécutant.
Répondez UNIQUEMENT avec le JSON structuré demandé.`,
        },
      ],
    });

    // Parse architect response
    let architectData;
    try {
      // Extract JSON from response
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      architectData = JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('[architect] Failed to parse response:', error);
      return NextResponse.json({
        error: 'Failed to parse architect response',
        rawResponse: response.text
      }, { status: 500 });
    }

    // Generate executor instructions
    const instructions: ExecutorInstruction[] = architectData.instructions.map((inst: any, index: number) => ({
      id: `task-${Date.now()}-${index}`,
      taskId: `task-${Date.now()}`,
      timestamp: Date.now(),
      priority: inst.priority || 'medium',
      instructions: [inst.instruction],
      context: {
        targetFiles: inst.targetFiles || [],
        searchPatterns: inst.searchPatterns,
        dependencies: inst.dependencies,
        constraints: inst.constraints,
      },
      validation: {
        expectedChanges: [inst.validation],
        testCases: inst.testCases,
        performanceTargets: inst.performanceTargets,
      },
      metadata: {
        estimatedTime: inst.estimatedTime || 30000,
        requiredSkills: inst.requiredSkills,
        riskLevel: inst.riskLevel || 'low',
      },
    }));

    // Update documentation with new task
    documentation.taskHistory.push({
      id: `task-${Date.now()}`,
      timestamp: Date.now(),
      request: userMessage,
      instructions: instructions.map(i => i.instructions[0]),
      executor: 'claude-sonnet',
      result: 'pending',
      metrics: {
        executionTime: 0,
        linesChanged: 0,
        filesAffected: 0,
      },
    });

    // Add architectural decision if provided
    if (architectData.documentation?.decision) {
      documentation.architecturalDecisions.push({
        id: `decision-${Date.now()}`,
        timestamp: Date.now(),
        decision: architectData.documentation.decision,
        rationale: architectData.documentation.rationale,
        impact: architectData.documentation.impact || 'medium',
        alternatives: architectData.documentation.alternatives,
      });
    }

    // Update patterns if discovered
    if (architectData.documentation?.newPattern) {
      documentation.knowledgeBase.patterns.set(
        architectData.documentation.newPattern,
        architectData.documentation.patternDescription || ''
      );
    }

    // Save updated documentation
    await saveArchitectDocumentation(documentation);

    // Prepare response
    const architectResponse: ArchitectResponse = {
      architectMessage: architectData.message || 'Instructions générées avec succès',
      instructions,
      documentationUpdates: {
        projectOverview: documentation.projectOverview,
        architecturalDecisions: documentation.architecturalDecisions,
      },
      estimatedTime: architectData.analysis?.estimatedTasks ? 
        architectData.analysis.estimatedTasks * 30000 : 30000,
    };

    return NextResponse.json(architectResponse);

  } catch (error) {
    console.error('[architect] Error:', error);
    return NextResponse.json({
      error: 'Architect analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}