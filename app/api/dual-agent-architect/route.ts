import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { 
  ArchitectRequest,
  ArchitectResponse,
  ArchitectDocumentation,
  ExecutorInstruction 
} from '@/types/dual-agent';
import fs from 'fs/promises';
import path from 'path';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Path for persistent documentation
const DOCS_PATH = path.join(process.cwd(), 'data', 'architect-docs.json');

// Load architect documentation
async function loadArchitectDocumentation(): Promise<ArchitectDocumentation> {
  try {
    const data = await fs.readFile(DOCS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    // Return default documentation if file doesn't exist
    return {
      projectOverview: {
        name: 'Arcadis Synapse Project',
        description: 'IDE intelligent avec architecture dual-agent',
        techStack: ['Next.js', 'TypeScript', 'Tailwind CSS'],
        lastUpdated: new Date().toISOString()
      },
      architecturalDecisions: [],
      componentRegistry: {},
      taskHistory: [],
      knowledgeBase: {
        patterns: [],
        antiPatterns: [],
        optimizations: []
      }
    };
  }
}

// Save architect documentation
async function saveArchitectDocumentation(doc: ArchitectDocumentation): Promise<void> {
  try {
    await fs.mkdir(path.dirname(DOCS_PATH), { recursive: true });
    await fs.writeFile(DOCS_PATH, JSON.stringify(doc, null, 2));
  } catch (error) {
    console.error('[architect] Failed to save documentation:', error);
  }
}

// Generate architect system prompt
function getArchitectSystemPrompt(documentation: ArchitectDocumentation): string {
  return `# RÔLE: Agent Architecte (Cortex) - Arcadis Synapse™

Tu es l'Agent Architecte (Cortex) du système Arcadis Synapse™. Tu es responsable de:
1. Analyser les demandes utilisateur de manière stratégique
2. Décomposer les tâches complexes en instructions précises
3. Maintenir la cohérence architecturale
4. Documenter toutes les décisions

## DOCUMENTATION ACTUELLE
${JSON.stringify(documentation, null, 2)}

## FORMAT DE RÉPONSE OBLIGATOIRE
Tu dois TOUJOURS répondre avec un JSON valide contenant:
{
  "analysis": "Ton analyse de la demande",
  "instructions": [
    {
      "id": "unique-id",
      "type": "code|config|command",
      "target": "fichier ou composant cible",
      "action": "create|update|delete|execute",
      "details": "Instructions précises pour l'exécuteur",
      "dependencies": ["id des instructions dépendantes"],
      "priority": 1-5
    }
  ],
  "documentationUpdate": {
    "architecturalDecisions": ["nouvelles décisions"],
    "componentRegistry": {"nouveaux composants": "description"},
    "patterns": ["nouveaux patterns identifiés"]
  },
  "estimatedComplexity": "low|medium|high",
  "risks": ["risques identifiés"]
}

## RÈGLES
1. Sois EXTRÊMEMENT précis dans tes instructions
2. Une instruction = une action atomique
3. Documente TOUT changement architectural
4. Anticipe les erreurs possibles
5. Optimise pour la maintenabilité`;
}

export async function POST(request: NextRequest) {
  try {
    const { userMessage, context, sessionId }: ArchitectRequest = await request.json();
    
    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('[architect] No Anthropic API key configured, using mock response');
      
      // Return mock response for demo
      return NextResponse.json<ArchitectResponse>({
        sessionId: sessionId || `mock-${Date.now()}`,
        analysis: `[MOCK] Analyse de: "${userMessage}"`,
        instructions: [
          {
            id: 'mock-1',
            type: 'code',
            target: 'mock-component',
            action: 'create',
            details: '[MOCK] Créer un composant de démonstration',
            priority: 1
          }
        ],
        documentationUpdate: {
          taskHistory: [{
            timestamp: new Date().toISOString(),
            request: userMessage,
            instructions: 1,
            complexity: 'low'
          }]
        },
        estimatedComplexity: 'low',
        confidence: 0.95,
        timestamp: new Date().toISOString()
      });
    }
    
    // Load current documentation
    const documentation = await loadArchitectDocumentation();
    
    // Prepare the prompt
    const systemPrompt = getArchitectSystemPrompt(documentation);
    const userPrompt = `
DEMANDE UTILISATEUR: ${userMessage}

CONTEXTE ADDITIONNEL:
${context ? JSON.stringify(context, null, 2) : 'Aucun contexte fourni'}

Analyse cette demande et génère les instructions pour l'Agent Exécuteur (Neuron).
Réponds UNIQUEMENT avec le JSON structuré demandé.`;

    console.log('[architect] Calling Claude Opus...');
    
    // Call Claude Opus
    const response = await anthropic.messages.create({
      model: process.env.CORTEX_MODEL || 'claude-3-opus-20240229',
      max_tokens: parseInt(process.env.MAX_TOKENS_CORTEX || '4096'),
      temperature: parseFloat(process.env.TEMPERATURE_CORTEX || '0.3'),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    // Parse Claude's response
    let architectData;
    try {
      const content = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';
      
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        architectData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('[architect] Failed to parse Claude response:', parseError);
      
      // Fallback structure
      architectData = {
        analysis: 'Erreur lors du parsing de la réponse',
        instructions: [],
        documentationUpdate: {},
        estimatedComplexity: 'unknown',
        risks: ['Parsing error']
      };
    }

    // Update documentation
    if (architectData.documentationUpdate) {
      const updatedDoc = {
        ...documentation,
        lastUpdated: new Date().toISOString(),
        architecturalDecisions: [
          ...documentation.architecturalDecisions,
          ...(architectData.documentationUpdate.architecturalDecisions || [])
        ],
        taskHistory: [
          ...documentation.taskHistory,
          {
            timestamp: new Date().toISOString(),
            request: userMessage,
            instructions: architectData.instructions.length,
            complexity: architectData.estimatedComplexity
          }
        ]
      };
      
      await saveArchitectDocumentation(updatedDoc);
    }

    // Return structured response
    const architectResponse: ArchitectResponse = {
      sessionId: sessionId || `session-${Date.now()}`,
      analysis: architectData.analysis,
      instructions: architectData.instructions,
      documentationUpdate: architectData.documentationUpdate,
      estimatedComplexity: architectData.estimatedComplexity,
      confidence: 0.85,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(architectResponse);
    
  } catch (error) {
    console.error('[architect] Error:', error);
    
    return NextResponse.json({
      error: 'Erreur lors de l\'analyse architecturale',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}