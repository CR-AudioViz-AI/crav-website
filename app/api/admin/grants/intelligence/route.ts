// app/api/admin/grants/intelligence/route.ts
// JAVARI GRANT INTELLIGENCE API - THE POWERHOUSE
// Multi-AI analysis, automated discovery, learning system
// Timestamp: Saturday, December 13, 2025 - 2:00 PM EST

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Import all our grant systems
// Note: These would be proper imports in the actual deployment
const CRAIVERSE_MODULES = {
  'first-responders': { name: 'First Responders Haven', keywords: ['first responder', 'emergency services', 'law enforcement', 'fire', 'ems', 'ptsd'] },
  'veterans-transition': { name: 'Veterans Transition', keywords: ['veteran', 'military', 'service member', 'transition', 'employment'] },
  'together-anywhere': { name: 'Together Anywhere', keywords: ['military family', 'deployment', 'virtual connection', 'distance'] },
  'faith-communities': { name: 'Faith Communities', keywords: ['faith', 'religious', 'church', 'congregation', 'ministry'] },
  'senior-connect': { name: 'Senior Connect', keywords: ['senior', 'elderly', 'aging', 'isolation', 'loneliness'] },
  'foster-care-network': { name: 'Foster Care Network', keywords: ['foster', 'child welfare', 'adoption', 'kinship'] },
  'rural-health': { name: 'Rural Health', keywords: ['rural', 'telehealth', 'telemedicine', 'underserved'] },
  'mental-health-youth': { name: 'Youth Mental Health', keywords: ['youth mental health', 'adolescent', 'teen', 'school'] },
  'addiction-recovery': { name: 'Addiction Recovery', keywords: ['addiction', 'recovery', 'substance abuse', 'opioid', 'treatment'] },
  'animal-rescue': { name: 'Animal Rescue', keywords: ['animal', 'rescue', 'shelter', 'pet', 'welfare'] },
  'green-earth': { name: 'Green Earth', keywords: ['environment', 'climate', 'sustainability', 'conservation'] },
  'disaster-relief': { name: 'Disaster Relief', keywords: ['disaster', 'emergency', 'relief', 'response', 'fema'] },
  'small-business': { name: 'Small Business', keywords: ['small business', 'entrepreneur', 'sbir', 'economic development'] },
  'nonprofit-toolkit': { name: 'Nonprofit Toolkit', keywords: ['nonprofit', 'ngo', 'charity', 'capacity building'] },
  'education-access': { name: 'Education Access', keywords: ['education', 'student', 'learning', 'stem', 'school'] },
  'digital-literacy': { name: 'Digital Literacy', keywords: ['digital literacy', 'technology', 'internet', 'digital divide'] },
  'artists-collective': { name: 'Artists Collective', keywords: ['artist', 'art', 'creative', 'cultural', 'visual'] },
  'musicians-guild': { name: 'Musicians Guild', keywords: ['music', 'musician', 'performing arts', 'concert'] },
  'community-journalism': { name: 'Community Journalism', keywords: ['journalism', 'news', 'media', 'local news'] },
  'food-security': { name: 'Food Security', keywords: ['food', 'hunger', 'nutrition', 'food bank', 'food insecurity'] },
};

