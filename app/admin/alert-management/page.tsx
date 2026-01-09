'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Bell,
  BellOff,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Trash2,
  Archive,
  TrendingUp,
  Server,
  DollarSign,
  Users,
  Activity
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'system' | 'security' | 'billing' | 'performance' | 'user';
  title: string;
  message: string;
  source: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  priority: number;
  created_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
  assigned_to: string | null;
  actions_taken: string[];
  metadata: any;
}

export default function AlertManagementPage() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'critical',
      category: 'system',
      title: 'High API Error Rate Detected',
      message: 'OpenAI API error rate has exceeded 5% threshold (currently 8.3%)',
      source: 'API Monitor',
      status: 'active',
      priority: 100,
      created_at: new Date().toISOString(),
      acknowledged_at: null,
      resolved_at: null,
      assigned_to: null,
      actions_taken: [],
      metadata: { errorRate: 8.3, threshold: 5, endpoint: '/api/javari/chat' }
    },
    {
      id: '2',
      type: 'warning',
      category: 'billing',
      title: 'Approaching Monthly Budget Limit',
      message: 'Vercel costs have reached 85% of monthly budget ($425 of $500)',
      source: 'Cost Tracker',
      status: 'acknowledged',
      priority: 80,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      acknowledged_at: new Date(Date.now() - 1800000).toISOString(),
      resolved_at: null,
      assigned_to: 'Roy',
      actions_taken: ['Budget review scheduled'],
      metadata: { current: 425, budget: 500, service: 'Vercel' }
    },
    {
      id: '3',
      type: 'warning',
      category: 'performance',
      title: 'Slow Database Query Detected',
      message: 'Query on users table took 3.2 seconds (threshold: 1s)',
      source: 'Database Monitor',
      status: 'resolved',
      priority: 60,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      acknowledged_at: new Date(Date.now() - 5400000).toISOString(),
      resolved_at: new Date(Date.now() - 3600000).toISOString(),
      assigned_to: 'System',
      actions_taken: ['Index added to users.email', 'Query optimized'],
      metadata: { queryTime: 3.2, threshold: 1, table: 'users' }
    },
    {
      id: '4',
      type: 'info',
      category: 'user',
      title: 'New User Milestone Reached',
      message: 'Platform has reached 100 registered users!',
      source: 'User Analytics',
      status: 'dismissed',
      priority: 20,
      created_at: new Date(Date.now() - 10800000).toISOString(),
      acknowledged_at: null,
      resolved_at: null,
      assigned_to: null,
      actions_taken: [],
      metadata: { milestone: 100 }
    },
    {
      id: '5',
      type: 'warning',
      category: 'security',
      title: 'Unusual Login Activity',
      message: '5 failed login attempts from IP 192.168.1.100',
      source: 'Security Monitor',
      status: 'active',
      priority: 75,
      created_at: new Date(Date.now() - 1800000).toISOString(),
      acknowledged_at: null,
      resolved_at: null,
      assigned_to: null,
      actions_taken: [],
      metadata: { ip: '192.168.1.100', attempts: 5, threshold: 3 }
    }
  ]);

  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>(alerts);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('active');
  const [filterCategory, setFilterCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    applyFilters();
    
    // Real-time subscription
    const subscription = supabase
      .channel('alerts-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'alerts' },
        (payload) => {
          console.log('Alert changed:', payload);
          // Reload alerts
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [alerts, searchTerm, filterType, filterStatus, filterCategory]);

  const applyFilters = () => {
    let filtered = [...alerts];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(term) ||
        a.message.toLowerCase().includes(term) ||
        a.source.toLowerCase().includes(term)
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(a => a.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(a => a.status === filterStatus);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(a => a.category === filterCategory);
    }

    // Sort by priority (highest first) then by created_at (newest first)
    filtered.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setFilteredAlerts(filtered);
  };

  const stats = {
    total: alerts.length,
    active: alerts.filter(a => a.status === 'active').length,
    critical: alerts.filter(a => a.type === 'critical' && a.status === 'active').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
    avgResponseTime: '12m'
  };

  const handleAcknowledge = (alertId: string) => {
    setAlerts(alerts.map(a => 
      a.id === alertId 
        ? { ...a, status: 'acknowledged', acknowledged_at: new Date().toISOString(), assigned_to: 'Roy' }
        : a
    ));
  };

  const handleResolve = (alertId: string) => {
    setAlerts(alerts.map(a => 
      a.id === alertId 
        ? { ...a, status: 'resolved', resolved_at: new Date().toISOString() }
        : a
    ));
  };

  const handleDismiss = (alertId: string) => {
    setAlerts(alerts.map(a => 
      a.id === alertId 
        ? { ...a, status: 'dismissed' }
        : a
    ));
  };

  const handleDelete = (alertId: string) => {
    setAlerts(alerts.filter(a => a.id !== alertId));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'warning': return 'bg-cyan-400/20 text-cyan-400 border-cyan-400/30';
      case 'info': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'success': return 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'info': return <Info className="w-5 h-5" />;
      case 'success': return <CheckCircle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system': return <Server className="w-4 h-4" />;
      case 'security': return <AlertTriangle className="w-4 h-4" />;
      case 'billing': return <DollarSign className="w-4 h-4" />;
      case 'performance': return <Activity className="w-4 h-4" />;
      case 'user': return <Users className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-500 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <Bell className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Alert Management</h1>
                <p className="text-slate-400">Monitor and respond to system alerts</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <Bell className="w-5 h-5 text-blue-400" />
                <span className="text-2xl font-bold text-white">{stats.total}</span>
              </div>
              <p className="text-slate-400 text-sm">Total Alerts</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span className="text-2xl font-bold text-white">{stats.active}</span>
              </div>
              <p className="text-slate-400 text-sm">Active</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-2xl font-bold text-white">{stats.critical}</span>
              </div>
              <p className="text-slate-400 text-sm">Critical</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-cyan-500" />
                <span className="text-2xl font-bold text-white">{stats.resolved}</span>
              </div>
              <p className="text-slate-400 text-sm">Resolved</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-cyan-500" />
                <span className="text-2xl font-bold text-white">{stats.avgResponseTime}</span>
              </div>
              <p className="text-slate-400 text-sm">Avg Response</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Types</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Categories</option>
              <option value="system">System</option>
              <option value="security">Security</option>
              <option value="billing">Billing</option>
              <option value="performance">Performance</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className={`bg-slate-800/50 backdrop-blur-sm rounded-lg border p-4 hover:bg-slate-800/70 transition-colors ${
              alert.status === 'active' ? 'border-l-4' : 'border'
            } ${
              alert.type === 'critical' ? 'border-l-red-500 border-slate-700' :
              alert.type === 'warning' ? 'border-l-cyan-400 border-slate-700' :
              'border-slate-700'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      alert.type === 'critical' ? 'bg-red-500/20' :
                      alert.type === 'warning' ? 'bg-cyan-400/20' :
                      alert.type === 'info' ? 'bg-blue-500/20' :
                      'bg-cyan-500/20'
                    }`}>
                      {getTypeIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getTypeColor(alert.type)}`}>
                          {alert.type}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400 text-xs">
                          {getCategoryIcon(alert.category)}
                          {alert.category}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm mb-2">{alert.message}</p>
                      <div className="flex items-center gap-4 text-slate-400 text-xs">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getTimeAgo(alert.created_at)}
                        </span>
                        <span>Source: {alert.source}</span>
                        {alert.assigned_to && (
                          <span>Assigned: {alert.assigned_to}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {alert.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-3 py-1 bg-cyan-400 hover:bg-cyan-400 text-white rounded-lg text-sm transition-colors"
                      >
                        Acknowledge
                      </button>
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="px-3 py-1 bg-cyan-500 hover:bg-cyan-500 text-white rounded-lg text-sm transition-colors"
                      >
                        Resolve
                      </button>
                    </>
                  )}
                  {alert.status === 'acknowledged' && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="px-3 py-1 bg-cyan-500 hover:bg-cyan-500 text-white rounded-lg text-sm transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedAlert(alert);
                      setShowDetailModal(true);
                    }}
                    className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {alert.actions_taken.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <div className="text-slate-400 text-xs mb-1">Actions Taken:</div>
                  <div className="flex flex-wrap gap-2">
                    {alert.actions_taken.map((action, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                        <CheckCircle className="w-3 h-3" />
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredAlerts.length === 0 && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-12 text-center">
              <BellOff className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No alerts match your filters</p>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedAlert && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg max-w-2xl w-full p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Alert Details</h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedAlert(null);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Title</label>
                  <div className="text-white font-medium">{selectedAlert.title}</div>
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-1">Message</label>
                  <div className="bg-slate-900/50 rounded-lg p-3 text-white">{selectedAlert.message}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">Type</label>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getTypeColor(selectedAlert.type)}`}>
                      {selectedAlert.type}
                    </span>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">Category</label>
                    <div className="text-white">{selectedAlert.category}</div>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">Status</label>
                    <div className="text-white capitalize">{selectedAlert.status}</div>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">Priority</label>
                    <div className="text-white">{selectedAlert.priority}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-1">Metadata</label>
                  <pre className="bg-slate-900/50 rounded-lg p-3 text-slate-300 text-xs overflow-x-auto">
                    {JSON.stringify(selectedAlert.metadata, null, 2)}
                  </pre>
                </div>

                {selectedAlert.actions_taken.length > 0 && (
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Actions Taken</label>
                    <div className="space-y-2">
                      {selectedAlert.actions_taken.map((action, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-2">
                          <CheckCircle className="w-4 h-4 text-cyan-500" />
                          <span className="text-white">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedAlert(null);
                }}
                className="mt-6 w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
