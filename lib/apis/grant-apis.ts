// lib/apis/grant-apis.ts
// COMPLETE FREE API INTEGRATIONS FOR GRANT DISCOVERY
// Every possible free government and nonprofit API
// Timestamp: Saturday, December 13, 2025 - 12:45 PM EST

// ============================================================
// API CONFIGURATION - ALL FREE APIS
// ============================================================

export const API_SOURCES = {
  // FEDERAL GOVERNMENT APIS (ALL FREE)
  GRANTS_GOV: {
    name: 'Grants.gov',
    baseUrl: 'https://www.grants.gov/grantsws/rest',
    description: 'Primary federal grant opportunities',
    rateLimit: '1000/day',
    docs: 'https://www.grants.gov/web/grants/support/technical-support/grantsws.html',
  },
  USA_SPENDING: {
    name: 'USASpending.gov',
    baseUrl: 'https://api.usaspending.gov/api/v2',
    description: 'Federal spending and award data',
    rateLimit: 'Unlimited',
    docs: 'https://api.usaspending.gov/',
  },
  SAM_GOV: {
    name: 'SAM.gov',
    baseUrl: 'https://api.sam.gov',
    description: 'System for Award Management - Entity verification',
    rateLimit: '10000/day with API key',
    docs: 'https://open.gsa.gov/api/sam-entity-api/',
  },
  FEDERAL_REGISTER: {
    name: 'Federal Register',
    baseUrl: 'https://www.federalregister.gov/api/v1',
    description: 'New grant announcements and NOFOs',
    rateLimit: 'Unlimited',
    docs: 'https://www.federalregister.gov/developers/documentation/api/v1',
  },
  DATA_GOV: {
    name: 'Data.gov',
    baseUrl: 'https://catalog.data.gov/api/3',
    description: 'Federal open data catalog',
    rateLimit: 'Unlimited',
    docs: 'https://www.data.gov/developers/apis',
  },

  // RESEARCH & SCIENCE APIS (ALL FREE)
  NIH_REPORTER: {
    name: 'NIH RePORTER',
    baseUrl: 'https://api.reporter.nih.gov/v2',
    description: 'NIH research grants and funding',
    rateLimit: 'Unlimited',
    docs: 'https://api.reporter.nih.gov/',
  },
  NSF_AWARDS: {
    name: 'NSF Awards',
    baseUrl: 'https://api.nsf.gov/services/v1/awards',
    description: 'National Science Foundation awards',
    rateLimit: 'Unlimited',
    docs: 'https://www.nsf.gov/developer/',
  },
  DOE_OSTI: {
    name: 'DOE OSTI',
    baseUrl: 'https://www.osti.gov/api/v1',
    description: 'Department of Energy research',
    rateLimit: 'Unlimited',
    docs: 'https://www.osti.gov/api',
  },

  // NONPROFIT & FOUNDATION (FREE TIERS)
  PROPUBLICA_NONPROFIT: {
    name: 'ProPublica Nonprofit Explorer',
    baseUrl: 'https://projects.propublica.org/nonprofits/api/v2',
    description: 'IRS 990 filings and nonprofit data',
    rateLimit: '1000/day',
    docs: 'https://www.propublica.org/datastore/api/nonprofit-explorer-api',
  },
  OPEN_990: {
    name: 'Open990',
    baseUrl: 'https://www.open990.org/api',
    description: 'Machine-readable 990 data',
    rateLimit: 'Free tier available',
    docs: 'https://www.open990.org/api/',
  },

  // CENSUS & DEMOGRAPHICS (FREE)
  CENSUS: {
    name: 'US Census Bureau',
    baseUrl: 'https://api.census.gov/data',
    description: 'Population and demographic data',
    rateLimit: '500/day without key, unlimited with key',
    docs: 'https://www.census.gov/data/developers.html',
  },
  BLS: {
    name: 'Bureau of Labor Statistics',
    baseUrl: 'https://api.bls.gov/publicAPI/v2',
    description: 'Employment and economic data',
    rateLimit: '500/day',
    docs: 'https://www.bls.gov/developers/',
  },

  // HEALTH & HUMAN SERVICES (FREE)
  HHS_GRANTS: {
    name: 'HHS Grants Forecast',
    baseUrl: 'https://www.hhs.gov/grants/grants/forecasted-announcements',
    description: 'Health grants forecast',
    rateLimit: 'Web scraping',
    docs: 'https://www.hhs.gov/grants/',
  },
  CDC_DATA: {
    name: 'CDC Open Data',
    baseUrl: 'https://data.cdc.gov/api',
    description: 'Health statistics and data',
    rateLimit: 'Unlimited',
    docs: 'https://data.cdc.gov/',
  },
  HRSA_DATA: {
    name: 'HRSA Data',
    baseUrl: 'https://data.hrsa.gov/api',
    description: 'Health resources data',
    rateLimit: 'Unlimited',
    docs: 'https://data.hrsa.gov/',
  },

  // VETERANS & MILITARY (FREE)
  VA_OPEN_DATA: {
    name: 'VA Open Data',
    baseUrl: 'https://www.va.gov/data',
    description: 'Veterans Affairs data',
    rateLimit: 'Unlimited',
    docs: 'https://www.va.gov/data/',
  },

  // ENVIRONMENT (FREE)
  EPA_ENVIROFACTS: {
    name: 'EPA Envirofacts',
    baseUrl: 'https://data.epa.gov/efservice',
    description: 'Environmental data',
    rateLimit: 'Unlimited',
    docs: 'https://www.epa.gov/enviro/envirofacts-data-service-api',
  },

  // EDUCATION (FREE)
  ED_DATA: {
    name: 'Department of Education',
    baseUrl: 'https://api.ed.gov',
    description: 'Education data and grants',
    rateLimit: 'Unlimited',
    docs: 'https://www2.ed.gov/developers',
  },
  IES_DATA: {
    name: 'IES NCES',
    baseUrl: 'https://nces.ed.gov/datalab',
    description: 'Education statistics',
    rateLimit: 'Unlimited',
    docs: 'https://nces.ed.gov/datalab/',
  },

  // ARTS & CULTURE (FREE)
  NEA: {
    name: 'National Endowment for the Arts',
    baseUrl: 'https://www.arts.gov/grants',
    description: 'Arts grants',
    rateLimit: 'Web scraping',
    docs: 'https://www.arts.gov/',
  },
  NEH: {
    name: 'National Endowment for Humanities',
    baseUrl: 'https://www.neh.gov/grants',
    description: 'Humanities grants',
    rateLimit: 'Web scraping',
    docs: 'https://www.neh.gov/',
  },

  // AGRICULTURE (FREE)
  USDA_NIFA: {
    name: 'USDA NIFA',
    baseUrl: 'https://www.nifa.usda.gov/grants',
    description: 'Agriculture and food grants',
    rateLimit: 'Web scraping',
    docs: 'https://www.nifa.usda.gov/',
  },

  // HOUSING (FREE)
  HUD_DATA: {
    name: 'HUD Exchange',
    baseUrl: 'https://www.hudexchange.info/api',
    description: 'Housing and community development',
    rateLimit: 'Unlimited',
    docs: 'https://www.hudexchange.info/',
  },

  // FEMA & DISASTER (FREE)
  FEMA_API: {
    name: 'FEMA OpenFEMA',
    baseUrl: 'https://www.fema.gov/api/open/v2',
    description: 'Disaster and emergency data',
    rateLimit: 'Unlimited',
    docs: 'https://www.fema.gov/about/openfema/api',
  },

  // BUSINESS (FREE)
  SBA_DATA: {
    name: 'SBA',
    baseUrl: 'https://data.sba.gov/api',
    description: 'Small business data',
    rateLimit: 'Unlimited',
    docs: 'https://data.sba.gov/',
  },
  SBIR_STTR: {
    name: 'SBIR/STTR',
    baseUrl: 'https://www.sbir.gov/api',
    description: 'Small business innovation research',
    rateLimit: 'Unlimited',
    docs: 'https://www.sbir.gov/',
  },
};

