// app/admin/costs/page.tsx
// Admin Cost Tracking - Supabase, Vercel, APIs
// Timestamp: Dec 11, 2025 10:33 PM EST

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, ArrowLeft, Database, Globe, Zap, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

const COST_CATEGORIES = [
  {
    id: 'supabase',
    name: 'Supabase',
    icon: Database,
    currentMonth: 89,
    lastMonth: 75,
    limit: 200,
    color: 'green',
    breakdown: [
      { item: 'Database Storage', cost: 25 },
      { item: 'Database Egress', cost: 15 },
      { item: 'Auth MAU', cost: 10 },
      { item: 'Storage', cost: 20 },
      { item: 'Edge Functions', cost: 19 },
    ],
  },
  {
    id: 'vercel',
    name: 'Vercel',
    icon: Globe,
    currentMonth: 45,
    lastMonth: 52,
    limit: 100,
    color: 'blue',
    breakdown: [
      { item: 'Bandwidth', cost: 15 },
      { item: 'Serverless Functions', cost: 12 },
      { item: 'Edge Functions', cost: 8 },
      { item: 'Analytics', cost: 5 },
      { item: 'Other', cost: 5 },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI API',
    icon: Zap,
    currentMonth: 234,
    lastMonth: 198,
    limit: 500,
    color: 'purple',
    breakdown: [
      { item: 'GPT-4 Turbo', cost: 150 },
      { item: 'GPT-4 Vision', cost: 45 },
      { item: 'DALL-E 3', cost: 30 },
      { item: 'Whisper', cost: 9 },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic API',
    icon: Zap,
    currentMonth: 156,
    lastMonth: 142,
    limit: 300,
    color: 'orange',
    breakdown: [
      { item: 'Claude 3 Opus', cost: 80 },
      { item: 'Claude 3 Sonnet', cost: 50 },
      { item: 'Claude 3 Haiku', cost: 26 },
    ],
  },
  {
    id: 'other',
    name: 'Other Services',
    icon: CreditCard,
    currentMonth: 78,
    lastMonth: 65,
    limit: 150,
    color: 'gray',
    breakdown: [
      { item: 'Google Cloud (Gemini)', cost: 25 },
      { item: 'Stripe Fees', cost: 18 },
      { item: 'PayPal Fees', cost: 12 },
      { item: 'Email (Resend)', cost: 10 },
      { item: 'Analytics', cost: 8 },
      { item: 'Monitoring', cost: 5 },
    ],
  },
];

export default async function AdminCostsPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const totalCurrentMonth = COST_CATEGORIES.reduce((sum, c) => sum + c.currentMonth, 0);
  const totalLastMonth = COST_CATEGORIES.reduce((sum, c) => sum + c.lastMonth, 0);
  const totalLimit = COST_CATEGORIES.reduce((sum, c) => sum + c.limit, 0);
  const changePercent = ((totalCurrentMonth - totalLastMonth) / totalLastMonth * 100);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white py-6">
        <div className="container mx-auto px-4">
          <Link href="/admin" className="inline-flex items-center gap-2 text-amber-200 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <CreditCard className="w-8 h-8" />
            Cost Tracking
          </h1>
          <p className="text-amber-200">Monitor infrastructure and API costs</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">This Month</p>
            <p className="text-3xl font-bold text-gray-900">${totalCurrentMonth}</p>
            <div className={`flex items-center gap-1 mt-2 ${changePercent > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {changePercent > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="text-sm font-semibold">{Math.abs(changePercent).toFixed(1)}% vs last month</span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Last Month</p>
            <p className="text-3xl font-bold text-gray-900">${totalLastMonth}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Monthly Budget</p>
            <p className="text-3xl font-bold text-blue-600">${totalLimit}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Budget Used</p>
            <p className="text-3xl font-bold text-amber-600">{((totalCurrentMonth / totalLimit) * 100).toFixed(0)}%</p>
            <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
              <div 
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${Math.min((totalCurrentMonth / totalLimit) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Cost Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {COST_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const usagePercent = (category.currentMonth / category.limit) * 100;
            const change = category.currentMonth - category.lastMonth;
            const colors: Record<string, string> = {
              green: 'from-green-500 to-green-600',
              blue: 'from-blue-500 to-blue-600',
              purple: 'from-purple-500 to-purple-600',
              orange: 'from-orange-500 to-orange-600',
              gray: 'from-gray-500 to-gray-600',
            };
            return (
              <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[category.color]} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">Limit: ${category.limit}/mo</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${category.currentMonth}</p>
                    <p className={`text-sm ${change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {change > 0 ? '+' : ''}{change} vs last month
                    </p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{usagePercent.toFixed(0)}% used</span>
                    <span>${category.limit - category.currentMonth} remaining</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div 
                      className={`h-full rounded-full ${
                        usagePercent > 80 ? 'bg-red-500' : 
                        usagePercent > 60 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Breakdown */}
                <div className="space-y-2">
                  {category.breakdown.map((item) => (
                    <div key={item.item} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.item}</span>
                      <span className="font-medium text-gray-900">${item.cost}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
