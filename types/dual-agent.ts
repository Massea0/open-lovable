// Types pour le système dual-agent avec Claude Opus (Architecte) et Claude 3.5 Sonnet (Exécutant)

export type AgentRole = 'architect' | 'executor';
export type AgentModel = 'claude-opus' | 'claude-sonnet';

// État de la documentation maintenue par Opus
export interface ArchitectDocumentation {
  projectOverview: {
    vision: string;
    objectives: string[];
    constraints: string[];
    techStack: string[];
    lastUpdated: number;
  };
  
  architecturalDecisions: Array<{
    id: string;
    timestamp: number;
    decision: string;
    rationale: string;
    impact: string;
    alternatives?: string[];
  }>;
  
  componentRegistry: Map<string, {
    path: string;
    purpose: string;
    dependencies: string[];
    interfaces: string[];
    lastModified: number;
    qualityScore: number;
  }>;
  
  taskHistory: Array<{
    id: string;
    timestamp: number;
    request: string;
    instructions: string[];
    executor: string;
    result: 'success' | 'partial' | 'failed';
    metrics: TaskMetrics;
  }>;
  
  knowledgeBase: {
    patterns: Map<string, string>; // Patterns découverts
    antiPatterns: Map<string, string>; // Erreurs à éviter
    optimizations: Map<string, string>; // Optimisations appliquées
  };
}

// Métriques de performance pour chaque tâche
export interface TaskMetrics {
  executionTime: number;
  linesChanged: number;
  filesAffected: number;
  testsPassingBefore?: number;
  testsPassingAfter?: number;
  performanceImpact?: number;
  codeQuality: {
    complexity?: number;
    maintainability?: number;
    testCoverage?: number;
  };
}

// Message entre l'utilisateur et l'architecte
export interface ArchitectMessage {
  id: string;
  timestamp: number;
  from: 'user' | 'architect';
  content: string;
  metadata?: {
    intent?: string;
    complexity?: 'simple' | 'moderate' | 'complex';
    estimatedTasks?: number;
  };
}

// Instructions de l'architecte vers l'exécutant
export interface ExecutorInstruction {
  id: string;
  taskId: string;
  timestamp: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Instructions ultra-précises (max 5 phrases)
  instructions: string[];
  
  // Contexte technique spécifique
  context: {
    targetFiles: string[];
    searchPatterns?: string[];
    dependencies?: string[];
    constraints?: string[];
  };
  
  // Critères de validation
  validation: {
    expectedChanges: string[];
    testCases?: string[];
    performanceTargets?: Record<string, number>;
  };
  
  // Méta-données pour le tracking
  metadata: {
    estimatedTime?: number;
    requiredSkills?: string[];
    riskLevel?: 'low' | 'medium' | 'high';
  };
}

// Rapport de l'exécutant vers l'architecte
export interface ExecutorReport {
  instructionId: string;
  timestamp: number;
  status: 'success' | 'partial' | 'failed' | 'blocked';
  
  // Résultats détaillés
  results: {
    filesModified: Array<{
      path: string;
      changes: number;
      diff?: string;
    }>;
    packagesInstalled?: string[];
    commandsExecuted?: Array<{
      command: string;
      output: string;
      exitCode: number;
    }>;
  };
  
  // Problèmes rencontrés
  issues?: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    file?: string;
    line?: number;
  }>;
  
  // Métriques d'exécution
  metrics: TaskMetrics;
  
  // Suggestions pour l'architecte
  feedback?: {
    clarificationsNeeded?: string[];
    suggestedImprovements?: string[];
    discoveredPatterns?: string[];
  };
}

// État global du système dual-agent
export interface DualAgentState {
  sessionId: string;
  startedAt: number;
  lastActivity: number;
  
  architect: {
    model: 'claude-opus';
    documentation: ArchitectDocumentation;
    conversationHistory: ArchitectMessage[];
    pendingTasks: ExecutorInstruction[];
    completedTasks: string[];
  };
  
  executor: {
    model: 'claude-sonnet';
    currentInstruction?: ExecutorInstruction;
    reports: ExecutorReport[];
    resetCount: number; // Nombre de fois que l'exécutant a été réinitialisé
    lastReset?: number;
  };
  
  performance: {
    totalTasks: number;
    successRate: number;
    averageExecutionTime: number;
    codeQualityTrend: number[]; // Évolution de la qualité
    userSatisfactionScore?: number;
  };
}

// Configuration pour les agents
export interface AgentConfig {
  architect: {
    model: 'anthropic/claude-3-opus-20240229';
    temperature: 0.3; // Plus bas pour des décisions cohérentes
    maxTokens: 4096;
    systemPrompt: string;
    persistDocumentation: boolean;
    documentationPath?: string;
  };
  
  executor: {
    model: 'anthropic/claude-3-5-sonnet-20241022';
    temperature: 0.5; // Équilibre créativité/précision
    maxTokens: 8192;
    systemPrompt: string;
    autoReset: boolean;
    resetThreshold?: number; // Nombre d'erreurs avant reset
  };
  
  communication: {
    maxInstructionLength: 500; // Caractères max par instruction
    maxInstructionsPerTask: 5;
    requireValidation: boolean;
    logCommunication: boolean;
  };
}

// Types pour les API endpoints
export interface ArchitectRequest {
  userMessage: string;
  context?: {
    recentChanges?: string[];
    currentFocus?: string;
    preferences?: Record<string, any>;
  };
}

export interface ArchitectResponse {
  architectMessage: string;
  instructions: ExecutorInstruction[];
  documentationUpdates?: Partial<ArchitectDocumentation>;
  estimatedTime?: number;
}

export interface ExecutorRequest {
  instruction: ExecutorInstruction;
  sandboxId?: string;
  dryRun?: boolean;
}

export interface ExecutorResponse {
  report: ExecutorReport;
  codeGenerated?: string;
  nextSteps?: string[];
}

// Types pour le monitoring en temps réel
export interface AgentActivity {
  timestamp: number;
  agent: AgentRole;
  action: string;
  details?: any;
  duration?: number;
}

export interface SystemHealth {
  architects: {
    active: boolean;
    lastResponse: number;
    queueLength: number;
    averageResponseTime: number;
  };
  executors: {
    active: boolean;
    currentTask?: string;
    tasksCompleted: number;
    errorRate: number;
  };
  overall: {
    status: 'healthy' | 'degraded' | 'down';
    uptime: number;
    memoryUsage: number;
    apiQuota?: {
      used: number;
      limit: number;
    };
  };
}