'use client';

// app/admin/grants/GrantsDashboard.tsx
// CR AudioViz AI - Complete Grant Management System
// Features: Kanban/List toggle, real-time updates, drag-and-drop, AI analysis
// Timestamp: Sunday, December 15, 2025 - 10:15 AM EST

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  LayoutGrid, List, Plus, Search, Filter, RefreshCw, 
  Calendar, DollarSign, Target, AlertTriangle, CheckCircle,
  Clock, ArrowUpRight, ChevronDown, ChevronRight, MoreVertical, 
  Eye, Edit, Trash2, Archive, Zap, TrendingUp, Building2,
  X, ExternalLink, FileText, Users, Phone, Mail, Sparkles,
  Download, Upload, Bell, PieChart, BarChart3, GripVertical,
  CheckCircle2, XCircle, AlertCircle, Briefcase, Globe, Flag
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface Grant {
  id: string;
  title: string;
  funder_name: string;
  funder_type: 'federal' | 'state' | 'private' | 'corporate' | 'foundation';
  amount_min: number | null;
  amount_max: number | null;
  amount_requested: number | null;
  amount_awarded: number | null;
  status: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  deadline: string | null;
  description: string | null;
  target_modules: string[];
  match_score: number;
  win_probability: number;
  url: string | null;
  notes: string | null;
  program_officer: string | null;
  program_officer_email: string | null;
  created_at: string;
  updated_at: string;
}

interface Milestone {
  id: string;
  grant_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed_date: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'skipped';
}

interface PipelineStats {
  total: number;
  by_status: Record<string, number>;
  total_requested: number;
  total_awarded: number;
  urgent_deadlines: number;
  by_funder_type: Record<string, number>;
  by_priority: Record<string, number>;
}

// ============================================
// CONFIGURATION
// ============================================

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  discovered: { label: 'Discovered', color: 'text-gray-700', bgColor: 'bg-gray-100', icon: Search },
  researching: { label: 'Researching', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: Eye },
  preparing: { label: 'Preparing', color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: FileText },
  writing: { label: 'Writing', color: 'text-orange-700', bgColor: 'bg-orange-100', icon: Edit },
  reviewing: { label: 'In Review', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: Eye },
  submitted: { label: 'Submitted', color: 'text-indigo-700', bgColor: 'bg-indigo-100', icon: CheckCircle },
  pending: { label: 'Pending Decision', color: 'text-cyan-700', bgColor: 'bg-cyan-100', icon: Clock },
  awarded: { label: 'Awarded', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle },
  withdrawn: { label: 'Withdrawn', color: 'text-gray-500', bgColor: 'bg-gray-100', icon: Archive },
  archived: { label: 'Archived', color: 'text-gray-400', bgColor: 'bg-gray-50', icon: Archive },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  critical: { label: 'Critical', color: 'text-red-700', bgColor: 'bg-red-500', borderColor: 'border-l-red-500' },
  high: { label: 'High', color: 'text-orange-700', bgColor: 'bg-orange-500', borderColor: 'border-l-orange-500' },
  medium: { label: 'Medium', color: 'text-yellow-700', bgColor: 'bg-yellow-500', borderColor: 'border-l-yellow-500' },
  low: { label: 'Low', color: 'text-gray-600', bgColor: 'bg-gray-400', borderColor: 'border-l-gray-400' },
};

const FUNDER_TYPE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  federal: { label: 'Federal', color: 'bg-blue-600', icon: Building2 },
  state: { label: 'State', color: 'bg-green-600', icon: Flag },
  private: { label: 'Private', color: 'bg-purple-600', icon: Briefcase },
  corporate: { label: 'Corporate', color: 'bg-gray-600', icon: Building2 },
  foundation: { label: 'Foundation', color: 'bg-amber-600', icon: Globe },
};

const KANBAN_COLUMNS = [
  'discovered', 'researching', 'preparing', 'writing', 
  'reviewing', 'submitted', 'pending', 'awarded'
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

const formatCurrency = (amount: number | null): string => {
  if (!amount) return 'TBD';
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  }).format(amount);
};

