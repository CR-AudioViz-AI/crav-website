/**
 * CR AudioViz AI - Centralized AI Predictions API
 * 
 * POST /api/ai/predictions - Get AI predictions
 * 
 * ALL apps use this endpoint for ML predictions.
 * 
 * @author CR AudioViz AI
 * @created December 25, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { getPrediction, PredictionRequest } from '@/lib/ai-predictions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, domain, data, options, userId, appId } = body;

    // Validate required fields
    if (!type || !domain || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: type, domain, data' },
        { status: 400 }
      );
    }

    // Build prediction request
    const predictionRequest: PredictionRequest = {
      type,
      domain,
      data,
      options,
    };

    // Get prediction
    const result = await getPrediction(predictionRequest);

    // Log the prediction
    const supabase = createClient();
    await supabase.from('ai_predictions_log').insert({
      user_id: userId,
      app_id: appId,
      prediction_type: type,
      domain,
      input_data: data,
      result: result.prediction,
      success: result.success,
      credits_used: result.credits_used || 0,
      error: result.error,
    });

    // Deduct credits if user is logged in
    if (userId && result.credits_used) {
      await supabase.rpc('deduct_credits', {
        p_user_id: userId,
        p_amount: result.credits_used,
        p_description: `AI prediction: ${type}`,
        p_app_id: appId,
      });
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Prediction failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      prediction: result.prediction,
      credits_used: result.credits_used,
    });

  } catch (error) {
    console.error('AI predictions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Return available prediction types
  return NextResponse.json({
    available_types: [
      {
        type: 'price_forecast',
        description: 'Predict future prices for travel, hotels, products',
        domains: ['travel', 'finance', 'ecommerce'],
        credits: '2-5',
      },
      {
        type: 'demand_forecast',
        description: 'Predict demand and availability',
        domains: ['travel', 'ecommerce'],
        credits: '2',
      },
      {
        type: 'sentiment',
        description: 'Analyze sentiment in reviews/text',
        domains: ['general'],
        credits: '1',
      },
      {
        type: 'recommendation',
        description: 'Generate personalized recommendations',
        domains: ['travel', 'finance', 'ecommerce', 'general'],
        credits: '5',
      },
      {
        type: 'anomaly_detection',
        description: 'Detect unusual patterns in data',
        domains: ['finance', 'general'],
        credits: '2',
      },
      {
        type: 'trend_analysis',
        description: 'Analyze trends and predict directions',
        domains: ['travel', 'finance', 'ecommerce', 'general'],
        credits: '5',
      },
    ],
  });
}
