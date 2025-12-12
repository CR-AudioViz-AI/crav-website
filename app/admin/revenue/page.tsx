// app/admin/revenue/page.tsx
// Admin Revenue Dashboard - All 7 Revenue Streams
// Timestamp: Dec 11, 2025 10:23 PM EST

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  TrendingUp, ArrowLeft, DollarSign, CreditCard, Users, 
  Building2, Percent, Gift, ShoppingBag, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

async function getRevenueData() {
  const supabase = createServerComponentClient({ cookies });
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // This month's revenue
  const { data: thisMonth } = await supabase
    .from('transactions')
    .select('amount, type')
    .eq('status', 'completed')
    .gte('created_at', startOfMonth.toISOString());

  // Last month's revenue
  const { data: lastMonth } = await supabase
    .from('transactions')
    .select('amount, type')
    .eq('status', 'completed')
    .gte('created_at', startOfLastMonth.toISOString())
    .lte('created_at', endOfLastMonth.toISOString());

  const thisMonthTotal = thisMonth?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
  const lastMonthTotal = lastMonth?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
  const growth = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100) : 0;

  // Revenue by type
  const subscriptionRevenue = thisMonth?.filter(t => t.type === 'subscription_payment').reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
  const creditRevenue = thisMonth?.filter(t => t.type === 'credit_purchase').reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

  return {
    thisMonth: thisMonthTotal,
    lastMonth: lastMonthTotal,
    growth,
    subscriptionRevenue,
    creditRevenue,
    marketplaceRevenue: 0,
    enterpriseRevenue: 0,
    grantRevenue: 0,
    affiliateRevenue: 0,
    merchandiseRevenue: 0,
  };
}

const REVENUE_STREAMS = [
  { id: 'subscriptions', name: 'SaaS Subscriptions', icon: CreditCard, color: 'blue', target: 400000 },
  { id: 'credits', name: 'Credit Purchases', icon: DollarSign, color: 'green', target: 200000 },
  { id: 'marketplace', name: 'Creator Marketplace', icon: ShoppingBag, color: 'purple', target: 150000 },
  { id: 'enterprise', name: 'White-Label Enterprise', icon: Building2, color: 'orange', target: 100000 },
  { id: 'grants', name: 'Grant Funding', icon: Gift, color: 'pink', target: 100000 },
  { id: 'affiliate', name: 'Affiliate Programs', icon: Percent, color: 'teal', target: 30000 },
  { id: 'merchandise', name: 'Trending Products', icon: ShoppingBag, color: 'amber', target: 20000 },
];

export default async function AdminRevenuePage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const data = await getRevenueData();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white py-6">
        <div className="container mx-auto px-4">
          <Link href="/admin" className="inline-flex items-center gap-2 text-green-200 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <TrendingUp className="w-8 h-8" />
            Revenue Dashboard
          </h1>
          <p className="text-green-200">Track all 7 revenue streams • Target: $1M ARR</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">This Month</p>
            <p className="text-3xl font-bold text-gray-900">${data.thisMonth.toLocaleString()}</p>
            <div className={`flex items-center gap-1 mt-2 ${data.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.growth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span className="text-sm font-semibold">{Math.abs(data.growth).toFixed(1)}% vs last month</span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Last Month</p>
            <p className="text-3xl font-bold text-gray-900">${data.lastMonth.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">ARR Projection</p>
            <p className="text-3xl font-bold text-blue-600">${(data.thisMonth * 12).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Goal Progress</p>
            <p className="text-3xl font-bold text-purple-600">{((data.thisMonth * 12 / 1000000) * 100).toFixed(1)}%</p>
            <p className="text-xs text-gray-400">of $1M ARR</p>
          </div>
        </div>

        {/* 7 Revenue Streams */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">7 Revenue Streams</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {REVENUE_STREAMS.map((stream) => {
            const Icon = stream.icon;
            const revenue = data[`${stream.id}Revenue` as keyof typeof data] || 0;
            const progress = (Number(revenue) / stream.target) * 100;
            const colors: Record<string, string> = {
              blue: 'from-blue-500 to-blue-600',
              green: 'from-green-500 to-green-600',
              purple: 'from-purple-500 to-purple-600',
              orange: 'from-orange-500 to-orange-600',
              pink: 'from-pink-500 to-pink-600',
              teal: 'from-teal-500 to-teal-600',
              amber: 'from-amber-500 to-amber-600',
            };
            return (
              <div key={stream.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[stream.color]} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-gray-500">${stream.target.toLocaleString()}/yr</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{stream.name}</h3>
                <p className="text-2xl font-bold text-gray-900 mb-2">${Number(revenue).toLocaleString()}</p>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${colors[stream.color]} transition-all`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{progress.toFixed(1)}% of annual target</p>
              </div>
            );
          })}
        </div>

        {/* Revenue Chart Placeholder */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Trend</h2>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">📊 Revenue chart visualization</p>
          </div>
        </div>
      </div>
    </div>
  );
}