const formatDate = (date: string | null): string => {
  if (!date) return 'No deadline';
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

const getDaysUntilDeadline = (deadline: string | null): number | null => {
  if (!deadline) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  const diffTime = deadlineDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getDeadlineUrgency = (deadline: string | null): 'overdue' | 'urgent' | 'soon' | 'normal' | null => {
  const days = getDaysUntilDeadline(deadline);
  if (days === null) return null;
  if (days < 0) return 'overdue';
  if (days <= 3) return 'urgent';
  if (days <= 7) return 'soon';
  return 'normal';
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function GrantsDashboard() {
  // State
  const [grants, setGrants] = useState<Grant[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterFunder, setFilterFunder] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'deadline' | 'amount' | 'priority' | 'updated'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [draggedGrant, setDraggedGrant] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchGrants = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('grant_opportunities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGrants(data || []);
    } catch (error) {
      console.error('Error fetching grants:', error);
    }
  }, [supabase]);

  const fetchMilestones = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('grant_milestones')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setMilestones(data || []);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    }
  }, [supabase]);

  const calculateStats = useCallback((grantsData: Grant[]) => {
    const byStatus: Record<string, number> = {};
    const byFunderType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    let totalRequested = 0;
    let totalAwarded = 0;
    let urgentDeadlines = 0;
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    grantsData.forEach(g => {
      byStatus[g.status] = (byStatus[g.status] || 0) + 1;
      byFunderType[g.funder_type] = (byFunderType[g.funder_type] || 0) + 1;
      byPriority[g.priority] = (byPriority[g.priority] || 0) + 1;
      totalRequested += g.amount_requested || 0;
      if (g.status === 'awarded') totalAwarded += g.amount_awarded || g.amount_requested || 0;
      if (g.deadline && new Date(g.deadline) <= sevenDaysFromNow && 
          !['awarded', 'rejected', 'withdrawn', 'archived'].includes(g.status)) {
        urgentDeadlines++;
      }
    });

    setStats({
      total: grantsData.length,
      by_status: byStatus,
      by_funder_type: byFunderType,
      by_priority: byPriority,
      total_requested: totalRequested,
      total_awarded: totalAwarded,
      urgent_deadlines: urgentDeadlines
    });
  }, []);

  // Initial load
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchGrants(), fetchMilestones()]);
      setLoading(false);
    };
    load();
  }, [fetchGrants, fetchMilestones]);

  // Calculate stats when grants change
  useEffect(() => {
    calculateStats(grants);
  }, [grants, calculateStats]);

  // Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchGrants(), fetchMilestones()]);
    setIsRefreshing(false);
  };

  // ============================================
  // FILTERING & SORTING
  // ============================================

  const filteredGrants = useMemo(() => {
    let result = grants.filter(grant => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          grant.title.toLowerCase().includes(query) ||
          grant.funder_name.toLowerCase().includes(query) ||
          grant.description?.toLowerCase().includes(query) ||
          grant.target_modules?.some(m => m.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      // Filters
      if (filterStatus !== 'all' && grant.status !== filterStatus) return false;
      if (filterPriority !== 'all' && grant.priority !== filterPriority) return false;
      if (filterFunder !== 'all' && grant.funder_type !== filterFunder) return false;
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'deadline':
          const aDate = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          const bDate = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          comparison = aDate - bDate;
          break;
        case 'amount':
          comparison = (b.amount_requested || 0) - (a.amount_requested || 0);
          break;
        case 'priority':
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'updated':
          comparison = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [grants, searchQuery, filterStatus, filterPriority, filterFunder, sortBy, sortOrder]);

  // ============================================
  // ACTIONS
  // ============================================

  const updateGrantStatus = async (grantId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('grant_opportunities')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', grantId);

      if (error) throw error;
      
      setGrants(prev => prev.map(g => 
        g.id === grantId ? { ...g, status: newStatus, updated_at: new Date().toISOString() } : g
      ));
    } catch (error) {
      console.error('Error updating grant:', error);
    }
  };

  const updateGrantPriority = async (grantId: string, newPriority: string) => {
    try {
      const { error } = await supabase
        .from('grant_opportunities')
        .update({ priority: newPriority, updated_at: new Date().toISOString() })
        .eq('id', grantId);

      if (error) throw error;
      
      setGrants(prev => prev.map(g => 
        g.id === grantId ? { ...g, priority: newPriority as Grant['priority'], updated_at: new Date().toISOString() } : g
      ));
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, grantId: string) => {
    setDraggedGrant(grantId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedGrant) {
      updateGrantStatus(draggedGrant, newStatus);
      setDraggedGrant(null);
    }
  };

  // ============================================
  // COMPONENTS
  // ============================================

  // Stats Card
  const StatsCard = ({ icon: Icon, label, value, subValue, color, trend }: { 
    icon: any; label: string; value: string; subValue?: string; color: string; trend?: string;
  }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
      </div>
    </div>
  );

  // Grant Card (for Kanban)
  const GrantCard = ({ grant, compact = false }: { grant: Grant; compact?: boolean }) => {
    const daysUntil = getDaysUntilDeadline(grant.deadline);
    const urgency = getDeadlineUrgency(grant.deadline);
    const StatusIcon = STATUS_CONFIG[grant.status]?.icon || Clock;
    const grantMilestones = milestones.filter(m => m.grant_id === grant.id);
    const completedMilestones = grantMilestones.filter(m => m.status === 'completed').length;
    
    return (
      <div 
        className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer ${compact ? 'p-3' : 'p-4'} border-l-4 ${PRIORITY_CONFIG[grant.priority].borderColor}`}
        onClick={() => setSelectedGrant(grant)}
        draggable
        onDragStart={(e) => handleDragStart(e, grant.id)}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${FUNDER_TYPE_CONFIG[grant.funder_type]?.color || 'bg-gray-500'} text-white`}>
                {FUNDER_TYPE_CONFIG[grant.funder_type]?.label || grant.funder_type}
              </span>
              {urgency === 'urgent' && (
                <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-red-100 text-red-700 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Urgent
                </span>
              )}
            </div>
            <h3 className={`font-semibold text-gray-900 line-clamp-2 ${compact ? 'text-sm' : 'text-base'}`}>
              {grant.title}
            </h3>
            <p className={`text-gray-500 truncate ${compact ? 'text-xs' : 'text-sm'}`}>
              {grant.funder_name}
            </p>
          </div>
          <button className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Amount */}
        <div className={`flex items-center gap-1.5 text-gray-700 ${compact ? 'text-sm mb-2' : 'text-base mb-3'}`}>
          <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span className="font-semibold">{formatCurrency(grant.amount_requested)}</span>
        </div>

        {/* Deadline */}
        {grant.deadline && (
          <div className={`flex items-center gap-2 mb-2 ${compact ? 'text-xs' : 'text-sm'}`}>
            <Calendar className={`w-4 h-4 ${urgency === 'urgent' || urgency === 'overdue' ? 'text-red-500' : 'text-gray-400'}`} />
            <span className={
              urgency === 'overdue' ? 'text-red-600 font-semibold' :
              urgency === 'urgent' ? 'text-red-600 font-medium' :
              urgency === 'soon' ? 'text-orange-600' : 'text-gray-600'
            }>
              {formatDate(grant.deadline)}
              {daysUntil !== null && (
                <span className="ml-1">
                  {daysUntil < 0 ? `(${Math.abs(daysUntil)}d overdue)` :
                   daysUntil === 0 ? '(Today!)' :
                   daysUntil === 1 ? '(Tomorrow)' : `(${daysUntil}d)`}
                </span>
              )}
            </span>
          </div>
        )}

        {/* Progress indicators */}
        {!compact && (
          <div className="flex items-center gap-4 mb-3 text-sm">
            <div className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="text-gray-600">Match: </span>
              <span className="font-medium">{grant.match_score}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-gray-600">Win: </span>
              <span className="font-medium">{grant.win_probability}%</span>
            </div>
          </div>
        )}

        {/* Milestones progress */}
        {grantMilestones.length > 0 && !compact && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Milestones</span>
              <span>{completedMilestones}/{grantMilestones.length}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all" 
                style={{ width: `${(completedMilestones / grantMilestones.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Modules */}
        {grant.target_modules && grant.target_modules.length > 0 && !compact && (
          <div className="flex flex-wrap gap-1 mb-3">
            {grant.target_modules.slice(0, 2).map(module => (
              <span key={module} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full">
                {module}
              </span>
            ))}
            {grant.target_modules.length > 2 && (
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                +{grant.target_modules.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  // Kanban Column
  const KanbanColumn = ({ status, grants: columnGrants }: { status: string; grants: Grant[] }) => {
    const config = STATUS_CONFIG[status];
    const Icon = config?.icon || Clock;
    const totalAmount = columnGrants.reduce((sum, g) => sum + (g.amount_requested || 0), 0);
    
    return (
      <div 
        className="flex-shrink-0 w-80 bg-gray-50/50 rounded-xl border border-gray-200"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, status)}
      >
        {/* Column Header */}
        <div className="p-3 border-b border-gray-200 bg-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${config?.bgColor || 'bg-gray-100'}`}>
                <Icon className={`w-4 h-4 ${config?.color || 'text-gray-600'}`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{config?.label || status}</h3>
                <p className="text-xs text-gray-500">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 text-sm font-bold rounded-full ${config?.bgColor || 'bg-gray-100'} ${config?.color || 'text-gray-700'}`}>
              {columnGrants.length}
            </span>
          </div>
        </div>
        
        {/* Column Content */}
        <div className="p-3 space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
          {columnGrants.map(grant => (
            <GrantCard key={grant.id} grant={grant} compact />
          ))}
          {columnGrants.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No grants</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // List View Row
  const ListRow = ({ grant }: { grant: Grant }) => {
    const daysUntil = getDaysUntilDeadline(grant.deadline);
    const urgency = getDeadlineUrgency(grant.deadline);
    const StatusIcon = STATUS_CONFIG[grant.status]?.icon || Clock;
    
    return (
      <tr 
        className="hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => setSelectedGrant(grant)}
      >
        <td className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className={`w-1.5 h-12 rounded-full ${PRIORITY_CONFIG[grant.priority].bgColor}`} />
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate max-w-xs">{grant.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${FUNDER_TYPE_CONFIG[grant.funder_type]?.color || 'bg-gray-500'} text-white`}>
                  {FUNDER_TYPE_CONFIG[grant.funder_type]?.label}
                </span>
                {grant.target_modules?.slice(0, 1).map(m => (
                  <span key={m} className="px-1.5 py-0.5 text-xs bg-gray-100 rounded text-gray-600">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </td>
        <td className="px-4 py-4">
          <span className="text-sm text-gray-600">{grant.funder_name}</span>
        </td>
        <td className="px-4 py-4">
          <span className="font-semibold text-gray-900">{formatCurrency(grant.amount_requested)}</span>
        </td>
        <td className="px-4 py-4">
          <div className={`text-sm ${
            urgency === 'overdue' ? 'text-red-600 font-semibold' :
            urgency === 'urgent' ? 'text-red-600 font-medium' :
            urgency === 'soon' ? 'text-orange-600' : 'text-gray-600'
          }`}>
            {formatDate(grant.deadline)}
            {daysUntil !== null && daysUntil >= -7 && daysUntil <= 14 && (
              <span className="block text-xs mt-0.5">
                {daysUntil < 0 ? `${Math.abs(daysUntil)}d overdue` :
                 daysUntil === 0 ? 'Today!' :
                 daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_CONFIG[grant.status]?.bgColor || 'bg-gray-100'} ${STATUS_CONFIG[grant.status]?.color || 'text-gray-700'}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {STATUS_CONFIG[grant.status]?.label || grant.status}
          </span>
        </td>
        <td className="px-4 py-4">
          <select
            value={grant.priority}
            onChange={(e) => {
              e.stopPropagation();
              updateGrantPriority(grant.id, e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            className={`text-xs font-medium rounded-full px-2 py-1 border-0 ${PRIORITY_CONFIG[grant.priority].bgColor} text-white cursor-pointer`}
          >
            {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${grant.match_score}%` }} />
            </div>
            <span className="text-sm text-gray-600 w-8">{grant.match_score}%</span>
          </div>
        </td>
        <td className="px-4 py-4 text-right">
          <div className="flex items-center justify-end gap-1">
            {grant.url && (
              <a 
                href={grant.url} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Open grant URL"
              >
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedGrant(grant); }}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="View details"
            >
              <Eye className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  // Grant Detail Panel
  const GrantDetailPanel = ({ grant, onClose }: { grant: Grant; onClose: () => void }) => {
    const grantMilestones = milestones.filter(m => m.grant_id === grant.id);
    const daysUntil = getDaysUntilDeadline(grant.deadline);
    
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="absolute inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${FUNDER_TYPE_CONFIG[grant.funder_type]?.color} text-white`}>
                    {FUNDER_TYPE_CONFIG[grant.funder_type]?.label}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_CONFIG[grant.status]?.bgColor} ${STATUS_CONFIG[grant.status]?.color}`}>
                    {STATUS_CONFIG[grant.status]?.label}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${PRIORITY_CONFIG[grant.priority].bgColor} text-white`}>
                    {PRIORITY_CONFIG[grant.priority].label}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{grant.title}</h2>
                <p className="text-gray-500">{grant.funder_name}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-2 text-green-700 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-medium">Amount Requested</span>
                </div>
                <p className="text-2xl font-bold text-green-800">{formatCurrency(grant.amount_requested)}</p>
                {grant.amount_min && grant.amount_max && (
                  <p className="text-xs text-green-600 mt-1">
                    Range: {formatCurrency(grant.amount_min)} - {formatCurrency(grant.amount_max)}
                  </p>
                )}
              </div>
              <div className={`rounded-xl p-4 border ${
                daysUntil !== null && daysUntil <= 7 
                  ? 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-200' 
                  : 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200'
              }`}>
                <div className={`flex items-center gap-2 mb-1 ${daysUntil !== null && daysUntil <= 7 ? 'text-red-700' : 'text-blue-700'}`}>
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Deadline</span>
                </div>
                <p className={`text-2xl font-bold ${daysUntil !== null && daysUntil <= 7 ? 'text-red-800' : 'text-blue-800'}`}>
                  {formatDate(grant.deadline)}
                </p>
                {daysUntil !== null && (
                  <p className={`text-xs mt-1 ${daysUntil <= 7 ? 'text-red-600' : 'text-blue-600'}`}>
                    {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` :
                     daysUntil === 0 ? 'Due today!' :
                     daysUntil === 1 ? 'Due tomorrow' : `${daysUntil} days remaining`}
                  </p>
                )}
              </div>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Match Score</span>
                  <span className="text-lg font-bold text-blue-600">{grant.match_score}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${grant.match_score}%` }} />
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Win Probability</span>
                  <span className="text-lg font-bold text-green-600">{grant.win_probability}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${grant.win_probability}%` }} />
                </div>
              </div>
            </div>

            {/* Description */}
            {grant.description && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{grant.description}</p>
              </div>
            )}

            {/* Target Modules */}
            {grant.target_modules && grant.target_modules.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Target CRAIverse Modules</h3>
                <div className="flex flex-wrap gap-2">
                  {grant.target_modules.map(module => (
                    <span key={module} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {module}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Milestones */}
            {grantMilestones.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Milestones</h3>
                <div className="space-y-2">
                  {grantMilestones.map(milestone => (
                    <div 
                      key={milestone.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        milestone.status === 'completed' ? 'bg-green-50 border-green-200' :
                        milestone.status === 'overdue' ? 'bg-red-50 border-red-200' :
                        'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        milestone.status === 'completed' ? 'bg-green-500' :
                        milestone.status === 'overdue' ? 'bg-red-500' :
                        milestone.status === 'in_progress' ? 'bg-blue-500' :
                        'bg-gray-300'
                      }`}>
                        {milestone.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : (
                          <Clock className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{milestone.title}</p>
                        {milestone.due_date && (
                          <p className="text-xs text-gray-500">Due: {formatDate(milestone.due_date)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {grant.notes && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">{grant.notes}</p>
                </div>
              </div>
            )}

            {/* Contact */}
            {grant.program_officer && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Program Officer</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">{grant.program_officer}</p>
                  {grant.program_officer_email && (
                    <a href={`mailto:${grant.program_officer_email}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1">
                      <Mail className="w-4 h-4" />
                      {grant.program_officer_email}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* URL */}
            {grant.url && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Application URL</h3>
                <a 
                  href={grant.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <Globe className="w-4 h-4" />
                  {grant.url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <select
                value={grant.status}
                onChange={(e) => {
                  updateGrantStatus(grant.id, e.target.value);
                  setSelectedGrant({ ...grant, status: e.target.value });
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading grant data...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-4">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Grant Management</h1>
              <p className="text-sm text-gray-500">Track and manage all grant opportunities</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'kanban' 
                      ? 'bg-white shadow text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">Kanban</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'list' 
                      ? 'bg-white shadow text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>

              {/* Refresh */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              {/* Add Grant */}
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Grant</span>
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
            <StatsCard 
              icon={Building2} 
              label="Total Grants" 
              value={stats?.total?.toString() || '0'} 
              color="bg-blue-600"
              subValue={`${stats?.by_status?.preparing || 0} in progress`}
            />
            <StatsCard 
              icon={DollarSign} 
              label="Pipeline Value" 
              value={formatCurrency(stats?.total_requested || 0)} 
              color="bg-green-600"
            />
            <StatsCard 
              icon={CheckCircle2} 
              label="Awarded" 
              value={formatCurrency(stats?.total_awarded || 0)} 
              color="bg-emerald-600"
              trend={stats?.total_awarded ? '+' + Math.round((stats.total_awarded / stats.total_requested) * 100) + '%' : undefined}
            />
            <StatsCard 
              icon={AlertTriangle} 
              label="Urgent" 
              value={stats?.urgent_deadlines?.toString() || '0'} 
              subValue="Due within 7 days"
              color="bg-red-600"
            />
            <StatsCard 
              icon={Target} 
              label="Active" 
              value={((stats?.by_status?.preparing || 0) + (stats?.by_status?.writing || 0) + (stats?.by_status?.reviewing || 0)).toString()} 
              subValue="In preparation"
              color="bg-purple-600"
            />
          </div>

          {/* Search & Filters Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search grants by title, funder, or module..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>
            
            <div className="flex items-center gap-2">
              {/* Sort */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-');
                  setSortBy(by as any);
                  setSortOrder(order as any);
                }}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="priority-asc">Priority ↑</option>
                <option value="priority-desc">Priority ↓</option>
                <option value="deadline-asc">Deadline ↑</option>
                <option value="deadline-desc">Deadline ↓</option>
                <option value="amount-desc">Amount ↓</option>
                <option value="amount-asc">Amount ↑</option>
                <option value="updated-desc">Recent</option>
              </select>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
                  showFilters || filterStatus !== 'all' || filterPriority !== 'all' || filterFunder !== 'all'
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {(filterStatus !== 'all' || filterPriority !== 'all' || filterFunder !== 'all') && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="flex flex-wrap items-center gap-4 mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Priorities</option>
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Funder Type</label>
                <select
                  value={filterFunder}
                  onChange={(e) => setFilterFunder(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  {Object.entries(FUNDER_TYPE_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterPriority('all');
                    setFilterFunder('all');
                    setSearchQuery('');
                  }}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6">
        {viewMode === 'kanban' ? (
          /* Kanban View */
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            {KANBAN_COLUMNS.map(status => (
              <KanbanColumn 
                key={status} 
                status={status} 
                grants={filteredGrants.filter(g => g.status === status)} 
              />
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Grant</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Funder</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Deadline</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Match</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredGrants.map(grant => (
                    <ListRow key={grant.id} grant={grant} />
                  ))}
                </tbody>
              </table>
            </div>
            {filteredGrants.length === 0 && (
              <div className="text-center py-16">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No grants found</h3>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grant Detail Panel */}
      {selectedGrant && (
        <GrantDetailPanel grant={selectedGrant} onClose={() => setSelectedGrant(null)} />
      )}
    </div>
  );
}
