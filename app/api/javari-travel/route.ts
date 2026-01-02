// Javari Travel API | Generated: 2026-01-02T02:09:46.625Z
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    module: 'javari-travel',
    name: 'Javari Travel',
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({ success: true, module: 'javari-travel', data: body })
}
