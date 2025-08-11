// Application Configuration
// This file contains all configurable settings for the application

export const appConfig = {
  // E2B Sandbox Configuration
  e2b: {
    // Sandbox timeout in minutes
    timeoutMinutes: 15,
    
    // Convert to milliseconds for E2B API
    get timeoutMs() {
      return this.timeoutMinutes * 60 * 1000;
    },
    
    // Vite development server port
    vitePort: 5173,
    
    // Time to wait for Vite to be ready (in milliseconds)
    viteStartupDelay: 7000,
    
    // Time to wait for CSS rebuild (in milliseconds)
    cssRebuildDelay: 2000,
    
    // Default sandbox template (if using templates)
    defaultTemplate: undefined, // or specify a template ID
  },
  
  // AI Model Configuration
  ai: {
    // Default AI model
    defaultModel: 'moonshotai/kimi-k2-instruct',
    
    // Available models
    availableModels: [
      'openai/gpt-5',
      'moonshotai/kimi-k2-instruct',
      'anthropic/claude-sonnet-4-20250514'
    ],
    
    // Model display names
    modelDisplayNames: {
      'openai/gpt-5': 'GPT-5',
      'moonshotai/kimi-k2-instruct': 'Kimi K2 Instruct',
      'anthropic/claude-sonnet-4-20250514': 'Sonnet 4'
    },
    
    // Temperature settings for non-reasoning models
    defaultTemperature: 0.7,
    
    // Max tokens for code generation
    maxTokens: 8000,
    
    // Max tokens for truncation recovery
    truncationRecoveryMaxTokens: 4000,
    
    // Dual-Agent System Configuration
    dualAgent: {
      enabled: true,
      
      // Claude Opus - L'Architecte
      architect: {
        model: 'anthropic/claude-3-opus-20240229',
        displayName: 'Claude Opus (Architecte)',
        temperature: 0.3, // Basse pour cohérence architecturale
        maxTokens: 4096,
        persistDocumentation: true,
        documentationPath: '.architect-docs',
        
        // Limites de communication
        maxInstructionsPerTask: 5,
        maxInstructionLength: 500,
        
        // Tracking et métriques
        enableMetrics: true,
        metricsRetentionDays: 30,
      },
      
      // Claude 3.5 Sonnet - L'Exécutant
      executor: {
        model: 'anthropic/claude-3-5-sonnet-20241022',
        displayName: 'Claude 3.5 Sonnet (Exécutant)',
        temperature: 0.5, // Équilibre créativité/précision
        maxTokens: 8192,
        
        // Reset automatique
        autoReset: true,
        resetThreshold: 3, // Reset après 3 erreurs consécutives
        preserveContext: false, // Ne pas garder le contexte après reset
        
        // Limites d'exécution
        maxExecutionTime: 120000, // 2 minutes max par tâche
        maxRetries: 2,
      },
      
      // Communication entre agents
      communication: {
        protocol: 'structured', // 'structured' ou 'natural'
        requireValidation: true,
        logAllCommunication: true,
        communicationLogPath: '.agent-communication',
        
        // Format des messages
        messageFormat: {
          includeTimestamp: true,
          includeMetrics: true,
          includeDiff: true,
        },
      },
      
      // Stratégies de fallback
      fallback: {
        enabled: true,
        singleAgentModel: 'anthropic/claude-sonnet-4-20250514',
        triggerOnArchitectError: true,
        triggerOnExecutorTimeout: true,
      },
    },
  },
  
  // Code Application Configuration
  codeApplication: {
    // Delay after applying code before refreshing iframe (milliseconds)
    defaultRefreshDelay: 2000,
    
    // Delay when packages are installed (milliseconds)
    packageInstallRefreshDelay: 5000,
    
    // Enable/disable automatic truncation recovery
    enableTruncationRecovery: false, // Disabled - too many false positives
    
    // Maximum number of truncation recovery attempts per file
    maxTruncationRecoveryAttempts: 1,
  },
  
  // UI Configuration
  ui: {
    // Show/hide certain UI elements
    showModelSelector: true,
    showStatusIndicator: true,
    
    // Animation durations (milliseconds)
    animationDuration: 200,
    
    // Toast notification duration (milliseconds)
    toastDuration: 3000,
    
    // Maximum chat messages to keep in memory
    maxChatMessages: 100,
    
    // Maximum recent messages to send as context
    maxRecentMessagesContext: 20,
    
    // Dual-Agent UI Configuration
    dualAgentUI: {
      showAgentIndicators: true,
      showCommunicationFlow: true,
      showMetrics: true,
      splitView: true, // Afficher architecte et exécutant côte à côte
      
      // Couleurs pour différencier les agents
      agentColors: {
        architect: '#8B5CF6', // Violet pour Opus
        executor: '#3B82F6', // Bleu pour Sonnet
        system: '#10B981', // Vert pour système
      },
    },
  },
  
  // Development Configuration
  dev: {
    // Enable debug logging
    enableDebugLogging: true,
    
    // Enable performance monitoring
    enablePerformanceMonitoring: false,
    
    // Log API responses
    logApiResponses: true,
  },
  
  // Package Installation Configuration
  packages: {
    // Use --legacy-peer-deps flag for npm install
    useLegacyPeerDeps: true,
    
    // Package installation timeout (milliseconds)
    installTimeout: 60000,
    
    // Auto-restart Vite after package installation
    autoRestartVite: true,
  },
  
  // File Management Configuration
  files: {
    // Excluded file patterns (files to ignore)
    excludePatterns: [
      'node_modules/**',
      '.git/**',
      '.next/**',
      'dist/**',
      'build/**',
      '*.log',
      '.DS_Store'
    ],
    
    // Maximum file size to read (bytes)
    maxFileSize: 1024 * 1024, // 1MB
    
    // File extensions to treat as text
    textFileExtensions: [
      '.js', '.jsx', '.ts', '.tsx',
      '.css', '.scss', '.sass',
      '.html', '.xml', '.svg',
      '.json', '.yml', '.yaml',
      '.md', '.txt', '.env',
      '.gitignore', '.dockerignore'
    ],
  },
  
  // API Endpoints Configuration (for external services)
  api: {
    // Retry configuration
    maxRetries: 3,
    retryDelay: 1000, // milliseconds
    
    // Request timeout (milliseconds)
    requestTimeout: 30000,
  }
};

// Type-safe config getter
export function getConfig<K extends keyof typeof appConfig>(key: K): typeof appConfig[K] {
  return appConfig[key];
}

// Helper to get nested config values
export function getConfigValue(path: string): any {
  return path.split('.').reduce((obj, key) => obj?.[key], appConfig as any);
}

export default appConfig;