// app/api/digital-products/purchase/route.ts
// CR AudioViz AI - Digital Product Purchase & Delivery API
// Henderson Standard: Fortune 50 Quality

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
})

// Create purchase checkout session
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { product_id, payment_method = 'stripe' } = await request.json()

    if (!product_id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('digital_products')
      .select('*')
      .eq('id', product_id)
      .eq('is_active', true)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if already purchased
    const { data: existingPurchase } = await supabase
      .from('digital_purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .eq('payment_status', 'completed')
      .single()

    if (existingPurchase) {
      return NextResponse.json({ 
        error: 'Already purchased',
        purchase_id: existingPurchase.id 
      }, { status: 400 })
    }

    // Handle free products
    if (product.price_cents === 0) {
      const { data: purchase, error: purchaseError } = await supabase
        .from('digital_purchases')
        .insert({
          user_id: user.id,
          email: user.email,
          product_id: product_id,
          amount_cents: 0,
          payment_provider: 'free',
          payment_status: 'completed',
          delivery_status: 'delivered',
          delivered_at: new Date().toISOString()
        })
        .select()
        .single()

      if (purchaseError) {
        return NextResponse.json({ error: 'Purchase creation failed' }, { status: 500 })
      }

      // Generate download URL
      const downloadUrl = await generateSignedUrl(product.file_path)

      return NextResponse.json({
        success: true,
        purchase_id: purchase.id,
        download_url: downloadUrl,
        message: 'Free product claimed successfully!'
      })
    }

    // Create Stripe checkout session
    if (payment_method === 'stripe') {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: user.email!,
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.title,
              description: product.description || undefined,
              images: product.cover_image_path 
                ? [`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/digital-products/${product.cover_image_path}`]
                : undefined
            },
            unit_amount: product.price_cents
          },
          quantity: 1
        }],
        metadata: {
          product_id: product_id,
          user_id: user.id,
          type: 'digital_product'
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/purchases/{CHECKOUT_SESSION_ID}?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/marketplace/${product.slug}?canceled=true`
      })

      // Create pending purchase record
      await supabase.from('digital_purchases').insert({
        user_id: user.id,
        email: user.email,
        product_id: product_id,
        amount_cents: product.price_cents,
        payment_provider: 'stripe',
        payment_id: session.id,
        payment_status: 'pending'
      })

      return NextResponse.json({
        checkout_url: session.url,
        session_id: session.id
      })
    }

    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })

  } catch (error) {
    console.error('Purchase API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET: Get user's purchases
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { data: purchases, error } = await supabase
      .from('digital_purchases')
      .select(`
        *,
        product:digital_products(
          id, slug, title, description, cover_image_path, file_type
        )
      `)
      .eq('user_id', user.id)
      .eq('payment_status', 'completed')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ purchases })

  } catch (error) {
    console.error('Get purchases error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper: Generate signed download URL
async function generateSignedUrl(filePath: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await supabase.storage
    .from('digital-products')
    .createSignedUrl(filePath, expiresIn)

  if (error) {
    throw new Error(`Failed to generate download URL: ${error.message}`)
  }

  return data.signedUrl
}