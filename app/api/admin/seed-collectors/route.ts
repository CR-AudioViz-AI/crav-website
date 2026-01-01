// Collector Database Seeding API
// Timestamp: January 1, 2026 - 6:03 PM EST
// CR AudioViz AI - Seeds Pokemon, MTG, Vinyl, Comics databases

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes for large imports

const POKEMON_API_KEY = process.env.POKEMON_TCG_API_KEY || '9b638546-53e0-40f7-b7f4-0fcc261865a9'
const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN || 'HtBQcBPXkTURWwZjFRAmRjjYiPKVaGVblihxgVwe'
const COMIC_VINE_API_KEY = process.env.COMIC_VINE_API_KEY || 'bdf63eeee6bc3fb8fe0ac7e0b92970efe131262c'

interface SeedResult {
  source: string
  success: boolean
  count: number
  message: string
}

async function seedPokemonSets(supabase: any): Promise<SeedResult> {
  try {
    const response = await fetch('https://api.pokemontcg.io/v2/sets?pageSize=250', {
      headers: { 'X-Api-Key': POKEMON_API_KEY }
    })
    
    if (!response.ok) throw new Error(`Pokemon API error: ${response.status}`)
    
    const data = await response.json()
    const sets = data.data.map((set: any) => ({
      pokemon_set_id: set.id,
      name: set.name,
      series: set.series,
      total_cards: set.total,
      release_date: set.releaseDate,
      symbol_url: set.images?.symbol,
      logo_url: set.images?.logo,
      updated_at: new Date().toISOString()
    }))
    
    const { error } = await supabase
      .from('pokemon_sets')
      .upsert(sets, { onConflict: 'pokemon_set_id' })
    
    if (error) throw error
    
    return { source: 'Pokemon Sets', success: true, count: sets.length, message: 'Sets imported' }
  } catch (err: any) {
    return { source: 'Pokemon Sets', success: false, count: 0, message: err.message }
  }
}

async function seedMTGSets(supabase: any): Promise<SeedResult> {
  try {
    const response = await fetch('https://api.scryfall.com/sets')
    
    if (!response.ok) throw new Error(`Scryfall API error: ${response.status}`)
    
    const data = await response.json()
    const sets = data.data.slice(0, 100).map((set: any) => ({
      scryfall_id: set.id,
      code: set.code,
      name: set.name,
      set_type: set.set_type,
      card_count: set.card_count,
      released_at: set.released_at,
      icon_svg_uri: set.icon_svg_uri,
      scryfall_uri: set.scryfall_uri,
      updated_at: new Date().toISOString()
    }))
    
    const { error } = await supabase
      .from('mtg_sets')
      .upsert(sets, { onConflict: 'scryfall_id' })
    
    if (error) throw error
    
    return { source: 'MTG Sets', success: true, count: sets.length, message: 'Sets imported from Scryfall' }
  } catch (err: any) {
    return { source: 'MTG Sets', success: false, count: 0, message: err.message }
  }
}

async function seedVinylGenres(supabase: any): Promise<SeedResult> {
  try {
    // Discogs genres are static - insert common ones
    const genres = [
      'Rock', 'Electronic', 'Pop', 'Hip Hop', 'Jazz', 'Classical', 
      'Funk / Soul', 'Reggae', 'Latin', 'Blues', 'Folk, World, & Country',
      'Stage & Screen', 'Non-Music', "Children's", 'Brass & Military'
    ].map((name, i) => ({
      id: i + 1,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      updated_at: new Date().toISOString()
    }))
    
    const { error } = await supabase
      .from('vinyl_genres')
      .upsert(genres, { onConflict: 'id' })
    
    if (error) throw error
    
    return { source: 'Vinyl Genres', success: true, count: genres.length, message: 'Genres imported' }
  } catch (err: any) {
    return { source: 'Vinyl Genres', success: false, count: 0, message: err.message }
  }
}

async function seedComicPublishers(supabase: any): Promise<SeedResult> {
  try {
    const response = await fetch(
      `https://comicvine.gamespot.com/api/publishers/?api_key=${COMIC_VINE_API_KEY}&format=json&limit=50&sort=count_of_issues:desc`,
      { headers: { 'User-Agent': 'CR AudioViz AI/1.0' } }
    )
    
    if (!response.ok) throw new Error(`Comic Vine API error: ${response.status}`)
    
    const data = await response.json()
    
    if (data.error !== 'OK') throw new Error(data.error)
    
    const publishers = data.results.map((pub: any) => ({
      comicvine_id: pub.id,
      name: pub.name,
      deck: pub.deck,
      image_url: pub.image?.medium_url,
      site_detail_url: pub.site_detail_url,
      updated_at: new Date().toISOString()
    }))
    
    const { error } = await supabase
      .from('comic_publishers')
      .upsert(publishers, { onConflict: 'comicvine_id' })
    
    if (error) throw error
    
    return { source: 'Comic Publishers', success: true, count: publishers.length, message: 'Publishers imported from Comic Vine' }
  } catch (err: any) {
    return { source: 'Comic Publishers', success: false, count: 0, message: err.message }
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const results: SeedResult[] = []
    
    // Run all seeders
    results.push(await seedPokemonSets(supabase))
    results.push(await seedMTGSets(supabase))
    results.push(await seedVinylGenres(supabase))
    results.push(await seedComicPublishers(supabase))
    
    const totalSuccess = results.filter(r => r.success).length
    const totalRecords = results.reduce((sum, r) => sum + r.count, 0)
    
    return NextResponse.json({
      success: totalSuccess === results.length,
      timestamp: new Date().toISOString(),
      summary: {
        total_sources: results.length,
        successful: totalSuccess,
        total_records: totalRecords
      },
      results
    })
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/admin/seed-collectors',
    method: 'POST',
    description: 'Seeds collector app databases from external APIs',
    sources: ['Pokemon TCG', 'Scryfall (MTG)', 'Discogs (Vinyl)', 'Comic Vine']
  })
}
