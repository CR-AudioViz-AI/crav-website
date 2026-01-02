/**
 * CR AudioViz AI - Deploy Module Routes API
 * ========================================
 * 
 * Deploys placeholder pages for registered modules to GitHub
 * Creates both page components and API routes
 * 
 * @version 1.0.1
 * @date January 1, 2026
 * @fix Fixed template literal escaping
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
  const description = definition.description || 'Welcome to ' + module_name
  const pascalName = toPascalCase(module_slug)
  const timestamp = new Date().toISOString()
  
  return "'use client'\n" +
    "// " + module_name + " - CR AudioViz AI Module | Generated: " + timestamp + "\n" +
    "import Link from 'next/link'\n\n" +
    "export default function " + pascalName + "Page() {\n" +
    "  return (\n" +
    "    <div className=\"min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white\">\n" +
    "      <header className=\"border-b border-white/10 p-4\">\n" +
    "        <Link href=\"/\" className=\"flex items-center gap-2\">\n" +
    "          <span className=\"text-2xl\">" + icon + "</span>\n" +
    "          <span className=\"text-xl font-bold\">" + module_name + "</span>\n" +
    "        </Link>\n" +
    "      </header>\n" +
    "      <main className=\"max-w-4xl mx-auto p-8 text-center\">\n" +
    "        <span className=\"text-6xl mb-6 block\">" + icon + "</span>\n" +
    "        <h1 className=\"text-4xl font-bold mb-4\">" + module_name + "</h1>\n" +
    "        <p className=\"text-xl text-gray-300 mb-8\">" + description + "</p>\n" +
    "        <div className=\"flex gap-4 justify-center\">\n" +
    "          <Link href=\"/signup\" className=\"px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700\">Get Started</Link>\n" +
    "          <Link href=\"/demo\" className=\"px-6 py-3 border border-white/20 rounded-lg hover:bg-white/10\">Demo</Link>\n" +
    "        </div>\n" +
    "      </main>\n" +
    "      <footer className=\"border-t border-white/10 p-4 text-center text-gray-500 mt-auto\">\n" +
    "        © 2026 CR AudioViz AI, LLC\n" +
    "      </footer>\n" +
    "    </div>\n" +
    "  )\n" +
    "}\n"
}

// Generate API route
function generateAPIRoute(mod: ModuleInfo): string {
  const timestamp = new Date().toISOString()
  return "// " + mod.module_name + " API | Generated: " + timestamp + "\n" +
    "import { NextRequest, NextResponse } from 'next/server'\n\n" +
    "export async function GET() {\n" +
    "  return NextResponse.json({\n" +
    "    module: '" + mod.module_slug + "',\n" +
    "    name: '" + mod.module_name + "',\n" +
    "    status: 'operational',\n" +
    "    version: '1.0.0',\n" +
    "    timestamp: new Date().toISOString()\n" +
    "  })\n" +
    "}\n\n" +
    "export async function POST(request: NextRequest) {\n" +
    "  const body = await request.json().catch(() => ({}))\n" +
    "  return NextResponse.json({ success: true, module: '" + mod.module_slug + "', data: body })\n" +
    "}\n"
}

function toPascalCase(str: string): string {
  return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
}

async function createOrUpdateFile(path: string, content: string, message: string): Promise<{ success: boolean; sha?: string; error?: string }> {
  try {
    // Check if file exists
    const checkUrl = 'https://api.github.com/repos/' + GITHUB_OWNER + '/' + GITHUB_REPO + '/contents/' + path
    const checkRes = await fetch(checkUrl, {
      headers: { Authorization: 'token ' + GITHUB_TOKEN }
    })
    
    let sha: string | undefined
    if (checkRes.ok) {
      const existing = await checkRes.json()
      sha = existing.sha
    }
    
    // Create or update file
    const putUrl = 'https://api.github.com/repos/' + GITHUB_OWNER + '/' + GITHUB_REPO + '/contents/' + path
    const res = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        Authorization: 'token ' + GITHUB_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        content: Buffer.from(content).toString('base64'),
        ...(sha && { sha })
      })
    })
    
    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.message }
    }
    
    const data = await res.json()
    return { success: true, sha: data.content?.sha }
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: errMsg }
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
  
  const preview = (modules || []).slice(0, 5).map(m => ({
    slug: m.module_slug,
    page: 'app/' + m.module_slug + '/page.tsx',
    api: 'app/api/' + m.module_slug + '/route.ts'
  }))
  
  return NextResponse.json({
    success: true,
    modules: modules?.length || 0,
    action: 'POST to deploy routes for all modules',
    preview,
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
    
    const pagePath = 'app/' + mod.module_slug + '/page.tsx'
    const pageMessage = 'feat: Add ' + mod.module_name + ' page | Auto-generated'
    const pageResult = await createOrUpdateFile(pagePath, pageCode, pageMessage)
    
    const apiPath = 'app/api/' + mod.module_slug + '/route.ts'
    const apiMessage = 'feat: Add ' + mod.module_name + ' API | Auto-generated'
    const apiResult = await createOrUpdateFile(apiPath, apiCode, apiMessage)
    
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
