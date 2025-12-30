// /app/marketplace/sell/page.tsx
// Seller Dashboard - CR AudioViz AI Creator Marketplace
// Manage products, track sales, request payouts

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// =============================================================================
// TYPES
// =============================================================================

interface SellerStats {
  totalEarnings: number;
  pendingPayout: number;
  totalSales: number;
  totalProducts: number;
  rating: number;
  views: number;
}

interface Product {
  id: string;
  title: string;
  price: number;
  sales: number;
  earnings: number;
  status: 'active' | 'pending' | 'draft';
  thumbnail: string;
}

interface Payout {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed';
  date: string;
  method: string;
}

// =============================================================================
// MOCK DATA
// =============================================================================

const SELLER_STATS: SellerStats = {
  totalEarnings: 4532.50,
  pendingPayout: 847.25,
  totalSales: 234,
  totalProducts: 12,
  rating: 4.8,
  views: 15678
};

const MY_PRODUCTS: Product[] = [
  { id: '1', title: 'Professional Business Card Templates', price: 25, sales: 89, earnings: 1556.75, status: 'active', thumbnail: '💼' },
  { id: '2', title: 'Social Media Bundle 2025', price: 30, sales: 67, earnings: 1407.00, status: 'active', thumbnail: '📱' },
  { id: '3', title: 'AI Prompt Collection - Business', price: 15, sales: 45, earnings: 472.50, status: 'active', thumbnail: '🤖' },
  { id: '4', title: 'Minimal Logo Pack', price: 35, sales: 33, earnings: 808.50, status: 'active', thumbnail: '◯' },
  { id: '5', title: 'New Product Draft', price: 20, sales: 0, earnings: 0, status: 'draft', thumbnail: '📝' }
];

const RECENT_PAYOUTS: Payout[] = [
  { id: 'p1', amount: 523.50, status: 'completed', date: '2025-12-27', method: 'PayPal' },
  { id: 'p2', amount: 412.75, status: 'completed', date: '2025-12-20', method: 'Stripe' },
  { id: 'p3', amount: 847.25, status: 'pending', date: '2025-12-30', method: 'PayPal' }
];

// =============================================================================
// COMPONENTS
// =============================================================================

function StatCard({ label, value, icon, trend, color }: {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && <p className="text-sm text-green-600 mt-1">{trend}</p>}
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white text-xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function ProductRow({ product }: { product: Product }) {
  const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    draft: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  };

  return (
    <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{product.thumbnail}</span>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{product.title}</p>
            <p className="text-sm text-gray-500">{product.price} credits</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 text-center">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[product.status]}`}>
          {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
        </span>
      </td>
      <td className="py-4 px-4 text-center text-gray-900 dark:text-white">
        {product.sales}
      </td>
      <td className="py-4 px-4 text-center font-medium text-green-600 dark:text-green-400">
        ${product.earnings.toFixed(2)}
      </td>
      <td className="py-4 px-4 text-center">
        <div className="flex gap-2 justify-center">
          <Link
            href={`/marketplace/sell/edit/${product.id}`}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
          >
            Edit
          </Link>
          <Link
            href={`/marketplace/product/${product.id}`}
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            View
          </Link>
        </div>
      </td>
    </tr>
  );
}

function PayoutHistory({ payouts }: { payouts: Payout[] }) {
  const statusColors = {
    pending: 'text-yellow-600',
    processing: 'text-blue-600',
    completed: 'text-green-600'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white">Recent Payouts</h3>
        <Link href="/marketplace/sell/payouts" className="text-sm text-purple-600 hover:underline">
          View All
        </Link>
      </div>
      <div className="space-y-3">
        {payouts.map(payout => (
          <div key={payout.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">${payout.amount.toFixed(2)}</p>
              <p className="text-sm text-gray-500">{payout.date} • {payout.method}</p>
            </div>
            <span className={`text-sm font-medium ${statusColors[payout.status]}`}>
              {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function SellerDashboardPage() {
  const [stats] = useState<SellerStats>(SELLER_STATS);
  const [products] = useState<Product[]>(MY_PRODUCTS);
  const [payouts] = useState<Payout[]>(RECENT_PAYOUTS);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/marketplace" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">🏪</span>
                </div>
              </Link>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-white">Seller Dashboard</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Manage your products & earnings</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/marketplace" className="text-gray-600 dark:text-gray-300 hover:text-gray-900">
                ← Back to Marketplace
              </Link>
              <Link
                href="/marketplace/sell/new"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                + New Product
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            label="Total Earnings"
            value={`$${stats.totalEarnings.toFixed(2)}`}
            icon="💰"
            color="bg-green-500"
            trend="+12% this month"
          />
          <StatCard
            label="Pending Payout"
            value={`$${stats.pendingPayout.toFixed(2)}`}
            icon="⏳"
            color="bg-yellow-500"
          />
          <StatCard
            label="Total Sales"
            value={stats.totalSales}
            icon="📦"
            color="bg-blue-500"
          />
          <StatCard
            label="Products"
            value={stats.totalProducts}
            icon="🎁"
            color="bg-purple-500"
          />
          <StatCard
            label="Avg Rating"
            value={`${stats.rating} ⭐`}
            icon="⭐"
            color="bg-orange-500"
          />
          <StatCard
            label="Total Views"
            value={stats.views.toLocaleString()}
            icon="👁️"
            color="bg-pink-500"
          />
        </div>

        {/* Revenue Split Explainer */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">You Keep 70% of Every Sale!</h3>
              <p className="text-purple-100">
                Platform fee is only 30%. Get paid weekly via PayPal or Stripe.
              </p>
            </div>
            <button
              onClick={() => setShowPayoutModal(true)}
              className="px-6 py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-colors"
            >
              Request Payout
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Products Table */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-white">My Products</h3>
                  <Link
                    href="/marketplace/sell/new"
                    className="text-sm text-purple-600 hover:underline"
                  >
                    + Add New
                  </Link>
                </div>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Product</th>
                    <th className="py-3 px-4 text-center text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="py-3 px-4 text-center text-sm font-medium text-gray-500 dark:text-gray-400">Sales</th>
                    <th className="py-3 px-4 text-center text-sm font-medium text-gray-500 dark:text-gray-400">Earnings</th>
                    <th className="py-3 px-4 text-center text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <ProductRow key={product.id} product={product} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PayoutHistory payouts={payouts} />

            {/* Quick Tips */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">📈 Tips to Sell More</h3>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Use high-quality thumbnails</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Write detailed descriptions</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Price competitively</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Respond to reviews quickly</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Promote on social media</span>
                </li>
              </ul>
            </div>

            {/* Verification Status */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">✓</span>
                <h3 className="font-bold text-blue-900 dark:text-blue-100">Verified Seller</h3>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your account is verified. Verified sellers get a badge and priority placement.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Request Payout</h3>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Available Balance</p>
              <p className="text-3xl font-bold text-green-600">${stats.pendingPayout.toFixed(2)}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payout Method
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                  <option>PayPal - roy***@email.com</option>
                  <option>Stripe - ****4242</option>
                  <option>+ Add new method</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  defaultValue={stats.pendingPayout}
                  max={stats.pendingPayout}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Payout requested! You\'ll receive funds within 3-5 business days.');
                  setShowPayoutModal(false);
                }}
                className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Request Payout
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
