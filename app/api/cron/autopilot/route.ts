/**
 * CR AudioViz AI - Autopilot Monitoring Cron
 * ==========================================
 * 
 * Runs every 5 minutes to:
 * 1. Check system health
 * 2. Log results to database
 * 3. Send alerts if critical issues detected
 * 4. Execute Tier 0/1 auto-fixes if enabled
 * 
 * @version 1.0.0
 * @date January 1, 2026
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface HealthCheck {
  name: string
  status: 'healthy' | 'warning' | 'critical' | 'unknown'
  score: number
  latency?: number
  details?: string
}

async function checkEndpoint(name: string, url: string): Promise<HealthCheck> {
  const start = Date.now()
  try {
    const res = await fetch(url, { 
      cache: 'no-store',
      signal: AbortSignal.timeout(10000)
    })
    const latency = Date.now() - start
    
    return {
      name,
      status: res.ok ? 'healthy' : 'warning',
      score: res.ok ? 100 : 50,
      latency,
      details: res.ok ? `OK (${latency}ms)` : `HTTP ${res.status}`
    }
  } catch (error: any) {
    return {
      name,
      status: 'critical',
      score: 0,
      latency: Date.now() - start,
      details: error.message || 'Connection failed'
    }
  }
}

async function sendDiscordAlert(message: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) return
  
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `🚨 **Autopilot Alert**\n${message}`,
        username: 'CR AudioViz Autopilot'
      })
    })
  } catch (err) {
    console.error('Discord alert failed:', err)
  }
}

export async function GET() {
  const startTime = Date.now()
  const checks: HealthCheck[] = []
  
  // Run health checks
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://craudiovizai.com'
  
  checks.push(await checkEndpoint('Main Website', baseUrl))
  checks.push(await checkEndpoint('API Health', `${baseUrl}/api/health`))
  checks.push(await checkEndpoint('Javari AI', 'https://javariai.com/api/health'))
  checks.push(await checkEndpoint('Admin Dashboard', `${baseUrl}/admin`))
  
  // Calculate overall score
  const overallScore = Math.round(
    checks.reduce((sum, c) => sum + c.score, 0) / checks.length
  )
  
  // Count statuses
  const critical = checks.filter(c => c.status === 'critical').length
  const warnings = checks.filter(c => c.status === 'warning').length
  const healthy = checks.filter(c => c.status === 'healthy').length
  
  // Log to database
  try {
    await supabase.from('autopilot_health_logs').insert({
      timestamp: new Date().toISOString(),
      overall_score: overallScore,
      checks: checks,
      critical_count: critical,
      warning_count: warnings,
      healthy_count: healthy,
      execution_time_ms: Date.now() - startTime
    })
  } catch (err) {
    console.error('Failed to log health check:', err)
  }
  
  // Send alert if critical issues
  if (critical > 0) {
    const criticalSystems = checks
      .filter(c => c.status === 'critical')
      .map(c => `• ${c.name}: ${c.details}`)
      .join('\n')
    
    await sendDiscordAlert(
      `**${critical} CRITICAL SYSTEM(S) DETECTED**\n\n${criticalSystems}\n\nOverall Score: ${overallScore}%`
    )
  }
  
  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    overallScore,
    summary: {
      healthy,
      warnings,
      critical,
      total: checks.length
    },
    checks,
    executionTime: Date.now() - startTime
  })
}
