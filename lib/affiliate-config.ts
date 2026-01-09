/**
 * CR AudioViz AI Affiliate Program Configuration
 * 
 * Revenue Strategy: Cover business costs with affiliate income,
 * making sales pure profit.
 */

export interface AffiliateProgram {
  id: string;
  name: string;
  category: string;
  commission: string;
  cookieDuration: number; // days
  signupUrl: string;
  apps: string[];
  productTypes: string[];
}

export const AFFILIATE_PROGRAMS: AffiliateProgram[] = [
  // ============================================================================
  // FINANCIAL SECTOR AFFILIATES
  // ============================================================================
  {
    id: 'lending-tree',
    name: 'LendingTree',
    category: 'financial',
    commission: '$5-$70 per lead',
    cookieDuration: 14,
    signupUrl: 'https://www.lendingtree.com/affiliates/',
    apps: ['mortgage-rate-monitor', 'javari-realty', 'javari-property'],
    productTypes: ['mortgage', 'refinance', 'home-equity'],
  },
  {
    id: 'bankrate',
    name: 'Bankrate',
    category: 'financial',
    commission: '$15-$100 per lead',
    cookieDuration: 30,
    signupUrl: 'https://www.bankrate.com/partners/',
    apps: ['mortgage-rate-monitor', 'javari-market', 'javari-insurance'],
    productTypes: ['mortgage', 'credit-cards', 'insurance'],
  },
  {
    id: 'nerdwallet',
    name: 'NerdWallet',
    category: 'financial',
    commission: 'Varies by product',
    cookieDuration: 30,
    signupUrl: 'https://www.nerdwallet.com/partnerships',
    apps: ['mortgage-rate-monitor', 'javari-market', 'javari-insurance'],
    productTypes: ['mortgage', 'credit-cards', 'banking', 'insurance'],
  },
  {
    id: 'rocket-mortgage',
    name: 'Rocket Mortgage',
    category: 'financial',
    commission: '$100+ per closed loan',
    cookieDuration: 30,
    signupUrl: 'https://www.rocketmortgage.com/partner',
    apps: ['mortgage-rate-monitor', 'javari-realty'],
    productTypes: ['mortgage'],
  },
  {
    id: 'robinhood',
    name: 'Robinhood',
    category: 'financial',
    commission: '$5-$15 per signup',
    cookieDuration: 7,
    signupUrl: 'https://robinhood.com/us/en/about/partners/',
    apps: ['javari-market', 'market-oracle-app'],
    productTypes: ['stocks', 'crypto'],
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    category: 'financial',
    commission: '50% of trading fees (90 days)',
    cookieDuration: 90,
    signupUrl: 'https://www.coinbase.com/affiliates',
    apps: ['javari-market', 'market-oracle-app'],
    productTypes: ['crypto'],
  },

  // ============================================================================
  // COLLECTORS SECTOR AFFILIATES
  // ============================================================================
  {
    id: 'ebay',
    name: 'eBay Partner Network',
    category: 'collectors',
    commission: '1-6% of sale',
    cookieDuration: 1,
    signupUrl: 'https://partnernetwork.ebay.com/',
    apps: ['javari-cards', 'javari-coin-cache', 'javari-vinyl-vault', 'javari-watch-works', 
           'javari-comic-crypt', 'javari-disney-vault', 'javari-spirits', 'javari-merch'],
    productTypes: ['cards', 'coins', 'vinyl', 'watches', 'comics', 'disney', 'spirits', 'collectibles'],
  },
  {
    id: 'tcgplayer',
    name: 'TCGplayer Affiliate',
    category: 'collectors',
    commission: '5% of sales',
    cookieDuration: 30,
    signupUrl: 'https://www.tcgplayer.com/affiliate',
    apps: ['javari-cards', 'javari-card-vault'],
    productTypes: ['trading-cards', 'pokemon', 'magic', 'yugioh'],
  },
  {
    id: 'discogs',
    name: 'Discogs',
    category: 'collectors',
    commission: '8% of sales',
    cookieDuration: 30,
    signupUrl: 'https://www.discogs.com/affiliates',
    apps: ['javari-vinyl-vault'],
    productTypes: ['vinyl', 'records', 'music'],
  },
  {
    id: 'chrono24',
    name: 'Chrono24',
    category: 'collectors',
    commission: '1-3% of sales',
    cookieDuration: 30,
    signupUrl: 'https://www.chrono24.com/affiliate.htm',
    apps: ['javari-watch-works'],
    productTypes: ['watches', 'luxury-watches'],
  },
  {
    id: 'apmex',
    name: 'APMEX',
    category: 'collectors',
    commission: '1-3% of sales',
    cookieDuration: 30,
    signupUrl: 'https://www.apmex.com/affiliate',
    apps: ['javari-coin-cache'],
    productTypes: ['coins', 'precious-metals', 'bullion'],
  },

  // ============================================================================
  // CRAFT SECTOR AFFILIATES
  // ============================================================================
  {
    id: 'amazon',
    name: 'Amazon Associates',
    category: 'general',
    commission: '1-10% depending on category',
    cookieDuration: 1,
    signupUrl: 'https://affiliate-program.amazon.com/',
    apps: ['crochet-platform', 'knitting-platform', 'machineknit-platform',
           'javari-shopping', 'javari-ebook'],
    productTypes: ['yarn', 'needles', 'hooks', 'patterns', 'books', 'supplies'],
  },
  {
    id: 'joann',
    name: 'JOANN Affiliate',
    category: 'craft',
    commission: '4-7% of sales',
    cookieDuration: 30,
    signupUrl: 'https://www.joann.com/affiliates',
    apps: ['crochet-platform', 'knitting-platform', 'machineknit-platform'],
    productTypes: ['yarn', 'fabric', 'craft-supplies'],
  },
  {
    id: 'lovecrafts',
    name: 'LoveCrafts',
    category: 'craft',
    commission: '5-8% of sales',
    cookieDuration: 30,
    signupUrl: 'https://www.lovecrafts.com/en-us/affiliates',
    apps: ['crochet-platform', 'knitting-platform'],
    productTypes: ['yarn', 'patterns', 'kits'],
  },
  {
    id: 'knitpicks',
    name: 'KnitPicks',
    category: 'craft',
    commission: '10% of sales',
    cookieDuration: 30,
    signupUrl: 'https://www.knitpicks.com/affiliate-program.html',
    apps: ['crochet-platform', 'knitting-platform'],
    productTypes: ['yarn', 'needles', 'accessories'],
  },

  // ============================================================================
  // REAL ESTATE SECTOR AFFILIATES
  // ============================================================================
  {
    id: 'zillow',
    name: 'Zillow Premier Agent',
    category: 'real-estate',
    commission: 'Referral fees',
    cookieDuration: 30,
    signupUrl: 'https://www.zillow.com/advertising/premier-agent/',
    apps: ['javari-realty', 'javari-property', 'javari-property-hub'],
    productTypes: ['real-estate', 'homes'],
  },
  {
    id: 'better',
    name: 'Better.com',
    category: 'real-estate',
    commission: '$500+ per closed loan',
    cookieDuration: 30,
    signupUrl: 'https://better.com/partners',
    apps: ['mortgage-rate-monitor', 'javari-realty'],
    productTypes: ['mortgage'],
  },

  // ============================================================================
  // TRAVEL SECTOR AFFILIATES
  // ============================================================================
  {
    id: 'booking',
    name: 'Booking.com Affiliate',
    category: 'travel',
    commission: '25-40% of commission',
    cookieDuration: 30,
    signupUrl: 'https://www.booking.com/affiliate-program/',
    apps: ['javari-travel', 'javari-orlando'],
    productTypes: ['hotels', 'accommodations'],
  },
  {
    id: 'viator',
    name: 'Viator',
    category: 'travel',
    commission: '8% of sales',
    cookieDuration: 30,
    signupUrl: 'https://www.viator.com/affiliate',
    apps: ['javari-travel', 'javari-orlando'],
    productTypes: ['tours', 'activities', 'experiences'],
  },
  {
    id: 'getyourguide',
    name: 'GetYourGuide',
    category: 'travel',
    commission: '8% of sales',
    cookieDuration: 30,
    signupUrl: 'https://partner.getyourguide.com/',
    apps: ['javari-travel', 'javari-orlando'],
    productTypes: ['tours', 'tickets', 'attractions'],
  },

  // ============================================================================
  // LIFESTYLE SECTOR AFFILIATES
  // ============================================================================
  {
    id: 'audible',
    name: 'Audible',
    category: 'lifestyle',
    commission: '$5 per trial signup',
    cookieDuration: 30,
    signupUrl: 'https://www.audible.com/ep/affiliate',
    apps: ['javari-ebook', 'javari-education'],
    productTypes: ['audiobooks'],
  },
  {
    id: 'headspace',
    name: 'Headspace',
    category: 'lifestyle',
    commission: '$10-15 per subscription',
    cookieDuration: 30,
    signupUrl: 'https://www.headspace.com/affiliates',
    apps: ['javari-health', 'javari-fitness'],
    productTypes: ['meditation', 'wellness'],
  },

  // ============================================================================
  // GAMING SECTOR AFFILIATES
  // ============================================================================
  {
    id: 'humble-bundle',
    name: 'Humble Bundle',
    category: 'gaming',
    commission: '10-15% of sales',
    cookieDuration: 30,
    signupUrl: 'https://www.humblebundle.com/partner',
    apps: ['javari-games', 'javari-games-hub', 'javari-game-studio'],
    productTypes: ['games', 'bundles', 'software'],
  },
  {
    id: 'green-man-gaming',
    name: 'Green Man Gaming',
    category: 'gaming',
    commission: '5% of sales',
    cookieDuration: 30,
    signupUrl: 'https://www.greenmangaming.com/affiliates/',
    apps: ['javari-games', 'javari-games-hub'],
    productTypes: ['games', 'pc-games'],
  },
];

// Helper to get affiliates for a specific app
export function getAffiliatesForApp(appId: string): AffiliateProgram[] {
  return AFFILIATE_PROGRAMS.filter(p => p.apps.includes(appId));
}

// Helper to get affiliates for a product type
export function getAffiliatesForProduct(productType: string): AffiliateProgram[] {
  return AFFILIATE_PROGRAMS.filter(p => p.productTypes.includes(productType));
}

export default AFFILIATE_PROGRAMS;
