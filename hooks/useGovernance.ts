// /hooks/useGovernance.ts
// Data Governance & Privacy Hook - CR AudioViz AI
// Consent management, data requests, privacy controls

import { useState, useCallback, useEffect } from 'react';

// =============================================================================
// TYPES
// =============================================================================

export type ConsentType = 
  | 'terms_of_service'
  | 'privacy_policy'
  | 'marketing_email'
  | 'marketing_sms'
  | 'marketing_push'
  | 'data_processing'
  | 'ai_training'
  | 'analytics'
  | 'third_party_sharing'
  | 'cookies_essential'
  | 'cookies_functional'
  | 'cookies_analytics'
  | 'cookies_advertising';

export type RequestType = 
  | 'access'
  | 'portability'
  | 'rectification'
  | 'erasure'
  | 'restriction'
  | 'objection'
  | 'do_not_sell'
  | 'know'
  | 'delete';

export interface Consent {
  id: string;
  user_id: string;
  consent_type: ConsentType;
  granted: boolean;
  granted_at: string | null;
  revoked_at: string | null;
  version: string;
  created_at: string;
  updated_at: string;
}

export interface DataRequest {
  id: string;
  user_id: string;
  request_type: RequestType;
  email: string;
  status: 'pending' | 'verifying' | 'in_progress' | 'completed' | 'rejected' | 'expired';
  due_date: string;
  result_url: string | null;
  result_expires_at: string | null;
  created_at: string;
}

export interface ConsentGroup {
  title: string;
  description: string;
  consents: ConsentType[];
  required?: boolean;
}

// =============================================================================
// CONSENT GROUPS (for UI organization)
// =============================================================================

export const CONSENT_GROUPS: ConsentGroup[] = [
  {
    title: 'Essential',
    description: 'Required for the platform to function',
    consents: ['terms_of_service', 'privacy_policy', 'cookies_essential'],
    required: true
  },
  {
    title: 'Marketing',
    description: 'How we communicate with you',
    consents: ['marketing_email', 'marketing_sms', 'marketing_push']
  },
  {
    title: 'Data & AI',
    description: 'How we use your data to improve our services',
    consents: ['data_processing', 'ai_training', 'analytics', 'third_party_sharing']
  },
  {
    title: 'Cookies',
    description: 'Website tracking preferences',
    consents: ['cookies_functional', 'cookies_analytics', 'cookies_advertising']
  }
];

export const CONSENT_LABELS: Record<ConsentType, { label: string; description: string }> = {
  terms_of_service: {
    label: 'Terms of Service',
    description: 'Agreement to our terms and conditions'
  },
  privacy_policy: {
    label: 'Privacy Policy',
    description: 'Acknowledgment of our privacy practices'
  },
  marketing_email: {
    label: 'Email Marketing',
    description: 'Receive promotional emails and newsletters'
  },
  marketing_sms: {
    label: 'SMS Marketing',
    description: 'Receive promotional text messages'
  },
  marketing_push: {
    label: 'Push Notifications',
    description: 'Receive push notifications about offers'
  },
  data_processing: {
    label: 'Data Processing',
    description: 'Allow processing of your data for service delivery'
  },
  ai_training: {
    label: 'AI Training',
    description: 'Allow your interactions to improve our AI'
  },
  analytics: {
    label: 'Analytics',
    description: 'Help us understand how you use our platform'
  },
  third_party_sharing: {
    label: 'Third-Party Sharing',
    description: 'Share data with trusted partners'
  },
  cookies_essential: {
    label: 'Essential Cookies',
    description: 'Required for basic site functionality'
  },
  cookies_functional: {
    label: 'Functional Cookies',
    description: 'Remember your preferences and settings'
  },
  cookies_analytics: {
    label: 'Analytics Cookies',
    description: 'Track site usage and performance'
  },
  cookies_advertising: {
    label: 'Advertising Cookies',
    description: 'Show relevant ads based on your interests'
  }
};

export const REQUEST_LABELS: Record<RequestType, { label: string; description: string; regulation: string }> = {
  access: {
    label: 'Access My Data',
    description: 'Get a copy of all data we have about you',
    regulation: 'GDPR Article 15'
  },
  portability: {
    label: 'Data Portability',
    description: 'Download your data in a machine-readable format',
    regulation: 'GDPR Article 20'
  },
  rectification: {
    label: 'Correct My Data',
    description: 'Request correction of inaccurate data',
    regulation: 'GDPR Article 16'
  },
  erasure: {
    label: 'Delete My Data',
    description: 'Request deletion of your personal data',
    regulation: 'GDPR Article 17'
  },
  restriction: {
    label: 'Restrict Processing',
    description: 'Limit how we use your data',
    regulation: 'GDPR Article 18'
  },
  objection: {
    label: 'Object to Processing',
    description: 'Object to specific uses of your data',
    regulation: 'GDPR Article 21'
  },
  do_not_sell: {
    label: 'Do Not Sell My Data',
    description: 'Opt out of data sales to third parties',
    regulation: 'CCPA'
  },
  know: {
    label: 'Right to Know',
    description: 'Know what data we collect and why',
    regulation: 'CCPA'
  },
  delete: {
    label: 'Delete My Data (CCPA)',
    description: 'Request deletion under California law',
    regulation: 'CCPA'
  }
};

