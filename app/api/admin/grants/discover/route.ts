// app/api/admin/grants/discover/route.ts
// Grants.gov API Integration + USASpending + Foundation Search
// FREE APIs for grant discovery
// Timestamp: Saturday, December 13, 2025 - 12:20 PM EST

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// CRAIverse module keywords for matching
const MODULE_KEYWORDS: Record<string, string[]> = {
  'first-responders': ['first responder', 'emergency services', 'law enforcement', 'fire department', 'ems', 'police', 'mental health first responder', 'ptsd', 'trauma'],
  'veterans-transition': ['veteran', 'military', 'service member', 'transition', 'career', 'employment', 'reintegration'],
  'together-anywhere': ['military family', 'deployment', 'family connection', 'virtual connection', 'distance', 'separation'],
  'faith-communities': ['faith', 'religious', 'church', 'congregation', 'ministry', 'spiritual', 'worship'],
  'senior-connect': ['senior', 'elderly', 'aging', 'older adult', 'isolation', 'loneliness', 'geriatric'],
  'foster-care-network': ['foster', 'foster care', 'child welfare', 'adoption', 'kinship', 'family services'],
  'rural-health': ['rural', 'telehealth', 'telemedicine', 'underserved', 'healthcare access', 'remote'],
  'mental-health-youth': ['youth mental health', 'adolescent', 'teen', 'child mental health', 'school', 'student'],
  'addiction-recovery': ['addiction', 'recovery', 'substance abuse', 'opioid', 'treatment', 'sobriety'],
  'animal-rescue': ['animal', 'rescue', 'shelter', 'pet', 'welfare', 'humane', 'adoption'],
  'green-earth': ['environment', 'climate', 'sustainability', 'conservation', 'green', 'eco'],
  'disaster-relief': ['disaster', 'emergency', 'relief', 'response', 'recovery', 'resilience', 'fema'],
  'small-business': ['small business', 'entrepreneur', 'local business', 'economic development', 'sbir'],
  'nonprofit-toolkit': ['nonprofit', 'ngo', 'charity', 'foundation', 'capacity building'],
  'education-access': ['education', 'student', 'learning', 'school', 'academic', 'stem'],
  'digital-literacy': ['digital literacy', 'technology', 'computer', 'internet', 'digital divide', 'access'],
  'artists-collective': ['artist', 'art', 'creative', 'cultural', 'arts'],
  'musicians-guild': ['music', 'musician', 'performing arts', 'concert', 'orchestra'],
  'community-journalism': ['journalism', 'news', 'media', 'local news', 'press'],
  'food-security': ['food', 'hunger', 'nutrition', 'food bank', 'food insecurity', 'meal'],
};

// Grants.gov API Configuration (FREE)
const GRANTS_GOV_API = 'https://www.grants.gov/grantsws/rest/opportunities/search';

// USASpending API (FREE)
const USA_SPENDING_API = 'https://api.usaspending.gov/api/v2/search/spending_by_award';

// Foundation Center API alternatives (Candid/GuideStar require paid access)
// We'll use public foundation directories and 990 data instead

interface GrantsGovOpportunity {
  id: string;
  number: string;
  title: string;
  agency: string;
  openDate: string;
  closeDate: string;
  awardCeiling: number;
  awardFloor: number;
  description: string;
  category: string;
  eligibilities: string[];
}

