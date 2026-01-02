// Javari Voice API | Generated: 2026-01-02T02:09:52.656Z
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    module: 'javari-voice',
    name: 'Javari Voice',
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({ success: true, module: 'javari-voice', data: body })
}
