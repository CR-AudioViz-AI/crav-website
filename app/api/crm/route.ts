/**
 * CR AudioViz AI - Central CRM API
 * Customer relationship management across all apps
 * 
 * @author CR AudioViz AI, LLC
 * @created December 31, 2025
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/crm - Get customer data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customer_id = searchParams.get('customer_id');
    const email = searchParams.get('email');
    const segment = searchParams.get('segment');

    if (customer_id) {
      // Get single customer
      const { data, error } = await supabase
        .from('crm_customers')
        .select('*, crm_customer_tags(*), crm_customer_apps(*)')
        .eq('id', customer_id)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      return NextResponse.json({ customer: data });
    }

    if (email) {
      // Find by email
      const { data, error } = await supabase
        .from('crm_customers')
        .select('*, crm_customer_tags(*)')
        .eq('email', email)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }
      return NextResponse.json({ customer: data });
    }

    if (segment) {
      // Get customers by segment
      const { data, error } = await supabase
        .from('crm_customers')
        .select('*')
        .contains('segments', [segment])
        .limit(100);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ customers: data, count: data?.length || 0 });
    }

    // Return all segments
    const { data: segments } = await supabase
      .from('crm_segments')
      .select('*')
      .order('name');

    return NextResponse.json({ segments: segments || [] });
  } catch (error) {
    console.error('CRM GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/crm - Create or update customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      user_id,
      email, 
      name, 
      metadata,
      tags,
      app_id,
      action 
    } = body;

    if (!email && !user_id) {
      return NextResponse.json(
        { error: 'email or user_id is required' },
        { status: 400 }
      );
    }

    // Upsert customer
    const { data: customer, error: customerError } = await supabase
      .from('crm_customers')
      .upsert({
        user_id: user_id || null,
        email,
        name: name || null,
        metadata: metadata || {},
        updated_at: new Date().toISOString()
      }, {
        onConflict: user_id ? 'user_id' : 'email'
      })
      .select()
      .single();

    if (customerError) {
      console.error('CRM upsert error:', customerError);
      return NextResponse.json({ error: customerError.message }, { status: 500 });
    }

    // Add tags if provided
    if (tags && Array.isArray(tags) && customer) {
      for (const tag of tags) {
        await supabase
          .from('crm_customer_tags')
          .upsert({
            customer_id: customer.id,
            tag,
            created_at: new Date().toISOString()
          }, {
            onConflict: 'customer_id,tag'
          });
      }
    }

    // Track app usage if provided
    if (app_id && customer) {
      await supabase
        .from('crm_customer_apps')
        .upsert({
          customer_id: customer.id,
          app_id,
          last_used: new Date().toISOString(),
          usage_count: 1
        }, {
          onConflict: 'customer_id,app_id'
        });
    }

    return NextResponse.json({ success: true, customer });
  } catch (error) {
    console.error('CRM POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/crm - Update customer tags/segments
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_id, add_tags, remove_tags, segments } = body;

    if (!customer_id) {
      return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
    }

    // Add tags
    if (add_tags && Array.isArray(add_tags)) {
      for (const tag of add_tags) {
        await supabase
          .from('crm_customer_tags')
          .upsert({
            customer_id,
            tag,
            created_at: new Date().toISOString()
          });
      }
    }

    // Remove tags
    if (remove_tags && Array.isArray(remove_tags)) {
      await supabase
        .from('crm_customer_tags')
        .delete()
        .eq('customer_id', customer_id)
        .in('tag', remove_tags);
    }

    // Update segments
    if (segments) {
      await supabase
        .from('crm_customers')
        .update({ segments, updated_at: new Date().toISOString() })
        .eq('id', customer_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('CRM PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