async function searchGrantsGov(keywords: string[], limit: number = 25): Promise<any[]> {
  try {
    // Grants.gov search endpoint
    const searchParams = new URLSearchParams({
      keyword: keywords.join(' OR '),
      oppStatuses: 'forecasted|posted',
      sortBy: 'openDate|desc',
      rows: limit.toString(),
    });

    const response = await fetch(`${GRANTS_GOV_API}?${searchParams}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Grants.gov API error:', response.status);
      return [];
    }

    const data = await response.json();
    return data.oppHits || [];
  } catch (error) {
    console.error('Error searching Grants.gov:', error);
    return [];
  }
}

async function searchUSASpending(keywords: string[]): Promise<any[]> {
  try {
    const response = await fetch(USA_SPENDING_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filters: {
          keywords: keywords,
          award_type_codes: ['02', '03', '04', '05'], // Grants
          time_period: [
            {
              start_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              end_date: new Date().toISOString().split('T')[0],
            }
          ],
        },
        fields: ['Award ID', 'Recipient Name', 'Award Amount', 'Description', 'Awarding Agency'],
        limit: 25,
      }),
    });

    if (!response.ok) {
      console.error('USASpending API error:', response.status);
      return [];
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching USASpending:', error);
    return [];
  }
}

function calculateMatchScore(opportunity: any, targetModules: string[]): number {
  let score = 0;
  const title = (opportunity.title || '').toLowerCase();
  const description = (opportunity.description || '').toLowerCase();
  const combinedText = `${title} ${description}`;

  for (const module of targetModules) {
    const keywords = MODULE_KEYWORDS[module] || [];
    for (const keyword of keywords) {
      if (combinedText.includes(keyword.toLowerCase())) {
        score += 10;
      }
    }
  }

  // Cap at 100
  return Math.min(score, 100);
}

function estimateWinProbability(opportunity: any, matchScore: number): number {
  let probability = matchScore * 0.5; // Base from match score

  // Adjust based on competition level (if available)
  if (opportunity.numberOfAwards && opportunity.numberOfAwards > 10) {
    probability += 10;
  }

  // Adjust based on award amount (smaller grants = less competition)
  if (opportunity.awardCeiling && opportunity.awardCeiling < 100000) {
    probability += 15;
  } else if (opportunity.awardCeiling && opportunity.awardCeiling < 500000) {
    probability += 10;
  }

  // Cap at 80 (never be overconfident)
  return Math.min(Math.round(probability), 80);
}

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Check admin access
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
  const source = searchParams.get('source') || 'all';

  try {
    // Collect keywords from target modules
    const keywords: string[] = [];
    for (const module of modules) {
      keywords.push(...(MODULE_KEYWORDS[module] || []));
    }

    // Remove duplicates and limit
    const uniqueKeywords = [...new Set(keywords)].slice(0, 20);

    let opportunities: any[] = [];

    // Search Grants.gov
    if (source === 'all' || source === 'grants_gov') {
      const grantsGovResults = await searchGrantsGov(uniqueKeywords);
      opportunities.push(...grantsGovResults.map((opp: any) => ({
        source: 'grants_gov',
        id: opp.id,
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
        match_score: calculateMatchScore(opp, modules),
        win_probability: 0, // Calculate below
        target_modules: modules.filter(m => {
          const mKeywords = MODULE_KEYWORDS[m] || [];
          return mKeywords.some(k => 
            (opp.title?.toLowerCase() || '').includes(k) || 
            (opp.synopsis?.toLowerCase() || '').includes(k)
          );
        }),
      })));
    }

    // Calculate win probability after match score
    opportunities = opportunities.map(opp => ({
      ...opp,
      win_probability: estimateWinProbability(opp, opp.match_score),
    }));

    // Sort by match score
    opportunities.sort((a, b) => b.match_score - a.match_score);

    return NextResponse.json({
      success: true,
      count: opportunities.length,
      keywords_used: uniqueKeywords,
      opportunities,
    });

  } catch (error) {
    console.error('Error discovering grants:', error);
    return NextResponse.json({ 
      error: 'Failed to discover grants',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST: Import discovered grant into our system
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Check admin access
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

  try {
    const body = await request.json();
    const { opportunity } = body;

    // Check if already imported
    const { data: existing } = await supabase
      .from('grant_opportunities')
      .select('id')
      .eq('opportunity_number', opportunity.opportunity_number)
      .single();

    if (existing) {
      return NextResponse.json({ 
        success: false, 
        message: 'Grant already imported',
        existing_id: existing.id 
      });
    }

    // Import the grant
    const { data: newGrant, error } = await supabase
      .from('grant_opportunities')
      .insert({
        grant_name: opportunity.title,
        opportunity_number: opportunity.opportunity_number,
        agency_name: opportunity.agency,
        description: opportunity.description,
        amount_available: opportunity.amount_available,
        application_opens: opportunity.open_date,
        application_deadline: opportunity.close_date,
        status: 'researching',
        priority: opportunity.match_score >= 80 ? 'high' : opportunity.match_score >= 60 ? 'medium' : 'low',
        target_modules: opportunity.target_modules,
        match_score: opportunity.match_score,
        win_probability: opportunity.win_probability,
        website_url: opportunity.url,
        eligibility_requirements: opportunity.eligibilities?.join(', '),
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Grant imported successfully',
      grant: newGrant,
    });

  } catch (error) {
    console.error('Error importing grant:', error);
    return NextResponse.json({ 
      error: 'Failed to import grant',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
