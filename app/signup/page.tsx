/**
 * Signup Page - CR AudioViz AI
 * 
 * Uses shared AuthOptions component to ensure consistency with login page.
 * All auth providers are rendered from central config - no hardcoding.
 * 
 * @timestamp January 7, 2026 - 11:34 AM EST
 * @author Claude (for Roy Henderson)
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AuthOptions from '@/components/auth/AuthOptions';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
              <div className="relative">
                <div className="flex gap-1.5 mb-1">
                  <div className="w-2 h-2 bg-white rounded-full" />
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <div className="w-4 h-1.5 bg-white rounded-full mx-auto" />
              </div>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create Your Account</h1>
          <p className="text-gray-400 mt-2">Start creating with Javari AI today</p>
        </div>

        {/* Signup Benefits */}
        <div className="mb-6 grid grid-cols-3 gap-3 text-center">
          <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/30">
            <div className="text-2xl mb-1">🎨</div>
            <div className="text-xs text-gray-400">Creative Tools</div>
          </div>
          <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/30">
            <div className="text-2xl mb-1">🎮</div>
            <div className="text-xs text-gray-400">Games Library</div>
          </div>
          <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/30">
            <div className="text-2xl mb-1">🤖</div>
            <div className="text-xs text-gray-400">AI Assistant</div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-gray-700/50">
          <AuthOptions mode="signup" redirectTo="/dashboard" />
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-purple-400 hover:text-purple-300">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-purple-400 hover:text-purple-300">Privacy Policy</Link>
        </p>
      </motion.div>
    </div>
  );
}
