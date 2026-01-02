import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const startTime = Date.now();
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const checks = {
      timestamp: new Date().toISOString(),
      status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
      responseTime: 0,
      services: {
        supabase: false,
        legalease_table: false,
        authentication: false,
        profiles: false
      },
      database: {
        connection: false,
        tables: {
          profiles: false,
          legalease_documents: false
        }
      }
    }

    // Check Supabase connection via profiles table
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
      
      if (!error) {
        checks.services.supabase = true
        checks.services.profiles = true
        checks.database.connection = true
        checks.database.tables.profiles = true
      }
    } catch (err: unknown) {
      console.error('Supabase connection check failed:', err)
    }

    // Check legalease_documents table
    try {
      const { data, error } = await supabase
        .from('legalease_documents')
        .select('id')
        .limit(1)
      
      if (!error) {
        checks.services.legalease_table = true
        checks.database.tables.legalease_documents = true
      } else {
        console.error('Legalease check error:', error.message)
      }
    } catch (err: unknown) {
      console.error('Legalease table check failed:', err)
    }

    // Check auth service
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      // Even without a session, if no error then auth service is up
      if (!error) {
        checks.services.authentication = true
      }
    } catch (err: unknown) {
      console.error('Auth check failed:', err)
    }

    // Calculate response time
    checks.responseTime = Date.now() - startTime;

    // Determine overall status
    const criticalServices = [checks.services.supabase, checks.database.connection]
    const allServices = Object.values(checks.services)
    
    if (criticalServices.every(s => s)) {
      if (allServices.every(s => s)) {
        checks.status = 'healthy'
      } else {
        checks.status = 'degraded'
      }
    } else {
      checks.status = 'unhealthy'
    }

    return NextResponse.json(checks, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    })
  }
}