// ============================================================
// GRANTS.GOV API
// ============================================================

export interface GrantsGovOpportunity {
  id: string;
  number: string;
  title: string;
  agency: string;
  agencyCode: string;
  openDate: string;
  closeDate: string;
  awardCeiling: number;
  awardFloor: number;
  synopsis: string;
  category: { name: string };
  eligibilities: { name: string }[];
  cfdaNumbers: string[];
}

export async function searchGrantsGov(params: {
  keywords?: string[];
  agencies?: string[];
  categories?: string[];
  eligibilities?: string[];
  fundingInstruments?: string[];
  status?: 'forecasted' | 'posted' | 'closed' | 'archived';
  startDate?: string;
  endDate?: string;
  rows?: number;
}): Promise<GrantsGovOpportunity[]> {
  try {
    const searchParams = new URLSearchParams();
    
    if (params.keywords?.length) {
      searchParams.set('keyword', params.keywords.join(' OR '));
    }
    if (params.agencies?.length) {
      searchParams.set('agency', params.agencies.join(','));
    }
    if (params.status) {
      const statusMap = {
        forecasted: 'forecasted',
        posted: 'posted',
        closed: 'closed',
        archived: 'archived',
      };
      searchParams.set('oppStatuses', statusMap[params.status]);
    }
    searchParams.set('sortBy', 'openDate|desc');
    searchParams.set('rows', (params.rows || 100).toString());

    const response = await fetch(
      `${API_SOURCES.GRANTS_GOV.baseUrl}/opportunities/search?${searchParams}`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      console.error('Grants.gov API error:', response.status);
      return [];
    }

    const data = await response.json();
    return data.oppHits || [];
  } catch (error) {
    console.error('Error fetching from Grants.gov:', error);
    return [];
  }
}

