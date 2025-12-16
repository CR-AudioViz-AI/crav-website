// app/api/admin/grants/discover/multi-source/route.ts
// Multi-Source Grant Discovery - ALL FREE APIs
// Grants.gov, USASpending, Sam.gov, Data.gov, State Grants, Foundation 990s
// Timestamp: Saturday, December 13, 2025 - 12:55 PM EST

// Force dynamic rendering - uses cookies
export const dynamic = 'force-dynamic';

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// ============================================
// FREE API ENDPOINTS
// ============================================

// 1. Grants.gov - Federal Grants (FREE, No API Key Required)
const GRANTS_GOV_SEARCH = 'https://www.grants.gov/grantsws/rest/opportunities/search';
const GRANTS_GOV_DETAILS = 'https://www.grants.gov/grantsws/rest/opportunity/details';

// 2. USASpending.gov - Federal Award Data (FREE, No API Key)
const USA_SPENDING_AWARDS = 'https://api.usaspending.gov/api/v2/search/spending_by_award';
const USA_SPENDING_AGENCIES = 'https://api.usaspending.gov/api/v2/references/toptier_agencies';

// 3. SAM.gov - Entity & Opportunity Search (FREE, API Key Available)
const SAM_OPPORTUNITIES = 'https://api.sam.gov/opportunities/v2/search';

// 4. Data.gov - Open Government Data (FREE)
const DATA_GOV_CKAN = 'https://catalog.data.gov/api/3/action/package_search';

// 5. Foundation Center / Candid - 990 Data (FREE via ProPublica)
const PROPUBLICA_990 = 'https://projects.propublica.org/nonprofits/api/v2';

// 6. State Grant Portals (Examples - Many states have open APIs)
const STATE_GRANT_SOURCES = {
  california: 'https://www.grants.ca.gov/api',
  florida: 'https://floridahousing.org/programs',
  texas: 'https://www.txsmartbuy.com/sp',
  newyork: 'https://grantsgateway.ny.gov',
};

