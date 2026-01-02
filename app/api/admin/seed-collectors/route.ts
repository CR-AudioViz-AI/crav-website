/**
 * CR AudioViz AI - Collector Database Seeding API v2.0
 * ====================================================
 * 
 * Seeds collector databases with real data from free APIs.
 * Updated January 1, 2026 - Better error handling & table names
 * 
 * Tables: collector_sets, collector_cards, collector_vinyl, collector_comics
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface SeedResult {
  source: string
  status: 'success' | 'error' | 'skipped'
  count: number
  message: string
}

async function seedPokemonTCG(): Promise<SeedResult> {
  try {
    console.log('Fetching Pokemon TCG sets...')
    const setsRes = await fetch('https://api.pokemontcg.io/v2/sets?orderBy=-releaseDate&pageSize=50', {
      headers: { 'Accept': 'application/json' }
    })
    
    if (!setsRes.ok) {
      return { source: 'Pokemon TCG', status: 'error', count: 0, message: `API returned ${setsRes.status}` }
    }
    
    const setsData = await setsRes.json()
    
    if (!setsData?.data || !Array.isArray(setsData.data)) {
      return { source: 'Pokemon TCG', status: 'error', count: 0, message: 'No data array in response' }
    }
    
    const sets = setsData.data.map((set: any) => ({
      external_id: `pokemon_${set.id}`,
      name: set.name,
      series: set.series,
      release_date: set.releaseDate || null,
      total_cards: set.total || 0,
      image_url: set.images?.logo || null,
      symbol_url: set.images?.symbol || null,
      source: 'pokemontcg',
      metadata: {
        ptcgoCode: set.ptcgoCode,
        legalities: set.legalities
      }
    }))
    
    const { error } = await supabase
      .from('collector_sets')
      .upsert(sets, { onConflict: 'external_id' })
    
    if (error) {
      return { source: 'Pokemon TCG', status: 'error', count: 0, message: error.message }
    }
    
    return { 
      source: 'Pokemon TCG', 
      status: 'success', 
      count: sets.length, 
      message: `Seeded ${sets.length} Pokemon TCG sets` 
    }
  } catch (error: any) {
    return { source: 'Pokemon TCG', status: 'error', count: 0, message: error.message }
  }
}

async function seedMTG(): Promise<SeedResult> {
  try {
    console.log('Fetching MTG sets from Scryfall...')
    const setsRes = await fetch('https://api.scryfall.com/sets', {
      headers: { 'Accept': 'application/json' }
    })
    
    if (!setsRes.ok) {
      return { source: 'MTG (Scryfall)', status: 'error', count: 0, message: `API returned ${setsRes.status}` }
    }
    
    const setsData = await setsRes.json()
    
    if (!setsData?.data || !Array.isArray(setsData.data)) {
      return { source: 'MTG (Scryfall)', status: 'error', count: 0, message: 'No data array in response' }
    }
    
    // Limit to 100 most recent sets
    const sets = setsData.data.slice(0, 100).map((set: any) => ({
      external_id: `mtg_${set.code}`,
      name: set.name,
      series: set.set_type,
      release_date: set.released_at || null,
      total_cards: set.card_count || 0,
      image_url: set.icon_svg_uri || null,
      source: 'scryfall',
      metadata: {
        code: set.code,
        setType: set.set_type,
        digital: set.digital,
        scryfallUri: set.scryfall_uri
      }
    }))
    
    const { error } = await supabase
      .from('collector_sets')
      .upsert(sets, { onConflict: 'external_id' })
    
    if (error) {
      return { source: 'MTG (Scryfall)', status: 'error', count: 0, message: error.message }
    }
    
    return { 
      source: 'MTG (Scryfall)', 
      status: 'success', 
      count: sets.length, 
      message: `Seeded ${sets.length} MTG sets` 
    }
  } catch (error: any) {
    return { source: 'MTG (Scryfall)', status: 'error', count: 0, message: error.message }
  }
}

async function seedVinyl(): Promise<SeedResult> {
  try {
    console.log('Fetching vinyl records from Discogs...')
    const genres = ['rock', 'jazz', 'electronic']
    let totalCount = 0
    const allRecords: any[] = []
    
    for (const genre of genres) {
      try {
        const res = await fetch(
          `https://api.discogs.com/database/search?style=${genre}&type=release&per_page=10`,
          { headers: { 'User-Agent': 'CRAudioVizAI/1.0' } }
        )
        
        if (!res.ok) continue
        
        const data = await res.json()
        
        if (data?.results && Array.isArray(data.results)) {
          const records = data.results.map((item: any) => ({
            external_id: `discogs_${item.id}`,
            title: item.title || 'Unknown',
            artist: item.title?.split(' - ')?.[0] || 'Unknown Artist',
            release_year: item.year || null,
            genre: genre,
            format: 'vinyl',
            image_url: item.cover_image || null,
            thumb_url: item.thumb || null,
            source: 'discogs',
            metadata: {
              country: item.country,
              label: item.label,
              catno: item.catno
            }
          }))
          
          allRecords.push(...records)
          totalCount += records.length
        }
        
        // Rate limit
        await new Promise(r => setTimeout(r, 1000))
      } catch {
        continue
      }
    }
    
    if (allRecords.length > 0) {
      const { error } = await supabase
        .from('collector_vinyl')
        .upsert(allRecords, { onConflict: 'external_id' })
      
      if (error) {
        return { source: 'Vinyl (Discogs)', status: 'error', count: 0, message: error.message }
      }
    }
    
    return { 
      source: 'Vinyl (Discogs)', 
      status: totalCount > 0 ? 'success' : 'skipped', 
      count: totalCount, 
      message: totalCount > 0 ? `Seeded ${totalCount} vinyl records` : 'No records fetched' 
    }
  } catch (error: any) {
    return { source: 'Vinyl (Discogs)', status: 'error', count: 0, message: error.message }
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const results: SeedResult[] = []
  
  try {
    // Check if tables exist first
    const { error: tableCheck } = await supabase
      .from('collector_sets')
      .select('id')
      .limit(1)
    
    if (tableCheck?.code === 'PGRST205') {
      return NextResponse.json({
        success: false,
        error: 'Collector tables do not exist. Run the SQL script in Supabase first.',
        hint: 'Go to https://supabase.com/dashboard/project/kteobfyferrukqeolofj/sql/new and run the collector_tables.sql script'
      }, { status: 400 })
    }
    
    const body = await request.json().catch(() => ({}))
    const sources = body.sources || ['pokemon', 'mtg', 'vinyl']
    
    if (sources.includes('pokemon')) {
      results.push(await seedPokemonTCG())
    }
    
    if (sources.includes('mtg')) {
      results.push(await seedMTG())
    }
    
    if (sources.includes('vinyl')) {
      results.push(await seedVinyl())
    }
    
    const totalSeeded = results.reduce((sum, r) => sum + r.count, 0)
    const successCount = results.filter(r => r.status === 'success').length
    
    return NextResponse.json({
      success: true,
      summary: {
        totalSeeded,
        sourcesProcessed: results.length,
        successful: successCount,
        executionTime: Date.now() - startTime
      },
      results
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      results
    }, { status: 500 })
  }
}

export async function GET() {
  // Check table status
  const tables = ['collector_sets', 'collector_cards', 'collector_vinyl', 'collector_comics', 'user_collections']
  const tableStatus: Record<string, any> = {}
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
    
    if (error?.code === 'PGRST205') {
      tableStatus[table] = { exists: false, message: 'Table not found' }
    } else if (error) {
      tableStatus[table] = { exists: false, error: error.message }
    } else {
      tableStatus[table] = { exists: true, count: count || 0 }
    }
  }
  
  const allExist = Object.values(tableStatus).every((t: any) => t.exists)
  
  return NextResponse.json({
    endpoint: '/api/admin/seed-collectors',
    method: 'POST',
    description: 'Seeds collector databases from external APIs',
    sources: ['pokemon', 'mtg', 'vinyl'],
    tableStatus,
    tablesReady: allExist,
    action: allExist 
      ? 'POST to seed data' 
      : 'Run collector_tables.sql in Supabase first',
    supabaseSqlEditor: 'https://supabase.com/dashboard/project/kteobfyferrukqeolofj/sql/new'
  })
}
