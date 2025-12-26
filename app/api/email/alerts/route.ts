/**
 * CR AudioViz AI - Centralized Email Alerts API
 * 
 * POST /api/email/alerts - Send deal alerts, price predictions, notifications
 * GET /api/email/alerts - Get user's alert preferences
 * PUT /api/email/alerts - Update alert preferences
 * DELETE /api/email/alerts - Unsubscribe from alerts
 * 
 * ALL apps use this endpoint for email notifications.
 * 
 * @author CR AudioViz AI
 * @created December 25, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { sendDealAlert, sendPricePrediction, sendEmail, DealAlertData, PricePredictionData, EmailType } from '@/lib/email-service';

// Rate limiting - max 100 emails per user per hour
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(userId);
  
  if (!limit || now > limit.resetAt) {
    rateLimits.set(userId, { count: 1, resetAt: now + 3600000 }); // 1 hour
    return true;
  }
  
  if (limit.count >= 100) {
    return false;
  }
  
  limit.count++;
  return true;
}

/**
 * POST - Send email alerts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, to, data, userId, appId } = body;

    // Validate required fields
    if (!type || !to) {
      return NextResponse.json(
        { error: 'Missing required fields: type, to' },
        { status: 400 }
      );
    }

    // Check rate limit
    if (userId && !checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Max 100 emails per hour.' },
        { status: 429 }
      );
    }

    let result;

    switch (type) {
      case 'deal_alert':
        if (!data?.dealType || !data?.originalPrice || !data?.newPrice || !data?.dealUrl) {
          return NextResponse.json(
            { error: 'Missing deal alert data: dealType, originalPrice, newPrice, dealUrl' },
            { status: 400 }
          );
        }
        result = await sendDealAlert(to, data as DealAlertData);
        break;

      case 'price_prediction':
        if (!data?.destination || !data?.currentPrice || !data?.predictedPrice) {
          return NextResponse.json(
            { error: 'Missing prediction data: destination, currentPrice, predictedPrice' },
            { status: 400 }
          );
        }
        result = await sendPricePrediction(to, data as PricePredictionData);
        break;

      default:
        // Generic email
        result = await sendEmail({
          to,
          subject: data?.subject || 'Notification from CR AudioViz AI',
          type: type as EmailType,
          templateData: data,
        });
    }

    // Log the email send
    const supabase = createClient();
    await supabase.from('email_logs').insert({
      user_id: userId,
      app_id: appId,
      email_type: type,
      recipient: Array.isArray(to) ? to.join(',') : to,
      success: result.success,
      message_id: result.messageId,
      error: result.error,
      metadata: data,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });

  } catch (error) {
    console.error('Email alerts API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET - Get user's alert preferences
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Return defaults if no preferences exist
    const preferences = data || {
      deal_alerts: true,
      price_predictions: true,
      booking_confirmations: true,
      newsletters: false,
      system_notifications: true,
      frequency: 'instant', // instant, daily, weekly
    };

    return NextResponse.json({ preferences });

  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to get preferences' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update alert preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, preferences } = body;

    if (!userId || !preferences) {
      return NextResponse.json(
        { error: 'Missing userId or preferences' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { error } = await supabase
      .from('email_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Unsubscribe from all alerts
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const token = searchParams.get('token'); // Unsubscribe token for non-logged-in users

    if (!userId && !token) {
      return NextResponse.json(
        { error: 'Missing userId or unsubscribe token' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    
    // If using token, find user by token
    let targetUserId = userId;
    if (token && !userId) {
      const { data } = await supabase
        .from('email_unsubscribe_tokens')
        .select('user_id')
        .eq('token', token)
        .single();
      targetUserId = data?.user_id;
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe request' },
        { status: 400 }
      );
    }

    // Set all preferences to false
    const { error } = await supabase
      .from('email_preferences')
      .upsert({
        user_id: targetUserId,
        deal_alerts: false,
        price_predictions: false,
        booking_confirmations: true, // Keep transactional
        newsletters: false,
        system_notifications: true, // Keep system alerts
        unsubscribed_at: new Date().toISOString(),
      });

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      message: 'You have been unsubscribed from marketing emails. Transactional emails will continue.'
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
