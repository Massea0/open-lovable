'use client';

import React, { useState, useEffect, useRef } from 'react';
import { arcadisSynapseConfig } from '@/config/arcadis-synapse.config';

interface SynapseMessage {
  id: string;
  timestamp: number;
  agent: 'user' | 'cortex' | 'neuron' | 'synapse';
  content: string;
  metadata?: any;
}

interface NeuralActivity {
  timestamp: number;
  type: 'analysis' | 'execution' | 'sync';
  agent: string;
  status: 'active' | 'completed' | 'error';
  description: string;
}

export function ArcadisSynapseInterface() {
  const [messages, setMessages] = useState<SynapseMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [neuralActivity, setNeuralActivity] = useState<NeuralActivity[]>([]);
  const [mode, setMode] = useState<'auto' | 'cortex' | 'neuron'>('auto');
  const [systemStatus, setSystemStatus] = useState('ready');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activityEndRef = useRef<HTMLDivElement>(null);
  
  const config = arcadisSynapseConfig;
  const colors = config.design.colors;

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    activityEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [neuralActivity]);

  // Animation d'initialisation
  useEffect(() => {
    setSystemStatus('initializing');
    setTimeout(() => {
      addSystemMessage('synapse', config.ui.messages.status.initializing);
      setTimeout(() => {
        addSystemMessage('synapse', config.ui.messages.status.ready);
        setSystemStatus('ready');
      }, 2000);
    }, 1000);
  }, []);

  const addSystemMessage = (agent: 'cortex' | 'neuron' | 'synapse', content: string) => {
    const message: SynapseMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      agent,
      content,
    };
    setMessages(prev => [...prev, message]);
  };

  const addActivity = (type: NeuralActivity['type'], agent: string, description: string, status: NeuralActivity['status'] = 'active') => {
    const activity: NeuralActivity = {
      timestamp: Date.now(),
      type,
      agent,
      status,
      description,
    };
    setNeuralActivity(prev => [...prev, activity]);
  };

  const handleSubmit = async () => {
    if (!userInput.trim() || isProcessing) return;
    
    const input = userInput.trim();
    setUserInput('');
    setIsProcessing(true);
    
    // Ajouter le message utilisateur
    const userMessage: SynapseMessage = {
      id: `msg-${Date.now()}`,
      timestamp: Date.now(),
      agent: 'user',
      content: input,
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Simuler le traitement
    if (mode === 'auto' || mode === 'cortex') {
      addActivity('analysis', 'Cortex', config.ui.messages.agents.cortex.thinking);
      addSystemMessage('cortex', `Analyse architecturale: "${input}"`);
      
      setTimeout(() => {
        addActivity('analysis', 'Cortex', 'Analyse complétée', 'completed');
        addSystemMessage('cortex', '3 tâches identifiées. Transmission au Neuron...');
        
        if (mode === 'auto') {
          setTimeout(() => {
            addActivity('execution', 'Neuron', config.ui.messages.agents.neuron.processing);
            addSystemMessage('neuron', 'Exécution des instructions...');
            
            setTimeout(() => {
              addActivity('execution', 'Neuron', 'Code généré avec succès', 'completed');
              addSystemMessage('neuron', '✅ Implémentation complétée');
              setIsProcessing(false);
            }, 2000);
          }, 1000);
        } else {
          setIsProcessing(false);
        }
      }, 2000);
    } else {
      addActivity('execution', 'Neuron', 'Exécution directe');
      addSystemMessage('neuron', `Traitement: "${input}"`);
      
      setTimeout(() => {
        addActivity('execution', 'Neuron', 'Exécution terminée', 'completed');
        setIsProcessing(false);
      }, 2000);
    }
  };

  const getAgentColor = (agent: string) => {
    switch (agent) {
      case 'cortex': return colors.agents.cortex;
      case 'neuron': return colors.agents.neuron;
      case 'synapse': return colors.agents.synapse;
      case 'user': return colors.accent.electric;
      default: return colors.ui.text.primary;
    }
  };

  const getAgentIcon = (agent: string) => {
    switch (agent) {
      case 'cortex': return '🧠';
      case 'neuron': return '⚡';
      case 'synapse': return '🔗';
      case 'user': return '👤';
      default: return '•';
    }
  };

  return (
    <div 
      className="flex flex-col h-screen"
      style={{ 
        backgroundColor: colors.ui.background,
        color: colors.ui.text.primary,
        fontFamily: config.design.typography.fontFamily.body
      }}
    >
      {/* Header */}
      <header 
        className="border-b px-6 py-4"
        style={{ 
          borderColor: colors.ui.border,
          background: `linear-gradient(180deg, ${colors.ui.surface} 0%, ${colors.ui.background} 100%)`
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/assets/arcadis-synapse-logo.svg" alt="Arcadis Synapse" className="h-10" />
            <div 
              className="text-xs px-3 py-1 rounded-full"
              style={{ 
                background: colors.gradients.synapse,
                color: colors.primary.dark
              }}
            >
              {systemStatus === 'ready' ? '● ONLINE' : '○ INITIALIZING'}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="px-4 py-2 rounded-lg text-sm"
              style={{
                backgroundColor: colors.ui.surface,
                borderColor: colors.ui.border,
                color: colors.ui.text.primary
              }}
            >
              <option value="auto">🔗 Synapse (Auto)</option>
              <option value="cortex">🧠 Cortex Only</option>
              <option value="neuron">⚡ Neuron Only</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Messages Panel */}
        <div className="flex-1 flex flex-col">
          <div 
            className="flex-1 overflow-y-auto p-6 space-y-4"
            style={{ backgroundColor: colors.ui.background }}
          >
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.agent === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-start gap-3 max-w-[70%]">
                  {msg.agent !== 'user' && (
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                      style={{ 
                        background: `linear-gradient(135deg, ${getAgentColor(msg.agent)} 0%, ${colors.ui.surface} 100%)`,
                        boxShadow: `0 0 20px ${getAgentColor(msg.agent)}40`
                      }}
                    >
                      {getAgentIcon(msg.agent)}
                    </div>
                  )}
                  
                  <div 
                    className="rounded-lg px-4 py-3"
                    style={{
                      backgroundColor: msg.agent === 'user' ? colors.accent.electric + '20' : colors.ui.surface,
                      border: `1px solid ${msg.agent === 'user' ? colors.accent.electric : colors.ui.border}`,
                      boxShadow: msg.agent === 'user' ? `0 0 20px ${colors.accent.electric}20` : 'none'
                    }}
                  >
                    <div className="text-xs mb-1" style={{ color: getAgentColor(msg.agent) }}>
                      {msg.agent.toUpperCase()}
                    </div>
                    <div className="text-sm">{msg.content}</div>
                  </div>
                  
                  {msg.agent === 'user' && (
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                      style={{ 
                        backgroundColor: colors.accent.electric + '20',
                        border: `1px solid ${colors.accent.electric}`
                      }}
                    >
                      {getAgentIcon(msg.agent)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div 
            className="border-t p-4"
            style={{ 
              borderColor: colors.ui.border,
              backgroundColor: colors.ui.surface
            }}
          >
            <div className="flex gap-3">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Décrivez votre intention..."
                className="flex-1 px-4 py-3 rounded-lg text-sm"
                style={{
                  backgroundColor: colors.ui.background,
                  border: `1px solid ${colors.ui.border}`,
                  color: colors.ui.text.primary
                }}
                disabled={isProcessing}
              />
              <button
                onClick={handleSubmit}
                disabled={!userInput.trim() || isProcessing}
                className="px-6 py-3 rounded-lg font-medium text-sm transition-all"
                style={{
                  background: isProcessing ? colors.ui.border : colors.gradients.synapse,
                  color: isProcessing ? colors.ui.text.tertiary : colors.primary.dark,
                  cursor: !userInput.trim() || isProcessing ? 'not-allowed' : 'pointer',
                  boxShadow: !userInput.trim() || isProcessing ? 'none' : `0 0 30px ${colors.accent.electric}40`
                }}
              >
                {isProcessing ? 'Processing...' : 'Analyser'}
              </button>
            </div>
          </div>
        </div>

        {/* Neural Activity Panel */}
        <div 
          className="w-80 border-l flex flex-col"
          style={{ 
            borderColor: colors.ui.border,
            backgroundColor: colors.ui.surface
          }}
        >
          <div 
            className="px-4 py-3 border-b"
            style={{ 
              borderColor: colors.ui.border,
              background: colors.gradients.dark
            }}
          >
            <h3 className="text-sm font-semibold">⚛️ Activité Neurale</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {neuralActivity.map((activity, idx) => (
              <div 
                key={idx}
                className="text-xs p-3 rounded-lg"
                style={{ 
                  backgroundColor: colors.ui.background,
                  border: `1px solid ${colors.ui.border}`
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span style={{ color: getAgentColor(activity.agent.toLowerCase()) }}>
                    {activity.agent}
                  </span>
                  <span 
                    className="px-2 py-0.5 rounded-full"
                    style={{ 
                      backgroundColor: activity.status === 'completed' ? colors.semantic.success + '20' :
                                     activity.status === 'error' ? colors.semantic.error + '20' :
                                     colors.accent.electric + '20',
                      color: activity.status === 'completed' ? colors.semantic.success :
                             activity.status === 'error' ? colors.semantic.error :
                             colors.accent.electric
                    }}
                  >
                    {activity.status}
                  </span>
                </div>
                <div style={{ color: colors.ui.text.secondary }}>
                  {activity.description}
                </div>
                <div className="mt-1" style={{ color: colors.ui.text.tertiary }}>
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            <div ref={activityEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}