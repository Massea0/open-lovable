'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModelSelector from '@/components/ModelSelector';
import { DEFAULT_MODELS, getModelById } from '@/config/models.config';
import '../styles/arcadis-theme.css';

interface SandboxData {
  sandboxId: string;
  url: string;
  structure?: any;
}

interface AgentMessage {
  id: string;
  agent: 'cortex' | 'neuron' | 'user';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    tokens?: number;
    time?: number;
    files?: string[];
    analysis?: any;
    instructions?: any[];
  };
}

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
}

export default function ArcadisSynapseIDE() {
  // État principal
  const [sandboxData, setSandboxData] = useState<SandboxData | null>(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  // Agents et modèles
  const [cortexModel, setCortexModel] = useState(DEFAULT_MODELS.architect);
  const [neuronModel, setNeuronModel] = useState(DEFAULT_MODELS.executor);
  const [agentMode, setAgentMode] = useState<'auto' | 'cortex' | 'neuron'>('auto');
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  
  // Interface
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeView, setActiveView] = useState<'preview' | 'code' | 'split'>('split');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  
  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Créer un sandbox au démarrage
  useEffect(() => {
    createSandbox();
  }, []);

  const createSandbox = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-ai-sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      if (data.success) {
        setSandboxData({
          sandboxId: data.sandboxId,
          url: data.url,
          structure: data.structure
        });
        
        // Message de bienvenue
        setMessages([{
          id: `msg-${Date.now()}`,
          agent: 'cortex',
          content: "Bienvenue dans Arcadis Synapse™ IDE ! Je suis Cortex, votre architecte IA. Décrivez-moi votre projet et je coordonnerai avec Neuron pour le réaliser.",
          timestamp: new Date(),
          metadata: { model: getModelById(cortexModel)?.name }
        }]);
      }
    } catch (error) {
      console.error('Failed to create sandbox:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userInput.trim() || isProcessing) return;

    const userMessage: AgentMessage = {
      id: `msg-${Date.now()}`,
      agent: 'user',
      content: userInput.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsProcessing(true);

    try {
      // Phase 1: Analyse par Cortex (Architecte)
      if (agentMode === 'auto' || agentMode === 'cortex') {
        const cortexMessage: AgentMessage = {
          id: `msg-${Date.now()}-cortex-thinking`,
          agent: 'cortex',
          content: "🧠 Analyse architecturale en cours...",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, cortexMessage]);

        // Appel à l'API Cortex
        const architectResponse = await fetch('/api/dual-agent-architect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userMessage: userMessage.content,
            context: {
              sandboxId: sandboxData?.sandboxId,
              existingFiles: Object.keys(fileContents),
              currentFile: selectedFile
            }
          })
        });

        const architectData = await architectResponse.json();
        
        // Mise à jour du message Cortex avec l'analyse
        setMessages(prev => prev.map(msg => 
          msg.id === cortexMessage.id 
            ? {
                ...msg,
                content: architectData.analysis || "J'ai analysé votre demande et préparé les instructions pour Neuron.",
                metadata: {
                  model: getModelById(cortexModel)?.name,
                  analysis: architectData,
                  instructions: architectData.instructions
                }
              }
            : msg
        ));

        // Phase 2: Exécution par Neuron
        if (agentMode === 'auto' && architectData.instructions?.length > 0) {
          const neuronMessage: AgentMessage = {
            id: `msg-${Date.now()}-neuron`,
            agent: 'neuron',
            content: "⚡ Génération du code en cours...",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, neuronMessage]);

          // Générer le code avec l'API existante
          const codeResponse = await fetch('/api/generate-ai-code-stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: architectData.instructions.map((i: any) => i.details).join('\n'),
              model: neuronModel,
              context: {
                sandboxId: sandboxData?.sandboxId,
                instructions: architectData.instructions
              }
            })
          });

          // Traiter le stream
          const reader = codeResponse.body?.getReader();
          const decoder = new TextDecoder();
          let generatedCode = '';

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));
                    if (data.type === 'complete') {
                      generatedCode = data.generatedCode;
                    }
                  } catch (e) {
                    // Ignorer les erreurs de parsing
                  }
                }
              }
            }
          }

          // Appliquer le code généré
          if (generatedCode) {
            const applyResponse = await fetch('/api/apply-ai-code-stream', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                response: generatedCode,
                sandboxId: sandboxData?.sandboxId
              })
            });

            // Traiter la réponse
            const applyReader = applyResponse.body?.getReader();
            const applyDecoder = new TextDecoder();
            let filesCreated: string[] = [];

            if (applyReader) {
              while (true) {
                const { done, value } = await applyReader.read();
                if (done) break;
                
                const chunk = applyDecoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    try {
                      const data = JSON.parse(line.slice(6));
                      if (data.type === 'complete' && data.results) {
                        filesCreated = data.results.filesCreated || [];
                      }
                    } catch (e) {
                      // Ignorer
                    }
                  }
                }
              }
            }

            // Mettre à jour le message Neuron
            setMessages(prev => prev.map(msg => 
              msg.id === neuronMessage.id 
                ? {
                    ...msg,
                    content: `✅ Code généré et appliqué avec succès !`,
                    metadata: {
                      model: getModelById(neuronModel)?.name,
                      files: filesCreated
                    }
                  }
                : msg
            ));

            // Rafraîchir l'iframe
            if (iframeRef.current && sandboxData?.url) {
              iframeRef.current.src = `${sandboxData.url}?t=${Date.now()}`;
            }

            // Récupérer les fichiers mis à jour
            await fetchSandboxFiles();
          }
        }
      }
    } catch (error) {
      console.error('Error processing request:', error);
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-error`,
        agent: 'cortex',
        content: `❌ Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchSandboxFiles = async () => {
    if (!sandboxData) return;
    
    try {
      const response = await fetch('/api/get-sandbox-files');
      const data = await response.json();
      
      if (data.success && data.files) {
        setFileContents(data.files);
        // Construire l'arbre de fichiers
        const tree = buildFileTree(Object.keys(data.files));
        setFileTree(tree);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
  };

  const buildFileTree = (paths: string[]): FileNode[] => {
    const root: FileNode[] = [];
    
    paths.forEach(path => {
      const parts = path.split('/').filter(Boolean);
      let current = root;
      
      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;
        let node = current.find(n => n.name === part);
        
        if (!node) {
          node = {
            name: part,
            path: parts.slice(0, index + 1).join('/'),
            type: isFile ? 'file' : 'folder',
            children: isFile ? undefined : []
          };
          current.push(node);
        }
        
        if (!isFile && node.children) {
          current = node.children;
        }
      });
    });
    
    return root;
  };

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return nodes.map(node => (
      <div key={node.path}>
        <div
          className={`flex items-center gap-2 px-2 py-1 hover:bg-slate-800 cursor-pointer rounded ${
            selectedFile === node.path ? 'bg-blue-900/30 border-l-2 border-blue-500' : ''
          }`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => node.type === 'file' && setSelectedFile(node.path)}
        >
          <span className="text-sm">
            {node.type === 'folder' ? '📁' : '📄'}
          </span>
          <span className="text-sm text-slate-300">{node.name}</span>
        </div>
        {node.children && renderFileTree(node.children, level + 1)}
      </div>
    ));
  };

  return (
    <div className={`flex flex-col h-screen ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
      {/* Header IDE */}
      <header className="h-12 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-arcadis flex items-center justify-center">
              <span className="text-white font-bold text-sm">AS</span>
            </div>
            <span className="text-sm font-semibold">Arcadis Synapse™ IDE</span>
          </div>
          
          {/* View toggles */}
          <div className="flex rounded-lg overflow-hidden border border-slate-700">
            {(['code', 'split', 'preview'] as const).map(view => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-3 py-1 text-xs ${
                  activeView === view 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {view === 'code' ? '📝' : view === 'split' ? '⚡' : '👁️'} {view}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ModelSelector
            role="architect"
            selectedModelId={cortexModel}
            onModelChange={setCortexModel}
          />
          <ModelSelector
            role="executor"
            selectedModelId={neuronModel}
            onModelChange={setNeuronModel}
          />
          
          <button
            onClick={() => sandboxData && window.open(sandboxData.url, '_blank')}
            className="px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded"
            disabled={!sandboxData}
          >
            🔗 Open Sandbox
          </button>
        </div>
      </header>

      {/* Main IDE Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - File Explorer */}
        <div className={`w-64 border-r border-slate-800 bg-slate-900 flex flex-col ${
          activeView === 'preview' ? 'hidden' : ''
        }`}>
          <div className="p-2 border-b border-slate-800">
            <h3 className="text-xs font-semibold text-slate-400 uppercase">Explorer</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {renderFileTree(fileTree)}
          </div>
        </div>

        {/* Editor/Preview Area */}
        <div className="flex-1 flex">
          {/* Code Editor */}
          {(activeView === 'code' || activeView === 'split') && (
            <div className={`${activeView === 'split' ? 'w-1/2' : 'flex-1'} flex flex-col border-r border-slate-800`}>
              {selectedFile ? (
                <>
                  <div className="h-10 bg-slate-800 flex items-center px-3 border-b border-slate-700">
                    <span className="text-sm text-slate-300">{selectedFile}</span>
                  </div>
                  <div className="flex-1 overflow-auto bg-slate-950 p-4">
                    <pre className="text-sm text-slate-300 font-mono">
                      {fileContents[selectedFile] || '// Fichier vide'}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-600">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📝</div>
                    <p>Sélectionnez un fichier pour l'éditer</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          {(activeView === 'preview' || activeView === 'split') && (
            <div className={`${activeView === 'split' ? 'w-1/2' : 'flex-1'} bg-white`}>
              {sandboxData?.url ? (
                <iframe
                  ref={iframeRef}
                  src={sandboxData.url}
                  className="w-full h-full"
                  title="Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  {loading ? 'Chargement...' : 'Aucun sandbox actif'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat Panel */}
        <div className="w-96 border-l border-slate-800 bg-slate-900 flex flex-col">
          <div className="p-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold">Agents IA</h3>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.agent === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${msg.agent === 'user' ? 'order-2' : ''}`}>
                  <div className={`text-xs mb-1 ${msg.agent === 'user' ? 'text-right' : ''} text-slate-500`}>
                    {msg.agent === 'cortex' ? '🧠 Cortex' : msg.agent === 'neuron' ? '⚡ Neuron' : 'Vous'}
                    {msg.metadata?.model && ` • ${msg.metadata.model}`}
                  </div>
                  <div className={`rounded-lg px-3 py-2 text-sm ${
                    msg.agent === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : msg.agent === 'cortex'
                      ? 'bg-slate-800 text-slate-200 border border-blue-800'
                      : 'bg-slate-800 text-slate-200 border border-green-800'
                  }`}>
                    {msg.content}
                    {msg.metadata?.files && msg.metadata.files.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-700">
                        <div className="text-xs opacity-70">
                          Fichiers: {msg.metadata.files.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Décrivez votre besoin..."
                className="flex-1 px-3 py-2 bg-slate-800 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              />
              <button
                type="submit"
                disabled={!userInput.trim() || isProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {isProcessing ? '...' : '→'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}