// CRAIverse module keywords for intelligent matching
const MODULE_KEYWORDS: Record<string, { primary: string[]; secondary: string[]; agencies: string[] }> = {
  'first-responders': {
    primary: ['first responder', 'emergency services', 'law enforcement', 'firefighter', 'ems', 'police', '911'],
    secondary: ['ptsd', 'trauma', 'mental health', 'crisis', 'public safety', 'emergency management'],
    agencies: ['FEMA', 'DOJ', 'DHS', 'SAMHSA', 'BJA', 'COPS'],
  },
  'veterans-transition': {
    primary: ['veteran', 'military', 'service member', 'armed forces', 'transitioning'],
    secondary: ['career', 'employment', 'reintegration', 'workforce', 'job training'],
    agencies: ['VA', 'DOD', 'DOL', 'SBA'],
  },
  'together-anywhere': {
    primary: ['military family', 'deployment', 'family connection', 'separation'],
    secondary: ['virtual', 'distance', 'communication', 'support services'],
    agencies: ['DOD', 'VA', 'USDA'],
  },
  'faith-communities': {
    primary: ['faith', 'religious', 'church', 'congregation', 'ministry'],
    secondary: ['community', 'spiritual', 'worship', 'charitable'],
    agencies: ['HHS', 'CNCS', 'Lilly Endowment', 'Templeton'],
  },
  'senior-connect': {
    primary: ['senior', 'elderly', 'aging', 'older adult', 'geriatric'],
    secondary: ['isolation', 'loneliness', 'caregiver', 'assisted living'],
    agencies: ['ACL', 'HHS', 'CMS', 'AOA'],
  },
  'foster-care-network': {
    primary: ['foster', 'foster care', 'child welfare', 'adoption'],
    secondary: ['kinship', 'family services', 'youth', 'placement'],
    agencies: ['ACF', 'HHS', 'Casey Family', 'Annie E. Casey'],
  },
  'rural-health': {
    primary: ['rural', 'telehealth', 'telemedicine', 'underserved'],
    secondary: ['healthcare access', 'remote', 'community health'],
    agencies: ['HRSA', 'USDA', 'FCC', 'HHS'],
  },
  'mental-health-youth': {
    primary: ['youth mental health', 'adolescent', 'teen', 'child mental'],
    secondary: ['school', 'student', 'counseling', 'behavioral health'],
    agencies: ['SAMHSA', 'ED', 'HHS', 'NIH', 'NIMH'],
  },
  'addiction-recovery': {
    primary: ['addiction', 'recovery', 'substance abuse', 'opioid'],
    secondary: ['treatment', 'sobriety', 'drug', 'alcohol', 'overdose'],
    agencies: ['SAMHSA', 'NIH', 'NIDA', 'HHS', 'CDC'],
  },
  'animal-rescue': {
    primary: ['animal', 'rescue', 'shelter', 'pet', 'welfare'],
    secondary: ['humane', 'adoption', 'spay', 'neuter', 'wildlife'],
    agencies: ['USDA', 'Petco Foundation', 'PetSmart Charities', 'ASPCA'],
  },
  'green-earth': {
    primary: ['environment', 'climate', 'sustainability', 'conservation'],
    secondary: ['green', 'eco', 'renewable', 'carbon', 'clean energy'],
    agencies: ['EPA', 'DOE', 'NOAA', 'DOI', 'USDA'],
  },
  'disaster-relief': {
    primary: ['disaster', 'emergency', 'relief', 'response'],
    secondary: ['recovery', 'resilience', 'preparedness', 'mitigation'],
    agencies: ['FEMA', 'HUD', 'SBA', 'Red Cross', 'USDA'],
  },
  'small-business': {
    primary: ['small business', 'entrepreneur', 'startup', 'sbir'],
    secondary: ['economic development', 'local business', 'commerce'],
    agencies: ['SBA', 'EDA', 'DOC', 'USDA', 'DOE'],
  },
  'nonprofit-toolkit': {
    primary: ['nonprofit', 'ngo', 'charity', '501c3'],
    secondary: ['capacity building', 'organizational', 'foundation'],
    agencies: ['CNCS', 'NEA', 'NEH', 'IMLS'],
  },
  'education-access': {
    primary: ['education', 'student', 'learning', 'academic'],
    secondary: ['school', 'stem', 'literacy', 'scholarship'],
    agencies: ['ED', 'NSF', 'NIH', 'DOD', 'IMLS'],
  },
  'digital-literacy': {
    primary: ['digital literacy', 'technology', 'computer', 'internet'],
    secondary: ['digital divide', 'broadband', 'access', 'training'],
    agencies: ['FCC', 'NTIA', 'ED', 'IMLS', 'NSF'],
  },
  'artists-collective': {
    primary: ['artist', 'art', 'creative', 'cultural'],
    secondary: ['arts', 'visual', 'performing', 'gallery'],
    agencies: ['NEA', 'NEH', 'IMLS', 'State Arts Councils'],
  },
  'musicians-guild': {
    primary: ['music', 'musician', 'performing arts', 'concert'],
    secondary: ['orchestra', 'band', 'recording', 'performance'],
    agencies: ['NEA', 'NEH', 'GRAMMY Foundation'],
  },
  'community-journalism': {
    primary: ['journalism', 'news', 'media', 'press'],
    secondary: ['local news', 'reporting', 'broadcast', 'publication'],
    agencies: ['CPB', 'Knight Foundation', 'Google News Initiative'],
  },
  'food-security': {
    primary: ['food', 'hunger', 'nutrition', 'food bank'],
    secondary: ['food insecurity', 'meal', 'snap', 'feeding'],
    agencies: ['USDA', 'HHS', 'Feeding America', 'No Kid Hungry'],
  },
};

// ============================================
// API SEARCH FUNCTIONS
// ============================================

async function searchGrantsGov(keywords: string[], agencies: string[]): Promise<any[]> {
  try {
    // Build search query
    const keywordQuery = keywords.slice(0, 10).join(' OR ');
    
    const params = new URLSearchParams({
      keyword: keywordQuery,
      oppStatuses: 'forecasted|posted',
      sortBy: 'openDate|desc',
      rows: '100',
    });

    // Add agency filter if specified
    if (agencies.length > 0) {
      params.set('fundingInstruments', 'G'); // Grants only
    }

    const response = await fetch(`${GRANTS_GOV_SEARCH}?${params}`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error('Grants.gov error:', response.status);
      return [];
    }

    const data = await response.json();
    
    return (data.oppHits || []).map((opp: any) => ({
      source: 'grants_gov',
      source_id: opp.id,
      opportunity_number: opp.number,
      title: opp.title,
      agency: opp.agency?.name || opp.agencyCode,
      description: opp.synopsis,
      amount_available: opp.awardCeiling,
      amount_floor: opp.awardFloor,
      open_date: opp.openDate,
      close_date: opp.closeDate,
      category: opp.category?.name,
      eligibilities: opp.eligibilities?.map((e: any) => e.name) || [],
      url: `https://www.grants.gov/search-results-detail/${opp.id}`,
    }));

  } catch (error) {
    console.error('Grants.gov search error:', error);
    return [];
  }
}

