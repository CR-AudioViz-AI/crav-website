/**
 * CR AudioViz AI - Centralized Email Service
 * 
 * ALL apps must use this for sending emails.
 * Uses Resend API for reliable delivery.
 * 
 * Features:
 * - Deal alerts (price drops, new deals)
 * - Transactional emails (receipts, confirmations)
 * - Marketing emails (newsletters, promotions)
 * - System notifications (errors, security)
 * 
 * @author CR AudioViz AI
 * @created December 25, 2025
 */

import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email types for tracking and templates
export type EmailType = 
  | 'deal_alert'           // Price drop, new deal found
  | 'price_prediction'     // ML prediction notification
  | 'booking_confirmation' // Hotel/ticket booking confirmed
  | 'payment_receipt'      // Payment processed
  | 'subscription_update'  // Plan changed
  | 'welcome'              // New user welcome
  | 'password_reset'       // Security
  | 'security_alert'       // Suspicious activity
  | 'newsletter'           // Marketing newsletter
  | 'system_notification'; // System alerts

export interface EmailOptions {
  to: string | string[];
  subject: string;
  type: EmailType;
  templateData?: Record<string, any>;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: string[];
  scheduledAt?: Date;
}

export interface DealAlertData {
  dealType: 'hotel' | 'ticket' | 'package' | 'dvc' | 'flight';
  destination?: string;
  originalPrice: number;
  newPrice: number;
  savings: number;
  savingsPercent: number;
  dealUrl: string;
  expiresAt?: string;
  imageUrl?: string;
  provider?: string;
}

export interface PricePredictionData {
  destination: string;
  currentPrice: number;
  predictedPrice: number;
  predictedDate: string;
  confidence: number;
  recommendation: 'book_now' | 'wait' | 'uncertain';
  explanation: string;
}

// Default from addresses by type
const FROM_ADDRESSES: Record<EmailType, string> = {
  deal_alert: 'deals@craudiovizai.com',
  price_prediction: 'alerts@craudiovizai.com',
  booking_confirmation: 'bookings@craudiovizai.com',
  payment_receipt: 'billing@craudiovizai.com',
  subscription_update: 'billing@craudiovizai.com',
  welcome: 'welcome@craudiovizai.com',
  password_reset: 'security@craudiovizai.com',
  security_alert: 'security@craudiovizai.com',
  newsletter: 'newsletter@craudiovizai.com',
  system_notification: 'system@craudiovizai.com',
};

/**
 * Send an email using the centralized service
 */
