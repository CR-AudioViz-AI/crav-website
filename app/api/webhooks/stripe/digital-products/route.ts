// app/api/webhooks/stripe/digital-products/route.ts
// CR AudioViz AI - Stripe Webhook for Digital Product Delivery
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

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_DIGITAL_PRODUCTS!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // Only process digital product purchases
      if (session.metadata?.type !== 'digital_product') {
        return NextResponse.json({ received: true, skipped: 'not_digital_product' })
      }

      const productId = session.metadata.product_id
      const userId = session.metadata.user_id

      if (!productId || !userId) {
        console.error('Missing metadata in checkout session:', session.id)
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
      }

      // Get product details
      const { data: product, error: productError } = await supabase
        .from('digital_products')
        .select('*')
        .eq('id', productId)
        .single()

      if (productError || !product) {
        console.error('Product not found:', productId)
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      // Update purchase record
      const { data: purchase, error: updateError } = await supabase
        .from('digital_purchases')
        .update({
          payment_status: 'completed',
          payment_id: session.payment_intent as string,
          delivery_status: 'delivered',
          delivered_at: new Date().toISOString()
        })
        .eq('payment_id', session.id)
        .select()
        .single()

      if (updateError) {
        console.error('Failed to update purchase:', updateError)
        
        // Create purchase if it doesn't exist (fallback)
        const { data: newPurchase, error: createError } = await supabase
          .from('digital_purchases')
          .insert({
            user_id: userId,
            email: session.customer_email!,
            product_id: productId,
            amount_cents: session.amount_total!,
            payment_provider: 'stripe',
            payment_id: session.payment_intent as string,
            payment_status: 'completed',
            delivery_status: 'delivered',
            delivered_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) {
          console.error('Failed to create purchase:', createError)
          return NextResponse.json({ error: 'Purchase creation failed' }, { status: 500 })
        }
      }

      // Generate download URL
      const { data: urlData } = await supabase.storage
        .from('digital-products')
        .createSignedUrl(product.file_path, 86400) // 24 hour expiry

      // Send delivery email
      await sendDeliveryEmail({
        email: session.customer_email!,
        productTitle: product.title,
        downloadUrl: urlData?.signedUrl || '',
        purchaseId: purchase?.id || ''
      })

      console.log(`✅ Digital product delivered: ${product.title} to ${session.customer_email}`)

      return NextResponse.json({ 
        received: true, 
        delivered: true,
        product: product.title 
      })
    }

    // Handle payment_intent.payment_failed
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      
      await supabase
        .from('digital_purchases')
        .update({
          payment_status: 'failed',
          delivery_status: 'failed'
        })
        .eq('payment_id', paymentIntent.id)

      console.log(`❌ Payment failed: ${paymentIntent.id}`)
    }

    // Handle refunds
    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge
      
      await supabase
        .from('digital_purchases')
        .update({
          payment_status: 'refunded'
        })
        .eq('payment_id', charge.payment_intent)

      console.log(`💰 Refund processed: ${charge.payment_intent}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ 
      error: 'Webhook handler failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Send delivery email using your email service
async function sendDeliveryEmail(params: {
  email: string
  productTitle: string
  downloadUrl: string
  purchaseId: string
}) {
  // TODO: Integrate with SendGrid or your email service
  // For now, log the delivery
  console.log(`📧 Delivery email to ${params.email}:`)
  console.log(`   Product: ${params.productTitle}`)
  console.log(`   Download: ${params.downloadUrl}`)
  
  // Example SendGrid integration:
  /*
  const sgMail = require('@sendgrid/mail')
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  
  await sgMail.send({
    to: params.email,
    from: 'noreply@craudiovizai.com',
    subject: `Your Download: ${params.productTitle}`,
    html: `
      <h1>Thank you for your purchase!</h1>
      <p>Your digital product is ready for download:</p>
      <p><strong>${params.productTitle}</strong></p>
      <p><a href="${params.downloadUrl}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Download Now</a></p>
      <p><small>This link expires in 24 hours. You can always re-download from your dashboard.</small></p>
      <hr/>
      <p>CR AudioViz AI - Your Story. Our Design.</p>
    `
  })
  */
}