async function searchUSASpending(keywords: string[]): Promise<any[]> {
  try {
    const response = await fetch(USA_SPENDING_AWARDS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filters: {
          keywords: keywords.slice(0, 5),
          award_type_codes: ['02', '03', '04', '05'], // Grants only
          time_period: [{
            start_date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
          }],
        },
        fields: [
          'Award ID', 'Recipient Name', 'Award Amount', 
          'Description', 'Awarding Agency', 'Award Type',
          'Start Date', 'End Date', 'CFDA Number'
        ],
        limit: 50,
        order: 'desc',
        sort: 'Award Amount',
      }),
      next: { revalidate: 3600 },
    });

    if (!response.ok) return [];

    const data = await response.json();
    
    // USASpending shows past awards - useful for understanding funding patterns
    return (data.results || []).map((award: any) => ({
      source: 'usa_spending',
      source_id: award['Award ID'],
      title: `Historic Award: ${award['Description']?.substring(0, 100) || 'Grant Award'}`,
      agency: award['Awarding Agency'],
      description: award['Description'],
      amount_awarded: award['Award Amount'],
      recipient: award['Recipient Name'],
      cfda_number: award['CFDA Number'],
      type: 'historic_award', // Flag as historic data
    }));

  } catch (error) {
    console.error('USASpending search error:', error);
    return [];
  }
}

async function searchProPublica990(searchTerm: string): Promise<any[]> {
  try {
    // Search for foundations that give grants in our areas
    const response = await fetch(
      `${PROPUBLICA_990}/search.json?q=${encodeURIComponent(searchTerm)}&c_code[id]=3`, // 501c3 only
      { next: { revalidate: 86400 } } // Cache for 24 hours
    );

    if (!response.ok) return [];

    const data = await response.json();
    
    // Return foundations as potential funders
    return (data.organizations || []).slice(0, 20).map((org: any) => ({
      source: 'propublica_990',
      source_id: org.ein,
      title: `Foundation: ${org.name}`,
      agency: org.name,
      description: `${org.city}, ${org.state} - Total Revenue: $${org.total_revenue?.toLocaleString() || 'N/A'}`,
      type: 'foundation',
      ein: org.ein,
      state: org.state,
      total_revenue: org.total_revenue,
    }));

  } catch (error) {
    console.error('ProPublica 990 search error:', error);
    return [];
  }
}

async function searchSamGov(keywords: string[]): Promise<any[]> {
  // SAM.gov requires API key for full access
  // Using public endpoint for basic search
  try {
    const apiKey = process.env.SAM_GOV_API_KEY;
    if (!apiKey) {
      console.log('SAM.gov API key not configured');
      return [];
    }

    const params = new URLSearchParams({
      api_key: apiKey,
      q: keywords.slice(0, 5).join(' '),
      postedFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      limit: '50',
    });

    const response = await fetch(`${SAM_OPPORTUNITIES}?${params}`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 },
    });

    if (!response.ok) return [];

    const data = await response.json();
    
    return (data.opportunitiesData || []).map((opp: any) => ({
      source: 'sam_gov',
      source_id: opp.noticeId,
      opportunity_number: opp.solicitationNumber,
      title: opp.title,
      agency: opp.department,
      description: opp.description,
      close_date: opp.responseDeadLine,
      url: opp.uiLink,
      type: opp.type,
    }));

  } catch (error) {
    console.error('SAM.gov search error:', error);
    return [];
  }
}

// ============================================
// INTELLIGENT MATCHING
// ============================================

function calculateMatchScore(opportunity: any, targetModules: string[]): number {
  let score = 0;
  const text = `${opportunity.title || ''} ${opportunity.description || ''} ${opportunity.agency || ''}`.toLowerCase();

  for (const module of targetModules) {
    const config = MODULE_KEYWORDS[module];
    if (!config) continue;

    // Primary keywords worth more
    for (const keyword of config.primary) {
      if (text.includes(keyword.toLowerCase())) {
        score += 15;
      }
    }

    // Secondary keywords
    for (const keyword of config.secondary) {
      if (text.includes(keyword.toLowerCase())) {
        score += 8;
      }
    }

    // Agency match is high value
    for (const agency of config.agencies) {
      if (text.includes(agency.toLowerCase())) {
        score += 20;
      }
    }
  }

  return Math.min(score, 100);
}