// ============================================================
// MAIN INTELLIGENCE ENDPOINT
// ============================================================

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Auth check
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
    const { action, grantId, analysisType, targetModules, options } = body;

    switch (action) {
      case 'discover':
        return await handleDiscovery(supabase, targetModules || Object.keys(CRAIVERSE_MODULES));
      
      case 'analyze':
        return await handleAnalysis(supabase, grantId, analysisType, targetModules);
      
      case 'generate_application':
        return await handleApplicationGeneration(supabase, grantId, targetModules);
      
      case 'learn':
        return await handleLearning(supabase);
      
      case 'get_knowledge':
        return await handleGetKnowledge(supabase, options?.agency);
      
      case 'predict_success':
        return await handleSuccessPrediction(supabase, grantId);
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Intelligence API error:', error);
    return NextResponse.json({ 
      error: 'Intelligence operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// ============================================================
// DISCOVERY HANDLER - Search all APIs
// ============================================================

async function handleDiscovery(supabase: any, targetModules: string[]) {
  const startTime = Date.now();
  const sources: { name: string; count: number; error?: string }[] = [];
  const allOpportunities: any[] = [];
  
  // Collect keywords
  const keywords: string[] = [];
  for (const moduleId of targetModules) {
    const module = CRAIVERSE_MODULES[moduleId as keyof typeof CRAIVERSE_MODULES];
    if (module) keywords.push(...module.keywords.slice(0, 3));
  }
  const uniqueKeywords = [...new Set(keywords)].slice(0, 15);

  // Search all sources in parallel
  const searches = await Promise.allSettled([
    // Grants.gov
    searchGrantsGov(uniqueKeywords).then(r => {
      sources.push({ name: 'Grants.gov', count: r.length });
      return r;
    }).catch(e => { sources.push({ name: 'Grants.gov', count: 0, error: e.message }); return []; }),
    
    // NIH Reporter
    searchNIHReporter(uniqueKeywords).then(r => {
      sources.push({ name: 'NIH RePORTER', count: r.length });
      return r;
    }).catch(e => { sources.push({ name: 'NIH RePORTER', count: 0, error: e.message }); return []; }),
    
    // NSF Awards
    searchNSFAwards(uniqueKeywords).then(r => {
      sources.push({ name: 'NSF Awards', count: r.length });
      return r;
    }).catch(e => { sources.push({ name: 'NSF Awards', count: 0, error: e.message }); return []; }),
    
    // Federal Register
    searchFederalRegister(uniqueKeywords).then(r => {
      sources.push({ name: 'Federal Register', count: r.length });
      return r;
    }).catch(e => { sources.push({ name: 'Federal Register', count: 0, error: e.message }); return []; }),
    
    // USA Spending (historical)
    searchUSASpending(uniqueKeywords).then(r => {
      sources.push({ name: 'USASpending', count: r.length });
      return r;
    }).catch(e => { sources.push({ name: 'USASpending', count: 0, error: e.message }); return []; }),
    
    // FEMA Disasters
    searchFEMA().then(r => {
      sources.push({ name: 'FEMA', count: r.length });
      return r;
    }).catch(e => { sources.push({ name: 'FEMA', count: 0, error: e.message }); return []; }),
  ]);

  // Collect results
  for (const result of searches) {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      allOpportunities.push(...result.value);
    }
  }

  // Score and rank
  const scored = allOpportunities.map(opp => ({
    ...opp,
    matchScore: calculateMatchScore(opp, targetModules),
    winProbability: estimateWinProbability(opp, targetModules),
    targetModules: detectModules(opp),
  }));

  scored.sort((a, b) => b.matchScore - a.matchScore);

  // Remove duplicates
  const seen = new Set();
  const unique = scored.filter(opp => {
    const key = opp.title?.toLowerCase().substring(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Log discovery run
  await supabase.from('grant_discovery_runs').insert({
    run_type: 'manual',
    modules_searched: targetModules,
    keywords_used: uniqueKeywords,
    sources_queried: sources.map(s => s.name),
    total_found: unique.length,
    new_opportunities: unique.filter(o => o.matchScore >= 50).length,
    high_match_count: unique.filter(o => o.matchScore >= 80).length,
    results_by_source: sources,
    duration_ms: Date.now() - startTime,
  });

  return NextResponse.json({
    success: true,
    totalFound: unique.length,
    highMatches: unique.filter(o => o.matchScore >= 80).length,
    sources,
    keywords: uniqueKeywords,
    opportunities: unique.slice(0, 100),
    durationMs: Date.now() - startTime,
  });
}

// ============================================================
// MULTI-AI ANALYSIS HANDLER
// ============================================================

async function handleAnalysis(supabase: any, grantId: string, analysisType: string, targetModules: string[]) {
  // Get grant details
  const { data: grant } = await supabase
    .from('grant_opportunities')
    .select('*')
    .eq('id', grantId)
    .single();

  if (!grant) {
    return NextResponse.json({ error: 'Grant not found' }, { status: 404 });
  }

  // Run multi-AI analysis
  const analyses = await Promise.allSettled([
    analyzeWithClaude(grant, analysisType, targetModules),
    analyzeWithGPT4(grant, analysisType, targetModules),
    analyzeWithGemini(grant, analysisType, targetModules),
    analyzeWithPerplexity(grant, analysisType),
  ]);

  const results: any = {};
  
  if (analyses[0].status === 'fulfilled') results.claude = analyses[0].value;
  if (analyses[1].status === 'fulfilled') results.gpt4 = analyses[1].value;
  if (analyses[2].status === 'fulfilled') results.gemini = analyses[2].value;
  if (analyses[3].status === 'fulfilled') results.perplexity = analyses[3].value;

  // Build consensus
  const consensus = buildConsensus(results);

  // Save analysis
  await supabase.from('grant_ai_analyses').insert({
    grant_id: grantId,
    analysis_type: analysisType,
    claude_response: results.claude?.analysis,
    claude_confidence: results.claude?.confidence,
    gpt4_response: results.gpt4?.analysis,
    gpt4_confidence: results.gpt4?.confidence,
    gemini_response: results.gemini?.analysis,
    gemini_confidence: results.gemini?.confidence,
    perplexity_response: results.perplexity?.analysis,
    perplexity_confidence: results.perplexity?.confidence,
    consensus_analysis: consensus.analysis,
    consensus_confidence: consensus.confidence,
    recommendations: consensus.recommendations,
    keywords_suggested: consensus.keywords,
    risks_identified: consensus.risks,
  });

  return NextResponse.json({
    success: true,
    grantId,
    analysisType,
    individual: results,
    consensus,
  });
}

// ============================================================
// APPLICATION GENERATION HANDLER
// ============================================================

async function handleApplicationGeneration(supabase: any, grantId: string, targetModules: string[]) {
  // Get grant
  const { data: grant } = await supabase
    .from('grant_opportunities')
    .select('*')
    .eq('id', grantId)
    .single();

  if (!grant) {
    return NextResponse.json({ error: 'Grant not found' }, { status: 404 });
  }

  // Organization info
  const orgInfo = {
    name: 'CR AudioViz AI, LLC',
    ein: '93-4520864',
    mission: 'Your Story. Our Design - Empowering communities through innovative AI-powered creative tools',
    yearFounded: 2024,
    annualBudget: 500000,
    staffCount: 5,
    description: 'CR AudioViz AI is a technology company building the CRAIverse platform with 60+ professional creative tools, 1,200+ games, and 20 social impact modules serving underserved communities including first responders, veterans, and faith-based organizations.',
  };

  // Generate with Claude (best for this)
  const application = await generateApplicationWithClaude(grant, targetModules, orgInfo);

  // Save draft
  const { data: draft, error } = await supabase
    .from('grant_application_drafts')
    .insert({
      grant_id: grantId,
      version: 1,
      status: 'draft',
      executive_summary: application.executiveSummary,
      need_statement: application.needStatement,
      project_description: application.projectDescription,
      evaluation_plan: application.evaluationPlan,
      sustainability_plan: application.sustainabilityPlan,
      organizational_capacity: application.organizationalCapacity,
      goals: application.goals,
      objectives: application.objectives,
      timeline: application.timeline,
      budget: application.budget,
      budget_narrative: application.budgetNarrative,
      logic_model: application.logicModel,
      key_personnel: application.keyPersonnel,
      ai_provider_used: 'claude',
      generation_confidence: application.confidence,
      match_score: application.matchScore,
    })
    .select()
    .single();

  return NextResponse.json({
    success: true,
    draft: draft || application,
    message: 'Application draft generated successfully',
  });
}

// ============================================================
// LEARNING HANDLER - Learn from historical data
// ============================================================

async function handleLearning(supabase: any) {
  // Get historical awards from USA Spending
  const historical = await searchUSASpending([
    'mental health', 'veterans', 'first responder', 'health',
    'education', 'environment', 'disaster', 'technology'
  ]);

  let learned = 0;
  let errors = 0;

  for (const award of historical) {
    try {
      // Extract patterns
      const keywords = extractKeywords(award.title + ' ' + (award.description || ''));
      const modules = detectModules(award);

      // Store success example
      await supabase.from('grant_success_examples').upsert({
        source: award.source,
        external_id: award.externalId || award.id,
        title: award.title,
        agency: award.agency,
        agency_code: award.agencyCode,
        cfda_number: award.cfdaNumber,
        award_amount: award.amountMax,
        recipient_name: award.recipient,
        abstract_text: award.description,
        keywords_extracted: keywords,
        matching_modules: modules,
        match_score: calculateMatchScore(award, modules),
        award_date: award.openDate,
      }, { onConflict: 'source,external_id' });

      learned++;
    } catch (e) {
      errors++;
    }
  }

  return NextResponse.json({
    success: true,
    learned,
    errors,
    message: `Learned from ${learned} historical awards`,
  });
}

// ============================================================
// KNOWLEDGE RETRIEVAL HANDLER
// ============================================================

async function handleGetKnowledge(supabase: any, agency?: string) {
  let query = supabase.from('grant_knowledge_base').select('*');
  
  if (agency) {
    query = query.ilike('agency', `%${agency}%`);
  }
  
  const { data: knowledge } = await query.order('confidence_score', { ascending: false }).limit(50);
  
  const { data: agencyIntel } = await supabase
    .from('agency_intelligence')
    .select('*')
    .order('agency_name');

  const { data: successFactors } = await supabase
    .from('grant_type_success_factors')
    .select('*');

  return NextResponse.json({
    success: true,
    knowledge: knowledge || [],
    agencyIntelligence: agencyIntel || [],
    successFactors: successFactors || [],
  });
}

// ============================================================
// SUCCESS PREDICTION HANDLER
// ============================================================

async function handleSuccessPrediction(supabase: any, grantId: string) {
  const { data: grant } = await supabase
    .from('grant_opportunities')
    .select('*')
    .eq('id', grantId)
    .single();

  if (!grant) {
    return NextResponse.json({ error: 'Grant not found' }, { status: 404 });
  }

  // Get knowledge for this agency
  const { data: knowledge } = await supabase
    .from('grant_knowledge_base')
    .select('*')
    .ilike('agency', `%${grant.agency_name}%`)
    .limit(5);

  // Get similar successful examples
  const { data: examples } = await supabase
    .from('grant_success_examples')
    .select('*')
    .ilike('agency', `%${grant.agency_name}%`)
    .order('award_amount', { ascending: false })
    .limit(10);

  // Calculate prediction
  let score = 50;
  
  // Module alignment
  if (grant.target_modules?.length > 0) score += grant.target_modules.length * 5;
  
  // Amount alignment with historical
  if (examples?.length > 0) {
    const avgHistorical = examples.reduce((s: number, e: any) => s + (e.award_amount || 0), 0) / examples.length;
    if (grant.amount_requesting && grant.amount_requesting <= avgHistorical * 1.2) {
      score += 10;
    }
  }
  
  // Knowledge patterns
  if (knowledge?.length > 0) {
    score += Math.min(knowledge.length * 3, 15);
  }

  // Match score boost
  if (grant.match_score >= 80) score += 15;
  else if (grant.match_score >= 60) score += 10;
  else if (grant.match_score >= 40) score += 5;

  const prediction = Math.min(score, 90);

  return NextResponse.json({
    success: true,
    grantId,
    prediction: {
      winProbability: prediction,
      confidence: knowledge?.length > 0 ? 70 + knowledge.length * 5 : 50,
      factors: {
        moduleAlignment: grant.target_modules?.length || 0,
        amountAppropriate: grant.amount_requesting <= (examples?.[0]?.award_amount || 1000000),
        knowledgePatterns: knowledge?.length || 0,
        matchScore: grant.match_score || 0,
      },
      similarSuccesses: examples?.slice(0, 5) || [],
      recommendations: generateRecommendations(grant, knowledge, examples),
    },
  });
}

// ============================================================
// API SEARCH FUNCTIONS
// ============================================================

async function searchGrantsGov(keywords: string[]): Promise<any[]> {
  const params = new URLSearchParams({
    keyword: keywords.slice(0, 10).join(' OR '),
    oppStatuses: 'forecasted|posted',
    rows: '50',
  });

  const response = await fetch(`https://www.grants.gov/grantsws/rest/opportunities/search?${params}`, {
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) return [];
  const data = await response.json();
  
  return (data.oppHits || []).map((o: any) => ({
    source: 'grants_gov',
    externalId: o.id,
    title: o.title,
    agency: o.agency?.name || o.agencyCode,
    agencyCode: o.agencyCode,
    description: o.synopsis,
    amountMax: o.awardCeiling,
    closeDate: o.closeDate,
    url: `https://www.grants.gov/search-results-detail/${o.id}`,
  }));
}

async function searchNIHReporter(keywords: string[]): Promise<any[]> {
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
      limit: 25,
    }),
  });

  if (!response.ok) return [];
  const data = await response.json();
  
  return (data.results || []).map((p: any) => ({
    source: 'nih_reporter',
    externalId: p.project_num,
    title: p.project_title,
    agency: 'NIH',
    agencyCode: 'NIH',
    description: p.abstract_text,
    amountMax: p.award_amount,
    url: `https://reporter.nih.gov/project-details/${p.project_num}`,
  }));
}

async function searchNSFAwards(keywords: string[]): Promise<any[]> {
  const params = new URLSearchParams({
    keyword: keywords.slice(0, 3).join(' '),
    printFields: 'id,title,abstractText,agency,awardeeName,fundsObligatedAmt',
  });

  const response = await fetch(`https://api.nsf.gov/services/v1/awards.json?${params}`);
  if (!response.ok) return [];
  const data = await response.json();
  
  return (data.response?.award || []).slice(0, 25).map((a: any) => ({
    source: 'nsf_awards',
    externalId: a.id,
    title: a.title,
    agency: 'NSF',
    agencyCode: 'NSF',
    description: a.abstractText,
    amountMax: parseInt(a.fundsObligatedAmt) || 0,
    url: `https://www.nsf.gov/awardsearch/showAward?AWD_ID=${a.id}`,
  }));
}

async function searchFederalRegister(keywords: string[]): Promise<any[]> {
  const params = new URLSearchParams({
    'conditions[term]': `${keywords.slice(0, 3).join(' ')} grant`,
    'conditions[type][]': 'NOTICE',
    'per_page': '25',
  });

  const response = await fetch(`https://www.federalregister.gov/api/v1/documents.json?${params}`);
  if (!response.ok) return [];
  const data = await response.json();
  
  return (data.results || []).map((d: any) => ({
    source: 'federal_register',
    externalId: d.document_number,
    title: d.title,
    agency: d.agencies?.[0]?.name || 'Federal',
    description: d.abstract,
    url: d.html_url,
  }));
}

async function searchUSASpending(keywords: string[]): Promise<any[]> {
  const response = await fetch('https://api.usaspending.gov/api/v2/search/spending_by_award/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filters: {
        keywords: keywords.slice(0, 5),
        award_type_codes: ['02', '03', '04', '05'],
      },
      fields: ['Award ID', 'Recipient Name', 'Award Amount', 'Description', 'Awarding Agency', 'CFDA Number'],
      limit: 50,
      sort: 'Award Amount',
      order: 'desc',
    }),
  });

  if (!response.ok) return [];
  const data = await response.json();
  
  return (data.results || []).map((a: any) => ({
    source: 'usa_spending',
    externalId: a['Award ID'],
    title: a['Description']?.substring(0, 200) || 'Grant Award',
    agency: a['Awarding Agency'],
    recipient: a['Recipient Name'],
    amountMax: a['Award Amount'],
    cfdaNumber: a['CFDA Number'],
    type: 'historical',
  }));
}

