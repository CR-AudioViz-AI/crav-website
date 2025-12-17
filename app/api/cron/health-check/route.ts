// CR AudioViz AI - Automated Health Check Cron
// File: /app/api/cron/health-check/route.ts
// Runs every 5 minutes via Vercel Cron

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FREE_APIS = [
  { name: 'quickchart', url: 'https://quickchart.io/healthcheck', category: 'Visualization' },
  { name: 'coincap', url: 'https://api.coincap.io/v2/assets/bitcoin', category: 'Financial' },
  { name: 'scryfall', url: 'https://api.scryfall.com/cards/random', category: 'Gaming' },
  { name: 'pokeapi', url: 'https://pokeapi.co/api/v2/pokemon/1', category: 'Gaming' },
  { name: 'musicbrainz', url: 'https://musicbrainz.org/ws/2/artist/5b11f4ce-a62d-471e-81fc-a69a8278c7da?fmt=json', category: 'Music' },
  { name: 'ip_api', url: 'http://ip-api.com/json/8.8.8.8', category: 'Geolocation' },
  { name: 'restcountries', url: 'https://restcountries.com/v3.1/alpha/us', category: 'Utilities' },
];

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = [];
  const timestamp = new Date();

  for (const api of FREE_APIS) {
    const start = Date.now();
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000);
      
      const headers: Record<string, string> = {};
      if (api.name === 'musicbrainz') {
        headers['User-Agent'] = 'CRAudioVizAI/1.0';
      }
      
      const res = await fetch(api.url, { headers, signal: controller.signal });
      const latency = Date.now() - start;
      const status = res.ok ? (latency < 1000 ? 'healthy' : 'degraded') : 'down';
      
      results.push({ service_name: api.name, category: api.category, status, latency_ms: latency, message: res.ok ? 'OK' : `HTTP ${res.status}`, checked_at: timestamp.toISOString() });
    } catch (e) {
      results.push({ service_name: api.name, category: api.category, status: 'down', latency_ms: Date.now() - start, message: e instanceof Error ? e.message : 'Error', checked_at: timestamp.toISOString() });
    }
  }

  // Log to Supabase
  await supabase.from('free_api_health_logs').insert(results);

  // Alert on failures
  const failures = results.filter(r => r.status === 'down');
  if (failures.length > 0 && process.env.DISCORD_WEBHOOK_URL) {
    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `🚨 **API Health Alert**\n${failures.map(f => `❌ ${f.service_name}: ${f.message}`).join('\n')}\nTime: ${timestamp.toISOString()}`
      })
    });
  }

  return NextResponse.json({
    success: true,
    checked: results.length,
    healthy: results.filter(r => r.status === 'healthy').length,
    degraded: results.filter(r => r.status === 'degraded').length,
    down: failures.length,
    timestamp: timestamp.toISOString()
  });
}
