/**
 * CR AudioViz AI - Autopilot Control Center
 * ==========================================
 * 
 * The central nervous system for autonomous operations.
 * Now wired to real /api/admin/autopilot endpoint.
 * 
 * @version 2.0.0
 * @date January 1, 2026
 */

'use client'

import { useState, useEffect, useCallback } from 'react'

interface SystemHealth {
  name: string
  status: 'healthy' | 'warning' | 'critical' | 'unknown'
  lastCheck: string
  score: number
  details?: string
  fixable?: boolean
  tier?: 0 | 1 | 2
}

interface AutopilotAction {
  id: string
  type: 'observe' | 'test' | 'fix' | 'verify' | 'report'
  target: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'needs_approval'
  tier: 0 | 1 | 2
  description: string
  timestamp: string
  result?: string
}

interface AutopilotState {
  enabled: boolean
  tier: 0 | 1 | 2
  lastRun: string | null
  systemHealth: SystemHealth[]
  pendingActions: AutopilotAction[]
  completedActions: AutopilotAction[]
  overallScore: number
}

export default function AutopilotControlCenter() {
  const [autopilot, setAutopilot] = useState<AutopilotState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionInProgress, setActionInProgress] = useState(false)

  const fetchAutopilotStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/autopilot?action=status')
      const data = await res.json()
      if (data.success) {
        setAutopilot(data.autopilot)
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch status')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAutopilotStatus()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAutopilotStatus, 30000)
    return () => clearInterval(interval)
  }, [fetchAutopilotStatus])

  async function toggleAutopilot() {
    setActionInProgress(true)
    try {
      const action = autopilot?.enabled ? 'disable' : 'enable'
      const res = await fetch('/api/admin/autopilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, tier: 0 })
      })
      const data = await res.json()
      if (data.success) {
        setAutopilot(data.autopilot)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionInProgress(false)
    }
  }

  async function setTier(newTier: 0 | 1 | 2) {
    setActionInProgress(true)
    try {
      const res = await fetch('/api/admin/autopilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setTier', tier: newTier })
      })
      const data = await res.json()
      if (data.success) {
        setAutopilot(data.autopilot)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionInProgress(false)
    }
  }

  async function runAutopilotLoop() {
    setActionInProgress(true)
    try {
      const res = await fetch('/api/admin/autopilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run' })
      })
      const data = await res.json()
      if (data.success) {
        setAutopilot(data.autopilot)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionInProgress(false)
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'healthy': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  function getStatusBg(status: string) {
    switch (status) {
      case 'healthy': return 'bg-green-50 border-green-200'
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      case 'critical': return 'bg-red-50 border-red-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Autopilot Control Center</h1>
          <p className="text-gray-500 mt-1">
            Autonomous monitoring and self-healing operations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={runAutopilotLoop}
            disabled={actionInProgress}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {actionInProgress ? (
              <span className="animate-spin">⟳</span>
            ) : (
              <span>▶</span>
            )}
            Run Loop
          </button>
          <button
            onClick={toggleAutopilot}
            disabled={actionInProgress}
            className={`px-4 py-2 rounded-lg font-medium ${
              autopilot?.enabled
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            } disabled:opacity-50`}
          >
            {autopilot?.enabled ? 'Disable Autopilot' : 'Enable Autopilot'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Status</div>
          <div className={`text-2xl font-bold ${autopilot?.enabled ? 'text-green-600' : 'text-gray-400'}`}>
            {autopilot?.enabled ? 'ACTIVE' : 'DISABLED'}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Current Tier</div>
          <div className="text-2xl font-bold text-blue-600">
            Tier {autopilot?.tier ?? 0}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Health Score</div>
          <div className={`text-2xl font-bold ${
            (autopilot?.overallScore ?? 0) >= 80 ? 'text-green-600' :
            (autopilot?.overallScore ?? 0) >= 50 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {autopilot?.overallScore ?? 0}%
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Last Run</div>
          <div className="text-lg font-medium text-gray-700">
            {autopilot?.lastRun 
              ? new Date(autopilot.lastRun).toLocaleTimeString()
              : 'Never'}
          </div>
        </div>
      </div>

      {/* Tier Selection */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Autonomous Operation Tier</h2>
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((tier) => (
            <button
              key={tier}
              onClick={() => setTier(tier as 0 | 1 | 2)}
              disabled={actionInProgress}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                autopilot?.tier === tier
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold">Tier {tier}</div>
              <div className="text-sm text-gray-500 mt-1">
                {tier === 0 && 'Observe Only - Read-only monitoring'}
                {tier === 1 && 'Safe Auto-Fix - Restart services, clear caches'}
                {tier === 2 && 'Full Auto - Code changes, deployments (approval required)'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">System Health</h2>
        <div className="space-y-3">
          {autopilot?.systemHealth.map((system, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg border ${getStatusBg(system.status)}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(system.status)}`}></div>
                <div>
                  <div className="font-medium">{system.name}</div>
                  <div className="text-sm text-gray-500">{system.details}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{system.score}%</div>
                <div className="text-xs text-gray-500">
                  {new Date(system.lastCheck).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Actions */}
      {autopilot?.pendingActions && autopilot.pendingActions.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Pending Actions</h2>
          <div className="space-y-3">
            {autopilot.pendingActions.map((action) => (
              <div
                key={action.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-yellow-50 border-yellow-200"
              >
                <div>
                  <div className="font-medium">{action.target}</div>
                  <div className="text-sm text-gray-600">{action.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    action.status === 'needs_approval' 
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {action.status}
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                    Tier {action.tier}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Autopilot Loop Visualization */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Autopilot Loop</h2>
        <div className="flex items-center justify-between">
          {['Observe', 'Test', 'Score', 'Recommend', 'Fix', 'Verify', 'Report'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                  index === 0 ? 'bg-blue-600' : 'bg-gray-300'
                }`}>
                  {index + 1}
                </div>
                <div className="text-xs mt-1 text-gray-600">{step}</div>
              </div>
              {index < 6 && (
                <div className="w-8 h-0.5 bg-gray-300 mx-1"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