// =============================================================================
// HOOK
// =============================================================================

interface UseGovernanceOptions {
  userId: string;
  autoLoad?: boolean;
  policyVersion?: string;
}

export function useGovernance(options: UseGovernanceOptions) {
  const { userId, autoLoad = true, policyVersion = '1.0' } = options;
  
  const [consents, setConsents] = useState<Consent[]>([]);
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =============================================================================
  // LOAD DATA
  // =============================================================================

  const loadConsents = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/governance?action=consents&userId=${userId}`
      );
      
      if (!response.ok) throw new Error('Failed to load consents');
      
      const data = await response.json();
      setConsents(data.consents || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/governance?action=requests&userId=${userId}`
      );
      
      if (!response.ok) throw new Error('Failed to load requests');
      
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && userId) {
      loadConsents();
      loadRequests();
    }
  }, [autoLoad, userId, loadConsents, loadRequests]);

  // =============================================================================
  // CONSENT MANAGEMENT
  // =============================================================================

  const updateConsent = useCallback(async (
    consentType: ConsentType, 
    granted: boolean,
    source: string = 'settings'
  ): Promise<boolean> => {
    setError(null);
    
    try {
      const response = await fetch('/api/governance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_consent',
          userId,
          consent_type: consentType,
          granted,
          version: policyVersion,
          source
        })
      });
      
      if (!response.ok) throw new Error('Failed to update consent');
      
      const data = await response.json();
      
      // Update local state
      setConsents(prev => {
        const existing = prev.findIndex(c => c.consent_type === consentType);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = data.consent;
          return updated;
        }
        return [...prev, data.consent];
      });
      
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [userId, policyVersion]);

  const updateAllConsents = useCallback(async (
    consentTypes: ConsentType[], 
    granted: boolean,
    source: string = 'settings'
  ): Promise<boolean> => {
    const results = await Promise.all(
      consentTypes.map(type => updateConsent(type, granted, source))
    );
    return results.every(r => r);
  }, [updateConsent]);

  const getConsentStatus = useCallback((consentType: ConsentType): boolean => {
    const consent = consents.find(c => c.consent_type === consentType);
    return consent?.granted || false;
  }, [consents]);

  const hasRequiredConsents = useCallback((): boolean => {
    const required = CONSENT_GROUPS
      .filter(g => g.required)
      .flatMap(g => g.consents);
    
    return required.every(type => getConsentStatus(type));
  }, [getConsentStatus]);

  // =============================================================================
  // DATA REQUESTS
  // =============================================================================

  const createDataRequest = useCallback(async (
    requestType: RequestType,
    email?: string
  ): Promise<DataRequest | null> => {
    setError(null);
    
    try {
      const response = await fetch('/api/governance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_request',
          userId,
          request_type: requestType,
          email: email || '' // Will be filled from user profile if authenticated
        })
      });
      
      if (!response.ok) throw new Error('Failed to create request');
      
      const data = await response.json();
      
      // Add to local state
      setRequests(prev => [data.request, ...prev]);
      
      return data.request;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [userId]);

  // =============================================================================
  // DATA EXPORT
  // =============================================================================

  const exportMyData = useCallback(async (): Promise<any | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/governance?action=export&userId=${userId}`
      );
      
      if (!response.ok) throw new Error('Failed to export data');
      
      const data = await response.json();
      
      // Trigger download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // =============================================================================
  // RETURN
  // =============================================================================

  return {
    // State
    consents,
    requests,
    loading,
    error,
    
    // Consent Management
    updateConsent,
    updateAllConsents,
    getConsentStatus,
    hasRequiredConsents,
    
    // Data Requests
    createDataRequest,
    
    // Data Export
    exportMyData,
    
    // Refresh
    refresh: () => {
      loadConsents();
      loadRequests();
    },
    
    // Helpers
    consentGroups: CONSENT_GROUPS,
    consentLabels: CONSENT_LABELS,
    requestLabels: REQUEST_LABELS
  };
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default useGovernance;