function estimateWinProbability(opportunity: any, matchScore: number): number {
  let probability = matchScore * 0.4;

  // Higher amounts = more competition
  const amount = opportunity.amount_available || opportunity.amount_awarded || 0;
  if (amount < 100000) probability += 20;
  else if (amount < 500000) probability += 10;
  else if (amount < 1000000) probability += 5;

  // Foundation grants often less competitive
  if (opportunity.source === 'propublica_990') probability += 10;

  // Newer postings = more time to prepare
  if (opportunity.close_date) {
    const daysUntil = Math.ceil((new Date(opportunity.close_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntil > 60) probability += 10;
    else if (daysUntil > 30) probability += 5;
  }

  return Math.min(Math.round(probability), 85);
}

function identifyTargetModules(opportunity: any): string[] {
  const text = `${opportunity.title || ''} ${opportunity.description || ''}`.toLowerCase();
  const matches: string[] = [];

  for (const [moduleId, config] of Object.entries(MODULE_KEYWORDS)) {
    const allKeywords = [...config.primary, ...config.secondary];
    const matchCount = allKeywords.filter(k => text.includes(k.toLowerCase())).length;
    
    if (matchCount >= 2) {
      matches.push(moduleId);
    }
  }

  return matches;
}

// ============================================
// MAIN API HANDLER
// ============================================

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const modules = searchParams.get('modules')?.split(',') || Object.keys(MODULE_KEYWORDS);
  const sources = searchParams.get('sources')?.split(',') || ['grants_gov', 'usa_spending', 'propublica_990'];
  const includeHistoric = searchParams.get('include_historic') === 'true';

  try {
    // Collect keywords from target modules
    const allKeywords: string[] = [];
    const allAgencies: string[] = [];
    
    for (const module of modules) {
      const config = MODULE_KEYWORDS[module];
      if (config) {
        allKeywords.push(...config.primary, ...config.secondary);
        allAgencies.push(...config.agencies);
      }
    }

    // Deduplicate
    const uniqueKeywords = [...new Set(allKeywords)];
    const uniqueAgencies = [...new Set(allAgencies)];

    // Run parallel searches
    const searchPromises: Promise<any[]>[] = [];

    if (sources.includes('grants_gov')) {
      searchPromises.push(searchGrantsGov(uniqueKeywords, uniqueAgencies));
    }

    if (sources.includes('usa_spending') && includeHistoric) {
      searchPromises.push(searchUSASpending(uniqueKeywords));
    }

    if (sources.includes('propublica_990')) {
      // Search for relevant foundations
      const foundationSearches = ['mental health foundation', 'veteran foundation', 'community foundation']
        .map(term => searchProPublica990(term));
      searchPromises.push(...foundationSearches);
    }

    if (sources.includes('sam_gov')) {
      searchPromises.push(searchSamGov(uniqueKeywords));
    }

    const results = await Promise.all(searchPromises);
    let allOpportunities = results.flat();

    // Calculate scores and identify modules for each opportunity
    allOpportunities = allOpportunities.map(opp => {
      const targetMods = identifyTargetModules(opp);
      const matchScore = calculateMatchScore(opp, modules);
      
      return {
        ...opp,
        target_modules: targetMods.length > 0 ? targetMods : modules.slice(0, 2),
        match_score: matchScore,
        win_probability: estimateWinProbability(opp, matchScore),
      };
    });

    // Sort by match score
    allOpportunities.sort((a, b) => b.match_score - a.match_score);

    // Remove duplicates by title similarity
    const seen = new Set();
    allOpportunities = allOpportunities.filter(opp => {
      const key = opp.title?.toLowerCase().substring(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Summary stats
    const summary = {
      total_found: allOpportunities.length,
      by_source: {
        grants_gov: allOpportunities.filter(o => o.source === 'grants_gov').length,
        usa_spending: allOpportunities.filter(o => o.source === 'usa_spending').length,
        propublica_990: allOpportunities.filter(o => o.source === 'propublica_990').length,
        sam_gov: allOpportunities.filter(o => o.source === 'sam_gov').length,
      },
      high_match: allOpportunities.filter(o => o.match_score >= 70).length,
      total_potential_funding: allOpportunities
        .filter(o => o.amount_available)
        .reduce((sum, o) => sum + (o.amount_available || 0), 0),
    };

    return NextResponse.json({
      success: true,
      summary,
      keywords_used: uniqueKeywords.slice(0, 30),
      agencies_targeted: uniqueAgencies,
      opportunities: allOpportunities.slice(0, 200), // Limit response size
    });

  } catch (error) {
    console.error('Multi-source discovery error:', error);
    return NextResponse.json({ 
      error: 'Discovery failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
