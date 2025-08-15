/**
 * Arcadis Synapse™ - Configuration Multi-Modèles
 * Support de tous les LLMs majeurs
 */

export interface ModelConfig {
  id: string;
  name: string;
  provider: 'anthropic' | 'openai' | 'google' | 'mistral' | 'meta' | 'cohere' | 'perplexity';
  category: 'architect' | 'executor' | 'both';
  capabilities: {
    reasoning: number; // 0-100
    coding: number; // 0-100
    speed: number; // 0-100
    contextWindow: number; // en tokens
    vision?: boolean;
    tools?: boolean;
    streaming?: boolean;
  };
  pricing: {
    input: number; // $ per 1M tokens
    output: number; // $ per 1M tokens
  };
  icon: string; // emoji ou URL
  color: string; // couleur hex
  recommended?: boolean;
  beta?: boolean;
  requiresKey: string; // nom de la variable env
}

export const AI_MODELS: ModelConfig[] = [
  // ========== ANTHROPIC ==========
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    category: 'architect',
    capabilities: {
      reasoning: 98,
      coding: 95,
      speed: 70,
      contextWindow: 200000,
      vision: true,
      tools: true,
      streaming: true
    },
    pricing: { input: 15, output: 75 },
    icon: '🎭',
    color: '#D97706',
    recommended: true,
    requiresKey: 'ANTHROPIC_API_KEY'
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    category: 'both',
    capabilities: {
      reasoning: 95,
      coding: 98,
      speed: 85,
      contextWindow: 200000,
      vision: true,
      tools: true,
      streaming: true
    },
    pricing: { input: 3, output: 15 },
    icon: '⚡',
    color: '#8B5CF6',
    recommended: true,
    requiresKey: 'ANTHROPIC_API_KEY'
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    category: 'executor',
    capabilities: {
      reasoning: 85,
      coding: 88,
      speed: 95,
      contextWindow: 200000,
      vision: true,
      tools: true,
      streaming: true
    },
    pricing: { input: 1, output: 5 },
    icon: '🏃',
    color: '#10B981',
    requiresKey: 'ANTHROPIC_API_KEY'
  },

  // ========== OPENAI ==========
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    category: 'both',
    capabilities: {
      reasoning: 93,
      coding: 92,
      speed: 88,
      contextWindow: 128000,
      vision: true,
      tools: true,
      streaming: true
    },
    pricing: { input: 2.5, output: 10 },
    icon: '🧠',
    color: '#10A37F',
    recommended: true,
    requiresKey: 'OPENAI_API_KEY'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    category: 'executor',
    capabilities: {
      reasoning: 85,
      coding: 87,
      speed: 92,
      contextWindow: 128000,
      vision: true,
      tools: true,
      streaming: true
    },
    pricing: { input: 0.15, output: 0.6 },
    icon: '💨',
    color: '#10A37F',
    requiresKey: 'OPENAI_API_KEY'
  },
  {
    id: 'o1-preview',
    name: 'OpenAI o1 Preview',
    provider: 'openai',
    category: 'architect',
    capabilities: {
      reasoning: 99,
      coding: 96,
      speed: 60,
      contextWindow: 128000,
      vision: false,
      tools: false,
      streaming: false
    },
    pricing: { input: 15, output: 60 },
    icon: '🔬',
    color: '#FF6B6B',
    beta: true,
    requiresKey: 'OPENAI_API_KEY'
  },
  {
    id: 'o1-mini',
    name: 'OpenAI o1 Mini',
    provider: 'openai',
    category: 'architect',
    capabilities: {
      reasoning: 95,
      coding: 93,
      speed: 75,
      contextWindow: 128000,
      vision: false,
      tools: false,
      streaming: false
    },
    pricing: { input: 3, output: 12 },
    icon: '🧪',
    color: '#FF9F1C',
    beta: true,
    requiresKey: 'OPENAI_API_KEY'
  },

  // ========== GOOGLE ==========
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    category: 'both',
    capabilities: {
      reasoning: 92,
      coding: 94,
      speed: 95,
      contextWindow: 1000000,
      vision: true,
      tools: true,
      streaming: true
    },
    pricing: { input: 0, output: 0 }, // Gratuit en preview
    icon: '✨',
    color: '#4285F4',
    beta: true,
    recommended: true,
    requiresKey: 'GOOGLE_API_KEY'
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    category: 'both',
    capabilities: {
      reasoning: 94,
      coding: 91,
      speed: 82,
      contextWindow: 2000000,
      vision: true,
      tools: true,
      streaming: true
    },
    pricing: { input: 1.25, output: 5 },
    icon: '💎',
    color: '#DB4437',
    requiresKey: 'GOOGLE_API_KEY'
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    category: 'executor',
    capabilities: {
      reasoning: 88,
      coding: 89,
      speed: 94,
      contextWindow: 1000000,
      vision: true,
      tools: true,
      streaming: true
    },
    pricing: { input: 0.075, output: 0.3 },
    icon: '⚡',
    color: '#F4B400',
    requiresKey: 'GOOGLE_API_KEY'
  },

  // ========== MISTRAL ==========
  {
    id: 'mistral-large-latest',
    name: 'Mistral Large',
    provider: 'mistral',
    category: 'both',
    capabilities: {
      reasoning: 91,
      coding: 90,
      speed: 86,
      contextWindow: 128000,
      vision: false,
      tools: true,
      streaming: true
    },
    pricing: { input: 2, output: 6 },
    icon: '🌬️',
    color: '#FF7000',
    requiresKey: 'MISTRAL_API_KEY'
  },
  {
    id: 'codestral-latest',
    name: 'Codestral',
    provider: 'mistral',
    category: 'executor',
    capabilities: {
      reasoning: 85,
      coding: 95,
      speed: 90,
      contextWindow: 32000,
      vision: false,
      tools: true,
      streaming: true
    },
    pricing: { input: 0.2, output: 0.6 },
    icon: '👨‍💻',
    color: '#FF4500',
    requiresKey: 'MISTRAL_API_KEY'
  },
  {
    id: 'mistral-small-latest',
    name: 'Mistral Small',
    provider: 'mistral',
    category: 'executor',
    capabilities: {
      reasoning: 83,
      coding: 85,
      speed: 93,
      contextWindow: 32000,
      vision: false,
      tools: true,
      streaming: true
    },
    pricing: { input: 0.2, output: 0.6 },
    icon: '🍃',
    color: '#FFA500',
    requiresKey: 'MISTRAL_API_KEY'
  },

  // ========== META ==========
  {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    provider: 'meta',
    category: 'both',
    capabilities: {
      reasoning: 90,
      coding: 88,
      speed: 80,
      contextWindow: 128000,
      vision: false,
      tools: true,
      streaming: true
    },
    pricing: { input: 0.5, output: 1.5 }, // Via providers tiers
    icon: '🦙',
    color: '#0084FF',
    requiresKey: 'TOGETHER_API_KEY'
  },
  {
    id: 'llama-3.2-90b-vision',
    name: 'Llama 3.2 90B Vision',
    provider: 'meta',
    category: 'architect',
    capabilities: {
      reasoning: 91,
      coding: 87,
      speed: 75,
      contextWindow: 128000,
      vision: true,
      tools: true,
      streaming: true
    },
    pricing: { input: 0.8, output: 2.4 },
    icon: '👁️',
    color: '#5865F2',
    requiresKey: 'TOGETHER_API_KEY'
  },

  // ========== COHERE ==========
  {
    id: 'command-r-plus',
    name: 'Command R+',
    provider: 'cohere',
    category: 'both',
    capabilities: {
      reasoning: 89,
      coding: 86,
      speed: 85,
      contextWindow: 128000,
      vision: false,
      tools: true,
      streaming: true
    },
    pricing: { input: 2.5, output: 10 },
    icon: '🎯',
    color: '#39AC56',
    requiresKey: 'COHERE_API_KEY'
  },
  {
    id: 'command-r',
    name: 'Command R',
    provider: 'cohere',
    category: 'executor',
    capabilities: {
      reasoning: 85,
      coding: 84,
      speed: 90,
      contextWindow: 128000,
      vision: false,
      tools: true,
      streaming: true
    },
    pricing: { input: 0.15, output: 0.6 },
    icon: '💬',
    color: '#2ECC71',
    requiresKey: 'COHERE_API_KEY'
  },

  // ========== PERPLEXITY ==========
  {
    id: 'sonar-pro',
    name: 'Perplexity Sonar Pro',
    provider: 'perplexity',
    category: 'architect',
    capabilities: {
      reasoning: 92,
      coding: 88,
      speed: 83,
      contextWindow: 200000,
      vision: false,
      tools: true,
      streaming: true
    },
    pricing: { input: 3, output: 15 },
    icon: '🔍',
    color: '#20B2AA',
    requiresKey: 'PERPLEXITY_API_KEY'
  },
  {
    id: 'sonar',
    name: 'Perplexity Sonar',
    provider: 'perplexity',
    category: 'executor',
    capabilities: {
      reasoning: 87,
      coding: 85,
      speed: 88,
      contextWindow: 127000,
      vision: false,
      tools: true,
      streaming: true
    },
    pricing: { input: 0.6, output: 1.8 },
    icon: '🎵',
    color: '#48D1CC',
    requiresKey: 'PERPLEXITY_API_KEY'
  }
];

