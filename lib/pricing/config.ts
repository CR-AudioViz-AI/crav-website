// lib/pricing/config.ts
// CR AudioViz AI Pricing Configuration
// Based on actual API costs with healthy margins
// Timestamp: Dec 11, 2025 10:45 PM EST

// ============================================
// ACTUAL API COSTS (What We Pay)
// ============================================

export const API_COSTS = {
  // Image Generation (Replicate/SDXL/Flux)
  image: {
    standard: 0.003,      // $0.003 per image (SD)
    hd: 0.008,            // $0.008 per image (SDXL)
    premium: 0.02,        // $0.02 per image (Flux Pro)
  },
  
  // Video Generation
  video: {
    short_5s: 0.05,       // 5 second clip
    medium_15s: 0.15,     // 15 second clip
    long_30s: 0.35,       // 30 second clip
  },
  
  // Audio/Voice
  voice: {
    tts_1k_chars: 0.015,  // ElevenLabs TTS
    clone_setup: 0.50,    // Voice clone setup
    clone_per_1k: 0.03,   // Cloned voice per 1K chars
  },
  
  // Music Generation
  music: {
    short_30s: 0.05,      // 30 second track
    full_3min: 0.20,      // Full song
  },
  
  // LLM (OpenAI/Anthropic)
  llm: {
    gpt4_1k_tokens: 0.03,
    claude_1k_tokens: 0.025,
    gpt35_1k_tokens: 0.002,
  },
  
  // Speech to Text
  stt: {
    per_minute: 0.006,    // Deepgram
  },
  
  // Document Processing
  document: {
    pdf_page: 0.01,
    ocr_page: 0.015,
  },
};

// ============================================
// CREDIT VALUES (What Users Pay)
// Target: 5-10x markup on costs
// 1 Credit = $0.10 value
// ============================================

export const CREDIT_COSTS = {
  // Image Generation
  'image-standard': { credits: 5, cost: API_COSTS.image.standard, margin: 16.6 },
  'image-hd': { credits: 10, cost: API_COSTS.image.hd, margin: 12.5 },
  'image-premium': { credits: 25, cost: API_COSTS.image.premium, margin: 12.5 },
  
  // Video Generation
  'video-short': { credits: 50, cost: API_COSTS.video.short_5s, margin: 10 },
  'video-medium': { credits: 150, cost: API_COSTS.video.medium_15s, margin: 10 },
  'video-long': { credits: 350, cost: API_COSTS.video.long_30s, margin: 10 },
  
  // Voice/TTS
  'voice-tts': { credits: 5, cost: API_COSTS.voice.tts_1k_chars, margin: 3.3 },
  'voice-clone-setup': { credits: 100, cost: API_COSTS.voice.clone_setup, margin: 20 },
  'voice-clone-use': { credits: 10, cost: API_COSTS.voice.clone_per_1k, margin: 3.3 },
  
  // Music
  'music-short': { credits: 15, cost: API_COSTS.music.short_30s, margin: 30 },
  'music-full': { credits: 50, cost: API_COSTS.music.full_3min, margin: 25 },
  
  // AI Chat/Assist
  'ai-chat': { credits: 1, cost: API_COSTS.llm.gpt35_1k_tokens, margin: 50 },
  'ai-advanced': { credits: 3, cost: API_COSTS.llm.claude_1k_tokens, margin: 12 },
  
  // Transcription
  'transcribe': { credits: 2, cost: API_COSTS.stt.per_minute, margin: 33 },
  
  // Document
  'doc-process': { credits: 3, cost: API_COSTS.document.pdf_page, margin: 30 },
};

// ============================================
// SUBSCRIPTION PLANS
// ============================================

