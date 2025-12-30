// /app/checkout/error/page.tsx
export const dynamic = 'force-dynamic';

'use client';

import React from 'react';
import Link from 'next/link';

export default function CheckoutErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="text-6xl mb-6">❌</div>
        <h1 className="text-3xl font-bold mb-4 text-red-600">Payment Failed</h1>
        <p className="text-gray-600 mb-8">
          Something went wrong with your payment. No charges were made to your account.
        </p>
        <div className="space-y-4">
          <Link href="/pricing" className="block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Try Again
          </Link>
          <Link href="/support" className="block px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
