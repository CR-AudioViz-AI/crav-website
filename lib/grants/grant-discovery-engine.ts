// lib/grants/grant-discovery-engine.ts
// AUTOMATED GRANT DISCOVERY ENGINE - Runs 24/7
// Searches ALL free APIs, learns patterns, predicts winners
// Timestamp: Saturday, December 13, 2025 - 1:35 PM EST

import { CRAIVERSE_MODULES, SUCCESS_PATTERNS, GRANT_APIS } from './javari-grant-intelligence';

// ============================================================
// ALL FREE API SEARCH FUNCTIONS
// ============================================================

// 1. GRANTS.GOV - Primary federal opportunities
export async function searchGrantsGov(keywords: string[]): Promise<any[]> {
  try {
    const params = new URLSearchParams({
      keyword: keywords.slice(0, 10).join(' OR '),
      oppStatuses: 'forecasted|posted',
      sortBy: 'openDate|desc',
      rows: '100',
    });

    const response = await fetch(
      `https://www.grants.gov/grantsws/rest/opportunities/search?${params}`,
      { headers: { 'Accept': 'application/json' }, next: { revalidate: 3600 } }
    );

    if (!response.ok) return [];
    const data = await response.json();
    
    return (data.oppHits || []).map((opp: any) => ({
      source: 'grants_gov',
      sourceLabel: 'Grants.gov',
      externalId: opp.id,
      opportunityNumber: opp.number,
      title: opp.title,
      agency: opp.agency?.name || opp.agencyCode,
      agencyCode: opp.agencyCode,
      description: opp.synopsis,
      amountMin: opp.awardFloor,
      amountMax: opp.awardCeiling,
      openDate: opp.openDate,
      closeDate: opp.closeDate,
      category: opp.category?.name,
      eligibilities: opp.eligibilities?.map((e: any) => e.name) || [],
      cfdaNumbers: opp.cfdaNumbers || [],
      url: `https://www.grants.gov/search-results-detail/${opp.id}`,
    }));
  } catch (error) {
    console.error('Grants.gov error:', error);
    return [];
  }
}

// 2. NIH REPORTER - Health research grants
export async function searchNIHReporter(keywords: string[]): Promise<any[]> {
  try {
    const response = await fetch('https://api.reporter.nih.gov/v2/projects/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        criteria: {
          advanced_text_search: {
            operator: 'or',
            search_field: 'all',
            search_text: keywords.slice(0, 5).join(' '),
          },
          fiscal_years: [2024, 2025],
        },
        offset: 0,
        limit: 50,
        sort_field: 'award_amount',
        sort_order: 'desc',
      }),
    });

    if (!response.ok) return [];
    const data = await response.json();
    
    return (data.results || []).map((p: any) => ({
      source: 'nih_reporter',
      sourceLabel: 'NIH RePORTER',
      externalId: p.project_num || p.appl_id,
      opportunityNumber: p.project_num,
      title: p.project_title,
      agency: p.agency_ic_admin?.name || 'NIH',
      agencyCode: 'NIH',
      description: p.abstract_text,
      amountMax: p.award_amount,
      openDate: p.project_start_date,
      closeDate: p.project_end_date,
      category: p.activity_code,
      pi: p.principal_investigators?.map((pi: any) => pi.full_name).join(', '),
      organization: p.organization?.org_name,
      url: `https://reporter.nih.gov/project-details/${p.project_num}`,
    }));
  } catch (error) {
    console.error('NIH Reporter error:', error);
    return [];
  }
}

// 3. NSF AWARDS - Science & research
export async function searchNSFAwards(keywords: string[]): Promise<any[]> {
  try {
    const params = new URLSearchParams({
      keyword: keywords.slice(0, 3).join(' '),
      printFields: 'id,title,abstractText,agency,awardeeName,fundsObligatedAmt,date,startDate,expDate,primaryProgram,piFirstName,piLastName',
    });

    const response = await fetch(`https://api.nsf.gov/services/v1/awards.json?${params}`);
    if (!response.ok) return [];
    const data = await response.json();
    
    return (data.response?.award || []).slice(0, 50).map((a: any) => ({
      source: 'nsf_awards',
      sourceLabel: 'NSF Awards',
      externalId: a.id,
      opportunityNumber: a.id,
      title: a.title,
      agency: 'National Science Foundation',
      agencyCode: 'NSF',
      description: a.abstractText,
      amountMax: parseInt(a.fundsObligatedAmt) || 0,
      openDate: a.startDate,
      closeDate: a.expDate,
      category: a.primaryProgram,
      pi: `${a.piFirstName} ${a.piLastName}`,
      organization: a.awardeeName,
      url: `https://www.nsf.gov/awardsearch/showAward?AWD_ID=${a.id}`,
    }));
  } catch (error) {
    console.error('NSF error:', error);
    return [];
  }
}

