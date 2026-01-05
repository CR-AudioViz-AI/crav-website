// ================================================================================
// AI PROVIDER REGISTRY API - /api/providers
// Dynamic provider list for Javari UI selector
// ================================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

// Full provider registry
const PROVIDER_REGISTRY = [
  // Premium Providers
  {
    provider_id: 'anthropic',
    display_name: 'Claude (Anthropic)',
    type: 'premium',
    status: 'active',
    capabilities: ['chat', 'reasoning', 'code', 'vision', 'documents'],
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku', 'claude-3.5-sonnet'],
    supports_tools: true,
    supports_vision: true,
    supports_uploads: true,
    cost_tier: 'high',
    latency_tier: 'medium',
    icon: '/icons/anthropic.svg',
  },
  {
    provider_id: 'openai',
    display_name: 'GPT-4 (OpenAI)',
    type: 'premium',
    status: 'active',
    capabilities: ['chat', 'reasoning', 'code', 'vision', 'audio'],
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o1-preview', 'o1-mini'],
    supports_tools: true,
    supports_vision: true,
    supports_uploads: true,
    cost_tier: 'high',
    latency_tier: 'medium',
    icon: '/icons/openai.svg',
  },
  {
    provider_id: 'google',
    display_name: 'Gemini (Google)',
    type: 'premium',
    status: 'active',
    capabilities: ['chat', 'reasoning', 'code', 'vision', 'multimodal'],
    models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    supports_tools: true,
    supports_vision: true,
    supports_uploads: true,
    cost_tier: 'medium',
    latency_tier: 'fast',
    icon: '/icons/google.svg',
  },
  // Fast/Cost-Optimized
  {
    provider_id: 'groq',
    display_name: 'Groq (Ultra-Fast)',
    type: 'fast',
    status: 'active',
    capabilities: ['chat', 'code'],
    models: ['llama-3.3-70b', 'llama-3.1-8b', 'mixtral-8x7b'],
    supports_tools: true,
    supports_vision: false,
    supports_uploads: false,
    cost_tier: 'low',
    latency_tier: 'ultra-fast',
    icon: '/icons/groq.svg',
  },
  {
    provider_id: 'together',
    display_name: 'Together AI',
    type: 'cost-optimized',
    status: 'active',
    capabilities: ['chat', 'code', 'embeddings'],
    models: ['llama-3.2-90b', 'mixtral-8x22b', 'qwen-2.5-72b'],
    supports_tools: true,
    supports_vision: true,
    supports_uploads: false,
    cost_tier: 'low',
    latency_tier: 'fast',
    icon: '/icons/together.svg',
  },
  {
    provider_id: 'fireworks',
    display_name: 'Fireworks AI',
    type: 'cost-optimized',
    status: 'active',
    capabilities: ['chat', 'code', 'function-calling'],
    models: ['llama-v3p3-70b', 'mixtral-8x22b-instruct'],
    supports_tools: true,
    supports_vision: false,
    supports_uploads: false,
    cost_tier: 'low',
    latency_tier: 'fast',
    icon: '/icons/fireworks.svg',
  },
  {
    provider_id: 'mistral',
    display_name: 'Mistral AI',
    type: 'cost-optimized',
    status: 'active',
    capabilities: ['chat', 'code', 'multilingual'],
    models: ['mistral-large', 'mistral-medium', 'mistral-small'],
    supports_tools: true,
    supports_vision: false,
    supports_uploads: false,
    cost_tier: 'medium',
    latency_tier: 'fast',
    icon: '/icons/mistral.svg',
  },
  // Specialized
  {
    provider_id: 'perplexity',
    display_name: 'Perplexity (Search)',
    type: 'specialized',
    status: 'active',
    capabilities: ['search', 'research', 'citations'],
    models: ['sonar-pro', 'sonar'],
    supports_tools: false,
    supports_vision: false,
    supports_uploads: false,
    cost_tier: 'medium',
    latency_tier: 'medium',
    icon: '/icons/perplexity.svg',
  },
  {
    provider_id: 'elevenlabs',
    display_name: 'ElevenLabs (Voice)',
    type: 'specialized',
    status: 'active',
    capabilities: ['tts', 'voice-cloning', 'audio'],
    models: ['eleven_multilingual_v2', 'eleven_turbo_v2'],
    supports_tools: false,
    supports_vision: false,
    supports_uploads: true,
    cost_tier: 'medium',
    latency_tier: 'fast',
    icon: '/icons/elevenlabs.svg',
  },
  {
    provider_id: 'replicate',
    display_name: 'Replicate (Images)',
    type: 'specialized',
    status: 'active',
    capabilities: ['image-gen', 'video', 'audio'],
    models: ['flux-1.1-pro', 'sdxl', 'stable-video'],
    supports_tools: false,
    supports_vision: true,
    supports_uploads: true,
    cost_tier: 'medium',
    latency_tier: 'slow',
    icon: '/icons/replicate.svg',
  },
  {
    provider_id: 'd-id',
    display_name: 'D-ID (Avatars)',
    type: 'specialized',
    status: 'active',
    capabilities: ['avatar', 'video-generation', 'lip-sync'],
    models: ['talks', 'clips'],
    supports_tools: false,
    supports_vision: false,
    supports_uploads: true,
    cost_tier: 'high',
    latency_tier: 'slow',
    icon: '/icons/d-id.svg',
  },
  {
    provider_id: 'deepgram',
    display_name: 'Deepgram (Transcription)',
    type: 'specialized',
    status: 'active',
    capabilities: ['stt', 'transcription', 'diarization'],
    models: ['nova-2', 'whisper-large'],
    supports_tools: false,
    supports_vision: false,
    supports_uploads: true,
    cost_tier: 'low',
    latency_tier: 'fast',
    icon: '/icons/deepgram.svg',
  },
  // Auto Router
  {
    provider_id: 'auto',
    display_name: 'Auto (Smart Routing)',
    type: 'router',
    status: 'active',
    capabilities: ['all'],
    models: ['auto-select'],
    supports_tools: true,
    supports_vision: true,
    supports_uploads: true,
    cost_tier: 'optimized',
    latency_tier: 'adaptive',
    icon: '/icons/javari.svg',
    description: 'Javari automatically selects the best provider for each task',
  },
];

// GET - List all providers
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const status = searchParams.get('status') || 'active';
  const capability = searchParams.get('capability');

  let providers = PROVIDER_REGISTRY;

  // Filter by type
  if (type) {
    providers = providers.filter(p => p.type === type);
  }

  // Filter by status
  if (status !== 'all') {
    providers = providers.filter(p => p.status === status);
  }

  // Filter by capability
  if (capability) {
    providers = providers.filter(p => p.capabilities.includes(capability));
  }

  return NextResponse.json({
    providers,
    count: providers.length,
    types: ['premium', 'fast', 'cost-optimized', 'specialized', 'router'],
  });
}

// POST - Update provider status (admin only)
export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { provider_id, status, enabled } = body;

    // Store provider config in DB
    const { data, error } = await supabase
      .from('feature_flags')
      .upsert({
        flag_name: `provider_${provider_id}_enabled`,
        flag_value: enabled ?? (status === 'active'),
        metadata: { provider_id, updated_at: new Date().toISOString() },
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      updated: true,
      provider_id,
      enabled: data.flag_value,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