export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    credits_monthly: 25,
    credits_expire: true, // Free credits expire monthly
    features: [
      '25 credits/month',
      'Basic tools access',
      'Community support',
      'Watermarked outputs',
    ],
    limits: {
      max_image_size: '512x512',
      max_video_length: 5,
      storage_mb: 100,
    },
  },
  
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 9.99,
    credits_monthly: 150,
    credits_expire: false, // NEVER EXPIRE
    stripe_price_id: process.env.STRIPE_STARTER_PRICE_ID,
    paypal_plan_id: process.env.PAYPAL_STARTER_PLAN_ID,
    features: [
      '150 credits/month (never expire)',
      'All basic tools',
      'No watermarks',
      'Email support',
      '1GB storage',
    ],
    limits: {
      max_image_size: '1024x1024',
      max_video_length: 15,
      storage_mb: 1024,
    },
    // Cost analysis
    cost_estimate: 1.50, // ~$1.50 if they use all credits at avg cost
    profit_margin: 0.85, // 85% margin
  },
  
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 29.99,
    credits_monthly: 500,
    credits_expire: false,
    stripe_price_id: process.env.STRIPE_PRO_PRICE_ID,
    paypal_plan_id: process.env.PAYPAL_PRO_PLAN_ID,
    features: [
      '500 credits/month (never expire)',
      'All tools including premium',
      'Priority processing',
      'Priority support',
      '10GB storage',
      'API access',
    ],
    limits: {
      max_image_size: '2048x2048',
      max_video_length: 30,
      storage_mb: 10240,
    },
    cost_estimate: 5.00,
    profit_margin: 0.83,
  },
  
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 99.99,
    credits_monthly: 2000,
    credits_expire: false,
    stripe_price_id: process.env.STRIPE_PREMIUM_PRICE_ID,
    paypal_plan_id: process.env.PAYPAL_PREMIUM_PLAN_ID,
    features: [
      '2,000 credits/month (never expire)',
      'All tools, no limits',
      'Instant processing',
      'Dedicated support',
      '100GB storage',
      'Full API access',
      'Custom model training',
      'White-label options',
    ],
    limits: {
      max_image_size: '4096x4096',
      max_video_length: 60,
      storage_mb: 102400,
    },
    cost_estimate: 20.00,
    profit_margin: 0.80,
  },
  
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: null, // Custom pricing
    credits_monthly: null, // Custom
    credits_expire: false,
    features: [
      'Custom credit allocation',
      'Dedicated infrastructure',
      'SLA guarantee',
      '24/7 priority support',
      'Unlimited storage',
      'Custom integrations',
      'On-premise options',
      'Team management',
    ],
    limits: {
      max_image_size: 'unlimited',
      max_video_length: 'unlimited',
      storage_mb: 'unlimited',
    },
  },
};

// ============================================
// CREDIT PACKS (One-time Purchases)
// ============================================

export const CREDIT_PACKS = {
  small: {
    id: 'small',
    name: 'Starter Pack',
    credits: 50,
    price: 4.99,
    price_per_credit: 0.0998,
    bonus: 0,
  },
  
  medium: {
    id: 'medium',
    name: 'Creator Pack',
    credits: 150,
    price: 12.99,
    price_per_credit: 0.0866,
    bonus: 0,
    popular: true,
  },
  
  large: {
    id: 'large',
    name: 'Pro Pack',
    credits: 500,
    price: 39.99,
    price_per_credit: 0.0800,
    bonus: 25, // 5% bonus
  },
  
  xl: {
    id: 'xl',
    name: 'Studio Pack',
    credits: 1200,
    price: 89.99,
    price_per_credit: 0.0750,
    bonus: 100, // ~8% bonus
  },
  
  mega: {
    id: 'mega',
    name: 'Agency Pack',
    credits: 3000,
    price: 199.99,
    price_per_credit: 0.0667,
    bonus: 500, // ~17% bonus
  },
};

// ============================================
// TOOLS REGISTRY (What Javari Can Use)
// ============================================