// Helpers pour filtrer les modèles
export const getModelsByCategory = (category: 'architect' | 'executor' | 'both') => {
  return AI_MODELS.filter(m => m.category === category || m.category === 'both');
};

export const getModelsByProvider = (provider: string) => {
  return AI_MODELS.filter(m => m.provider === provider);
};

export const getRecommendedModels = () => {
  return AI_MODELS.filter(m => m.recommended);
};

export const getModelById = (id: string) => {
  return AI_MODELS.find(m => m.id === id);
};

// Configuration par défaut
export const DEFAULT_MODELS = {
  architect: 'claude-3-opus-20240229',
  executor: 'claude-3-5-sonnet-20241022'
};

// Mapping des providers vers leurs SDKs
export const PROVIDER_CONFIGS = {
  anthropic: {
    name: 'Anthropic',
    sdkPackage: '@anthropic-ai/sdk',
    envKey: 'ANTHROPIC_API_KEY',
    baseUrl: 'https://api.anthropic.com'
  },
  openai: {
    name: 'OpenAI',
    sdkPackage: 'openai',
    envKey: 'OPENAI_API_KEY',
    baseUrl: 'https://api.openai.com'
  },
  google: {
    name: 'Google AI',
    sdkPackage: '@google/generative-ai',
    envKey: 'GOOGLE_API_KEY',
    baseUrl: 'https://generativelanguage.googleapis.com'
  },
  mistral: {
    name: 'Mistral AI',
    sdkPackage: '@mistralai/mistralai',
    envKey: 'MISTRAL_API_KEY',
    baseUrl: 'https://api.mistral.ai'
  },
  meta: {
    name: 'Meta (via Together)',
    sdkPackage: 'together-ai',
    envKey: 'TOGETHER_API_KEY',
    baseUrl: 'https://api.together.xyz'
  },
  cohere: {
    name: 'Cohere',
    sdkPackage: 'cohere-ai',
    envKey: 'COHERE_API_KEY',
    baseUrl: 'https://api.cohere.ai'
  },
  perplexity: {
    name: 'Perplexity',
    sdkPackage: 'openai', // Utilise le SDK OpenAI
    envKey: 'PERPLEXITY_API_KEY',
    baseUrl: 'https://api.perplexity.ai'
  }
};