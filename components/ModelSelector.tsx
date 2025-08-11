'use client';

import React, { useState, useEffect } from 'react';
import { AI_MODELS, getModelsByCategory, getModelById, type ModelConfig } from '@/config/models.config';
import { motion, AnimatePresence } from 'framer-motion';

interface ModelSelectorProps {
  role: 'architect' | 'executor';
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
  className?: string;
}

export default function ModelSelector({ 
  role, 
  selectedModelId, 
  onModelChange,
  className = ''
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);
  
  const selectedModel = getModelById(selectedModelId);
  const availableModels = getModelsByCategory(role);
  
  // Filtrer les modèles par recherche
  const filteredModels = availableModels.filter(model => 
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Grouper par provider
  const modelsByProvider = filteredModels.reduce((acc, model) => {
    if (!acc[model.provider]) acc[model.provider] = [];
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, ModelConfig[]>);

  return (
    <div className={`relative ${className}`}>
      {/* Bouton principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-all group"
      >
        {selectedModel && (
          <>
            <span className="text-lg">{selectedModel.icon}</span>
            <div className="text-left">
              <div className="text-sm font-medium text-white">
                {role === 'architect' ? 'Cortex' : 'Neuron'}
              </div>
              <div className="text-xs text-gray-400">{selectedModel.name}</div>
            </div>
            <div className="ml-2 flex items-center gap-1">
              {/* Indicateurs de capacités */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-500">Raisonnement</span>
                  <div className="w-12 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                      style={{ width: `${selectedModel.capabilities.reasoning}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-500">Code</span>
                  <div className="w-12 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                      style={{ width: `${selectedModel.capabilities.coding}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-[480px] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header avec recherche */}
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-sm font-semibold text-white mb-3">
                Sélectionner le modèle {role === 'architect' ? 'Architecte (Cortex)' : 'Exécuteur (Neuron)'}
              </h3>
              <input
                type="text"
                placeholder="Rechercher un modèle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>

            {/* Liste des modèles */}
            <div className="max-h-[500px] overflow-y-auto">
              {Object.entries(modelsByProvider).map(([provider, models]) => (
                <div key={provider} className="border-b border-gray-800 last:border-0">
                  <div className="px-4 py-2 bg-gray-800/30">
                    <span className="text-xs font-semibold text-gray-400 uppercase">
                      {provider}
                    </span>
                  </div>
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        onModelChange(model.id);
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setHoveredModel(model.id)}
                      onMouseLeave={() => setHoveredModel(null)}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-800/50 transition-all ${
                        selectedModelId === model.id ? 'bg-blue-900/20 border-l-2 border-blue-500' : ''
                      }`}
                    >
                      {/* Icon */}
                      <span className="text-2xl">{model.icon}</span>
                      
                      {/* Info */}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">
                            {model.name}
                          </span>
                          {model.recommended && (
                            <span className="px-1.5 py-0.5 bg-green-900/50 text-green-400 text-[10px] font-semibold rounded">
                              RECOMMANDÉ
                            </span>
                          )}
                          {model.beta && (
                            <span className="px-1.5 py-0.5 bg-orange-900/50 text-orange-400 text-[10px] font-semibold rounded">
                              BETA
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">
                            {(model.capabilities.contextWindow / 1000).toFixed(0)}K contexte
                          </span>
                          <span className="text-xs text-gray-500">
                            ${model.pricing.input}/${model.pricing.output} par 1M
                          </span>
                          {model.capabilities.vision && (
                            <span className="text-xs text-blue-400">👁️ Vision</span>
                          )}
                        </div>
                      </div>

                      {/* Barres de capacités */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                              style={{ width: `${model.capabilities.reasoning}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-500 w-8">{model.capabilities.reasoning}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                              style={{ width: `${model.capabilities.coding}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-500 w-8">{model.capabilities.coding}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                              style={{ width: `${model.capabilities.speed}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-500 w-8">{model.capabilities.speed}%</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {/* Footer avec infos */}
            <div className="p-3 bg-gray-800/30 border-t border-gray-800">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{filteredModels.length} modèles disponibles</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Raisonnement</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Code</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span>Vitesse</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}