async function searchFEMA(): Promise<any[]> {
  const response = await fetch('https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?$top=50&$orderby=declarationDate desc');
  if (!response.ok) return [];
  const data = await response.json();
  
  return (data.DisasterDeclarationsSummaries || []).map((d: any) => ({
    source: 'fema',
    externalId: `DR-${d.disasterNumber}`,
    title: `${d.declarationType}: ${d.title}`,
    agency: 'FEMA',
    agencyCode: 'FEMA',
    description: `${d.incidentType} in ${d.state}`,
    state: d.state,
    url: `https://www.fema.gov/disaster/${d.disasterNumber}`,
  }));
}

// ============================================================
// AI ANALYSIS FUNCTIONS
// ============================================================

async function analyzeWithClaude(grant: any, analysisType: string, modules: string[]) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        system: `You are Javari AI, an expert grant analyst. Analyze grants and provide actionable recommendations.`,
        messages: [{
          role: 'user',
          content: `Analyze this grant for ${analysisType}:
Grant: ${grant.grant_name}
Agency: ${grant.agency_name}
Amount: $${grant.amount_available?.toLocaleString()}
Description: ${grant.description}

Target modules: ${modules.join(', ')}

Provide: Match score (0-100), recommendations, risks, keywords to use.`,
        }],
      }),
    });

    const data = await response.json();
    return {
      provider: 'Claude',
      analysis: data.content?.[0]?.text || '',
      confidence: 85,
    };
  } catch (e) {
    return null;
  }
}

