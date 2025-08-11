# 🤖 PROMPT SYSTÈME POUR CURSOR AGENT - ARCADIS SYNAPSE IDE

## 🎯 CONTEXTE DU PROJET

Tu es en train de développer **Arcadis Synapse IDE**, un fork de VSCode avec une architecture dual-agent révolutionnaire qui va surpasser Cursor lui-même.

### Informations Clés :
- **Entreprise** : Arcadis Tech (arcadis.tech)
- **Projet** : Fork VSCode avec architecture dual-agent (Cortex + Neuron)
- **Objectif** : Créer un IDE supérieur à Cursor en 2 mois
- **Méthode** : Utiliser Cursor pour développer son remplaçant (ironie assumée)

---

## 🏗️ ARCHITECTURE CIBLE

### Structure du Projet :
```
arcadis-synapse-ide/
├── vscode/                    # Fork de VSCode
│   ├── src/
│   ├── extensions/
│   │   └── arcadis-synapse/  # Extension principale
│   │       ├── src/
│   │       │   ├── extension.ts
│   │       │   ├── agents/
│   │       │   │   ├── cortex.ts      # Agent Architecte
│   │       │   │   └── neuron.ts      # Agent Ingénieur
│   │       │   ├── orchestrator/
│   │       │   │   └── synapse.ts     # Coordinateur
│   │       │   └── ui/
│   │       │       └── chat.tsx       # Interface chat
│   │       └── package.json
│   └── product.json           # Configuration Arcadis
├── synapse-service/           # Service local Node.js
│   ├── server.ts             # WebSocket server :7437
│   ├── cortex-agent.ts
│   ├── neuron-agent.ts
│   └── package.json
└── .env                      # API keys
```

---

## 📋 TÂCHES PRIORITAIRES

### Phase 1 : Fork VSCode (Semaine 1)
1. **Fork et Setup**
   - Clone VSCode repository
   - Checkout version stable (1.85)
   - Setup build environment

