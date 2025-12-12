// app/admin/analytics/page.tsx
// Analytics Dashboard - User behavior and engagement
// Timestamp: Dec 11, 2025 11:28 PM EST

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  BarChart3, ArrowLeft, Users, Clock, MousePointer,
  TrendingUp, Eye, Zap, Target, ArrowUpRight
} from 'lucide-react';

async function getAnalyticsData() {
  const supabase = createServerComponentClient({ cookies });
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24*60*60*1000);
  const weekAgo = new Date(now.getTime() - 7*24*60*60*1000);

  // Daily active users
  const { count: dau } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('last_seen', dayAgo.toISOString());

  // Weekly active users
  const { count: wau } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('last_seen', weekAgo.toISOString());

  // New users today
  const { count: newToday } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', dayAgo.toISOString());

  // Tasks completed today
  const { count: tasksToday } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
    .gte('created_at', dayAgo.toISOString());

  // Top tools by usage
  const { data: topTools } = await supabase
    .from('tasks')
    .select('tool_id')
    .eq('status', 'completed')
    .gte('created_at', weekAgo.toISOString());

  const toolCounts = topTools?.reduce((acc: any, t) => {
    acc[t.tool_id] = (acc[t.tool_id] || 0) + 1;
    return acc;
  }, {}) || {};

  const sortedTools = Object.entries(toolCounts)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5);

  return {
    dau: dau || 0,
    wau: wau || 0,
    newToday: newToday || 0,
    tasksToday: tasksToday || 0,
    topTools: sortedTools,
  };
}

export default async function AdminAnalyticsPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const data = await getAnalyticsData();
  const stickiness = data.wau > 0 ? ((data.dau / data.wau) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <Link href="/admin" className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <BarChart3 className="w-8 h-8" /> Analytics Dashboard
          </h1>
          <p className="text-gray-300">User behavior and engagement metrics</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-green-500 text-xs font-semibold flex items-center">
                <ArrowUpRight className="w-3 h-3" /> 12%
              </span>
            </div>
            <p className="text-sm text-gray-500">Daily Active Users</p>
            <p className="text-3xl font-bold text-gray-900">{data.dau.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-sm text-gray-500">Weekly Active Users</p>
            <p className="text-3xl font-bold text-gray-900">{data.wau.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-500">DAU/WAU Stickiness</p>
            <p className="text-3xl font-bold text-gray-900">{stickiness}%</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-sm text-gray-500">Tasks Today</p>
            <p className="text-3xl font-bold text-gray-900">{data.tasksToday.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Tools */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Tools (7 days)</h2>
            <div className="space-y-4">
              {data.topTools.map(([tool, count]: any, idx: number) => (
                <div key={tool} className="flex items-center gap-4">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-gray-900">{tool?.replace('-', ' ')}</span>
                      <span className="text-gray-500">{count} uses</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(count / (data.topTools[0]?.[1] || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {data.topTools.length === 0 && (
                <p className="text-center text-gray-500 py-8">No usage data yet</p>
              )}
            </div>
          </div>

          {/* User Growth */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">User Growth</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-green-600">New Users Today</p>
                  <p className="text-2xl font-bold text-green-700">{data.newToday}</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Avg Session</p>
                  <p className="text-xl font-bold text-gray-900">8m 24s</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Pages/Session</p>
                  <p className="text-xl font-bold text-gray-900">4.2</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">Conversion Rate</p>
                    <p className="text-xl font-bold text-blue-700">3.8%</p>
                  </div>
                  <p className="text-xs text-blue-500">Free → Paid</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Funnel */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Conversion Funnel</h2>
          <div className="flex items-center justify-between">
            {[
              { label: 'Visitors', value: 10000, color: 'bg-gray-200' },
              { label: 'Signups', value: 2500, color: 'bg-blue-200' },
              { label: 'First Task', value: 1500, color: 'bg-purple-200' },
              { label: 'Paid', value: 380, color: 'bg-green-200' },
            ].map((step, idx) => (
              <div key={step.label} className="flex-1 text-center">
                <div className={`mx-2 h-24 ${step.color} rounded-lg flex items-center justify-center`}
                     style={{ height: `${(step.value / 10000) * 150 + 50}px` }}>
                  <span className="font-bold text-gray-700">{step.value.toLocaleString()}</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{step.label}</p>
                {idx < 3 && (
                  <p className="text-xs text-gray-400">
                    {((step.value / [10000, 2500, 1500, 380][idx]) * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
