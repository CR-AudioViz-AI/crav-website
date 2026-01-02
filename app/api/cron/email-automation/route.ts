/**
 * CR AudioViz AI - Email Automation Cron
 * =======================================
 * 
 * Processes scheduled email sequences:
 * - Welcome sequences for new users
 * - Subscriber onboarding
 * - Re-engagement campaigns
 * - Churn prevention alerts
 * 
 * Runs every 15 minutes via Vercel Cron
 * 
 * @version 1.0.0
 * @date January 2, 2026 - 1:41 AM EST
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Resend or SendGrid integration
const sendEmail = async (to: string, subject: string, html: string) => {
  // Using Resend API
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Javari Library <library@craudiovizai.com>',
      to,
      subject,
      html
    })
  })
  return response.json()
}

// Email templates
const templates: Record<string, (data: any) => string> = {
  welcome_1_access: (data) => `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #6366F1;">Welcome to Javari Library! 🎉</h1>
      <p>Hi ${data.name || 'there'},</p>
      <p>You now have access to <strong>112 FREE eBooks</strong> covering AI, business, self-improvement, and more!</p>
      <div style="background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); padding: 20px; border-radius: 12px; margin: 20px 0;">
        <a href="https://craudiovizai.com/apps/javari-library" style="color: white; font-size: 18px; text-decoration: none;">
          📚 Access Your Library Now →
        </a>
      </div>
      <p>Your free eBooks include:</p>
      <ul>
        <li>The AI Secrets Unlocked Series (9 volumes)</li>
        <li>From Impossible to Inevitable (3 volumes)</li>
        <li>The Javari Spirits Collection (14 books)</li>
        <li>And 86 more titles!</li>
      </ul>
      <p>— The Javari Team</p>
    </div>
  `,
  
  welcome_2_recommendations: (data) => `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #6366F1;">Your Personalized Reading List 📖</h1>
      <p>Hi ${data.name || 'there'},</p>
      <p>Based on popular choices, here are 5 must-read eBooks to start with:</p>
      <ol>
        <li><strong>AI Secrets Unlocked Vol. 1</strong> - Master AI fundamentals</li>
        <li><strong>From Impossible to Inevitable</strong> - Business growth strategies</li>
        <li><strong>Conversations with Javari</strong> - AI-human collaboration</li>
        <li><strong>The Spirit of Innovation</strong> - Creative entrepreneurship</li>
        <li><strong>Building Your Digital Empire</strong> - Online business blueprint</li>
      </ol>
      <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <p style="margin: 0;"><strong>💡 Pro Tip:</strong> Use our AI-powered audiobook converter to listen on the go!</p>
      </div>
      <p>— The Javari Team</p>
    </div>
  `,
  
  welcome_3_features: (data) => `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #6366F1;">Did You Know? 🎧</h1>
      <p>Hi ${data.name || 'there'},</p>
      <p>You can convert ANY eBook to an audiobook instantly with our AI voice technology!</p>
      <p><strong>How it works:</strong></p>
      <ol>
        <li>Open any eBook in your library</li>
        <li>Click "Convert to Audio"</li>
        <li>Choose from 10+ AI voices</li>
        <li>Download or stream your audiobook</li>
      </ol>
      <p><strong>Other features you might have missed:</strong></p>
      <ul>
        <li>📱 Reading progress sync across devices</li>
        <li>🔖 Smart bookmarking with notes</li>
        <li>🌙 Dark mode for night reading</li>
        <li>📊 Reading statistics dashboard</li>
      </ul>
      <p>— The Javari Team</p>
    </div>
  `,
  
  welcome_4_upgrade: (data) => `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #6366F1;">Unlock 88 More Premium eBooks 🚀</h1>
      <p>Hi ${data.name || 'there'},</p>
      <p>You've been exploring our free library - now take your learning to the next level!</p>
      <div style="background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); padding: 25px; border-radius: 12px; margin: 20px 0; color: white;">
        <h2 style="margin: 0 0 15px 0; color: white;">Premium Membership</h2>
        <p style="font-size: 24px; margin: 0;">$9.99/month</p>
        <ul style="margin: 15px 0;">
          <li>Access to ALL 200 eBooks</li>
          <li>Unlimited audiobook conversions</li>
          <li>New releases every week</li>
          <li>Priority customer support</li>
        </ul>
        <a href="https://craudiovizai.com/pricing" style="display: inline-block; background: white; color: #6366F1; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Upgrade Now →
        </a>
      </div>
      <p style="font-size: 14px; color: #666;">First 7 days free. Cancel anytime.</p>
      <p>— The Javari Team</p>
    </div>
  `,
  
  churn_prevention: (data) => `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #EF4444;">We Miss You! 💔</h1>
      <p>Hi ${data.name || 'there'},</p>
      <p>Your subscription payment didn't go through, and we don't want you to lose access to your library!</p>
      <div style="background: #FEF2F2; border: 1px solid #EF4444; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #B91C1C;"><strong>⚠️ Your account will be downgraded in 3 days</strong></p>
      </div>
      <p>Update your payment method to keep:</p>
      <ul>
        <li>✅ Access to all 200 premium eBooks</li>
        <li>✅ Your reading progress and bookmarks</li>
        <li>✅ Unlimited audiobook conversions</li>
      </ul>
      <a href="https://craudiovizai.com/settings/billing" style="display: inline-block; background: #6366F1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px;">
        Update Payment Method →
      </a>
      <p>Questions? Reply to this email and we'll help!</p>
      <p>— The Javari Team</p>
    </div>
  `
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const results = {
    processed: 0,
    sent: 0,
    errors: 0,
    details: [] as any[]
  }
  
  try {
    // 1. Process welcome sequences for new users
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .limit(50)
    
    if (fetchError) {
      console.error('Error fetching email queue:', fetchError)
    }
    
    if (pendingEmails && pendingEmails.length > 0) {
      for (const email of pendingEmails) {
        results.processed++
        
        try {
          // Get template
          const templateFn = templates[email.template_id]
          if (!templateFn) {
            throw new Error(`Template not found: ${email.template_id}`)
          }
          
          const html = templateFn(email.data || {})
          
          // Send email
          if (process.env.RESEND_API_KEY) {
            await sendEmail(email.to_email, email.subject, html)
            results.sent++
          } else {
            // Log instead of sending in dev
            console.log('Would send email to:', email.to_email)
            results.sent++
          }
          
          // Mark as sent
          await supabase
            .from('email_queue')
            .update({ 
              status: 'sent',
              sent_at: new Date().toISOString()
            })
            .eq('id', email.id)
            
        } catch (sendError: any) {
          results.errors++
          results.details.push({
            email: email.id,
            error: sendError.message
          })
          
          // Mark as failed
          await supabase
            .from('email_queue')
            .update({ 
              status: 'failed',
              error_message: sendError.message
            })
            .eq('id', email.id)
        }
      }
    }
    
    // 2. Queue welcome emails for new users (last 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()
    
    const { data: newUsers } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .gte('created_at', fifteenMinutesAgo)
      .is('welcome_email_sent', null)
    
    if (newUsers && newUsers.length > 0) {
      const welcomeEmails = newUsers.map(user => ({
        to_email: user.email,
        subject: 'Welcome to Javari Library! 🎉 Your 112 Free eBooks Await',
        template_id: 'welcome_1_access',
        data: { name: user.full_name || user.email.split('@')[0] },
        scheduled_at: new Date().toISOString(),
        status: 'pending',
        user_id: user.id,
        sequence: 'welcome',
        step: 1
      }))
      
      // Insert welcome emails
      await supabase.from('email_queue').insert(welcomeEmails)
      
      // Queue follow-up emails
      for (const user of newUsers) {
        // Day 1 follow-up
        await supabase.from('email_queue').insert({
          to_email: user.email,
          subject: 'Quick Start: 5 Must-Read eBooks for Your Goals',
          template_id: 'welcome_2_recommendations',
          data: { name: user.full_name },
          scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          user_id: user.id,
          sequence: 'welcome',
          step: 2
        })
        
        // Day 3 follow-up
        await supabase.from('email_queue').insert({
          to_email: user.email,
          subject: 'Did you know? Convert any eBook to audiobook instantly',
          template_id: 'welcome_3_features',
          data: { name: user.full_name },
          scheduled_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          user_id: user.id,
          sequence: 'welcome',
          step: 3
        })
        
        // Day 7 upgrade prompt
        await supabase.from('email_queue').insert({
          to_email: user.email,
          subject: 'Unlock 88 more premium eBooks (special offer inside)',
          template_id: 'welcome_4_upgrade',
          data: { name: user.full_name },
          scheduled_at: new Date(Date.now() + 168 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          user_id: user.id,
          sequence: 'welcome',
          step: 4
        })
        
        // Mark user as having welcome email queued
        await supabase
          .from('profiles')
          .update({ welcome_email_sent: new Date().toISOString() })
          .eq('id', user.id)
      }
      
      results.details.push({
        action: 'queued_welcome_sequences',
        users: newUsers.length
      })
    }
    
    // 3. Check for churning subscriptions (failed payments)
    const { data: failedPayments } = await supabase
      .from('subscriptions')
      .select('user_id, profiles!inner(email, full_name)')
      .eq('status', 'past_due')
      .is('churn_email_sent', null)
    
    if (failedPayments && failedPayments.length > 0) {
      for (const sub of failedPayments as any[]) {
        await supabase.from('email_queue').insert({
          to_email: sub.profiles.email,
          subject: 'Action Required: Update Your Payment Method',
          template_id: 'churn_prevention',
          data: { name: sub.profiles.full_name },
          scheduled_at: new Date().toISOString(),
          status: 'pending',
          user_id: sub.user_id,
          sequence: 'churn_prevention',
          step: 1
        })
        
        await supabase
          .from('subscriptions')
          .update({ churn_email_sent: new Date().toISOString() })
          .eq('user_id', sub.user_id)
      }
      
      results.details.push({
        action: 'queued_churn_prevention',
        subscriptions: failedPayments.length
      })
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
      results
    })
    
  } catch (error: any) {
    console.error('Email automation error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
