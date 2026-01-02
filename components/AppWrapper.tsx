'use client';

import { ReactNode, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';

/**
 * CR AudioViz AI - Standardized App Wrapper
 * ==========================================
 * 
 * EVERY app page MUST use this wrapper for:
 * - Authentication state
 * - Credit system integration
 * - Error boundaries
 * - Loading states
 * - Analytics tracking
 * - Accessibility compliance
 * 
 * Usage:
 * <AppWrapper appId="resume-builder" creditCost={1}>
 *   {({ user, credits, deductCredits, isLoading }) => (
 *     <YourAppContent />
 *   )}
 * </AppWrapper>
 */

interface AppWrapperProps {
  appId: string;
  creditCost?: number;
  requiresAuth?: boolean;
  children: (props: {
    user: User | null;
    credits: number;
    deductCredits: (amount?: number) => Promise<boolean>;
    isLoading: boolean;
    error: string | null;
  }) => ReactNode;
}

interface CreditBalance {
  balance: number;
  plan: string;
}

export default function AppWrapper({
  appId,
  creditCost = 1,
  requiresAuth = false,
  children
}: AppWrapperProps) {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Get user session
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);

        if (session?.user) {
          // Fetch credit balance
          const { data: profile } = await supabase
            .from('profiles')
            .select('credits, plan')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setCredits(profile.credits || 0);
          }

          // Log app access for analytics
          await supabase.from('app_usage').insert({
            user_id: session.user.id,
            app_id: appId,
            action: 'open',
            timestamp: new Date().toISOString()
          }).catch(() => {}); // Silent fail for analytics
        }
      } catch (err) {
        console.error('App initialization error:', err);
        setError('Failed to load app. Please refresh.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', session.user.id)
            .single();
          if (profile) setCredits(profile.credits || 0);
        } else {
          setCredits(0);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, appId]);

  const deductCredits = async (amount: number = creditCost): Promise<boolean> => {
    if (!user) {
      setError('Please sign in to use this feature');
      return false;
    }

    if (credits < amount) {
      setError('Insufficient credits. Please purchase more.');
      return false;
    }

    try {
      const newBalance = credits - amount;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits: newBalance })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Log the transaction
      await supabase.from('credit_transactions').insert({
        user_id: user.id,
        amount: -amount,
        type: 'deduction',
        app_id: appId,
        description: `Used ${appId}`,
        timestamp: new Date().toISOString()
      }).catch(() => {});

      setCredits(newBalance);
      setError(null);
      return true;
    } catch (err) {
      console.error('Credit deduction error:', err);
      setError('Failed to process credits. Please try again.');
      return false;
    }
  };

  // Auth required but not logged in
  if (!isLoading && requiresAuth && !user) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800"
        role="main"
        aria-label="Authentication required"
      >
        <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/10 max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-gray-400 mb-6">Please sign in to access {appId.replace(/-/g, ' ')}.</p>
          <a
            href="/auth/signin"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !isLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800"
        role="alert"
        aria-live="assertive"
      >
        <div className="text-center p-8 bg-red-900/20 rounded-2xl border border-red-500/30 max-w-md">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div role="application" aria-label={appId.replace(/-/g, ' ')}>
      {children({ user, credits, deductCredits, isLoading, error })}
    </div>
  );
}