// 4. FEDERAL REGISTER - New announcements
export async function searchFederalRegister(keywords: string[]): Promise<any[]> {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const params = new URLSearchParams({
      'conditions[term]': `${keywords.slice(0, 3).join(' ')} grant funding`,
      'conditions[type][]': 'NOTICE',
      'conditions[publication_date][gte]': thirtyDaysAgo,
      'per_page': '50',
      'order': 'newest',
    });

    const response = await fetch(`https://www.federalregister.gov/api/v1/documents.json?${params}`);
    if (!response.ok) return [];
    const data = await response.json();
    
    return (data.results || []).map((d: any) => ({
      source: 'federal_register',
      sourceLabel: 'Federal Register',
      externalId: d.document_number,
      opportunityNumber: d.document_number,
      title: d.title,
      agency: d.agencies?.[0]?.name || 'Federal Government',
      agencyCode: d.agencies?.[0]?.id,
      description: d.abstract,
      openDate: d.publication_date,
      url: d.html_url,
      pdfUrl: d.pdf_url,
      type: d.type,
    }));
  } catch (error) {
    console.error('Federal Register error:', error);
    return [];
  }
}

// 5. USA SPENDING - Historical awards (learn what got funded)
export async function searchUSASpending(keywords: string[]): Promise<any[]> {
  try {
    const response = await fetch('https://api.usaspending.gov/api/v2/search/spending_by_award/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filters: {
          keywords: keywords.slice(0, 5),
          award_type_codes: ['02', '03', '04', '05'], // Grants
          time_period: [{
            start_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
          }],
        },
        fields: ['Award ID', 'Recipient Name', 'Award Amount', 'Description', 'Awarding Agency', 'CFDA Number', 'Start Date'],
        limit: 100,
        sort: 'Award Amount',
        order: 'desc',
      }),
    });

    if (!response.ok) return [];
    const data = await response.json();
    
    return (data.results || []).map((a: any) => ({
      source: 'usa_spending',
      sourceLabel: 'USASpending.gov (Historical)',
      externalId: a['Award ID'],
      title: `Award: ${a['Description']?.substring(0, 100) || 'Grant Award'}`,
      agency: a['Awarding Agency'] || 'Federal Government',
      recipient: a['Recipient Name'],
      amountMax: a['Award Amount'],
      cfdaNumber: a['CFDA Number'],
      openDate: a['Start Date'],
      url: `https://www.usaspending.gov/award/${a['Award ID']}`,
      type: 'historical',
    }));
  } catch (error) {
    console.error('USASpending error:', error);
    return [];
  }
}

// 6. FEMA - Disaster grants
export async function searchFEMADisasters(state?: string): Promise<any[]> {
  try {
    let url = 'https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?$top=100&$orderby=declarationDate desc';
    if (state) url += `&$filter=state eq '${state}'`;

    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    
    return (data.DisasterDeclarationsSummaries || []).map((d: any) => ({
      source: 'fema',
      sourceLabel: 'FEMA Disasters',
      externalId: `DR-${d.disasterNumber}`,
      title: `${d.declarationType} Declaration: ${d.title}`,
      agency: 'FEMA',
      agencyCode: 'FEMA',
      description: `${d.incidentType} in ${d.state}. Programs: ${d.ihProgramDeclared ? 'Individual Assistance, ' : ''}${d.paProgramDeclared ? 'Public Assistance, ' : ''}${d.hmProgramDeclared ? 'Hazard Mitigation' : ''}`,
      openDate: d.declarationDate,
      state: d.state,
      incidentType: d.incidentType,
      programs: {
        individualAssistance: d.ihProgramDeclared,
        publicAssistance: d.paProgramDeclared,
        hazardMitigation: d.hmProgramDeclared,
      },
      url: `https://www.fema.gov/disaster/${d.disasterNumber}`,
    }));
  } catch (error) {
    console.error('FEMA error:', error);
    return [];
  }
}

// 7. PROPUBLICA - Nonprofit data (competitor analysis)
export async function searchProPublicaNonprofits(query: string, state?: string): Promise<any[]> {
  try {
    const params = new URLSearchParams({ q: query });
    if (state) params.set('state[id]', state);

    const response = await fetch(`https://projects.propublica.org/nonprofits/api/v2/search.json?${params}`);
    if (!response.ok) return [];
    const data = await response.json();
    
    return (data.organizations || []).map((o: any) => ({
      source: 'propublica',
      sourceLabel: 'ProPublica Nonprofits',
      ein: o.ein,
      name: o.name,
      city: o.city,
      state: o.state,
      nteeCode: o.ntee_code,
      totalRevenue: o.income_amount,
      totalAssets: o.asset_amount,
    }));
  } catch (error) {
    console.error('ProPublica error:', error);
    return [];
  }
}

