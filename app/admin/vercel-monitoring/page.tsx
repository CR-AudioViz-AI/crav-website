'use client';

import { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  GitBranch,
  RefreshCw,
  Eye,
  AlertCircle,
  TrendingUp,
  Zap,
  ExternalLink,
  Terminal,
  Play,
  Pause
} from 'lucide-react';

interface Deployment {
  id: string;
  name: string;
  url: string;
  created: number;
  state: 'READY' | 'ERROR' | 'BUILDING' | 'QUEUED' | 'CANCELED';
  creator: {
    username: string;
    email: string;
  };
  meta: {
    githubCommitMessage?: string;
    githubCommitRef?: string;
    githubCommitSha?: string;
    githubCommitAuthorName?: string;
  };
  inspectorUrl: string;
  target?: string | null;
}

interface ProjectStats {
  totalDeployments: number;
  successRate: number;
  avgBuildTime: number;
  lastDeployment: string;
  activeDeployments: number;
  failedToday: number;
}

interface BuildLog {
  text: string;
  type: 'stdout' | 'stderr';
  level?: 'error' | 'warning' | 'info';
  created: number;
}

export default function VercelMonitoringPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [logs, setLogs] = useState<BuildLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vercel configuration (using MCP - configured automatically)
  const TEAM_ID = 'team_Z0yef7NlFu1coCJWz8UmUdI5';
  const PROJECT_ID = 'prj_fmk3PLscIPrcAseKwhjCMBglH8C4';

  useEffect(() => {
    loadDeployments();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadDeployments(true);
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadDeployments = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    
    try {
      // Fetch from Vercel API via our backend proxy
      const response = await fetch(`/api/admin/vercel/deployments?projectId=${PROJECT_ID}&teamId=${TEAM_ID}&limit=20`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.deployments && Array.isArray(result.deployments)) {
        setDeployments(result.deployments);
        calculateStats(result.deployments);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error loading deployments:', error);
      setError(error instanceof Error ? error.message : 'Failed to load deployments');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (deploymentsList: Deployment[]) => {
    const total = deploymentsList.length;
    const successful = deploymentsList.filter(d => d.state === 'READY').length;
    const successRate = total > 0 ? (successful / total) * 100 : 0;
    const building = deploymentsList.filter(d => d.state === 'BUILDING').length;
    
    // Calculate failed deployments today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const failedToday = deploymentsList.filter(d => 
      d.state === 'ERROR' && d.created >= today.getTime()
    ).length;

    setStats({
      totalDeployments: total,
      successRate: successRate,
      avgBuildTime: 47, // Would need to calculate from actual build times
      lastDeployment: deploymentsList[0] ? new Date(deploymentsList[0].created).toLocaleString() : 'Never',
      activeDeployments: building,
      failedToday: failedToday
    });
  };

  const loadBuildLogs = async (deployment: Deployment) => {
    setLoadingLogs(true);
    try {
      const response = await fetch(
        `/api/admin/vercel/logs?deploymentId=${deployment.id}&teamId=${TEAM_ID}&limit=100`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load logs: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.logs && Array.isArray(result.logs)) {
        setLogs(result.logs);
      } else {
        setLogs([{
          text: 'Build logs are being generated...',
          type: 'stdout',
          created: Date.now()
        }]);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
      setLogs([{
        text: `Error loading logs: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'stderr',
        level: 'error',
        created: Date.now()
      }]);
    } finally {
      setLoadingLogs(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadDeployments();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const openDeploymentLogs = async (deployment: Deployment) => {
    setSelectedDeployment(deployment);
    setShowLogsModal(true);
    await loadBuildLogs(deployment);
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'READY': return 'bg-cyan-500';
      case 'ERROR': return 'bg-red-500';
      case 'BUILDING': return 'bg-blue-500';
      case 'QUEUED': return 'bg-cyan-400';
      case 'CANCELED': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'READY':
        return <CheckCircle2 className="w-5 h-5 text-cyan-500" />;
      case 'ERROR':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'BUILDING':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'QUEUED':
        return <Clock className="w-5 h-5 text-cyan-400" />;
      case 'CANCELED':
        return <AlertCircle className="w-5 h-5 text-slate-500" />;
      default:
        return <Activity className="w-5 h-5 text-slate-500" />;
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-slate-400 text-lg">Connecting to Vercel API...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="bg-red-500/10 border border-red-500 rounded-xl p-8 max-w-md">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white text-center mb-2">Vercel API Error</h3>
              <p className="text-slate-400 text-center mb-4">{error}</p>
              <button
                onClick={loadDeployments}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Zap className="w-10 h-10 text-blue-500" />
              Vercel Monitoring
            </h1>
            <p className="text-slate-400 text-lg">
              Real-time deployment tracking • Live build logs • Auto-refresh
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                autoRefresh
                  ? 'bg-cyan-500 hover:bg-cyan-500 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
            >
              {autoRefresh ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 ${
                refreshing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-slate-400 text-sm font-medium">Recent Deployments</h3>
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalDeployments}</p>
              <p className="text-slate-500 text-sm mt-1">last 20 builds</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-slate-400 text-sm font-medium">Success Rate</h3>
                <TrendingUp className="w-5 h-5 text-cyan-500" />
              </div>
              <p className="text-3xl font-bold text-white">{stats.successRate.toFixed(1)}%</p>
              <p className="text-slate-500 text-sm mt-1">build quality</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-slate-400 text-sm font-medium">Building Now</h3>
                <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
              </div>
              <p className="text-3xl font-bold text-white">{stats.activeDeployments}</p>
              <p className="text-slate-500 text-sm mt-1">active builds</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-slate-400 text-sm font-medium">Failed Today</h3>
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-white">{stats.failedToday}</p>
              <p className="text-slate-500 text-sm mt-1">errors logged</p>
            </div>
          </div>
        )}

        {/* Deployments List */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <GitBranch className="w-6 h-6 text-blue-500" />
              Live Deployments
            </h2>
          </div>

          <div className="divide-y divide-slate-700">
            {deployments.length === 0 ? (
              <div className="p-12 text-center">
                <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No deployments found</p>
              </div>
            ) : (
              deployments.map((deployment) => (
                <div
                  key={deployment.id}
                  className="p-6 hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={() => openDeploymentLogs(deployment)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {getStateIcon(deployment.state)}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold text-lg">
                            {deployment.meta.githubCommitMessage || 'No commit message'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStateColor(deployment.state)} text-white`}>
                            {deployment.state}
                          </span>
                          {deployment.target === 'production' && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-500 text-white">
                              PRODUCTION
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <GitBranch className="w-4 h-4" />
                            {deployment.meta.githubCommitRef || 'unknown'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTimeAgo(deployment.created)}
                          </span>
                          <span className="font-mono text-xs">
                            {deployment.meta.githubCommitSha?.substring(0, 7) || 'no-sha'}
                          </span>
                          <span>
                            by {deployment.meta.githubCommitAuthorName || deployment.creator.username}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={deployment.inspectorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Inspector
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeploymentLogs(deployment);
                        }}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Terminal className="w-4 h-4" />
                        Logs
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Logs Modal */}
      {showLogsModal && selectedDeployment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Build Logs</h2>
                <p className="text-slate-400 text-sm">{selectedDeployment.meta.githubCommitMessage}</p>
              </div>
              <button
                onClick={() => {
                  setShowLogsModal(false);
                  setSelectedDeployment(null);
                  setLogs([]);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {loadingLogs ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : (
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <div className="space-y-1">
                    {logs.length === 0 ? (
                      <div className="text-slate-500">No logs available</div>
                    ) : (
                      logs.map((log, index) => (
                        <div
                          key={index}
                          className={`${
                            log.level === 'error'
                              ? 'text-red-400'
                              : log.level === 'warning'
                              ? 'text-cyan-400'
                              : log.type === 'stderr'
                              ? 'text-cyan-500'
                              : 'text-slate-300'
                          }`}
                        >
                          {log.text}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setShowLogsModal(false);
                  setSelectedDeployment(null);
                  setLogs([]);
                }}
                className="w-full mt-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
