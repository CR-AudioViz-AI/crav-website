// lib/paypal/client.ts
// PayPal API Client for CR AudioViz AI
// Timestamp: Dec 11, 2025 9:51 PM EST

import { PAYPAL_CONFIG, PayPalOrder, PayPalSubscription } from './config';

class PayPalClient {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  private async getAccessToken(): Promise<string> {
    // Return cached token if valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const auth = Buffer.from(
      `${PAYPAL_CONFIG.clientId}:${PAYPAL_CONFIG.clientSecret}`
    ).toString('base64');

    const response = await fetch(`${PAYPAL_CONFIG.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`PayPal auth failed: ${response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    
    return this.accessToken;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAccessToken();
    
    const response = await fetch(`${PAYPAL_CONFIG.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `PayPal API error: ${response.statusText}`);
    }

    return response.json();
  }

  // ============================================
  // ORDER METHODS (One-time purchases)
  // ============================================

  async createOrder(params: {
    amount: number;
    currency?: string;
    description: string;
    customId?: string;
    returnUrl: string;
    cancelUrl: string;
  }): Promise<PayPalOrder> {
    return this.request('/v2/checkout/orders', {
      method: 'POST',
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: params.currency || 'USD',
            value: params.amount.toFixed(2),
          },
          description: params.description,
          custom_id: params.customId,
        }],
        application_context: {
          brand_name: 'CR AudioViz AI',
          landing_page: 'LOGIN',
          user_action: 'PAY_NOW',
          return_url: params.returnUrl,
          cancel_url: params.cancelUrl,
        },
      }),
    });
  }

  async captureOrder(orderId: string): Promise<PayPalOrder> {
    return this.request(`/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
    });
  }

  async getOrder(orderId: string): Promise<PayPalOrder> {
    return this.request(`/v2/checkout/orders/${orderId}`);
  }

  // ============================================
  // SUBSCRIPTION METHODS
  // ============================================

  async createSubscription(params: {
    planId: string;
    customId?: string;
    returnUrl: string;
    cancelUrl: string;
  }): Promise<PayPalSubscription> {
    return this.request('/v1/billing/subscriptions', {
      method: 'POST',
      body: JSON.stringify({
        plan_id: params.planId,
        custom_id: params.customId,
        application_context: {
          brand_name: 'CR AudioViz AI',
          locale: 'en-US',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          return_url: params.returnUrl,
          cancel_url: params.cancelUrl,
        },
      }),
    });
  }

  async getSubscription(subscriptionId: string): Promise<PayPalSubscription> {
    return this.request(`/v1/billing/subscriptions/${subscriptionId}`);
  }

  async cancelSubscription(
    subscriptionId: string, 
    reason: string
  ): Promise<void> {
    await this.request(`/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async suspendSubscription(subscriptionId: string): Promise<void> {
    await this.request(`/v1/billing/subscriptions/${subscriptionId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason: 'Customer requested suspension' }),
    });
  }

  async activateSubscription(subscriptionId: string): Promise<void> {
    await this.request(`/v1/billing/subscriptions/${subscriptionId}/activate`, {
      method: 'POST',
      body: JSON.stringify({ reason: 'Customer reactivated subscription' }),
    });
  }

  // ============================================
  // WEBHOOK VERIFICATION
  // ============================================

  async verifyWebhook(params: {
    webhookId: string;
    headers: Record<string, string>;
    body: string;
  }): Promise<boolean> {
    try {
      const response = await this.request<{ verification_status: string }>(
        '/v1/notifications/verify-webhook-signature',
        {
          method: 'POST',
          body: JSON.stringify({
            auth_algo: params.headers['paypal-auth-algo'],
            cert_url: params.headers['paypal-cert-url'],
            transmission_id: params.headers['paypal-transmission-id'],
            transmission_sig: params.headers['paypal-transmission-sig'],
            transmission_time: params.headers['paypal-transmission-time'],
            webhook_id: params.webhookId,
            webhook_event: JSON.parse(params.body),
          }),
        }
      );
      return response.verification_status === 'SUCCESS';
    } catch (error) {
      console.error('Webhook verification failed:', error);
      return false;
    }
  }

  // ============================================
  // REFUND METHODS
  // ============================================

  async refundCapture(params: {
    captureId: string;
    amount?: number;
    currency?: string;
    reason?: string;
  }): Promise<{ id: string; status: string }> {
    const body: Record<string, unknown> = {};
    
    if (params.amount) {
      body.amount = {
        value: params.amount.toFixed(2),
        currency_code: params.currency || 'USD',
      };
    }
    
    if (params.reason) {
      body.note_to_payer = params.reason;
    }

    return this.request(`/v2/payments/captures/${params.captureId}/refund`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
}

// Export singleton instance
export const paypalClient = new PayPalClient();
