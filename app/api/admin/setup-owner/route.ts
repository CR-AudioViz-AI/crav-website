// app/api/admin/setup-owner/route.ts
// One-time setup to configure the platform owner as admin
// Timestamp: Sunday, December 15, 2025 - 9:50 PM EST

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Platform owner email - the ultimate admin
const OWNER_EMAIL = 'royhenderson@craudiovizai.com';

// Alternative owner emails (in case of typos in DB)
const OWNER_EMAILS = [
  'royhenderson@craudiovizai.com',
  'roy@craudiovizai.com',
  'admin@craudiovizai.com',
];

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        details: 'Please sign in first'
      }, { status: 401 });
    }

    // Check if user is owner
    const isOwner = OWNER_EMAILS.includes(user.email?.toLowerCase() || '');
    
    if (!isOwner) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: `Only the platform owner can use this endpoint. Your email: ${user.email}`
      }, { status: 403 });
    }

    // Update profile to admin with unlimited credits
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        role: 'admin',
        plan: 'enterprise',
        credits_balance: 999999,  // Effectively unlimited
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'id' 
      })
      .select()
      .single();

    if (updateError) {
      // Try just updating existing record
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        return NextResponse.json({ 
          error: 'Profile not found',
          details: fetchError.message,
          user_id: user.id,
          user_email: user.email
        }, { status: 404 });
      }

      // Update existing profile
      const { error: patchError } = await supabase
        .from('profiles')
        .update({
          role: 'admin',
          plan: 'enterprise',
          credits_balance: 999999,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (patchError) {
        return NextResponse.json({ 
          error: 'Failed to update profile',
          details: patchError.message
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Admin privileges granted (via update)',
        profile: {
          id: user.id,
          email: user.email,
          role: 'admin',
          plan: 'enterprise',
          credits_balance: 999999
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin privileges granted',
      profile: {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        plan: profile.plan,
        credits_balance: profile.credits_balance
      }
    });

  } catch (error: any) {
    console.error('Setup owner error:', error);
    return NextResponse.json({ 
      error: 'Internal error',
      details: error.message
    }, { status: 500 });
  }
}

// GET to check current status
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ 
        authenticated: false,
        error: 'Not signed in'
      }, { status: 401 });
    }

    const isOwner = OWNER_EMAILS.includes(user.email?.toLowerCase() || '');

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, role, plan, credits_balance')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      authenticated: true,
      is_owner: isOwner,
      user: {
        id: user.id,
        email: user.email
      },
      profile: profile || null,
      needs_setup: isOwner && profile?.role !== 'admin'
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message
    }, { status: 500 });
  }
}
