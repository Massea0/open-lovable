'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { appConfig } from '@/config/app.config';
import type { 
  ArchitectMessage,
  ExecutorInstruction,
  ExecutorReport,
  SystemHealth,
  AgentActivity
} from '@/types/dual-agent';

interface DualAgentInterfaceProps {
  onSendMessage: (message: string, mode: 'auto' | 'architect-only' | 'executor-only') => Promise<void>;
  isProcessing: boolean;
}

export function DualAgentInterface({ onSendMessage, isProcessing }: DualAgentInterfaceProps) {
  const [userMessage, setUserMessage] = useState('');
  const [mode, setMode] = useState<'auto' | 'architect-only' | 'executor-only'>('auto');
  const [architectMessages, setArchitectMessages] = useState<ArchitectMessage[]>([]);
  const [executorReports, setExecutorReports] = useState<ExecutorReport[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [showMetrics, setShowMetrics] = useState(false);
  
  const architectRef = useRef<HTMLDivElement>(null);
  const executorRef = useRef<HTMLDivElement>(null);
  const activityRef = useRef<HTMLDivElement>(null);

  // Fetch system health periodically
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('/api/dual-agent-orchestrator');
        if (response.ok) {
          const health = await response.json();
          setSystemHealth(health);
        }
      } catch (error) {
        console.error('Failed to fetch system health:', error);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (architectRef.current) {
      architectRef.current.scrollTop = architectRef.current.scrollHeight;
    }
    if (executorRef.current) {
      executorRef.current.scrollTop = executorRef.current.scrollHeight;
    }
    if (activityRef.current) {
      activityRef.current.scrollTop = activityRef.current.scrollHeight;
    }
  }, [architectMessages, executorReports, activities]);

  const handleSend = async () => {
    if (!userMessage.trim() || isProcessing) return;

    const message = userMessage.trim();
    setUserMessage('');

    // Add user message to architect conversation
    const userMsg: ArchitectMessage = {
      id: `msg-${Date.now()}`,
      timestamp: Date.now(),
      from: 'user',
      content: message,
    };
    setArchitectMessages(prev => [...prev, userMsg]);

    // Add activity
    const activity: AgentActivity = {
      timestamp: Date.now(),
      agent: 'architect',
      action: 'Analyse de la requête',
    };
    setActivities(prev => [...prev, activity]);

    // Send to backend
    await onSendMessage(message, mode);
  };

  // Mock function to add architect response
  const addArchitectResponse = (content: string, instructions?: ExecutorInstruction[]) => {
    const architectMsg: ArchitectMessage = {
      id: `msg-${Date.now()}`,
      timestamp: Date.now(),
      from: 'architect',
      content,
      metadata: {
        estimatedTasks: instructions?.length,
      },
    };
    setArchitectMessages(prev => [...prev, architectMsg]);

    if (instructions) {
      const activity: AgentActivity = {
        timestamp: Date.now(),
        agent: 'architect',
        action: `${instructions.length} instructions générées`,
        details: instructions.map(i => i.id),
      };
      setActivities(prev => [...prev, activity]);
    }
  };

  // Mock function to add executor report
  const addExecutorReport = (report: ExecutorReport) => {
    setExecutorReports(prev => [...prev, report]);
    
    const activity: AgentActivity = {
      timestamp: Date.now(),
      agent: 'executor',
      action: `Tâche ${report.status}`,
      details: {
        files: report.results.filesModified?.length || 0,
        duration: report.metrics.executionTime,
      },
      duration: report.metrics.executionTime,
    };
    setActivities(prev => [...prev, activity]);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-500';
      case 'partial': return 'text-yellow-500';
      case 'failed': return 'text-red-500';
      case 'blocked': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const agentColors = appConfig.ui.dualAgentUI.agentColors;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header with System Status */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Système Dual-Agent</h2>
            
            {/* Mode Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Mode:</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="px-2 py-1 text-sm border rounded"
                disabled={isProcessing}
              >
                <option value="auto">Auto (Architecte + Exécutant)</option>
                <option value="architect-only">Architecte seulement</option>
                <option value="executor-only">Exécutant seulement</option>
              </select>
            </div>
          </div>

          {/* System Health Indicators */}
          {systemHealth && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${systemHealth.architects.active ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">Architecte</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${systemHealth.executors.active ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">Exécutant</span>
              </div>
              {systemHealth.overall.apiQuota && (
                <div className="text-sm text-gray-600">
                  API: {systemHealth.overall.apiQuota.used}/{systemHealth.overall.apiQuota.limit}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMetrics(!showMetrics)}
              >
                {showMetrics ? 'Masquer' : 'Métriques'}
              </Button>
            </div>
          )}
        </div>

        {/* Metrics Panel */}
        {showMetrics && systemHealth && (
          <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Temps de réponse moyen:</span>
              <span className="ml-2 font-medium">{systemHealth.architects.averageResponseTime}ms</span>
            </div>
            <div>
              <span className="text-gray-600">Tâches complétées:</span>
              <span className="ml-2 font-medium">{systemHealth.executors.tasksCompleted}</span>
            </div>
            <div>
              <span className="text-gray-600">Taux d'erreur:</span>
              <span className="ml-2 font-medium">{(systemHealth.executors.errorRate * 100).toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Architect Panel */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border">
          <div 
            className="px-4 py-2 border-b flex items-center justify-between"
            style={{ backgroundColor: `${agentColors.architect}20` }}
          >
            <h3 className="font-medium" style={{ color: agentColors.architect }}>
              🏛️ Claude Opus - Architecte
            </h3>
            <span className="text-xs text-gray-500">
              {architectMessages.length} messages
            </span>
          </div>
          
          <div 
            ref={architectRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {architectMessages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    msg.from === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="text-sm">{msg.content}</div>
                  <div className={`text-xs mt-1 ${msg.from === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {formatTimestamp(msg.timestamp)}
                    {msg.metadata?.estimatedTasks && (
                      <span className="ml-2">• {msg.metadata.estimatedTasks} tâches</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isProcessing && mode !== 'executor-only' && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-violet-500 border-t-transparent rounded-full" />
                    <span className="text-sm text-gray-600">Analyse en cours...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Executor Panel */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border">
          <div 
            className="px-4 py-2 border-b flex items-center justify-between"
            style={{ backgroundColor: `${agentColors.executor}20` }}
          >
            <h3 className="font-medium" style={{ color: agentColors.executor }}>
              🔧 Claude 3.5 Sonnet - Exécutant
            </h3>
            <span className="text-xs text-gray-500">
              {executorReports.length} rapports
            </span>
          </div>
          
          <div 
            ref={executorRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {executorReports.map(report => (
              <div key={report.instructionId} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${getStatusColor(report.status)}`}>
                    {report.status === 'success' ? '✅' : report.status === 'failed' ? '❌' : '⚠️'} {report.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(report.timestamp)}
                  </span>
                </div>
                
                {report.results.filesModified && report.results.filesModified.length > 0 && (
                  <div className="text-sm text-gray-600 mb-1">
                    📁 Fichiers: {report.results.filesModified.map(f => f.path).join(', ')}
                  </div>
                )}
                
                {report.results.packagesInstalled && report.results.packagesInstalled.length > 0 && (
                  <div className="text-sm text-gray-600 mb-1">
                    📦 Packages: {report.results.packagesInstalled.join(', ')}
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                  <span>⏱️ {report.metrics.executionTime}ms</span>
                  <span>📝 {report.metrics.linesChanged} lignes</span>
                  <span>📄 {report.metrics.filesAffected} fichiers</span>
                </div>
                
                {report.issues && report.issues.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    {report.issues.map((issue, idx) => (
                      <div key={idx} className={`text-xs ${issue.type === 'error' ? 'text-red-500' : 'text-yellow-500'}`}>
                        {issue.type === 'error' ? '❌' : '⚠️'} {issue.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isProcessing && mode === 'executor-only' && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                  <span className="text-sm text-gray-600">Exécution en cours...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="w-64 flex flex-col bg-white rounded-lg shadow-sm border">
          <div 
            className="px-4 py-2 border-b"
            style={{ backgroundColor: `${agentColors.system}20` }}
          >
            <h3 className="font-medium" style={{ color: agentColors.system }}>
              📊 Activité
            </h3>
          </div>
          
          <div 
            ref={activityRef}
            className="flex-1 overflow-y-auto p-3 space-y-2"
          >
            {activities.map((activity, idx) => (
              <div key={idx} className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span 
                    className="font-medium"
                    style={{ color: activity.agent === 'architect' ? agentColors.architect : agentColors.executor }}
                  >
                    {activity.agent === 'architect' ? '🏛️' : '🔧'}
                  </span>
                  <span className="text-gray-400">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
                <div className="text-gray-600 pl-4">
                  {activity.action}
                  {activity.duration && (
                    <span className="text-gray-400 ml-1">({activity.duration}ms)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-3">
          <Textarea
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Décrivez ce que vous voulez créer ou modifier..."
            className="flex-1 min-h-[60px] resize-none"
            disabled={isProcessing}
          />
          <Button
            onClick={handleSend}
            disabled={!userMessage.trim() || isProcessing}
            className="px-6"
            style={{ 
              backgroundColor: isProcessing ? '#9CA3AF' : agentColors.architect,
              color: 'white'
            }}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Traitement...</span>
              </div>
            ) : (
              'Envoyer'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}