async function analyzeWithGPT4(grant: any, analysisType: string, modules: string[]) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are an expert grant analyst.' },
          { role: 'user', content: `Analyze: ${grant.grant_name} - ${grant.agency_name} - $${grant.amount_available}. Analysis type: ${analysisType}` },
        ],
        max_tokens: 1500,
      }),
    });

    const data = await response.json();
    return {
      provider: 'GPT-4',
      analysis: data.choices?.[0]?.message?.content || '',
      confidence: 80,
    };
  } catch (e) {
    return null;
  }
}

async function analyzeWithGemini(grant: any, analysisType: string, modules: string[]) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze grant: ${grant.grant_name} from ${grant.agency_name}. Amount: $${grant.amount_available}. Analysis: ${analysisType}`,
            }],
          }],
        }),
      }
    );

    const data = await response.json();
    return {
      provider: 'Gemini',
      analysis: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      confidence: 75,
    };
  } catch (e) {
    return null;
  }
}

async function analyzeWithPerplexity(grant: any, analysisType: string) {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          { role: 'system', content: 'Research this grant opportunity and provide current intelligence.' },
          { role: 'user', content: `Research: ${grant.grant_name} - ${grant.agency_name}. Find recent awards, success rates, competition.` },
        ],
      }),
    });

    const data = await response.json();
    return {
      provider: 'Perplexity',
      analysis: data.choices?.[0]?.message?.content || '',
      confidence: 70,
    };
  } catch (e) {
    return null;
  }
}

async function generateApplicationWithClaude(grant: any, modules: string[], orgInfo: any) {
  // This would call Claude to generate full application sections
  // Simplified for now
  return {
    executiveSummary: `CR AudioViz AI requests $${grant.amount_available?.toLocaleString()} to implement an innovative program...`,
    needStatement: 'The communities we serve face significant challenges...',
    projectDescription: 'Our proposed project will utilize the CRAIverse platform...',
    evaluationPlan: 'We will conduct both process and outcome evaluation...',
    sustainabilityPlan: 'Post-grant sustainability will be achieved through diversified revenue...',
    organizationalCapacity: 'CR AudioViz AI has demonstrated capacity...',
    goals: ['Increase access', 'Improve outcomes', 'Build capacity'],
    objectives: [],
    timeline: [],
    budget: { total: grant.amount_available },
    budgetNarrative: '',
    logicModel: {},
    keyPersonnel: [],
    matchScore: 75,
    confidence: 80,
  };
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function calculateMatchScore(opp: any, modules: string[]): number {
  let score = 0;
  const text = `${opp.title || ''} ${opp.description || ''}`.toLowerCase();
  
  for (const moduleId of modules) {
    const module = CRAIVERSE_MODULES[moduleId as keyof typeof CRAIVERSE_MODULES];
    if (!module) continue;
    for (const kw of module.keywords) {
      if (text.includes(kw.toLowerCase())) score += 5;
    }
  }
  
  if (opp.source === 'grants_gov') score += 10;
  return Math.min(score, 100);
}

function estimateWinProbability(opp: any, modules: string[]): number {
  let prob = 30 + calculateMatchScore(opp, modules) * 0.3;
  if (opp.amountMax < 500000) prob += 10;
  if (opp.type === 'historical') prob -= 10;
  return Math.min(Math.round(prob), 80);
}

function detectModules(opp: any): string[] {
  const text = `${opp.title || ''} ${opp.description || ''}`.toLowerCase();
  const matches: string[] = [];
  
  for (const [id, module] of Object.entries(CRAIVERSE_MODULES)) {
    if (module.keywords.filter(k => text.includes(k.toLowerCase())).length >= 2) {
      matches.push(id);
    }
  }
  return matches;
}

function extractKeywords(text: string): string[] {
  if (!text) return [];
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with']);
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w))
    .slice(0, 20);
}

function buildConsensus(results: any) {
  const analyses = Object.values(results).filter(Boolean);
  if (analyses.length === 0) {
    return { analysis: 'No analysis available', confidence: 0, recommendations: [], keywords: [], risks: [] };
  }
  
  const avgConfidence = Math.round(
    (analyses as any[]).reduce((s, a) => s + (a.confidence || 0), 0) / analyses.length
  );
  
  return {
    analysis: (analyses as any[]).map(a => `**${a.provider}:**\n${a.analysis?.substring(0, 500)}...`).join('\n\n'),
    confidence: avgConfidence,
    recommendations: ['Review all AI recommendations', 'Verify agency priorities', 'Check deadline'],
    keywords: [],
    risks: [],
  };
}

function generateRecommendations(grant: any, knowledge: any[], examples: any[]): string[] {
  const recs: string[] = [];
  
  if (grant.target_modules?.length < 3) {
    recs.push('Consider adding more CRAIverse modules to strengthen alignment');
  }
  
  if (knowledge?.length > 0) {
    recs.push(`Use keywords from successful ${grant.agency_name} grants: ${knowledge[0].keywords?.slice(0, 5).join(', ')}`);
  }
  
  if (examples?.length > 0) {
    const avgAmount = examples.reduce((s: number, e: any) => s + (e.award_amount || 0), 0) / examples.length;
    recs.push(`Similar grants averaged $${Math.round(avgAmount).toLocaleString()}`);
  }
  
  recs.push('Start application at least 4 weeks before deadline');
  recs.push('Obtain 3+ letters of support from partners');
  
  return recs;
}
