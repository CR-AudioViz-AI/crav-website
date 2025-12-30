// /api/observability/route.ts
// Observability & Monitoring API - CR AudioViz AI
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Services to monitor
const SERVICES = [
  { name: 'craudiovizai.com', url: 'https://craudiovizai.com', type: 'website' },
  { name: 'javariai.com', url: 'https://javariai.com', type: 'website' },
  { name: 'orlandotripdeal.com', url: 'https://orlandotripdeal.com', type: 'website' },
  { name: 'supabase', url: 'https://kteobfyferrukqeolofj.supabase.co/rest/v1/', type: 'database' },
];

// GET: Fetch observability data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const serviceName = searchParams.get('service');
    const timeRange = searchParams.get('range') || '24h';
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Calculate time range
    const now = new Date();
    let startTime: Date;
    switch (timeRange) {
      case '1h': startTime = new Date(now.getTime() - 60 * 60 * 1000); break;
      case '6h': startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000); break;
      case '24h': startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
      case '7d': startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case '30d': startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      default: startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    switch (action) {
      case 'health': {
        // Get latest health status for each service
        const { data, error } = await supabase
          .from('service_health')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Group by service, get latest
        const latestHealth: Record<string, any> = {};
        data?.forEach(h => {
          if (!latestHealth[h.service_name]) {
            latestHealth[h.service_name] = h;
          }
        });

        return NextResponse.json({
          services: Object.values(latestHealth),
          overall: Object.values(latestHealth).every((h: any) => h.status === 'healthy') 
            ? 'healthy' : 'degraded'
        });
      }

      case 'errors': {
        // Get recent errors
        let query = supabase
          .from('error_logs')
          .select('*')
          .gte('created_at', startTime.toISOString())
          .order('created_at', { ascending: false })
          .limit(limit);

        if (serviceName) {
          query = query.eq('service_name', serviceName);
        }

        const { data, error } = await query;

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Get error counts by type
        const errorCounts: Record<string, number> = {};
        data?.forEach(e => {
          errorCounts[e.error_type] = (errorCounts[e.error_type] || 0) + 1;
        });

        return NextResponse.json({
          errors: data || [],
          counts: errorCounts,
          total: data?.length || 0
        });
      }

      case 'metrics': {
        // Get performance metrics
        let query = supabase
          .from('performance_metrics')
          .select('*')
          .gte('recorded_at', startTime.toISOString())
          .order('recorded_at', { ascending: false })
          .limit(limit);

        if (serviceName) {
          query = query.eq('service_name', serviceName);
        }

        const { data, error } = await query;

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
          metrics: data || [],
          total: data?.length || 0
        });
      }

      case 'alerts': {
        // Get active alerts/incidents
        const { data: incidents, error: incError } = await supabase
          .from('alert_incidents')
          .select('*')
          .in('status', ['open', 'acknowledged'])
          .order('triggered_at', { ascending: false });

        const { data: rules } = await supabase
          .from('alert_rules')
          .select('*')
          .eq('is_active', true);

        if (incError) {
          return NextResponse.json({ error: incError.message }, { status: 500 });
        }

        return NextResponse.json({
          activeIncidents: incidents || [],
          rules: rules || [],
          alertCount: incidents?.length || 0
        });
      }

      case 'uptime': {
        // Get uptime data
        let query = supabase
          .from('uptime_daily')
          .select('*')
          .gte('date', startTime.toISOString().split('T')[0])
          .order('date', { ascending: false });

        if (serviceName) {
          query = query.eq('service_name', serviceName);
        }

        const { data, error } = await query;

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Calculate overall uptime
        const overallUptime = data?.length 
          ? data.reduce((sum, d) => sum + (d.uptime_percent || 100), 0) / data.length
          : 100;

        return NextResponse.json({
          uptime: data || [],
          overallUptime: Math.round(overallUptime * 100) / 100
        });
      }

      case 'dashboard': {
        // Get dashboard overview
        const [healthRes, errorsRes, incidentsRes, uptimeRes] = await Promise.all([
          supabase
            .from('service_health')
            .select('service_name, status, response_time_ms, created_at')
            .order('created_at', { ascending: false })
            .limit(20),
          supabase
            .from('error_logs')
            .select('id, error_type, service_name, created_at')
            .gte('created_at', startTime.toISOString())
            .order('created_at', { ascending: false })
            .limit(10),
          supabase
            .from('alert_incidents')
            .select('*')
            .in('status', ['open', 'acknowledged']),
          supabase
            .from('uptime_daily')
            .select('service_name, uptime_percent, date')
            .gte('date', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        ]);

        // Process health data
        const latestHealth: Record<string, any> = {};
        healthRes.data?.forEach(h => {
          if (!latestHealth[h.service_name]) {
            latestHealth[h.service_name] = h;
          }
        });

        // Calculate stats
        const healthyServices = Object.values(latestHealth).filter((h: any) => h.status === 'healthy').length;
        const totalServices = Object.keys(latestHealth).length;

        return NextResponse.json({
          health: {
            services: Object.values(latestHealth),
            healthy: healthyServices,
            total: totalServices,
            status: healthyServices === totalServices ? 'healthy' : 'degraded'
          },
          errors: {
            recent: errorsRes.data || [],
            count: errorsRes.data?.length || 0
          },
          alerts: {
            active: incidentsRes.data || [],
            count: incidentsRes.data?.length || 0
          },
          uptime: {
            data: uptimeRes.data || [],
            average: uptimeRes.data?.length 
              ? uptimeRes.data.reduce((sum, d) => sum + (d.uptime_percent || 100), 0) / uptimeRes.data.length
              : 100
          }
        });
      }

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use: health, errors, metrics, alerts, uptime, dashboard' 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Observability API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Record observability data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    switch (action) {
      case 'health-check': {
        // Run health checks on all services
        const results = await Promise.all(
          SERVICES.map(async (service) => {
            const startTime = Date.now();
            let status = 'healthy';
            let statusCode = 0;
            let errorMessage = null;

            try {
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 10000);

              const response = await fetch(service.url, {
                method: 'HEAD',
                signal: controller.signal
              });

              clearTimeout(timeout);
              statusCode = response.status;

              if (!response.ok) {
                status = statusCode >= 500 ? 'unhealthy' : 'degraded';
              }
            } catch (err: any) {
              status = 'unhealthy';
              errorMessage = err.message;
            }

            const responseTime = Date.now() - startTime;

            // Record to database
            await supabase.from('service_health').insert({
              service_name: service.name,
              service_url: service.url,
              service_type: service.type,
              status,
              status_code: statusCode,
              response_time_ms: responseTime,
              error_message: errorMessage,
              last_check_at: new Date().toISOString(),
              last_healthy_at: status === 'healthy' ? new Date().toISOString() : null,
              last_unhealthy_at: status === 'unhealthy' ? new Date().toISOString() : null
            });

            return {
              service: service.name,
              status,
              responseTime,
              statusCode
            };
          })
        );

        return NextResponse.json({
          success: true,
          results,
          timestamp: new Date().toISOString()
        });
      }

      case 'log-error': {
        const {
          serviceName,
          errorType,
          errorMessage,
          stackTrace,
          endpoint,
          userId,
          requestId,
          userImpact = 'minor'
        } = body;

        if (!serviceName || !errorType || !errorMessage) {
          return NextResponse.json(
            { error: 'serviceName, errorType, and errorMessage required' },
            { status: 400 }
          );
        }

        // Generate hash for deduplication
        const errorHash = Buffer.from(
          `${serviceName}:${errorType}:${errorMessage}:${endpoint || ''}`
        ).toString('base64').substring(0, 32);

        const { data, error } = await supabase
          .from('error_logs')
          .insert({
            service_name: serviceName,
            error_type: errorType,
            error_message: errorMessage,
            stack_trace: stackTrace,
            endpoint,
            user_id: userId,
            request_id: requestId,
            error_hash: errorHash,
            user_impact: userImpact
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, errorId: data.id });
      }

      case 'record-metric': {
        const {
          metricName,
          value,
          serviceName,
          metricType = 'gauge',
          endpoint,
          unit,
          tags = {}
        } = body;

        if (!metricName || value === undefined || !serviceName) {
          return NextResponse.json(
            { error: 'metricName, value, and serviceName required' },
            { status: 400 }
          );
        }

        const { data, error } = await supabase
          .from('performance_metrics')
          .insert({
            metric_name: metricName,
            metric_type: metricType,
            value,
            unit,
            service_name: serviceName,
            endpoint,
            tags
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, metricId: data.id });
      }

      case 'trigger-alert': {
        const {
          ruleId,
          ruleName,
          severity,
          triggeredValue,
          thresholdValue,
          condition,
          serviceName,
          endpoint
        } = body;

        if (!ruleName || !severity) {
          return NextResponse.json(
            { error: 'ruleName and severity required' },
            { status: 400 }
          );
        }

        const { data, error } = await supabase
          .from('alert_incidents')
          .insert({
            rule_id: ruleId,
            rule_name: ruleName,
            severity,
            triggered_value: triggeredValue,
            threshold_value: thresholdValue,
            condition,
            service_name: serviceName,
            endpoint,
            status: 'open'
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Update rule's last triggered time
        if (ruleId) {
          await supabase
            .from('alert_rules')
            .update({ last_triggered_at: new Date().toISOString() })
            .eq('id', ruleId);
        }

        return NextResponse.json({ success: true, incidentId: data.id });
      }

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use: health-check, log-error, record-metric, trigger-alert' 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Observability API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update incidents
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { incidentId, status, resolvedBy, resolutionNotes } = body;

    if (!incidentId || !status) {
      return NextResponse.json({ error: 'incidentId and status required' }, { status: 400 });
    }

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const updates: Record<string, any> = { status };

    if (status === 'acknowledged') {
      updates.acknowledged_at = new Date().toISOString();
      updates.acknowledged_by = resolvedBy;
    }

    if (status === 'resolved') {
      updates.resolved_at = new Date().toISOString();
      updates.resolved_by = resolvedBy;
      updates.resolution_notes = resolutionNotes;
    }

    const { data, error } = await supabase
      .from('alert_incidents')
      .update(updates)
      .eq('id', incidentId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, incident: data });

  } catch (error) {
    console.error('Observability API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
