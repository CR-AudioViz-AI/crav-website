// /app/insurance/page.tsx
// Insurance Hub - CR AudioViz AI
export const dynamic = 'force-dynamic';

'use client';

import React from 'react';
import Link from 'next/link';

export default function InsurancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            CR AudioViz AI
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/tools" className="text-gray-600 hover:text-indigo-600">Tools</Link>
            <Link href="/pricing" className="text-gray-600 hover:text-indigo-600">Pricing</Link>
            <Link href="/login" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Sign In</Link>
          </nav>
        </div>
      </header>

      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">🛡️ Insurance Hub</h1>
          <p className="text-xl text-indigo-100 mb-8">Compare insurance quotes and find the best coverage</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
          <p className="text-gray-600">Insurance comparison tools are being developed.</p>
          <Link href="/" className="inline-block mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Return Home
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 CR AudioViz AI, LLC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
