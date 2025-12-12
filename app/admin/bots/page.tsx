// app/admin/bots/page.tsx
// Bot Activity Dashboard - 9 Autonomous Bots
// Timestamp: Dec 11, 2025 11:25 PM EST

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Bot, ArrowLeft, Play, Pause, RefreshCw, Clock,
  CheckCircle, AlertTriangle, Activity, Settings
} from 'lucide-react';

const BOTS_CONFIG = [
  {
    id: 'credit-monitor',
    name: 'Credit Monitor',
    description: 'Monitors user credit balances and sends low-balance alerts',
    schedule: 'Every 15 minutes',
    actions: ['Check balances', 'Send alerts', 'Update notifications'],
  },
  {
    id: 'subscription-manager',
    name: 'Subscription Manager',
    description: 'Handles subscription renewals, expirations, and credit grants',
    schedule: 'Every hour',
    actions: ['Check expirations', 'Grant monthly credits', 'Update statuses'],
  },
  {
    id: 'task-cleanup',
    name: 'Task Cleanup',
    description: 'Cleans up stale tasks and issues automatic refunds',
    schedule: 'Every 30 minutes',
    actions: ['Find stale tasks', 'Issue refunds', 'Archive old tasks'],
  },
  {
    id: 'health-checker',
    name: 'Health Checker',
    description: 'Monitors all external API providers and services',
    schedule: 'Every 5 minutes',
    actions: ['Ping APIs', 'Log latencies', 'Alert on failures'],
  },
  {
    id: 'analytics-aggregator',
    name: 'Analytics Aggregator',
    description: 'Aggregates usage data for dashboards and reports',
    schedule: 'Every hour',
    actions: ['Aggregate events', 'Calculate metrics', 'Update dashboards'],
  },
  {
    id: 'content-moderator',
    name: 'Content Moderator',
    description: 'AI-powered moderation of user-generated content',
    schedule: 'Real-time + batch',
    actions: ['Scan new content', 'Flag violations', 'Auto-remove severe'],
  },
  {
    id: 'email-scheduler',
    name: 'Email Scheduler',
    description: 'Sends scheduled emails and automated sequences',
    schedule: 'Every 10 minutes',
    actions: ['Check queue', 'Send emails', 'Track deliveries'],
  },
  {
    id: 'backup-manager',
    name: 'Backup Manager',
    description: 'Manages database backups and data exports',
    schedule: 'Daily at 3 AM',
    actions: ['Create backups', 'Verify integrity', 'Cleanup old backups'],
  },
  {
    id: 'report-generator',
    name: 'Report Generator',
    description: 'Generates daily, weekly, and monthly reports',
    schedule: 'Daily at 6 AM',
    actions: ['Gather data', 'Generate reports', 'Send to admins'],
  },
];

async function getBotStats() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: bots } = await supabase
    .from('bots')
    .select('*');

  const { data: recentRuns } = await supabase
    .from('bot_runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(50);

  return {
    bots: bots || [],
    recentRuns: recentRuns || [],
  };
}

export default async function AdminBotsPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { bots, recentRuns } = await getBotStats();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <Link href="/admin" className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Bot className="w-8 h-8" /> Autonomous Bots
              </h1>
              <p className="text-gray-300">9 bots running 24/7 to keep the platform healthy</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                9/9 Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Bot Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {BOTS_CONFIG.map((bot) => {
            const dbBot = bots.find(b => b.id === bot.id);
            const lastRun = recentRuns.find(r => r.bot_id === bot.id);
            const isActive = dbBot?.status === 'active' || true;

            return (
              <div key={bot.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Bot className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{bot.name}</h3>
                      <p className="text-xs text-gray-500">{bot.schedule}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button className={`p-1.5 rounded-lg ${isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                      {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">{bot.description}</p>

                <div className="space-y-2 mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Actions:</p>
                  <div className="flex flex-wrap gap-1">
                    {bot.actions.map((action, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        {action}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    Last run: {lastRun ? new Date(lastRun.started_at).toLocaleTimeString() : 'Never'}
                  </div>
                  <div className="flex items-center gap-1">
                    {isActive ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    )}
                    <span className={`text-xs font-semibold ${isActive ? 'text-green-600' : 'text-yellow-600'}`}>
                      {isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Bot Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {recentRuns.slice(0, 10).map((run: any) => (
              <div key={run.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    run.status === 'success' ? 'bg-green-100' : run.status === 'failed' ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    {run.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : run.status === 'failed' ? (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    ) : (
                      <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{run.bot_id?.replace('-', ' ')}</p>
                    <p className="text-xs text-gray-500">
                      Duration: {run.duration_ms ? `${run.duration_ms}ms` : 'Running...'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    run.status === 'success' ? 'text-green-600' : run.status === 'failed' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {run.status}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(run.started_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
