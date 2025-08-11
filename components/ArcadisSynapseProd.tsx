'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModelSelector from '@/components/ModelSelector';
import { DEFAULT_MODELS, getModelById } from '@/config/models.config';
import '../styles/arcadis-theme.css';

interface Message {
  id: string;
  role: 'user' | 'cortex' | 'neuron' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  metrics?: {
    tokens?: number;
    time?: number;
    cost?: number;
  };
}

export function ArcadisSynapseProd() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mode, setMode] = useState<'auto' | 'cortex' | 'neuron'>('auto');
  const [cortexModel, setCortexModel] = useState(DEFAULT_MODELS.architect);
  const [neuronModel, setNeuronModel] = useState(DEFAULT_MODELS.executor);
  const [showMetrics, setShowMetrics] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Theme detection
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    // Simulation de traitement
    setTimeout(() => {
      const cortexResponse: Message = {
        id: `msg-${Date.now()}-cortex`,
        role: 'cortex',
        content: `[Analyse architecturale] ${userMessage.content}`,
        timestamp: new Date(),
        model: getModelById(cortexModel)?.name,
        metrics: {
          tokens: Math.floor(Math.random() * 1000) + 100,
          time: Math.random() * 2 + 0.5,
          cost: Math.random() * 0.05
        }
      };

      setMessages(prev => [...prev, cortexResponse]);

      if (mode === 'auto' || mode === 'neuron') {
        setTimeout(() => {
          const neuronResponse: Message = {
            id: `msg-${Date.now()}-neuron`,
            role: 'neuron',
            content: `[Exécution] Code généré pour: ${userMessage.content}`,
            timestamp: new Date(),
            model: getModelById(neuronModel)?.name,
            metrics: {
              tokens: Math.floor(Math.random() * 2000) + 500,
              time: Math.random() * 3 + 1,
              cost: Math.random() * 0.03
            }
          };
          setMessages(prev => [...prev, neuronResponse]);
          setIsProcessing(false);
        }, 1500);
      } else {
        setIsProcessing(false);
      }
    }, 1000);
  };

  return (
    <div className={`flex flex-col h-screen ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Header moderne et épuré */}
      <header className={`border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white/80'} backdrop-blur-xl`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo et titre */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl gradient-arcadis flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">AS</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gradient-arcadis">
                  Arcadis Synapse™
                </h1>
                <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Intelligence Architecturale Augmentée
                </p>
              </div>
            </div>

            {/* Contrôles */}
            <div className="flex items-center gap-3">
              {/* Sélecteurs de modèles */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg glass">
                <ModelSelector
                  role="architect"
                  selectedModelId={cortexModel}
                  onModelChange={setCortexModel}
                  className="scale-90"
                />
                <div className={`w-px h-8 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
                <ModelSelector
                  role="executor"
                  selectedModelId={neuronModel}
                  onModelChange={setNeuronModel}
                  className="scale-90"
                />
              </div>

              {/* Mode */}
              <div className="flex rounded-lg overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                {['auto', 'cortex', 'neuron'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m as any)}
                    className={`px-4 py-2 text-sm font-medium transition-all ${
                      mode === m
                        ? 'bg-gradient-arcadis text-white'
                        : theme === 'dark'
                        ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {m === 'auto' ? '🔗 Auto' : m === 'cortex' ? '🧠 Cortex' : '⚡ Neuron'}
                  </button>
                ))}
              </div>

              {/* Métriques */}
              <button
                onClick={() => setShowMetrics(!showMetrics)}
                className={`p-2 rounded-lg transition-all ${
                  showMetrics
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : theme === 'dark'
                    ? 'text-slate-400 hover:bg-slate-800'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>

              {/* Thème */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all ${
                  theme === 'dark'
                    ? 'text-slate-400 hover:bg-slate-800'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {theme === 'dark' ? '🌙' : '☀️'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Zone de messages */}
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-4xl mx-auto space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${message.role === 'user' ? 'order-2' : ''}`}>
                    {/* En-tête du message */}
                    <div className={`flex items-center gap-2 mb-2 ${message.role === 'user' ? 'justify-end' : ''}`}>
                      {message.role !== 'user' && (
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md ${
                          message.role === 'cortex' ? 'gradient-arcadis' : 'bg-gradient-to-br from-green-500 to-emerald-600'
                        }`}>
                          {message.role === 'cortex' ? 'C' : 'N'}
                        </div>
                      )}
                      <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                        {message.role === 'user' ? 'Vous' : message.role === 'cortex' ? 'Cortex' : 'Neuron'}
                        {message.model && ` • ${message.model}`}
                      </div>
                    </div>

                    {/* Contenu du message */}
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'gradient-arcadis text-white shadow-lg'
                        : theme === 'dark'
                        ? 'bg-slate-800 text-slate-200 border border-slate-700'
                        : 'bg-white text-slate-800 border border-slate-200 shadow-sm'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      
                      {/* Métriques */}
                      {showMetrics && message.metrics && (
                        <div className={`mt-3 pt-3 border-t ${
                          message.role === 'user'
                            ? 'border-white/20'
                            : theme === 'dark'
                            ? 'border-slate-700'
                            : 'border-slate-200'
                        }`}>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="opacity-70">
                              🎯 {message.metrics.tokens} tokens
                            </span>
                            <span className="opacity-70">
                              ⏱️ {message.metrics.time?.toFixed(2)}s
                            </span>
                            <span className="opacity-70">
                              💰 ${message.metrics.cost?.toFixed(4)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Indicateur de traitement */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className={`px-4 py-3 rounded-2xl ${
                  theme === 'dark' ? 'bg-slate-800' : 'bg-white border border-slate-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      Traitement en cours...
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Panneau latéral des métriques (optionnel) */}
        {showMetrics && (
          <div className={`w-80 border-l ${
            theme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white/50'
          } backdrop-blur-xl p-4`}>
            <h3 className={`text-sm font-semibold mb-4 ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Métriques de session
            </h3>
            
            <div className="space-y-4">
              {/* Statistiques globales */}
              <div className={`p-3 rounded-lg ${
                theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
              }`}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
                      Messages
                    </p>
                    <p className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                    }`}>
                      {messages.length}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
                      Tokens total
                    </p>
                    <p className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                    }`}>
                      {messages.reduce((acc, m) => acc + (m.metrics?.tokens || 0), 0)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
                      Temps total
                    </p>
                    <p className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                    }`}>
                      {messages.reduce((acc, m) => acc + (m.metrics?.time || 0), 0).toFixed(1)}s
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
                      Coût total
                    </p>
                    <p className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                    }`}>
                      ${messages.reduce((acc, m) => acc + (m.metrics?.cost || 0), 0).toFixed(3)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Graphique de performance */}
              <div className={`p-3 rounded-lg ${
                theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
              }`}>
                <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
                  Performance des modèles
                </p>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Cortex</span>
                      <span>{getModelById(cortexModel)?.name}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full gradient-arcadis" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Neuron</span>
                      <span>{getModelById(neuronModel)?.name}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Zone d'input moderne */}
      <div className={`border-t ${
        theme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white/80'
      } backdrop-blur-xl`}>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="max-w-4xl mx-auto">
            <div className={`flex items-end gap-3 p-3 rounded-xl ${
              theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100/50'
            } border ${
              theme === 'dark' ? 'border-slate-700' : 'border-slate-200'
            } focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all`}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Décrivez votre besoin..."
                className={`flex-1 resize-none bg-transparent outline-none ${
                  theme === 'dark' ? 'text-slate-200 placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'
                } text-sm`}
                rows={1}
                style={{
                  minHeight: '24px',
                  maxHeight: '120px',
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isProcessing}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all transform ${
                  !input.trim() || isProcessing
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'gradient-arcadis text-white hover:scale-105 active:scale-95 shadow-lg'
                }`}
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Envoyer'
                )}
              </button>
            </div>
            <div className={`flex items-center justify-between mt-2 px-1 text-xs ${
              theme === 'dark' ? 'text-slate-500' : 'text-slate-600'
            }`}>
              <span>Entrée pour envoyer, Shift+Entrée pour nouvelle ligne</span>
              <span>
                {input.length > 0 && `${input.length} caractères`}
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}