export const TOOLS_REGISTRY = [
  // IMAGE GENERATION
  {
    id: 'image-generator',
    name: 'AI Image Generator',
    category: 'image',
    description: 'Create stunning images from text descriptions',
    base_credits: 10,
    api_provider: 'replicate',
    tiers: {
      standard: { credits: 5, model: 'stability-ai/sdxl' },
      hd: { credits: 10, model: 'stability-ai/sdxl' },
      premium: { credits: 25, model: 'black-forest-labs/flux-pro' },
    },
  },
  {
    id: 'image-editor',
    name: 'AI Image Editor',
    category: 'image',
    description: 'Edit and enhance images with AI',
    base_credits: 8,
    api_provider: 'replicate',
  },
  {
    id: 'background-remover',
    name: 'Background Remover',
    category: 'image',
    description: 'Remove backgrounds instantly',
    base_credits: 3,
    api_provider: 'replicate',
  },
  {
    id: 'image-upscaler',
    name: 'Image Upscaler',
    category: 'image',
    description: 'Upscale images up to 4x',
    base_credits: 5,
    api_provider: 'replicate',
  },
  {
    id: 'face-swap',
    name: 'Face Swap',
    category: 'image',
    description: 'Swap faces in images',
    base_credits: 8,
    api_provider: 'replicate',
  },
  {
    id: 'style-transfer',
    name: 'Style Transfer',
    category: 'image',
    description: 'Apply artistic styles to images',
    base_credits: 6,
    api_provider: 'replicate',
  },
  
  // VIDEO GENERATION
  {
    id: 'video-generator',
    name: 'AI Video Generator',
    category: 'video',
    description: 'Create videos from text or images',
    base_credits: 50,
    api_provider: 'replicate',
    tiers: {
      short: { credits: 50, duration: 5 },
      medium: { credits: 150, duration: 15 },
      long: { credits: 350, duration: 30 },
    },
  },
  {
    id: 'video-editor',
    name: 'AI Video Editor',
    category: 'video',
    description: 'Edit videos with AI assistance',
    base_credits: 30,
    api_provider: 'custom',
  },
  {
    id: 'lipsync',
    name: 'Lip Sync Video',
    category: 'video',
    description: 'Sync lips to audio',
    base_credits: 40,
    api_provider: 'replicate',
  },
  
  // AUDIO
  {
    id: 'text-to-speech',
    name: 'Text to Speech',
    category: 'audio',
    description: 'Convert text to natural speech',
    base_credits: 5,
    api_provider: 'elevenlabs',
  },
  {
    id: 'voice-clone',
    name: 'Voice Clone',
    category: 'audio',
    description: 'Clone any voice with 30 seconds of audio',
    base_credits: 100,
    api_provider: 'elevenlabs',
  },
  {
    id: 'music-generator',
    name: 'AI Music Generator',
    category: 'audio',
    description: 'Create original music from descriptions',
    base_credits: 15,
    api_provider: 'replicate',
    tiers: {
      short: { credits: 15, duration: 30 },
      full: { credits: 50, duration: 180 },
    },
  },
  {
    id: 'audio-enhancer',
    name: 'Audio Enhancer',
    category: 'audio',
    description: 'Clean and enhance audio quality',
    base_credits: 5,
    api_provider: 'replicate',
  },
  {
    id: 'transcription',
    name: 'Audio Transcription',
    category: 'audio',
    description: 'Convert speech to text',
    base_credits: 2,
    api_provider: 'deepgram',
  },
  
  // TEXT/DOCUMENT
  {
    id: 'ai-writer',
    name: 'AI Writer',
    category: 'text',
    description: 'Generate articles, blogs, and content',
    base_credits: 3,
    api_provider: 'anthropic',
  },
  {
    id: 'code-generator',
    name: 'Code Generator',
    category: 'text',
    description: 'Generate code in any language',
    base_credits: 5,
    api_provider: 'anthropic',
  },
  {
    id: 'document-analyzer',
    name: 'Document Analyzer',
    category: 'text',
    description: 'Analyze and summarize documents',
    base_credits: 3,
    api_provider: 'anthropic',
  },
  {
    id: 'translator',
    name: 'AI Translator',
    category: 'text',
    description: 'Translate text between languages',
    base_credits: 2,
    api_provider: 'anthropic',
  },
  
  // UTILITY
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    category: 'utility',
    description: 'Create beautiful QR codes',
    base_credits: 1,
    api_provider: 'custom',
  },
  {
    id: 'meme-generator',
    name: 'Meme Generator',
    category: 'utility',
    description: 'Create memes with AI',
    base_credits: 2,
    api_provider: 'custom',
  },
];

// ============================================
// PROFIT CALCULATIONS
// ============================================

export function calculateProfit(plan: keyof typeof SUBSCRIPTION_PLANS) {
  const p = SUBSCRIPTION_PLANS[plan];
  if (!p.price || !p.cost_estimate) return null;
  
  return {
    revenue: p.price,
    estimated_cost: p.cost_estimate,
    gross_profit: p.price - p.cost_estimate,
    margin_percent: ((p.price - p.cost_estimate) / p.price) * 100,
  };
}

export function calculateCreditPackProfit(packId: keyof typeof CREDIT_PACKS) {
  const pack = CREDIT_PACKS[packId];
  // Assume 60% of credits are used on average
  const avgCostPerCredit = 0.01; // ~$0.01 per credit average cost
  const estimatedCost = (pack.credits + pack.bonus) * avgCostPerCredit * 0.6;
  
  return {
    revenue: pack.price,
    estimated_cost: estimatedCost,
    gross_profit: pack.price - estimatedCost,
    margin_percent: ((pack.price - estimatedCost) / pack.price) * 100,
  };
}

// Example profit analysis:
// Starter Plan ($9.99):
//   - 150 credits @ ~$0.01 avg = $1.50 cost
//   - Profit: $8.49 (85% margin)
//
// Pro Plan ($29.99):
//   - 500 credits @ ~$0.01 avg = $5.00 cost
//   - Profit: $24.99 (83% margin)
//
// Premium Plan ($99.99):
//   - 2000 credits @ ~$0.01 avg = $20.00 cost
//   - Profit: $79.99 (80% margin)

