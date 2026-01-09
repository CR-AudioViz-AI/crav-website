'use client';

/**
 * AuthOptions - Shared Authentication UI Component
 * 
 * Single source of truth for all auth methods displayed on login/signup pages.
 * Renders ALL enabled providers from lib/auth/providers.ts configuration.
 * 
 * Features:
 * - OAuth providers (Google, GitHub, Apple, Microsoft, Discord, Twitter, Facebook, LinkedIn)
 * - Email + password login/signup
 * - Magic link authentication
 * - Phone/SMS authentication
 * - Enterprise SSO
 * - Forgot password link
 * - Error states for misconfigured providers
 * 
 * @timestamp January 7, 2026 - 11:44 AM EST
 * @author Claude (for Roy Henderson)
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  getEnabledOAuthProviders, 
  getAllAuthMethods,
  AUTH_FEATURES,
  AuthProviderConfig 
} from '@/lib/auth/providers';
import { Loader2, Mail, Sparkles, Phone, Building2, AlertCircle, ArrowLeft } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface AuthOptionsProps {
  mode: 'login' | 'signup';
  onSuccess?: () => void;
  onError?: (error: string) => void;
  redirectTo?: string;
}

interface ProviderError {
  providerId: string;
  message: string;
}

// ============================================================================
// PROVIDER ICONS
// ============================================================================

const ProviderIcons: Record<string, React.FC<{ className?: string }>> = {
  google: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  ),
  github: ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  ),
  apple: ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  ),
  microsoft: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#F25022" d="M1 1h10v10H1z"/>
      <path fill="#00A4EF" d="M1 13h10v10H1z"/>
      <path fill="#7FBA00" d="M13 1h10v10H13z"/>
      <path fill="#FFB900" d="M13 13h10v10H13z"/>
    </svg>
  ),
  discord: ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  ),
  twitter: ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  facebook: ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  linkedin: ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  email: Mail,
  magic: Sparkles,
  phone: Phone,
  sso: Building2,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AuthOptions({ mode, onSuccess, onError, redirectTo }: AuthOptionsProps) {
  const supabase = createClient();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  // UI state
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [showPhoneAuth, setShowPhoneAuth] = useState(false);
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [providerErrors, setProviderErrors] = useState<ProviderError[]>([]);
  
  // Get auth methods from config
  const authMethods = getAllAuthMethods();
  const oauthProviders = getEnabledOAuthProviders();
  
  // Reset to main view
  const resetView = () => {
    setShowMagicLink(false);
    setShowPhoneAuth(false);
    setAwaitingOtp(false);
    setError('');
    setSuccess('');
  };
  
  // ============================================================================
  // OAUTH HANDLER
  // ============================================================================
  
  const handleOAuth = async (provider: AuthProviderConfig) => {
    if (!provider.supabaseProvider) {
      setError(`${provider.name} is not properly configured`);
      return;
    }
    
    setLoading(provider.id);
    setError('');
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: provider.supabaseProvider,
        options: {
          redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
        },
      });
      
      if (authError) {
        if (authError.message.includes('not enabled') || authError.message.includes('not configured')) {
          setProviderErrors(prev => [...prev, { 
            providerId: provider.id, 
            message: `${provider.name} is not configured in Supabase` 
          }]);
        }
        throw authError;
      }
    } catch (err: any) {
      console.error(`OAuth error (${provider.name}):`, err);
      setError(err.message || `Failed to sign in with ${provider.name}`);
      onError?.(err.message);
    } finally {
      setLoading(null);
    }
  };
  
  // ============================================================================
  // EMAIL/PASSWORD HANDLER
  // ============================================================================
  
  const handleEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('email');
    setError('');
    
    try {
      if (mode === 'signup') {
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }
        
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        
        if (authError) throw authError;
        
        setSuccess('Check your email to confirm your account!');
        onSuccess?.();
      } else {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (authError) throw authError;
        
        window.location.href = redirectTo || '/dashboard';
        onSuccess?.();
      }
    } catch (err: any) {
      console.error('Email/password error:', err);
      setError(err.message || 'Authentication failed');
      onError?.(err.message);
    } finally {
      setLoading(null);
    }
  };
  
  // ============================================================================
  // MAGIC LINK HANDLER
  // ============================================================================
  
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('magic_link');
    setError('');
    
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (authError) throw authError;
      
      setSuccess('Check your email for the magic link!');
      onSuccess?.();
    } catch (err: any) {
      console.error('Magic link error:', err);
      setError(err.message || 'Failed to send magic link');
      onError?.(err.message);
    } finally {
      setLoading(null);
    }
  };
  
  // ============================================================================
  // PHONE AUTH HANDLER
  // ============================================================================
  
  const handlePhoneSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('phone');
    setError('');
    
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });
      
      if (authError) throw authError;
      
      setAwaitingOtp(true);
      setSuccess('Check your phone for the verification code!');
    } catch (err: any) {
      console.error('Phone auth error:', err);
      setError(err.message || 'Failed to send verification code');
      onError?.(err.message);
    } finally {
      setLoading(null);
    }
  };
  
  const handlePhoneVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('phone_verify');
    setError('');
    
    try {
      const { error: authError } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otpCode,
        type: 'sms',
      });
      
      if (authError) throw authError;
      
      window.location.href = redirectTo || '/dashboard';
      onSuccess?.();
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Invalid verification code');
      onError?.(err.message);
    } finally {
      setLoading(null);
    }
  };
  
  // ============================================================================
  // RENDER OAUTH BUTTON
  // ============================================================================
  
  const renderOAuthButton = (provider: AuthProviderConfig) => {
    const Icon = ProviderIcons[provider.icon];
    const hasError = providerErrors.some(e => e.providerId === provider.id);
    const isLoading = loading === provider.id;
    
    if (hasError) {
      return (
        <div
          key={provider.id}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-red-300 dark:border-red-700 rounded-xl bg-red-50 dark:bg-red-900/20"
          data-testid={`auth-provider-${provider.id}`}
          data-provider-error="true"
        >
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="font-medium text-red-600 dark:text-red-400 text-sm">
            {provider.name} not configured
          </span>
        </div>
      );
    }
    
    return (
      <button
        key={provider.id}
        onClick={() => handleOAuth(provider)}
        disabled={isLoading || loading !== null}
        className={`w-full flex items-center justify-center gap-3 px-4 py-3 border rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${provider.colors.bg} ${provider.colors.bgHover} ${provider.colors.border || 'border-transparent'}`}
        data-testid={`auth-provider-${provider.id}`}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          Icon && <Icon className="w-5 h-5" />
        )}
        <span className={`font-medium ${provider.colors.text}`}>
          Continue with {provider.name}
        </span>
      </button>
    );
  };
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="space-y-6" data-testid="auth-options">
      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
      
      {/* Success Display */}
      {success && (
        <div className="p-3 bg-cyan-500 dark:bg-cyan-500/20 text-cyan-500 dark:text-cyan-500 rounded-lg text-sm">
          {success}
        </div>
      )}
      
      {/* Back Button for alternate views */}
      {(showMagicLink || showPhoneAuth) && (
        <button
          onClick={resetView}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all options
        </button>
      )}
      
      {/* ==================== MAIN VIEW ==================== */}
      {!showMagicLink && !showPhoneAuth && (
        <>
          {/* OAuth Providers */}
          {oauthProviders.length > 0 && (
            <div className="space-y-3" data-testid="oauth-providers">
              {oauthProviders.map(renderOAuthButton)}
            </div>
          )}
          
          {/* Divider */}
          {oauthProviders.length > 0 && authMethods.email && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">
                  or continue with email
                </span>
              </div>
            </div>
          )}
          
          {/* Email/Password Form */}
          {authMethods.email && (
            <form onSubmit={handleEmailPassword} className="space-y-4" data-testid="email-password-form">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-cyan-500 text-gray-900 dark:text-white"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-cyan-500 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  {mode === 'login' && AUTH_FEATURES.forgotPasswordEnabled && (
                    <Link 
                      href="/forgot-password" 
                      className="text-sm text-cyan-600 hover:underline"
                      data-testid="forgot-password-link"
                    >
                      Forgot?
                    </Link>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-cyan-500 text-gray-900 dark:text-white"
                />
                {mode === 'signup' && (
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading === 'email'}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-medium hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                data-testid="auth-provider-email"
              >
                {loading === 'email' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Mail className="w-5 h-5" />
                )}
                {mode === 'signup' ? 'Create Account' : 'Sign In'}
              </button>
            </form>
          )}
          
          {/* Alternative Auth Methods */}
          <div className="space-y-2">
            {/* Magic Link Toggle */}
            {authMethods.magicLink && (
              <button
                onClick={() => setShowMagicLink(true)}
                className="w-full text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 py-2"
                data-testid="toggle-magic-link"
              >
                ✨ Sign in with magic link (no password needed)
              </button>
            )}
            
            {/* Phone Auth Toggle */}
            {authMethods.phone && (
              <button
                onClick={() => setShowPhoneAuth(true)}
                className="w-full text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 py-2"
                data-testid="toggle-phone-auth"
              >
                📱 Sign in with phone number
              </button>
            )}
          </div>
          
          {/* Enterprise SSO */}
          {authMethods.sso && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/auth/sso"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                data-testid="auth-provider-sso"
              >
                <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Continue with Enterprise SSO
                </span>
              </Link>
            </div>
          )}
        </>
      )}
      
      {/* ==================== MAGIC LINK VIEW ==================== */}
      {showMagicLink && (
        <form onSubmit={handleMagicLink} className="space-y-4" data-testid="magic-link-form">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-cyan-500 text-gray-900 dark:text-white"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading === 'magic_link'}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-500 text-white rounded-xl font-medium hover:from-cyan-500 hover:to-cyan-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            data-testid="auth-provider-magic_link"
          >
            {loading === 'magic_link' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            Send Magic Link
          </button>
        </form>
      )}
      
      {/* ==================== PHONE AUTH VIEW ==================== */}
      {showPhoneAuth && !awaitingOtp && (
        <form onSubmit={handlePhoneSendOtp} className="space-y-4" data-testid="phone-auth-form">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 123-4567"
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-cyan-500 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +1 for US)</p>
          </div>
          
          <button
            type="submit"
            disabled={loading === 'phone'}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-500 text-white rounded-xl font-medium hover:from-cyan-500 hover:to-cyan-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            data-testid="auth-provider-phone"
          >
            {loading === 'phone' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Phone className="w-5 h-5" />
            )}
            Send Verification Code
          </button>
        </form>
      )}
      
      {/* Phone OTP Verification */}
      {showPhoneAuth && awaitingOtp && (
        <form onSubmit={handlePhoneVerifyOtp} className="space-y-4" data-testid="phone-otp-form">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="123456"
              required
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-cyan-500 text-gray-900 dark:text-white text-center text-2xl tracking-widest"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading === 'phone_verify'}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-500 text-white rounded-xl font-medium hover:from-cyan-500 hover:to-cyan-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            data-testid="auth-provider-phone-verify"
          >
            {loading === 'phone_verify' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Verify & Sign In'
            )}
          </button>
          
          <button
            type="button"
            onClick={() => setAwaitingOtp(false)}
            className="w-full text-sm text-gray-500 hover:text-gray-700"
          >
            Resend code
          </button>
        </form>
      )}
      
      {/* Switch Mode Link */}
      {!showMagicLink && !showPhoneAuth && (
        <p className="text-center text-gray-600 dark:text-gray-400">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-cyan-600 hover:underline font-medium">
                Sign up free
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link href="/login" className="text-cyan-600 hover:underline font-medium">
                Sign in
              </Link>
            </>
          )}
        </p>
      )}
    </div>
  );
}