// 8. CENSUS - Demographics for grant targeting
export async function getCensusData(variables: string[], geography: string): Promise<any> {
  try {
    const varsParam = variables.join(',');
    const response = await fetch(
      `https://api.census.gov/data/2022/acs/acs5?get=${varsParam}&for=${geography}`
    );
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Census error:', error);
    return null;
  }
}

// 9. FRED - Economic data
export async function getFREDData(seriesId: string): Promise<any> {
  try {
    const params = new URLSearchParams({
      series_id: seriesId,
      api_key: process.env.FRED_API_KEY || 'fc8d5b44ab7b1b7b47da21d2454d0f2a',
      file_type: 'json',
      sort_order: 'desc',
      limit: '10',
    });

    const response = await fetch(`https://api.stlouisfed.org/fred/series/observations?${params}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('FRED error:', error);
    return null;
  }
}

// 10. BLS - Employment data
export async function getBLSData(seriesIds: string[]): Promise<any> {
  try {
    const response = await fetch('https://api.bls.gov/publicAPI/v2/timeseries/data/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seriesid: seriesIds,
        startyear: '2023',
        endyear: '2025',
      }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('BLS error:', error);
    return null;
  }
}

// ============================================================
// MASTER SEARCH - ALL APIS AT ONCE
// ============================================================

export interface DiscoveryResult {
  opportunities: any[];
  sources: { name: string; count: number; error?: string }[];
  totalFound: number;
  searchedAt: string;
  keywords: string[];
}

export async function discoverAllGrants(targetModules: string[]): Promise<DiscoveryResult> {
  // Collect keywords from all target modules
  const keywords: string[] = [];
  for (const moduleId of targetModules) {
    const module = CRAIVERSE_MODULES[moduleId as keyof typeof CRAIVERSE_MODULES];
    if (module) {
      keywords.push(...module.keywords.slice(0, 5));
    }
  }
  const uniqueKeywords = [...new Set(keywords)].slice(0, 25);
  
  const sources: { name: string; count: number; error?: string }[] = [];
  const allOpportunities: any[] = [];

  // Run all searches in parallel
  const searches = await Promise.allSettled([
    searchGrantsGov(uniqueKeywords).then(r => {
      sources.push({ name: 'Grants.gov', count: r.length });
      return r;
    }).catch(e => { sources.push({ name: 'Grants.gov', count: 0, error: e.message }); return []; }),
    
    searchNIHReporter(uniqueKeywords).then(r => {
      sources.push({ name: 'NIH RePORTER', count: r.length });
      return r;
    }).catch(e => { sources.push({ name: 'NIH RePORTER', count: 0, error: e.message }); return []; }),
    
    searchNSFAwards(uniqueKeywords).then(r => {
      sources.push({ name: 'NSF Awards', count: r.length });
      return r;
    }).catch(e => { sources.push({ name: 'NSF Awards', count: 0, error: e.message }); return []; }),
    
    searchFederalRegister(uniqueKeywords).then(r => {
      sources.push({ name: 'Federal Register', count: r.length });
      return r;
    }).catch(e => { sources.push({ name: 'Federal Register', count: 0, error: e.message }); return []; }),
    
    searchUSASpending(uniqueKeywords).then(r => {
      sources.push({ name: 'USASpending.gov', count: r.length });
      return r;
    }).catch(e => { sources.push({ name: 'USASpending.gov', count: 0, error: e.message }); return []; }),
    
    searchFEMADisasters().then(r => {
      sources.push({ name: 'FEMA', count: r.length });
      return r;
    }).catch(e => { sources.push({ name: 'FEMA', count: 0, error: e.message }); return []; }),
  ]);

  // Collect all results
  for (const result of searches) {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      allOpportunities.push(...result.value);
    }
  }

  // Calculate match scores for each opportunity
  const scoredOpportunities = allOpportunities.map(opp => ({
    ...opp,
    matchScore: calculateMatchScore(opp, targetModules),
    targetModules: detectMatchingModules(opp),
    winProbability: estimateWinProbability(opp, targetModules),
  }));

  // Sort by match score
  scoredOpportunities.sort((a, b) => b.matchScore - a.matchScore);

  // Remove duplicates
  const seen = new Set<string>();
  const unique = scoredOpportunities.filter(opp => {
    const key = opp.title?.toLowerCase().substring(0, 50) || opp.externalId;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    opportunities: unique,
    sources,
    totalFound: unique.length,
    searchedAt: new Date().toISOString(),
    keywords: uniqueKeywords,
  };
}

// ============================================================
// SCORING & MATCHING ALGORITHMS
// ============================================================

function calculateMatchScore(opportunity: any, targetModules: string[]): number {
  let score = 0;
  const text = `${opportunity.title || ''} ${opportunity.description || ''}`.toLowerCase();

  // Check each target module
  for (const moduleId of targetModules) {
    const module = CRAIVERSE_MODULES[moduleId as keyof typeof CRAIVERSE_MODULES];
    if (!module) continue;

    // Keyword matches
    for (const keyword of module.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += 5;
      }
    }

    // Agency alignment
    if (module.agencies.some(a => 
      opportunity.agency?.toLowerCase().includes(a.toLowerCase()) ||
      opportunity.agencyCode?.includes(a)
    )) {
      score += 15;
    }

    // CFDA alignment
    if (opportunity.cfdaNumbers?.length && module.cfda?.length) {
      for (const cfda of opportunity.cfdaNumbers) {
        if (module.cfda.some(c => cfda.startsWith(c))) {
          score += 10;
        }
      }
    }
  }

  // Bonus for open opportunities
  if (opportunity.source === 'grants_gov') score += 10;
  if (opportunity.closeDate) {
    const daysLeft = Math.ceil((new Date(opportunity.closeDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft > 30) score += 5;
    if (daysLeft > 60) score += 5;
  }

  return Math.min(score, 100);
}

function detectMatchingModules(opportunity: any): string[] {
  const text = `${opportunity.title || ''} ${opportunity.description || ''}`.toLowerCase();
  const matches: string[] = [];

  for (const [moduleId, module] of Object.entries(CRAIVERSE_MODULES)) {
    const matchCount = module.keywords.filter(k => text.includes(k.toLowerCase())).length;
    if (matchCount >= 2) {
      matches.push(moduleId);
    }
  }

  return matches;
}

function estimateWinProbability(opportunity: any, targetModules: string[]): number {
  let probability = 30; // Base probability
  
  const matchScore = calculateMatchScore(opportunity, targetModules);
  probability += matchScore * 0.3;

  // Lower amounts = less competition
  const amount = opportunity.amountMax || opportunity.amountMin || 0;
  if (amount > 0 && amount < 100000) probability += 15;
  else if (amount < 500000) probability += 10;
  else if (amount < 1000000) probability += 5;

  // Historical awards (we can learn from them)
  if (opportunity.type === 'historical') probability -= 10; // Can't apply, just learning

  // Source reliability
  if (opportunity.source === 'grants_gov') probability += 5;

  return Math.min(Math.round(probability), 85);
}

// ============================================================
// LEARNING SYSTEM - Store patterns from successful grants
// ============================================================

export interface GrantPattern {
  id: string;
  agency: string;
  category: string;
  keywords: string[];
  avgAmount: number;
  successFactors: string[];
  typicalRecipients: string[];
  applicationTips: string[];
  learnedAt: string;
}

export async function learnFromHistoricalAwards(supabase: any): Promise<void> {
  // Get historical awards from USA Spending
  const historical = await searchUSASpending([
    'mental health', 'veterans', 'first responder', 'rural health',
    'education', 'environment', 'disaster relief', 'small business'
  ]);

  // Extract patterns
  const patterns: Map<string, GrantPattern> = new Map();
  
  for (const award of historical) {
    const key = `${award.agency}_${award.cfdaNumber}`;
    const existing = patterns.get(key);
    
    if (existing) {
      existing.avgAmount = (existing.avgAmount + (award.amountMax || 0)) / 2;
      if (award.recipient && !existing.typicalRecipients.includes(award.recipient)) {
        existing.typicalRecipients.push(award.recipient);
      }
    } else {
      patterns.set(key, {
        id: key,
        agency: award.agency,
        category: award.cfdaNumber,
        keywords: extractKeywords(award.title + ' ' + award.description),
        avgAmount: award.amountMax || 0,
        successFactors: [],
        typicalRecipients: award.recipient ? [award.recipient] : [],
        applicationTips: [],
        learnedAt: new Date().toISOString(),
      });
    }
  }

  // Store patterns in database
  for (const pattern of patterns.values()) {
    await supabase.from('grant_knowledge_base').upsert({
      pattern_id: pattern.id,
      agency: pattern.agency,
      category: pattern.category,
      keywords: pattern.keywords,
      avg_amount: pattern.avgAmount,
      success_factors: pattern.successFactors,
      typical_recipients: pattern.typicalRecipients.slice(0, 10),
      application_tips: pattern.applicationTips,
      learned_at: pattern.learnedAt,
    }, { onConflict: 'pattern_id' });
  }
}

function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));
  
  // Count frequency
  const freq: Map<string, number> = new Map();
  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1);
  }
  
  // Return top keywords
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

// ============================================================
// EXPORT ALL FUNCTIONS
// ============================================================

export {
  searchGrantsGov,
  searchNIHReporter,
  searchNSFAwards,
  searchFederalRegister,
  searchUSASpending,
  searchFEMADisasters,
  searchProPublicaNonprofits,
  getCensusData,
  getFREDData,
  getBLSData,
};