export async function sendEmail(options: EmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const fromAddress = options.from || FROM_ADDRESSES[options.type] || 'noreply@craudiovizai.com';
    
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html || generateHtmlFromTemplate(options.type, options.templateData),
      text: options.text,
      reply_to: options.replyTo,
      tags: options.tags?.map(tag => ({ name: tag, value: 'true' })),
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error('Email service error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Send a deal alert email
 */
export async function sendDealAlert(
  to: string | string[],
  dealData: DealAlertData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const subject = `🔥 ${dealData.savingsPercent}% OFF - ${dealData.dealType.charAt(0).toUpperCase() + dealData.dealType.slice(1)} Deal Alert!`;
  
  return sendEmail({
    to,
    subject,
    type: 'deal_alert',
    templateData: dealData,
  });
}

/**
 * Send a price prediction notification
 */
export async function sendPricePrediction(
  to: string | string[],
  predictionData: PricePredictionData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const actionEmoji = predictionData.recommendation === 'book_now' ? '🚨' : 
                      predictionData.recommendation === 'wait' ? '⏳' : '🤔';
  const subject = `${actionEmoji} Price Prediction: ${predictionData.destination}`;
  
  return sendEmail({
    to,
    subject,
    type: 'price_prediction',
    templateData: predictionData,
  });
}

/**
 * Send a welcome email
 */
export async function sendWelcomeEmail(
  to: string,
  userData: { name: string; plan?: string }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  return sendEmail({
    to,
    subject: `Welcome to CR AudioViz AI, ${userData.name}! 🎉`,
    type: 'welcome',
    templateData: userData,
  });
}

/**
 * Generate HTML from template
 */
function generateHtmlFromTemplate(type: EmailType, data?: Record<string, any>): string {
  const baseStyles = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
      .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
      .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 12px 12px; }
      .btn { display: inline-block; background: #6366F1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; }
      .savings { color: #10B981; font-size: 24px; font-weight: bold; }
      .price-old { color: #9CA3AF; text-decoration: line-through; }
      .price-new { color: #10B981; font-size: 28px; font-weight: bold; }
    </style>
  `;

  switch (type) {
    case 'deal_alert':
      return `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔥 Deal Alert!</h1>
              <p>We found a great deal for you</p>
            </div>
            <div class="content">
              <h2>${data?.dealType?.charAt(0).toUpperCase()}${data?.dealType?.slice(1)} Deal</h2>
              ${data?.destination ? `<p><strong>Destination:</strong> ${data.destination}</p>` : ''}
              <p class="price-old">Was: $${data?.originalPrice?.toFixed(2)}</p>
              <p class="price-new">Now: $${data?.newPrice?.toFixed(2)}</p>
              <p class="savings">You Save: $${data?.savings?.toFixed(2)} (${data?.savingsPercent}% OFF)</p>
              ${data?.expiresAt ? `<p>⏰ Expires: ${data.expiresAt}</p>` : ''}
              <p style="text-align: center; margin-top: 20px;">
                <a href="${data?.dealUrl}" class="btn">Get This Deal →</a>
              </p>
            </div>
            <div class="footer">
              <p>CR AudioViz AI - Your Story. Our Design.</p>
              <p><a href="https://craudiovizai.com/unsubscribe">Unsubscribe</a> | <a href="https://craudiovizai.com/preferences">Email Preferences</a></p>
            </div>
          </div>
        </body>
        </html>
      `;

    case 'price_prediction':
      const recColors: Record<string, string> = {
        book_now: '#EF4444',
        wait: '#F59E0B',
        uncertain: '#6B7280'
      };
      return `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Price Prediction</h1>
              <p>${data?.destination}</p>
            </div>
            <div class="content">
              <p><strong>Current Price:</strong> $${data?.currentPrice?.toFixed(2)}</p>
              <p><strong>Predicted Price:</strong> $${data?.predictedPrice?.toFixed(2)} by ${data?.predictedDate}</p>
              <p><strong>Confidence:</strong> ${data?.confidence}%</p>
              <div style="background: ${recColors[data?.recommendation] || '#6B7280'}; color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <strong>Recommendation:</strong> ${data?.recommendation?.replace('_', ' ').toUpperCase()}
              </div>
              <p>${data?.explanation}</p>
            </div>
            <div class="footer">
              <p>CR AudioViz AI - Powered by AI</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case 'welcome':
      return `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome, ${data?.name}! 🎉</h1>
            </div>
            <div class="content">
              <p>Thanks for joining CR AudioViz AI!</p>
              <p>You now have access to 60+ professional creative tools, AI-powered assistance from Javari, and our entire ecosystem.</p>
              <p style="text-align: center; margin-top: 20px;">
                <a href="https://craudiovizai.com/dashboard" class="btn">Go to Dashboard →</a>
              </p>
            </div>
            <div class="footer">
              <p>Your Story. Our Design.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    default:
      return `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CR AudioViz AI</h1>
            </div>
            <div class="content">
              ${data?.message || 'You have a new notification.'}
            </div>
            <div class="footer">
              <p>CR AudioViz AI - Your Story. Our Design.</p>
            </div>
          </div>
        </body>
        </html>
      `;
  }
}

export default {
  sendEmail,
  sendDealAlert,
  sendPricePrediction,
  sendWelcomeEmail,
};
