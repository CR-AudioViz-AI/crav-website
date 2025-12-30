// /api/user/onboarding/route.ts
// User Onboarding API - CR AudioViz AI
// Saves onboarding data and triggers welcome flows
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// =============================================================================
// SAVE ONBOARDING DATA
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      name,
      useCase,
      interests,
      experience,
      goals,
      companyName,
      companySize,
      referralSource,
      completedAt
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Update user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: name,
        onboarding_completed: true,
        onboarding_completed_at: completedAt,
        preferences: {
          useCase,
          interests,
          experience,
          goals
        },
        company_name: companyName,
        company_size: companySize,
        referral_source: referralSource,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Profile update error:', profileError);
      throw profileError;
    }

    // Track onboarding completion event
    await supabase.from('analytics_events').insert({
      user_id: userId,
      event_name: 'onboarding_completed',
      event_data: {
        useCase,
        interests,
        experience,
        steps_completed: 6,
        duration_seconds: null // Could calculate from first visit
      }
    });

    // Award welcome credits (if not already awarded)
    const { data: existingCredits } = await supabase
      .from('credits_ledger')
      .select('id')
      .eq('user_id', userId)
      .eq('source', 'welcome_bonus')
      .single();

    if (!existingCredits) {
      // Award 50 welcome credits
      await supabase.from('credits_ledger').insert({
        user_id: userId,
        amount: 50,
        transaction_type: 'credit',
        source: 'welcome_bonus',
        description: 'Welcome bonus for completing onboarding',
        expires_at: null // Never expires
      });

      // Update credits balance
      await supabase.rpc('add_user_credits', {
        p_user_id: userId,
        p_amount: 50
      });

      // Track milestone
      await supabase.from('user_milestones').insert({
        user_id: userId,
        milestone_id: (await supabase
          .from('success_milestones')
          .select('id')
          .eq('name', 'Profile Complete')
          .single()).data?.id
      }).catch(() => {}); // Ignore if already completed
    }

    // Create personalized recommendations based on interests
    const recommendations = generateRecommendations(interests, useCase);

    // Store recommendations
    await supabase
      .from('profiles')
      .update({
        recommended_tools: recommendations.tools,
        recommended_modules: recommendations.modules
      })
      .eq('id', userId);

    // Trigger welcome email (would integrate with email service)
    await triggerWelcomeEmail(userId, name, interests);

    return NextResponse.json({
      success: true,
      recommendations,
      creditsAwarded: existingCredits ? 0 : 50
    });

  } catch (error: any) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// =============================================================================
// GET ONBOARDING STATUS
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        onboarding_completed,
        onboarding_completed_at,
        preferences,
        recommended_tools,
        recommended_modules
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;

    return NextResponse.json({
      completed: profile?.onboarding_completed || false,
      completedAt: profile?.onboarding_completed_at,
      preferences: profile?.preferences,
      recommendations: {
        tools: profile?.recommended_tools || [],
        modules: profile?.recommended_modules || []
      }
    });

  } catch (error: any) {
    console.error('Onboarding status error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateRecommendations(interests: string[], useCase: string) {
  const toolMapping: Record<string, string[]> = {
    writing: ['document-writer', 'blog-generator', 'email-composer'],
    coding: ['code-assistant', 'api-builder', 'debug-helper'],
    design: ['logo-creator', 'social-media-designer', 'image-editor'],
    marketing: ['ad-copy-generator', 'seo-optimizer', 'social-scheduler'],
    research: ['research-assistant', 'summarizer', 'fact-checker'],
    education: ['study-helper', 'quiz-maker', 'flashcard-creator'],
    music: ['audio-tools', 'music-generator', 'podcast-helper'],
    video: ['video-script-writer', 'thumbnail-creator', 'caption-generator'],
    business: ['invoice-generator', 'proposal-writer', 'analytics-dashboard'],
    productivity: ['task-manager', 'calendar-assistant', 'note-organizer'],
    games: ['games-hub', 'trivia-creator', 'game-assistant'],
    social: ['content-calendar', 'hashtag-generator', 'engagement-analyzer']
  };

  const moduleMapping: Record<string, string[]> = {
    personal: ['javari-ai', 'games-hub', 'creative-tools'],
    business: ['javari-ai', 'invoice-generator', 'document-writer', 'analytics'],
    creator: ['logo-creator', 'social-media-designer', 'video-tools', 'audio-tools'],
    developer: ['code-assistant', 'api-builder', 'documentation-generator'],
    student: ['study-helper', 'research-assistant', 'document-writer'],
    other: ['javari-ai', 'creative-tools', 'games-hub']
  };

  // Collect recommended tools based on interests
  const tools = new Set<string>();
  interests.forEach(interest => {
    const interestTools = toolMapping[interest] || [];
    interestTools.forEach(tool => tools.add(tool));
  });

  // Get modules based on use case
  const modules = moduleMapping[useCase] || moduleMapping.other;

  return {
    tools: Array.from(tools).slice(0, 6), // Top 6 tools
    modules: modules.slice(0, 4) // Top 4 modules
  };
}

async function triggerWelcomeEmail(userId: string, name: string, interests: string[]) {
  // This would integrate with an email service like SendGrid, Resend, etc.
  // For now, just log the intent
  console.log(`Would send welcome email to user ${userId}:`, {
    name,
    interests,
    subject: `Welcome to Javari, ${name}! 🎉`,
    template: 'welcome-onboarding'
  });

  // In production:
  // await sendEmail({
  //   to: userEmail,
  //   template: 'welcome-onboarding',
  //   data: { name, interests, recommendedTools }
  // });
}
