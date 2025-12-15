// ============================================================================
// JAVARI AI - AUTONOMOUS SECURITY THREAT HANDLER
// ============================================================================
// Created: Tuesday, November 4, 2025 - 10:12 PM EST
// Purpose: Javari autonomously detects, analyzes, and responds to security threats
// FIXED: Uses lazy initialization to prevent build-time errors
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

// Lazy initialization to prevent build-time errors
let supabase: SupabaseClient | null = null;
let anthropic: Anthropic | null = null;

function getSupabase(): SupabaseClient {
  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Supabase credentials not configured');
    }
    supabase = createClient(url, key);
  }
  return supabase;
}

function getAnthropic(): Anthropic {
  if (!anthropic) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error('Anthropic API key not configured');
    }
    anthropic = new Anthropic({ apiKey: key });
  }
  return anthropic;
}

// ============================================================================
// THREAT SEVERITY SCORING
// ============================================================================

function calculateThreatSeverity(threat: any): 'low' | 'medium' | 'high' | 'critical' {
  const severityScores: Record<string, number> = {
    sql_injection: 90,
    xss_attack: 85,
    path_traversal: 80,
    credential_stuffing: 95,
    ddos_attempt: 95,
    api_abuse: 70,
    rate_limit_exceeded: 50,
    bot_detected: 40,
    suspicious_pattern: 60,
  };

  const baseScore = severityScores[threat.threat_type] || 50;
  let score = baseScore;
  if (threat.repeat_offender) score += 20;
  if (threat.authenticated_user) score += 15;
  
  if (score >= 90) return 'critical';
  if (score >= 70) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

// ============================================================================
// JAVARI THREAT ANALYSIS
// ============================================================================

async function analyzeThreatWithAI(threat: any): Promise<{
  analysis: string;
  confidence_score: number;
  recommended_action: string;
  reasoning: string;
}> {
  try {
    const client = getAnthropic();
    const prompt = `You are Javari AI, a security analyst for CR AudioViz AI. Analyze this security threat:

**Threat Type:** ${threat.threat_type}
**IP Address:** ${threat.ip_address}
**Request URL:** ${threat.request_url}
**Method:** ${threat.request_method}
**User Agent:** ${threat.user_agent}

Respond ONLY with valid JSON:
{
  "is_real_threat": boolean,
  "sophistication_level": "low" | "medium" | "high",
  "recommended_action": "block_immediately" | "trap_in_honeypot" | "monitor_closely" | "ignore",
  "confidence_score": number (0-1),
  "reasoning": string
}`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        analysis: result.is_real_threat ? 'Real threat detected' : 'Likely false positive',
        confidence_score: result.confidence_score || 0.5,
        recommended_action: result.recommended_action || 'monitor_closely',
        reasoning: result.reasoning || 'AI analysis complete'
      };
    }
    
    return {
      analysis: 'Unable to analyze',
      confidence_score: 0.5,
      recommended_action: 'monitor_closely',
      reasoning: 'Failed to parse AI response'
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    return {
      analysis: 'Analysis failed',
      confidence_score: 0,
      recommended_action: 'monitor_closely',
      reasoning: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ============================================================================
// MAIN THREAT HANDLER
// ============================================================================

export async function javariHandleThreat(threat_id: string): Promise<{
  success: boolean;
  action_taken?: string;
  analysis?: any;
  error?: string;
}> {
  try {
    const db = getSupabase();
    
    // Get the threat
    const { data: threat, error: fetchError } = await db
      .from('security_threats')
      .select('*')
      .eq('id', threat_id)
      .single();
    
    if (fetchError || !threat) {
      return { success: false, error: 'Threat not found' };
    }
    
    // Analyze with AI
    const analysis = await analyzeThreatWithAI(threat);
    const severity = calculateThreatSeverity(threat);
    
    // Determine action
    let action_taken = analysis.recommended_action;
    
    // Execute action
    if (action_taken === 'block_immediately' || severity === 'critical') {
      // Add to blocklist
      await db.from('ip_blocklist').upsert({
        ip_address: threat.ip_address,
        reason: `Auto-blocked by Javari: ${threat.threat_type}`,
        blocked_at: new Date().toISOString(),
        expires_at: null // Permanent for critical
      });
      action_taken = 'blocked';
    }
    
    // Update threat record
    await db
      .from('security_threats')
      .update({
        status: 'handled',
        handled_by: 'javari_ai',
        handled_at: new Date().toISOString(),
        action_taken,
        ai_analysis: analysis,
        severity
      })
      .eq('id', threat_id);
    
    // Log activity
    await db.from('security_activity_log').insert({
      threat_id,
      action: action_taken,
      actor: 'javari_ai',
      details: analysis,
      created_at: new Date().toISOString()
    });
    
    return {
      success: true,
      action_taken,
      analysis: {
        ...analysis,
        severity
      }
    };
    
  } catch (error) {
    console.error('Threat handling error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
