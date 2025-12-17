// CR AudioViz AI - Free API Health Dashboard
// File: /app/admin/api-health/page.tsx
// Auto-deployed: Wednesday, December 17, 2025

'use client';

import { useEffect, useState } from 'react';
import { Activity, CheckCircle, AlertTriangle, XCircle, RefreshCw, DollarSign } from 'lucide-react';

interface APIStatus {
  service: string;
  category: string;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  latency: number;
  message?: string;
  annualValue: number;
}

interface HealthData {
  status: string;
  message: string;
  results: APIStatus[];
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    down: number;
    totalAnnualValue: number;
  };
  timestamp: string;
}

const statusConfig = {
  healthy: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
  degraded: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  down: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  unknown: { icon: Activity, color: 'text-gray-500', bg: 'bg-gray-500/10' },
};

export default function APIHealthDashboard() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health/free-apis');
      const json = await res.json();
      setData(json);
      setLastRefresh(new Date());
    } catch (e) {
      console.error('Failed to fetch health:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div className="p-8 text-center">Loading...</div>;

  const categories = [...new Set(data.results.map(r => r.category))];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Activity className="w-8 h-8 text-purple-500" />
              Free API Health Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Real-time monitoring of {data.summary.total} free APIs</p>
          </div>
          <button onClick={fetchHealth} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total APIs</span>
              <Activity className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold mt-2">{data.summary.total}</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-green-900/50">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Healthy</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold mt-2 text-green-500">{data.summary.healthy}</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-yellow-900/50">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Degraded</span>
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold mt-2 text-yellow-500">{data.summary.degraded}</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-purple-900/50">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Annual Savings</span>
              <DollarSign className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold mt-2 text-purple-500">${data.summary.totalAnnualValue?.toLocaleString() || '15,816'}</div>
          </div>
        </div>

        {categories.map(category => (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-300">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.results.filter(r => r.category === category).map(api => {
                const config = statusConfig[api.status];
                const Icon = config.icon;
                return (
                  <div key={api.service} className={`${config.bg} rounded-xl p-4 border border-gray-800`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{api.service.replace(/_/g, ' ')}</span>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="mt-2 text-sm text-gray-400">
                      <span className="mr-4">Latency: {api.latency}ms</span>
                      {api.annualValue > 0 && <span className="text-purple-400">${api.annualValue}/yr</span>}
                    </div>
                    {api.message && api.message !== 'OK' && <div className="mt-1 text-xs text-gray-500">{api.message}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="text-center text-gray-500 text-sm mt-8">
          Last updated: {lastRefresh.toLocaleString()} • Auto-refreshes every 60s
        </div>
      </div>
    </div>
  );
}