export async function getGrantsGovDetails(opportunityId: string): Promise<any> {
  try {
    const response = await fetch(
      `${API_SOURCES.GRANTS_GOV.baseUrl}/opportunity/details?oppId=${opportunityId}`,
      { headers: { 'Accept': 'application/json' } }
    );
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching grant details:', error);
    return null;
  }
}

// ============================================================
// USA SPENDING API
// ============================================================

export interface USASpendingAward {
  id: string;
  recipientName: string;
  awardAmount: number;
  description: string;
  awardingAgency: string;
  awardDate: string;
  cfda: string;
}

export async function searchUSASpending(params: {
  keywords?: string[];
  agencies?: string[];
  awardTypes?: string[];
  dateRange?: { start: string; end: string };
  minAmount?: number;
  maxAmount?: number;
  limit?: number;
}): Promise<USASpendingAward[]> {
  try {
    const filters: any = {
      award_type_codes: params.awardTypes || ['02', '03', '04', '05'], // Grants
    };

    if (params.keywords?.length) {
      filters.keywords = params.keywords;
    }
    if (params.agencies?.length) {
      filters.agencies = params.agencies.map(a => ({ type: 'awarding', name: a }));
    }
    if (params.dateRange) {
      filters.time_period = [{
        start_date: params.dateRange.start,
        end_date: params.dateRange.end,
      }];
    }
    if (params.minAmount || params.maxAmount) {
      filters.award_amounts = [{
        lower_bound: params.minAmount || 0,
        upper_bound: params.maxAmount || 999999999999,
      }];
    }

    const response = await fetch(
      `${API_SOURCES.USA_SPENDING.baseUrl}/search/spending_by_award/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters,
          fields: [
            'Award ID', 'Recipient Name', 'Award Amount', 
            'Description', 'Awarding Agency', 'Award Date', 'CFDA Number'
          ],
          limit: params.limit || 100,
          page: 1,
          sort: 'Award Amount',
          order: 'desc',
        }),
      }
    );

    if (!response.ok) {
      console.error('USASpending API error:', response.status);
      return [];
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching from USASpending:', error);
    return [];
  }
}

// ============================================================
// NIH REPORTER API
// ============================================================

export interface NIHGrant {
  projectNumber: string;
  title: string;
  abstractText: string;
  piNames: string[];
  organization: string;
  totalCost: number;
  awardAmount: number;
  fiscalYear: number;
  nihSpendingCats: string[];
}

export async function searchNIHReporter(params: {
  keywords?: string[];
  fiscalYears?: number[];
  agencies?: string[];
  projectTypes?: string[];
  limit?: number;
}): Promise<NIHGrant[]> {
  try {
    const criteria: any = {};

    if (params.keywords?.length) {
      criteria.advanced_text_search = {
        operator: 'or',
        search_field: 'all',
        search_text: params.keywords.join(' '),
      };
    }
    if (params.fiscalYears?.length) {
      criteria.fiscal_years = params.fiscalYears;
    }
    if (params.agencies?.length) {
      criteria.agencies = params.agencies;
    }

    const response = await fetch(
      `${API_SOURCES.NIH_REPORTER.baseUrl}/projects/search`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          criteria,
          offset: 0,
          limit: params.limit || 100,
          sort_field: 'award_amount',
          sort_order: 'desc',
        }),
      }
    );

    if (!response.ok) {
      console.error('NIH Reporter API error:', response.status);
      return [];
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching from NIH Reporter:', error);
    return [];
  }
}

// ============================================================
// NSF AWARDS API
// ============================================================

export interface NSFAward {
  id: string;
  title: string;
  abstractText: string;
  piFirstName: string;
  piLastName: string;
  agency: string;
  awardee: string;
  awardeeName: string;
  fundsObligatedAmt: number;
  date: string;
  startDate: string;
  expDate: string;
  primaryProgram: string;
}

export async function searchNSFAwards(params: {
  keywords?: string;
  agency?: string;
  dateStart?: string;
  dateEnd?: string;
  awardeeState?: string;
  limit?: number;
}): Promise<NSFAward[]> {
  try {
    const searchParams = new URLSearchParams({
      printFields: 'id,title,abstractText,piFirstName,piLastName,agency,awardeeName,fundsObligatedAmt,date,startDate,expDate,primaryProgram',
      ...(params.keywords && { keyword: params.keywords }),
      ...(params.agency && { agency: params.agency }),
      ...(params.dateStart && { dateStart: params.dateStart }),
      ...(params.dateEnd && { dateEnd: params.dateEnd }),
      ...(params.awardeeState && { awardeeStateCode: params.awardeeState }),
    });

    const response = await fetch(
      `${API_SOURCES.NSF_AWARDS.baseUrl}.json?${searchParams}`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (!response.ok) {
      console.error('NSF API error:', response.status);
      return [];
    }

    const data = await response.json();
    return data.response?.award || [];
  } catch (error) {
    console.error('Error fetching from NSF:', error);
    return [];
  }
}

// ============================================================
// FEDERAL REGISTER API
// ============================================================

export interface FederalRegisterNotice {
  documentNumber: string;
  title: string;
  abstract: string;
  agencies: { name: string }[];
  type: string;
  publicationDate: string;
  htmlUrl: string;
  pdfUrl: string;
  action: string;
}

export async function searchFederalRegister(params: {
  keywords?: string;
  agencies?: string[];
  documentTypes?: ('NOTICE' | 'RULE' | 'PROPOSED_RULE' | 'PRESIDENTIAL_DOCUMENT')[];
  publicationDateStart?: string;
  publicationDateEnd?: string;
  perPage?: number;
}): Promise<FederalRegisterNotice[]> {
  try {
    const searchParams = new URLSearchParams();
    
    if (params.keywords) {
      searchParams.set('conditions[term]', params.keywords);
    }
    if (params.agencies?.length) {
      params.agencies.forEach(a => searchParams.append('conditions[agencies][]', a));
    }
    if (params.documentTypes?.length) {
      params.documentTypes.forEach(t => searchParams.append('conditions[type][]', t));
    }
    if (params.publicationDateStart) {
      searchParams.set('conditions[publication_date][gte]', params.publicationDateStart);
    }
    if (params.publicationDateEnd) {
      searchParams.set('conditions[publication_date][lte]', params.publicationDateEnd);
    }
    
    // Filter for grant-related documents
    searchParams.set('conditions[term]', `${params.keywords || ''} grant funding opportunity`);
    searchParams.set('per_page', (params.perPage || 100).toString());
    searchParams.set('order', 'newest');

    const response = await fetch(
      `${API_SOURCES.FEDERAL_REGISTER.baseUrl}/documents.json?${searchParams}`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (!response.ok) {
      console.error('Federal Register API error:', response.status);
      return [];
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching from Federal Register:', error);
    return [];
  }
}

// ============================================================
// PROPUBLICA NONPROFIT EXPLORER API
// ============================================================

export interface NonprofitOrg {
  ein: string;
  name: string;
  city: string;
  state: string;
  nteeCode: string;
  totalRevenue: number;
  totalExpenses: number;
  totalAssets: number;
  filings: {
    taxPeriod: string;
    pdfUrl: string;
  }[];
}

export async function searchNonprofits(params: {
  query?: string;
  state?: string;
  nteeCode?: string;
  c_code?: string;
}): Promise<NonprofitOrg[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.set('q', params.query);
    if (params.state) searchParams.set('state[id]', params.state);
    if (params.nteeCode) searchParams.set('ntee[id]', params.nteeCode);
    if (params.c_code) searchParams.set('c_code[id]', params.c_code);

    const response = await fetch(
      `${API_SOURCES.PROPUBLICA_NONPROFIT.baseUrl}/search.json?${searchParams}`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (!response.ok) {
      console.error('ProPublica API error:', response.status);
      return [];
    }

    const data = await response.json();
    return data.organizations || [];
  } catch (error) {
    console.error('Error fetching from ProPublica:', error);
    return [];
  }
}

export async function getNonprofitDetails(ein: string): Promise<any> {
  try {
    const response = await fetch(
      `${API_SOURCES.PROPUBLICA_NONPROFIT.baseUrl}/organizations/${ein}.json`,
      { headers: { 'Accept': 'application/json' } }
    );
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching nonprofit details:', error);
    return null;
  }
}

// ============================================================
// FEMA OPENFEMA API
// ============================================================

export interface FEMADisasterDeclaration {
  disasterNumber: number;
  declarationDate: string;
  state: string;
  declarationType: string;
  incidentType: string;
  title: string;
  declaredCountyArea: string;
  programsAvailable: string;
  ihProgramDeclared: boolean;
  iaProgramDeclared: boolean;
  paProgramDeclared: boolean;
  hmProgramDeclared: boolean;
}

export async function getFEMADisasters(params: {
  state?: string;
  year?: number;
  declarationType?: string;
  limit?: number;
}): Promise<FEMADisasterDeclaration[]> {
  try {
    let filter = '';
    const filters: string[] = [];
    
    if (params.state) filters.push(`state eq '${params.state}'`);
    if (params.year) filters.push(`year(declarationDate) eq ${params.year}`);
    if (params.declarationType) filters.push(`declarationType eq '${params.declarationType}'`);
    
    if (filters.length) filter = `$filter=${filters.join(' and ')}`;

    const response = await fetch(
      `${API_SOURCES.FEMA_API.baseUrl}/DisasterDeclarationsSummaries?${filter}&$top=${params.limit || 100}&$orderby=declarationDate desc`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (!response.ok) {
      console.error('FEMA API error:', response.status);
      return [];
    }

    const data = await response.json();
    return data.DisasterDeclarationsSummaries || [];
  } catch (error) {
    console.error('Error fetching from FEMA:', error);
    return [];
  }
}

export async function getFEMAGrantPrograms(): Promise<any[]> {
  try {
    const response = await fetch(
      `${API_SOURCES.FEMA_API.baseUrl}/HazardMitigationGrantProgram?$top=100`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (!response.ok) return [];
    const data = await response.json();
    return data.HazardMitigationGrantProgram || [];
  } catch (error) {
    console.error('Error fetching FEMA grants:', error);
    return [];
  }
}

// ============================================================
// CENSUS API - Demographics for grant targeting
// ============================================================

export async function getCensusData(params: {
  dataset: string;
  variables: string[];
  geography: string;
  year?: number;
}): Promise<any[]> {
  try {
    const year = params.year || 2022;
    const varsParam = params.variables.join(',');
    
    const response = await fetch(
      `${API_SOURCES.CENSUS.baseUrl}/${year}/acs/acs5?get=${varsParam}&for=${params.geography}`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (!response.ok) {
      console.error('Census API error:', response.status);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching from Census:', error);
    return [];
  }
}

// Get poverty data for a state (useful for grant targeting)
export async function getStatePovertyData(stateCode: string): Promise<any> {
  return getCensusData({
    dataset: 'acs/acs5',
    variables: ['NAME', 'B17001_001E', 'B17001_002E'], // Total and below poverty
    geography: `state:${stateCode}`,
  });
}

// ============================================================
// SBIR/STTR API - Small Business Innovation
// ============================================================

export async function searchSBIRAwards(params: {
  keywords?: string;
  agency?: string;
  year?: number;
  state?: string;
}): Promise<any[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params.keywords) searchParams.set('keyword', params.keywords);
    if (params.agency) searchParams.set('agency', params.agency);
    if (params.year) searchParams.set('year', params.year.toString());
    if (params.state) searchParams.set('state', params.state);

    // Note: SBIR.gov doesn't have a public API, would need to scrape
    // This is a placeholder for when they add one
    console.log('SBIR search params:', searchParams.toString());
    return [];
  } catch (error) {
    console.error('Error fetching from SBIR:', error);
    return [];
  }
}

// ============================================================
// HUD EXCHANGE API - Housing grants
// ============================================================

export async function getHUDPrograms(): Promise<any[]> {
  try {
    const response = await fetch(
      'https://www.hudexchange.info/programs/',
      { headers: { 'Accept': 'application/json' } }
    );

    // HUD doesn't have a clean API, would need scraping
    // Return empty for now
    return [];
  } catch (error) {
    console.error('Error fetching from HUD:', error);
    return [];
  }
}

// ============================================================
// COMBINED SEARCH - Search all APIs at once
// ============================================================

export interface UnifiedGrant {
  id: string;
  source: string;
  sourceUrl: string;
  title: string;
  agency: string;
  description: string;
  amountMin?: number;
  amountMax?: number;
  openDate?: string;
  closeDate?: string;
  eligibility?: string[];
  keywords?: string[];
  category?: string;
  matchScore?: number;
}

export async function searchAllGrantSources(keywords: string[]): Promise<{
  grants: UnifiedGrant[];
  sources: { name: string; count: number; error?: string }[];
}> {
  const results: UnifiedGrant[] = [];
  const sources: { name: string; count: number; error?: string }[] = [];

  // Search Grants.gov
  try {
    const grantsGov = await searchGrantsGov({ keywords, rows: 50 });
    sources.push({ name: 'Grants.gov', count: grantsGov.length });
    results.push(...grantsGov.map(g => ({
      id: `grants_gov_${g.id}`,
      source: 'Grants.gov',
      sourceUrl: `https://www.grants.gov/search-results-detail/${g.id}`,
      title: g.title,
      agency: g.agency || g.agencyCode,
      description: g.synopsis || '',
      amountMin: g.awardFloor,
      amountMax: g.awardCeiling,
      openDate: g.openDate,
      closeDate: g.closeDate,
      eligibility: g.eligibilities?.map(e => e.name) || [],
      category: g.category?.name,
    })));
  } catch (e) {
    sources.push({ name: 'Grants.gov', count: 0, error: 'Failed to fetch' });
  }

  // Search NIH Reporter
  try {
    const nih = await searchNIHReporter({ keywords, fiscalYears: [2024, 2025], limit: 25 });
    sources.push({ name: 'NIH Reporter', count: nih.length });
    results.push(...nih.map(g => ({
      id: `nih_${g.projectNumber}`,
      source: 'NIH Reporter',
      sourceUrl: `https://reporter.nih.gov/project-details/${g.projectNumber}`,
      title: g.title,
      agency: 'National Institutes of Health',
      description: g.abstractText || '',
      amountMax: g.awardAmount,
      category: g.nihSpendingCats?.join(', '),
    })));
  } catch (e) {
    sources.push({ name: 'NIH Reporter', count: 0, error: 'Failed to fetch' });
  }

  // Search NSF
  try {
    const nsf = await searchNSFAwards({ keywords: keywords.join(' '), limit: 25 });
    sources.push({ name: 'NSF Awards', count: nsf.length });
    results.push(...nsf.map(g => ({
      id: `nsf_${g.id}`,
      source: 'NSF Awards',
      sourceUrl: `https://www.nsf.gov/awardsearch/showAward?AWD_ID=${g.id}`,
      title: g.title,
      agency: 'National Science Foundation',
      description: g.abstractText || '',
      amountMax: g.fundsObligatedAmt,
      openDate: g.startDate,
      closeDate: g.expDate,
      category: g.primaryProgram,
    })));
  } catch (e) {
    sources.push({ name: 'NSF Awards', count: 0, error: 'Failed to fetch' });
  }

  // Search Federal Register for new opportunities
  try {
    const fedReg = await searchFederalRegister({ 
      keywords: keywords.join(' '), 
      documentTypes: ['NOTICE'],
      perPage: 25 
    });
    sources.push({ name: 'Federal Register', count: fedReg.length });
    results.push(...fedReg.map(g => ({
      id: `fed_reg_${g.documentNumber}`,
      source: 'Federal Register',
      sourceUrl: g.htmlUrl,
      title: g.title,
      agency: g.agencies?.[0]?.name || 'Federal Government',
      description: g.abstract || '',
      openDate: g.publicationDate,
    })));
  } catch (e) {
    sources.push({ name: 'Federal Register', count: 0, error: 'Failed to fetch' });
  }

  return { grants: results, sources };
}

