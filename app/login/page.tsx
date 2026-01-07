/**
 * Login Page - CR AudioViz AI
 * 
 * Uses shared AuthOptions component to ensure consistency with signup page.
 * All auth providers are rendered from central config - no hardcoding.
 * 
 * @timestamp January 7, 2026 - 11:33 AM EST
 * @author Claude (for Roy Henderson)
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AuthOptions from '@/components/auth/AuthOptions';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
              <div className="relative">
                <div className="flex gap-1.5 mb-1">
                  <div className="w-2 h-2 bg-white rounded-full" />
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <div className="w-4 h-1.5 bg-white rounded-full mx-auto" />
              </div>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400 mt-2">Sign in to continue to Javari AI</p>
        </div>

        {/* Auth Card */}
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-gray-700/50">
          <AuthOptions mode="login" redirectTo="/dashboard" />
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-cyan-400 hover:text-cyan-300">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</Link>
        </p>
      </motion.div>
    </div>
  );
}
