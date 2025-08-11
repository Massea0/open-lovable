/**
 * Arcadis Synapse™ - Configuration Principale
 * © 2024 Arcadis Tech. Tous droits réservés.
 * 
 * IDE Intelligent propulsé par IA dual-agent
 * Version Enterprise - Usage Interne Arcadis
 */

export const arcadisSynapseConfig = {
  // ═══════════════════════════════════════════
  // IDENTITÉ DE MARQUE
  // ═══════════════════════════════════════════
  brand: {
    name: 'Arcadis Synapse',
    fullName: 'Arcadis Synapse™ IDE',
    tagline: 'Intelligence Architecturale Augmentée',
    company: 'Arcadis Tech',
    version: '1.0.0-enterprise',
    copyright: '© 2024 Arcadis Tech. Proprietary Software.',
    
    // Métaphore du cerveau/synapse
    concepts: {
      architect: 'Cortex', // Remplace "Claude Opus"
      executor: 'Neuron',  // Remplace "Claude Sonnet"
      system: 'Synapse',   // Le système complet
    },
  },

  // ═══════════════════════════════════════════
  // DESIGN SYSTEM
  // ═══════════════════════════════════════════
  design: {
    // Palette de couleurs Arcadis Tech
    colors: {
      // Couleurs principales
      primary: {
        main: '#0A0E27',      // Bleu nuit profond
        light: '#1A1F3A',     // Bleu nuit clair
        dark: '#050714',      // Bleu nuit très foncé
        contrast: '#FFFFFF',   // Texte sur primary
      },
      
      // Couleurs d'accent
      accent: {
        electric: '#00D4FF',   // Bleu électrique (principale)
        neon: '#00FF88',       // Vert néon
        plasma: '#FF00FF',     // Magenta plasma
        quantum: '#FFD700',    // Or quantique
      },
      
      // Gradients futuristes
      gradients: {
        synapse: 'linear-gradient(135deg, #00D4FF 0%, #00FF88 50%, #FFD700 100%)',
        neural: 'linear-gradient(45deg, #0A0E27 0%, #1A1F3A 50%, #00D4FF 100%)',
        quantum: 'linear-gradient(90deg, #FF00FF 0%, #00D4FF 50%, #00FF88 100%)',
        dark: 'linear-gradient(180deg, #0A0E27 0%, #050714 100%)',
      },
      
      // Couleurs sémantiques
      semantic: {
        success: '#00FF88',
        warning: '#FFD700',
        error: '#FF4444',
        info: '#00D4FF',
      },
      
      // Couleurs des agents
      agents: {
        cortex: '#FF00FF',    // Magenta pour l'architecte
        neuron: '#00D4FF',    // Bleu électrique pour l'exécutant
        synapse: '#00FF88',   // Vert néon pour le système
      },
      
      // Couleurs de l'interface
      ui: {
        background: '#0A0E27',
        surface: '#1A1F3A',
        surfaceLight: '#2A2F4A',
        border: '#3A3F5A',
        borderLight: '#4A4F6A',
        text: {
          primary: '#FFFFFF',
          secondary: '#B8BCC8',
          tertiary: '#8A8E9A',
          disabled: '#5A5E6A',
        },
      },
    },
    
    // Typographie
    typography: {
      fontFamily: {
        display: '"Space Grotesk", "Inter", system-ui, sans-serif',
        body: '"Inter", system-ui, -apple-system, sans-serif',
        code: '"JetBrains Mono", "Fira Code", monospace',
      },
      
      sizes: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        base: '1rem',     // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem',  // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem', // 36px
        '5xl': '3rem',    // 48px
      },
      
      weights: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        black: 900,
      },
    },
    
    // Espacements
    spacing: {
      xs: '0.25rem',   // 4px
      sm: '0.5rem',    // 8px
      md: '1rem',      // 16px
      lg: '1.5rem',    // 24px
      xl: '2rem',      // 32px
      '2xl': '3rem',   // 48px
      '3xl': '4rem',   // 64px
    },
    
    // Animations
    animations: {
      duration: {
        instant: '100ms',
        fast: '200ms',
        normal: '300ms',
        slow: '500ms',
        verySlow: '1000ms',
      },
      
      easing: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      
      // Animations spécifiques
      pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      glow: 'glow 2s ease-in-out infinite alternate',
      float: 'float 3s ease-in-out infinite',
      scan: 'scan 2s linear infinite',
    },
    
    // Effets visuels
    effects: {
      // Ombres avec lueur néon
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 212, 255, 0.05)',
        md: '0 4px 6px -1px rgba(0, 212, 255, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 212, 255, 0.15)',
        xl: '0 20px 25px -5px rgba(0, 212, 255, 0.2)',
        glow: '0 0 20px rgba(0, 212, 255, 0.5)',
        neon: '0 0 40px rgba(0, 255, 136, 0.6)',
      },
      
      // Blur effects
      blur: {
        sm: 'blur(4px)',
        md: 'blur(8px)',
        lg: 'blur(16px)',
        xl: 'blur(24px)',
      },
      
      // Bordures
      borders: {
        radius: {
          sm: '0.25rem',
          md: '0.5rem',
          lg: '0.75rem',
          xl: '1rem',
          full: '9999px',
        },
        
        width: {
          thin: '1px',
          medium: '2px',
          thick: '3px',
        },
      },
    },
  },

  // ═══════════════════════════════════════════
  // CONFIGURATION SYSTÈME
  // ═══════════════════════════════════════════
  system: {
    // Métadonnées
    metadata: {
      appName: 'Arcadis Synapse',
      description: 'IDE Intelligent avec Architecture Dual-Agent',
      keywords: ['Arcadis', 'Synapse', 'IDE', 'AI', 'Development'],
      author: 'Arcadis Tech',
      license: 'Proprietary',
    },
    
    // Features flags
    features: {
      dualAgent: true,
      cortexArchitect: true,
      neuronExecutor: true,
      quantumPreview: true,
      neuralNetworkVisualization: true,
      synapseAnalytics: true,
      darkModeOnly: true, // Toujours en dark mode
    },
    
    // Configurations API
    api: {
      endpoints: {
        cortex: '/api/synapse/cortex',
        neuron: '/api/synapse/neuron',
        orchestrator: '/api/synapse/orchestrator',
        analytics: '/api/synapse/analytics',
      },
      
      // Limites et quotas
      limits: {
        maxRequestSize: '10MB',
        maxResponseSize: '50MB',
        timeout: 120000, // 2 minutes
        maxConcurrentRequests: 10,
      },
    },
    
    // Sécurité
    security: {
      encryption: 'AES-256-GCM',
      authentication: 'JWT',
      authorization: 'RBAC',
      auditLog: true,
      dataRetention: '90days',
    },
  },

  // ═══════════════════════════════════════════
  // MESSAGES ET TEXTES UI
  // ═══════════════════════════════════════════
  ui: {
    messages: {
      welcome: 'Bienvenue dans Arcadis Synapse™',
      tagline: 'Intelligence Architecturale Augmentée',
      
      agents: {
        cortex: {
          name: 'Cortex',
          role: 'Architecte Neural',
          description: 'Analyse et conçoit l\'architecture optimale',
          thinking: 'Analyse neurale en cours...',
          ready: 'Cortex prêt',
        },
        neuron: {
          name: 'Neuron',
          role: 'Exécutant Quantique',
          description: 'Implémente avec précision quantique',
          processing: 'Traitement quantique...',
          ready: 'Neuron activé',
        },
        synapse: {
          name: 'Synapse',
          role: 'Orchestrateur',
          description: 'Synchronise les flux neuraux',
          syncing: 'Synchronisation...',
          ready: 'Synapse connectée',
        },
      },
      
      status: {
        initializing: 'Initialisation du réseau neural...',
        connecting: 'Connexion aux synapses...',
        ready: 'Système neural opérationnel',
        processing: 'Traitement quantique en cours...',
        completed: 'Opération complétée',
        error: 'Anomalie détectée',
      },
      
      actions: {
        analyze: 'Analyser',
        execute: 'Exécuter',
        optimize: 'Optimiser',
        deploy: 'Déployer',
        sync: 'Synchroniser',
      },
    },
    
    // Tooltips et aide
    tooltips: {
      cortexPanel: 'Le Cortex analyse et planifie l\'architecture',
      neuronPanel: 'Le Neuron exécute les instructions avec précision',
      synapseFlow: 'Visualisation du flux de données neural',
      quantumPreview: 'Aperçu quantique en temps réel',
    },
  },

  // ═══════════════════════════════════════════
  // ASSETS ET RESSOURCES
  // ═══════════════════════════════════════════
  assets: {
    logo: {
      full: '/assets/arcadis-synapse-logo.svg',
      icon: '/assets/synapse-icon.svg',
      favicon: '/favicon.ico',
    },
    
    icons: {
      cortex: '🧠',
      neuron: '⚡',
      synapse: '🔗',
      quantum: '⚛️',
      neural: '🌐',
    },
    
    sounds: {
      startup: '/sounds/synapse-startup.mp3',
      success: '/sounds/quantum-success.mp3',
      error: '/sounds/neural-error.mp3',
      notification: '/sounds/synapse-ping.mp3',
    },
  },

  // ═══════════════════════════════════════════
  // ANALYTICS ET TELEMETRIE
  // ═══════════════════════════════════════════
  analytics: {
    enabled: true,
    provider: 'arcadis-internal',
    
    metrics: {
      performance: true,
      usage: true,
      errors: true,
      aiMetrics: true,
    },
    
    events: {
      trackUserActions: true,
      trackAIInteractions: true,
      trackSystemPerformance: true,
    },
  },
};

// Export type-safe config getter
export function getSynapseConfig<K extends keyof typeof arcadisSynapseConfig>(
  key: K
): typeof arcadisSynapseConfig[K] {
  return arcadisSynapseConfig[key];
}

export default arcadisSynapseConfig;