// ============================================================
// HELPER: Get all available federal agencies
// ============================================================

export const FEDERAL_AGENCIES = [
  { code: 'HHS', name: 'Department of Health and Human Services' },
  { code: 'DOD', name: 'Department of Defense' },
  { code: 'ED', name: 'Department of Education' },
  { code: 'DOE', name: 'Department of Energy' },
  { code: 'USDA', name: 'Department of Agriculture' },
  { code: 'DOJ', name: 'Department of Justice' },
  { code: 'DOL', name: 'Department of Labor' },
  { code: 'DOS', name: 'Department of State' },
  { code: 'DOT', name: 'Department of Transportation' },
  { code: 'VA', name: 'Department of Veterans Affairs' },
  { code: 'DHS', name: 'Department of Homeland Security' },
  { code: 'HUD', name: 'Department of Housing and Urban Development' },
  { code: 'DOC', name: 'Department of Commerce' },
  { code: 'DOI', name: 'Department of the Interior' },
  { code: 'EPA', name: 'Environmental Protection Agency' },
  { code: 'NASA', name: 'National Aeronautics and Space Administration' },
  { code: 'NSF', name: 'National Science Foundation' },
  { code: 'SBA', name: 'Small Business Administration' },
  { code: 'SSA', name: 'Social Security Administration' },
  { code: 'USAID', name: 'U.S. Agency for International Development' },
  { code: 'NEA', name: 'National Endowment for the Arts' },
  { code: 'NEH', name: 'National Endowment for the Humanities' },
  { code: 'IMLS', name: 'Institute of Museum and Library Services' },
  { code: 'CNCS', name: 'Corporation for National and Community Service' },
  { code: 'FEMA', name: 'Federal Emergency Management Agency' },
];

// ============================================================
// HELPER: CFDA Categories for filtering
// ============================================================

export const CFDA_CATEGORIES = [
  { code: 'AG', name: 'Agriculture' },
  { code: 'CD', name: 'Community Development' },
  { code: 'CP', name: 'Consumer Protection' },
  { code: 'DPR', name: 'Disaster Prevention and Relief' },
  { code: 'ED', name: 'Education' },
  { code: 'ELT', name: 'Employment, Labor and Training' },
  { code: 'EN', name: 'Energy' },
  { code: 'ENV', name: 'Environment' },
  { code: 'FN', name: 'Food and Nutrition' },
  { code: 'HL', name: 'Health' },
  { code: 'HO', name: 'Housing' },
  { code: 'HU', name: 'Humanities' },
  { code: 'IIJ', name: 'Information and Statistics' },
  { code: 'IS', name: 'Income Security and Social Services' },
  { code: 'LJL', name: 'Law, Justice and Legal Services' },
  { code: 'NR', name: 'Natural Resources' },
  { code: 'RA', name: 'Regional Development' },
  { code: 'RD', name: 'Science and Technology' },
  { code: 'ST', name: 'Transportation' },
  { code: 'O', name: 'Other' },
];
