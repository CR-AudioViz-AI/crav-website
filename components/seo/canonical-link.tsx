'use client';

/**
 * CanonicalLink Component - Fixed for Hydration
 * 
 * Uses Next.js head management instead of direct DOM manipulation
 * to avoid hydration mismatches.
 * 
 * @timestamp January 7, 2026 - 11:18 AM EST
 * @fix Removed direct DOM manipulation that caused removeChild errors
 */

import { usePathname } from 'next/navigation';
import Head from 'next/head';

const BASE_URL = 'https://craudiovizai.com';

export function CanonicalLink() {
  const pathname = usePathname();
  
  // Don't render anything - canonical is handled by metadata in layout.tsx
  // This component was causing hydration errors by directly manipulating DOM
  return null;
}
