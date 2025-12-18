// ============================================================
// CR AUDIOVIZ AI - API HEALTH DASHBOARD PAGE
// /app/admin/api-health/page.tsx
// Updated: December 17, 2025 - Comprehensive 30+ API monitoring
// ============================================================

import APIHealthDashboard from '@/components/admin/APIHealthDashboard';

export const metadata = {
  title: 'API Health Dashboard | CR AudioViz AI Admin',
  description: 'Real-time monitoring dashboard for all 30+ APIs in the CR AudioViz AI ecosystem - $28,296/year free tier value',
};

export const dynamic = 'force-dynamic';

export default function APIHealthPage() {
  return <APIHealthDashboard />;
}
