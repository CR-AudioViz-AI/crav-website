// /api/moderation/trust/route.ts
// Trust Scores API - CR AudioViz AI
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// GET: Get trust score for user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const includeDetails = searchParams.get('details') === 'true';

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get or create trust score
    let { data: trustScore } = await supabase
      .from('user_trust_scores')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!trustScore) {
      // Create default trust score
      const { data: newScore, error } = await supabase
        .from('user_trust_scores')
        .insert({
          user_id: userId,
          trust_score: 50,
          is_new_user: true
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      trustScore = newScore;
    }

    // Get trust level label
    const trustLevel = getTrustLevel(trustScore.trust_score);

    const response: any = {
      userId,
      trustScore: trustScore.trust_score,
      trustLevel,
      isVerified: {
        email: trustScore.email_verified,
        phone: trustScore.phone_verified,
        identity: trustScore.identity_verified,
        payment: trustScore.payment_verified
      },
      flags: {
        isTrustedSeller: trustScore.is_trusted_seller,
        isTrustedReviewer: trustScore.is_trusted_reviewer,
        isNewUser: trustScore.is_new_user,
        isRestricted: trustScore.is_restricted,
        isBanned: trustScore.is_banned
      }
    };

    if (includeDetails) {
      response.stats = {
        totalFlagged: trustScore.total_content_flagged,
        totalRemoved: trustScore.total_content_removed,
        totalWarnings: trustScore.total_warnings,
        totalSuspensions: trustScore.total_suspensions
      };

      if (trustScore.is_restricted) {
        response.restriction = {
          reason: trustScore.restriction_reason,
          until: trustScore.restriction_until
        };
      }

      if (trustScore.is_banned) {
        response.ban = {
          reason: trustScore.banned_reason,
          at: trustScore.banned_at
        };
      }
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Trust API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Calculate/update trust score
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Calculate new score
    const newScore = await calculateTrustScore(supabase, userId);

    return NextResponse.json({
      success: true,
      userId,
      trustScore: newScore,
      trustLevel: getTrustLevel(newScore)
    });

  } catch (error) {
    console.error('Trust API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update trust score (admin actions)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      adminId,
      action, // 'verify', 'restrict', 'unrestrict', 'ban', 'unban', 'trust_seller', 'trust_reviewer'
      reason,
      duration // For restrictions, in hours
    } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'userId and action required' }, { status: 400 });
    }

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get current state
    const { data: current } = await supabase
      .from('user_trust_scores')
      .select('*')
      .eq('user_id', userId)
      .single();

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    switch (action) {
      case 'verify_email':
        updates.email_verified = true;
        break;
      case 'verify_phone':
        updates.phone_verified = true;
        break;
      case 'verify_identity':
        updates.identity_verified = true;
        break;
      case 'verify_payment':
        updates.payment_verified = true;
        break;

      case 'restrict':
        updates.is_restricted = true;
        updates.restriction_reason = reason;
        if (duration) {
          updates.restriction_until = new Date(Date.now() + duration * 60 * 60 * 1000).toISOString();
        }
        break;

      case 'unrestrict':
        updates.is_restricted = false;
        updates.restriction_reason = null;
        updates.restriction_until = null;
        break;

      case 'ban':
        updates.is_banned = true;
        updates.banned_reason = reason;
        updates.banned_at = new Date().toISOString();
        updates.banned_by = adminId;
        break;

      case 'unban':
        updates.is_banned = false;
        updates.banned_reason = null;
        updates.banned_at = null;
        updates.banned_by = null;
        break;

      case 'trust_seller':
        updates.is_trusted_seller = true;
        updates.is_new_user = false;
        break;

      case 'trust_reviewer':
        updates.is_trusted_reviewer = true;
        updates.is_new_user = false;
        break;

      case 'remove_trust_seller':
        updates.is_trusted_seller = false;
        break;

      case 'remove_trust_reviewer':
        updates.is_trusted_reviewer = false;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Upsert trust score
    const { data, error } = await supabase
      .from('user_trust_scores')
      .upsert({
        user_id: userId,
        ...updates
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log to audit
    await supabase.from('moderation_audit_log').insert({
      actor_id: adminId,
      actor_type: 'admin',
      action: `user_${action}`,
      action_category: 'user_action',
      target_type: 'user',
      target_id: userId,
      previous_state: current,
      new_state: data,
      reason
    });

    return NextResponse.json({
      success: true,
      trustScore: data
    });

  } catch (error) {
    console.error('Trust API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper: Get trust level label
function getTrustLevel(score: number): string {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 50) return 'neutral';
  if (score >= 25) return 'low';
  return 'poor';
}

// Helper: Calculate trust score
async function calculateTrustScore(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<number> {
  let score = 50;

  // Get user data
  const { data: user } = await supabase
    .from('auth.users')
    .select('created_at')
    .eq('id', userId)
    .single();

  // Account age bonus (max +20)
  if (user?.created_at) {
    const ageInDays = Math.floor(
      (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    score += Math.min(Math.floor(ageInDays / 30), 20);
  }

  // Get trust score record
  const { data: trustData } = await supabase
    .from('user_trust_scores')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (trustData) {
    // Verification bonuses
    if (trustData.email_verified) score += 10;
    if (trustData.phone_verified) score += 10;
    if (trustData.identity_verified) score += 15;
    if (trustData.payment_verified) score += 5;

    // Violation penalties
    score -= (trustData.total_warnings || 0) * 5;
    score -= (trustData.total_content_removed || 0) * 10;
    score -= (trustData.total_suspensions || 0) * 20;
  }

  // Clamp to 0-100
  score = Math.max(0, Math.min(100, score));

  // Update stored score
  await supabase
    .from('user_trust_scores')
    .upsert({
      user_id: userId,
      trust_score: score,
      last_calculated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

  return score;
}
