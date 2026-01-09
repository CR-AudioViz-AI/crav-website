"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, CreditCard, Ticket, TrendingUp, 
  DollarSign, AlertCircle, Clock, CheckCircle,
  ArrowUpRight, ArrowDownRight, RefreshCw
} from "lucide-react";

interface DashboardStats {
  users: { total: number; today: number };
  subscriptions: { active: number };
  revenue: { today: number; month: number };
  tickets: { open: number };
  credits: { total_balance: number };
  recent_transactions: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/dashboard/stats");
      const data = await res.json();
      setStats(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ 
    title, value, subValue, icon: Icon, trend, color 
  }: { 
    title: string; 
    value: string | number; 
    subValue?: string; 
    icon: any; 
    trend?: "up" | "down"; 
    color: string;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subValue && (
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              {trend === "up" && <ArrowUpRight className="w-4 h-4 text-cyan-500" />}
              {trend === "down" && <ArrowDownRight className="w-4 h-4 text-red-500" />}
              {subValue}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                CRAIverse Operations Center
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchStats}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              {lastUpdated && (
                <span className="text-sm text-gray-500">
                  Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats?.users.total?.toLocaleString() || 0}
            subValue={`+${stats?.users.today || 0} today`}
            icon={Users}
            trend="up"
            color="bg-blue-500"
          />
          <StatCard
            title="Active Subscriptions"
            value={stats?.subscriptions.active?.toLocaleString() || 0}
            icon={CreditCard}
            color="bg-cyan-500"
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${stats?.revenue.month?.toLocaleString() || 0}`}
            subValue={`$${stats?.revenue.today || 0} today`}
            icon={DollarSign}
            trend="up"
            color="bg-cyan-500"
          />
          <StatCard
            title="Open Tickets"
            value={stats?.tickets.open || 0}
            icon={Ticket}
            color={stats?.tickets.open && stats.tickets.open > 10 ? "bg-red-500" : "bg-cyan-500"}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/users" className="block bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <h3 className="font-semibold text-gray-900">User Management</h3>
                <p className="text-sm text-gray-500">View and manage users</p>
              </div>
            </div>
          </Link>
          
          <Link href="/admin/tickets" className="block bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <Ticket className="w-8 h-8 text-cyan-500" />
              <div>
                <h3 className="font-semibold text-gray-900">Support Tickets</h3>
                <p className="text-sm text-gray-500">{stats?.tickets.open || 0} open tickets</p>
              </div>
            </div>
          </Link>
          
          <Link href="/admin/billing" className="block bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <DollarSign className="w-8 h-8 text-cyan-500" />
              <div>
                <h3 className="font-semibold text-gray-900">Billing & Revenue</h3>
                <p className="text-sm text-gray-500">View transactions</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats?.recent_transactions?.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {tx.craiverse_profiles?.display_name || "Unknown"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {tx.craiverse_profiles?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        ${(tx.amount / 100).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {tx.provider}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        tx.status === "completed" 
                          ? "bg-cyan-500 text-cyan-500"
                          : tx.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-cyan-400 text-cyan-400"
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {(!stats?.recent_transactions || stats.recent_transactions.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No recent transactions
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
