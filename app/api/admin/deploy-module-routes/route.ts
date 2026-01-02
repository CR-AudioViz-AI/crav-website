/**
 * CR AudioViz AI - Deploy Module Routes API
 * ========================================
 * 
 * Deploys placeholder pages for registered modules to GitHub
 * Creates both page components and API routes
 * 
 * @version 1.0.0
 * @date January 1, 2026
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''
const GITHUB_OWNER = 'CR-AudioViz-AI'
const GITHUB_REPO = 'crav-website'

interface ModuleInfo {
  module_slug: string
  module_name: string
  definition: {
    icon?: string
    description?: string
    family?: string
    revenueModel?: string
  }
}

// Generate a minimal page component
function generatePageComponent(mod: ModuleInfo): string {
  const { module_slug, module_name, definition } = mod
  const icon = definition.icon || '📦'
  const description = definition.description || `Welcome to ${module_name}`
  
  return `'use client'
// ${module_name} - CR AudioViz AI Module | Generated: ${new Date().toISOString()}
import Link from 'next/link'

export default function ${toPascalCase(module_slug)}Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <header className="border-b border-white/10 p-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">${icon}</span>
          <span className="text-xl font-bold">${module_name}</span>
        </Link>
      </header>
      <main className="max-w-4xl mx-auto p-8 text-center">
        <span className="text-6xl mb-6 block">${icon}</span>
        <h1 className="text-4xl font-bold mb-4">${module_name}</h1>
        <p className="text-xl text-gray-300 mb-8">${description}</p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup" className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700">Get Started</Link>
          <Link href="/demo" className="px-6 py-3 border border-white/20 rounded-lg hover:bg-white/10">Demo</Link>
        </div>
      </main>
      <footer className="border-t border-white/10 p-4 text-center text-gray-500 mt-auto">
        © 2026 CR AudioViz AI, LLC
      </footer>
    </div>
  )
}
`
}

// Generate API route
function generateAPIRoute(mod: ModuleInfo): string {
  return `// ${mod.module_name} API | Generated: ${new Date().toISOString()}
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    module: '${mod.module_slug}',
    name: '${mod.module_name}',
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({ success: true, module: '${mod.module_slug}', data: body })
}
`
}

function toPascalCase(str: string): string {
  return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
}

async function createOrUpdateFile(path: string, content: string, message: string): Promise<{ success: boolean; sha?: string; error?: string }> {
  try {
    // Check if file exists
    const checkRes = await fetch(
      \`https://api.github.com/repos/\${GITHUB_OWNER}/\${GITHUB_REPO}/contents/\${path}\`,
      { headers: { Authorization: \`token \${GITHUB_TOKEN}\` } }
    )
    
    let sha: string | undefined
    if (checkRes.ok) {
      const existing = await checkRes.json()
      sha = existing.sha
    }
    
    // Create or update file
    const res = await fetch(
      \`https://api.github.com/repos/\${GITHUB_OWNER}/\${GITHUB_REPO}/contents/\${path}\`,
      {
        method: 'PUT',
        headers: {
          Authorization: \`token \${GITHUB_TOKEN}\`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          content: Buffer.from(content).toString('base64'),
          ...(sha && { sha })
        })
      }
    )
    
    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.message }
    }
    
    const data = await res.json()
    return { success: true, sha: data.content?.sha }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function GET() {
  const { data: modules, error } = await supabase
    .from('module_registry')
    .select('module_slug, module_name, definition')
    .order('module_slug')
  
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({
    success: true,
    modules: modules?.length || 0,
    action: 'POST to deploy routes for all modules',
    preview: modules?.slice(0, 5).map(m => ({
      slug: m.module_slug,
      page: \`app/\${m.module_slug}/page.tsx\`,
      api: \`app/api/\${m.module_slug}/route.ts\`
    })),
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const limit = body.limit || 5 // Deploy in batches to avoid rate limits
  const offset = body.offset || 0
  
  // Get modules
  const { data: modules, error } = await supabase
    .from('module_registry')
    .select('module_slug, module_name, definition')
    .order('module_slug')
    .range(offset, offset + limit - 1)
  
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  
  const results: Array<{
    module: string
    page: { success: boolean; error?: string }
    api: { success: boolean; error?: string }
  }> = []
  
  for (const mod of modules || []) {
    const pageCode = generatePageComponent(mod)
    const apiCode = generateAPIRoute(mod)
    
    const pageResult = await createOrUpdateFile(
      \`app/\${mod.module_slug}/page.tsx\`,
      pageCode,
      \`feat: Add \${mod.module_name} page | Auto-generated\`
    )
    
    const apiResult = await createOrUpdateFile(
      \`app/api/\${mod.module_slug}/route.ts\`,
      apiCode,
      \`feat: Add \${mod.module_name} API | Auto-generated\`
    )
    
    results.push({
      module: mod.module_slug,
      page: pageResult,
      api: apiResult
    })
    
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500))
  }
  
  const successful = results.filter(r => r.page.success && r.api.success).length
  const { count } = await supabase.from('module_registry').select('*', { count: 'exact', head: true })
  
  return NextResponse.json({
    success: true,
    deployed: successful,
    total: results.length,
    results,
    pagination: {
      offset,
      limit,
      totalModules: count,
      hasMore: offset + limit < (count || 0),
      nextOffset: offset + limit
    },
    timestamp: new Date().toISOString()
  })
}