2. **Rebranding Arcadis**
   - Remplacer "Visual Studio Code" → "Arcadis Synapse"
   - Remplacer "Code" → "Synapse"
   - Couleur principale : Bleu Arcadis (#0054A6)
   - Supprimer télémétrie Microsoft

3. **Build & Test**
   - Compiler avec `yarn compile`
   - Créer scripts de build
   - Tester l'exécutable

### Phase 2 : Extension Dual-Agent (Semaine 2)
1. **Extension de base**
   - Activity bar icon "Synapse"
   - Webview panel pour chat
   - Commands palette integration

2. **Service Orchestrateur**
   - WebSocket server (port 7437)
   - Message routing
   - State management

3. **UI Components**
   - Chat interface (style ChatGPT)
   - Status bar indicators
   - Settings page

### Phase 3 : Agents IA (Semaine 3-4)
1. **Cortex Agent (Architecte)**
   - Analyse de code
   - Planification de tâches
   - Gestion du contexte
   - Documentation automatique

2. **Neuron Agent (Ingénieur)**
   - Génération de code
   - Refactoring
   - Tests automatiques
   - Exécution de commandes

3. **Intégration LLMs**
   - Claude (Anthropic)
   - GPT-4 (OpenAI)
   - Gemini (Google)

---

## 💻 CODE À IMPLÉMENTER

### 1. Extension Principal (`extension.ts`)
```typescript
import * as vscode from 'vscode';
import { SynapseOrchestrator } from './orchestrator/synapse';
import { CortexAgent } from './agents/cortex';
import { NeuronAgent } from './agents/neuron';
import { ChatPanel } from './ui/chat';

export function activate(context: vscode.ExtensionContext) {
    // Initialize orchestrator
    const orchestrator = new SynapseOrchestrator();
    
    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('synapse.chat', () => {
            ChatPanel.createOrShow(context.extensionUri);
        }),
        
        vscode.commands.registerCommand('synapse.inlineChat', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;
            
            const selection = editor.selection;
            const text = editor.document.getText(selection);
            
            // Process with dual-agent
            const result = await orchestrator.process({
                code: text,
                intent: await vscode.window.showInputBox({
                    prompt: 'What would you like to do?'
                })
            });
            
            // Apply changes
            editor.edit(editBuilder => {
                editBuilder.replace(selection, result.code);
            });
        })
    );
    
    // Status bar
    const statusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right
    );
    statusBar.text = '$(synapse) Synapse Ready';
    statusBar.show();
}
```

### 2. Cortex Agent (`cortex.ts`)
```typescript
export class CortexAgent {
    private model = 'claude-3-opus-20240229';
    
    async analyze(request: AnalysisRequest): Promise<AnalysisResult> {
        // Architectural analysis
        const context = await this.gatherContext();
        const intent = await this.understandIntent(request);
        const plan = await this.createPlan(intent, context);
        
        return {
            intent,
            plan,
            instructions: this.generateInstructions(plan),
            risks: this.evaluateRisks(plan),
            alternatives: this.findAlternatives(plan)
        };
    }
    
    private async gatherContext(): Promise<Context> {
        // Workspace analysis
        const files = await vscode.workspace.findFiles('**/*.{ts,js,py}');
        const dependencies = await this.analyzeDependencies();
        const gitStatus = await this.getGitStatus();
        
        return {
            files: files.map(f => f.fsPath),
            dependencies,
            gitStatus,
            recentChanges: await this.getRecentChanges()
        };
    }
    
    private generateInstructions(plan: Plan): Instruction[] {
        return plan.steps.map(step => ({
            to: 'neuron',
            task: step.action,
            context: step.context,
            constraints: step.constraints,
            expectedOutput: step.expectedOutput
        }));
    }
}
```

### 3. Neuron Agent (`neuron.ts`)
```typescript
export class NeuronAgent {
    private model = 'claude-3-5-sonnet-20240229';
    
    async execute(instruction: Instruction): Promise<ExecutionResult> {
        const startTime = Date.now();
        
        try {
            // Generate code based on instruction
            const code = await this.generateCode(instruction);
            
            // Validate the generated code
            const validation = await this.validate(code);
            
            // Run tests if applicable
            const tests = await this.generateTests(code);
            
            return {
                status: 'success',
                code,
                tests,
                validation,
                metrics: {
                    duration: Date.now() - startTime,
                    tokens: this.countTokens(code),
                    complexity: this.calculateComplexity(code)
                }
            };
        } catch (error) {
            return {
                status: 'failure',
                error: error.message,
                duration: Date.now() - startTime
            };
        }
    }
    
    private async generateCode(instruction: Instruction): Promise<string> {
        const prompt = this.buildPrompt(instruction);
        const response = await this.callLLM(prompt);
        return this.extractCode(response);
    }
}
```

### 4. Orchestrateur (`synapse.ts`)
```typescript
export class SynapseOrchestrator {
    private cortex: CortexAgent;
    private neuron: NeuronAgent;
    private ws: WebSocket;
    
    constructor() {
        this.cortex = new CortexAgent();
        this.neuron = new NeuronAgent();
        this.connectToService();
    }
    
    private connectToService() {
        this.ws = new WebSocket('ws://localhost:7437');
        
        this.ws.on('open', () => {
            console.log('Connected to Synapse service');
        });
        
        this.ws.on('message', (data) => {
            this.handleMessage(JSON.parse(data));
        });
    }
    
    async process(request: Request): Promise<Response> {
        // 1. Cortex analyzes and plans
        const analysis = await this.cortex.analyze(request);
        
        // 2. Execute plan with Neuron
        const results = [];
        for (const instruction of analysis.instructions) {
            const result = await this.neuron.execute(instruction);
            results.push(result);
            
            // Handle failures with retry
            if (result.status === 'failure') {
                const revised = await this.cortex.revise(instruction, result.error);
                const retry = await this.neuron.execute(revised);
                results.push(retry);
            }
        }
        
        // 3. Aggregate results
        return this.aggregateResults(results);
    }
}
```

### 5. Service WebSocket (`server.ts`)
```typescript
import { WebSocketServer } from 'ws';
import { Anthropic } from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const wss = new WebSocketServer({ port: 7437 });
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

wss.on('connection', (ws) => {
    console.log('VSCode extension connected');
    
    ws.on('message', async (message) => {
        const request = JSON.parse(message.toString());
        
        switch (request.type) {
            case 'cortex':
                const cortexResponse = await processCortex(request);
                ws.send(JSON.stringify(cortexResponse));
                break;
                
            case 'neuron':
                const neuronResponse = await processNeuron(request);
                ws.send(JSON.stringify(neuronResponse));
                break;
        }
    });
});

async function processCortex(request: any) {
    const response = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        temperature: 0.7,
        system: CORTEX_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: request.content }]
    });
    
    return {
        type: 'cortex-response',
        content: response.content[0].text
    };
}

async function processNeuron(request: any) {
    const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240229',
        max_tokens: 8000,
        temperature: 0.3,
        system: NEURON_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: request.content }]
    });
    
    return {
        type: 'neuron-response',
        content: response.content[0].text
    };
}
```

### 6. Package.json Extension
```json
{
  "name": "arcadis-synapse",
  "displayName": "Arcadis Synapse",
  "description": "Dual-Agent AI Architecture",
  "version": "1.0.0",
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": ["Other"],
  "activationEvents": [
    "onStartupFinished"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "synapse.chat",
        "title": "Synapse: Open Chat"
      },
      {
        "command": "synapse.inlineChat",
        "title": "Synapse: Inline Chat"
      }
    ],
    "keybindings": [
      {
        "command": "synapse.inlineChat",
        "key": "cmd+k",
        "when": "editorTextFocus"
      }
    ],
    "configuration": {
      "title": "Arcadis Synapse",
      "properties": {
        "synapse.cortexModel": {
          "type": "string",
          "default": "claude-3-opus-20240229",
          "description": "Model for Cortex (Architect)"
        },
        "synapse.neuronModel": {
          "type": "string",
          "default": "claude-3-5-sonnet-20240229",
          "description": "Model for Neuron (Engineer)"
        }
      }
    }
  },
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./"
  },
  "devDependencies": {
    "@types/vscode": "^1.85.0",
    "@types/node": "20.x",
    "typescript": "^5.3.0"
  },
  "dependencies": {
    "ws": "^8.16.0"
  }
}
```

---

## 🎨 COMMANDES CURSOR À UTILISER

### Pour implémenter rapidement :

```bash
# 1. Setup initial
Cmd+K: "Setup this VSCode fork with Arcadis Synapse branding and remove Microsoft telemetry"

# 2. Créer l'extension
Cmd+K: "Create a VSCode extension with dual-agent architecture using the code provided above"

# 3. Implémenter le chat UI
Cmd+K: "Create a beautiful chat interface like ChatGPT with markdown support and syntax highlighting"

# 4. Service WebSocket
Cmd+K: "Create WebSocket service that connects to Anthropic API for Cortex and Neuron agents"

# 5. Inline chat (Cmd+K)
Cmd+K: "Implement inline chat feature similar to Cursor's Cmd+K with selection context"

# 6. Context awareness
Cmd+K: "Add workspace file indexing and Git integration for context gathering"

# 7. Tests
Cmd+K: "Generate comprehensive tests for all agent classes"

# 8. Performance
Cmd+K: "Optimize this code for production with caching and error handling"
```

---

## 🚀 DÉMARRAGE RAPIDE

```bash
# 1. Dans votre nouveau repo
cd arcadis-synapse-ide

# 2. Cloner VSCode
git clone https://github.com/microsoft/vscode.git
cd vscode

# 3. Ouvrir dans Cursor
cursor .

# 4. Copier ce prompt dans Cursor
# Utiliser Cmd+Shift+I (Composer) et coller tout ce document

# 5. Laisser Cursor implémenter le code

# 6. Build et test
yarn && yarn compile
./scripts/code.sh
```

---

## ⚡ TIPS IMPORTANTS

1. **Toujours référencer ce document** dans vos prompts Cursor
2. **Itérer rapidement** - Petits changements fréquents
3. **Tester souvent** - Après chaque modification majeure
4. **Commiter régulièrement** - Pour pouvoir revenir en arrière

---

## 🎯 OBJECTIF FINAL

En suivant ce guide avec Cursor, vous aurez dans 2 mois :
- ✅ Un fork VSCode fonctionnel
- ✅ Architecture dual-agent opérationnelle
- ✅ UI/UX moderne et fluide
- ✅ Performance supérieure à Cursor
- ✅ 100+ beta testers actifs

**L'ironie est complète : Cursor aura créé son propre successeur !**

---

*"The student becomes the master, the tool becomes obsolete."*