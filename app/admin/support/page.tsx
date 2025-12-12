// app/admin/support/page.tsx
// Admin Support Ticket Management - Pulse → Javari → Roy Flow
// Timestamp: Dec 11, 2025 10:18 PM EST

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  MessageSquare, ArrowLeft, Filter, Search, Clock, User, 
  Bot, AlertCircle, CheckCircle, ChevronRight, Zap
} from 'lucide-react';

async function getTickets() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: tickets } = await supabase
    .from('support_tickets')
    .select(`
      *,
      user:users(full_name, email),
      assigned_to:users!assigned_to(full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  // Stats
  const { count: openCount } = await supabase
    .from('support_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open');

  const { count: pulseCount } = await supabase
    .from('support_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('escalation_tier', 'pulse');

  const { count: javariCount } = await supabase
    .from('support_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('escalation_tier', 'javari');

  const { count: humanCount } = await supabase
    .from('support_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('escalation_tier', 'human');

  return { 
    tickets: tickets || [], 
    stats: { 
      open: openCount || 0, 
      pulse: pulseCount || 0, 
      javari: javariCount || 0,
      human: humanCount || 0 
    } 
  };
}

export default async function AdminSupportPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) redirect('/login');

  const { tickets, stats } = await getTickets();

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  };

  const statusColors: Record<string, string> = {
    open: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-purple-100 text-purple-700',
    waiting: 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700',
  };

  const tierIcons: Record<string, any> = {
    pulse: { icon: Bot, color: 'text-blue-500', label: 'Pulse AI' },
    javari: { icon: Zap, color: 'text-purple-500', label: 'Javari AI' },
    human: { icon: User, color: 'text-orange-500', label: 'Human Agent' },
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <Link href="/admin" className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <MessageSquare className="w-8 h-8" />
                Support Tickets
              </h1>
              <p className="text-gray-300">Manage customer support requests</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Escalation Flow Visual */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">Support Escalation Flow</h3>
          <div className="flex items-center justify-between max-w-3xl">
            {/* Pulse */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                <Bot className="w-8 h-8 text-blue-600" />
              </div>
              <p className="font-semibold text-gray-900">Pulse AI</p>
              <p className="text-sm text-gray-500">Tier 1 • Auto-resolve</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">{stats.pulse}</p>
            </div>
            <ChevronRight className="w-8 h-8 text-gray-300" />
            {/* Javari */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <p className="font-semibold text-gray-900">Javari AI</p>
              <p className="text-sm text-gray-500">Tier 2 • Build solutions</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">{stats.javari}</p>
            </div>
            <ChevronRight className="w-8 h-8 text-gray-300" />
            {/* Human */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-2">
                <User className="w-8 h-8 text-orange-600" />
              </div>
              <p className="font-semibold text-gray-900">Roy / Team</p>
              <p className="text-sm text-gray-500">Tier 3 • Executive</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">{stats.human}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Open Tickets</p>
            <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Avg Response Time</p>
            <p className="text-2xl font-bold text-green-600">2.4h</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">AI Resolution Rate</p>
            <p className="text-2xl font-bold text-purple-600">87%</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Satisfaction</p>
            <p className="text-2xl font-bold text-yellow-600">4.8★</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg">
              <option>All Status</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg">
              <option>All Tiers</option>
              <option>Pulse AI</option>
              <option>Javari AI</option>
              <option>Human</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg">
              <option>All Priority</option>
              <option>Urgent</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Ticket</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">User</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Tier</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Priority</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Created</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length > 0 ? tickets.map((ticket: any) => {
                const tier = tierIcons[ticket.escalation_tier] || tierIcons.pulse;
                const TierIcon = tier.icon;
                return (
                  <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                    <td className="py-4 px-6">
                      <Link href={`/admin/support/${ticket.id}`}>
                        <p className="font-semibold text-gray-900 hover:text-blue-600">#{ticket.id.slice(0,8)}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{ticket.subject}</p>
                      </Link>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-900">{ticket.user?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{ticket.user?.email}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <TierIcon className={`w-4 h-4 ${tier.color}`} />
                        <span className="text-sm text-gray-700">{tier.label}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${priorityColors[ticket.priority] || priorityColors.medium}`}>
                        {ticket.priority || 'Medium'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[ticket.status] || statusColors.open}`}>
                        {ticket.status || 'Open'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No support tickets yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
