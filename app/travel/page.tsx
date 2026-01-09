'use client';

// /app/travel/page.tsx
// Travel Hub - CR AudioViz AI
// Clean version without analytics dependency

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Link from 'next/link';

const TRAVEL_CATEGORIES = [
  { id: 'all', name: 'All', icon: '🌍' },
  { id: 'flights', name: 'Flights', icon: '✈️' },
  { id: 'hotels', name: 'Hotels', icon: '🏨' },
  { id: 'experiences', name: 'Experiences', icon: '🎭' },
  { id: 'packages', name: 'Packages', icon: '📦' },
  { id: 'cruises', name: 'Cruises', icon: '🚢' }
];

const POPULAR_DESTINATIONS = [
  { name: 'Orlando', image: '🏰', deals: 245 },
  { name: 'Miami', image: '🏖️', deals: 189 },
  { name: 'New York', image: '🗽', deals: 312 },
  { name: 'Las Vegas', image: '🎰', deals: 156 },
  { name: 'Los Angeles', image: '🌴', deals: 203 },
  { name: 'Hawaii', image: '🌺', deals: 134 }
];

const TRAVEL_DEALS = [
  {
    id: 't-1',
    title: 'Universal Orlando Resort Package',
    description: '3 nights at Universal hotel + 2-park tickets. Experience the magic of Wizarding World.',
    price: 599,
    priceLabel: '/person',
    rating: 4.9,
    reviewCount: 8500,
    features: ['3-night hotel stay', '2-day park tickets', 'Early park admission', 'Free shuttle service'],
    ctaText: 'View Deal',
    ctaUrl: 'https://www.viator.com/Orlando?ref=craudiovizai',
    badge: 'Best Seller',
    category: 'packages'
  },
  {
    id: 't-2',
    title: 'Walt Disney World Magic Package',
    description: '4 nights near Disney + theme park tickets. Create magical memories.',
    price: 749,
    priceLabel: '/person',
    rating: 4.8,
    reviewCount: 12300,
    features: ['4-night hotel stay', 'Multi-day park tickets', 'Disney dining plan option', 'Airport transfer'],
    ctaText: 'View Deal',
    ctaUrl: 'https://www.getyourguide.com/orlando?ref=craudiovizai',
    badge: 'Most Popular',
    category: 'packages'
  },
  {
    id: 't-3',
    title: 'Miami Beach Getaway',
    description: 'Luxury beachfront resort with spa access and gourmet dining.',
    price: 399,
    priceLabel: '/night',
    rating: 4.7,
    reviewCount: 5600,
    features: ['Oceanfront room', 'Full spa access', 'Breakfast included', 'Beach service'],
    ctaText: 'Book Now',
    ctaUrl: 'https://www.klook.com/miami?ref=craudiovizai',
    badge: 'Luxury',
    category: 'hotels'
  },
  {
    id: 't-4',
    title: 'NYC Explorer Pass',
    description: 'Access to 100+ attractions in New York City. Best value for sightseeing.',
    price: 129,
    priceLabel: '/pass',
    rating: 4.6,
    reviewCount: 15000,
    features: ['100+ attractions', 'Skip the line', 'Mobile ticket', 'Valid 60 days'],
    ctaText: 'Get Pass',
    ctaUrl: 'https://www.viator.com/NewYork?ref=craudiovizai',
    badge: 'Top Rated',
    category: 'experiences'
  }
];

export default function TravelPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDeals = TRAVEL_DEALS.filter(deal => {
    if (activeCategory !== 'all' && deal.category !== activeCategory) return false;
    if (searchQuery && !deal.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              CR AudioViz AI
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/tools" className="text-gray-600 hover:text-blue-600">Tools</Link>
            <Link href="/pricing" className="text-gray-600 hover:text-blue-600">Pricing</Link>
            <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      <section className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">✈️ Travel Hub</h1>
          <p className="text-xl text-blue-100 mb-8">Compare deals from top travel sites. Best prices guaranteed.</p>
          <div className="max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search destinations, hotels, experiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
            />
          </div>
        </div>
      </section>

      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {TRAVEL_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-3 rounded-full whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Popular Destinations</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {POPULAR_DESTINATIONS.map(dest => (
              <div key={dest.name} className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="text-4xl mb-2">{dest.image}</div>
                <h3 className="font-semibold">{dest.name}</h3>
                <p className="text-sm text-gray-500">{dest.deals} deals</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Featured Travel Deals</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeals.map(deal => (
              <div key={deal.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                  <span className="text-6xl">✈️</span>
                </div>
                <div className="p-6">
                  {deal.badge && (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full mb-2">
                      {deal.badge}
                    </span>
                  )}
                  <h3 className="text-xl font-bold mb-2">{deal.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{deal.description}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-cyan-400">★</span>
                    <span className="font-medium">{deal.rating}</span>
                    <span className="text-gray-400">({deal.reviewCount.toLocaleString()} reviews)</span>
                  </div>
                  <ul className="text-sm text-gray-600 mb-4 space-y-1">
                    {deal.features.slice(0, 3).map((f, i) => (
                      <li key={i}>✓ {f}</li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-blue-600">${deal.price}</span>
                      <span className="text-gray-500 text-sm">{deal.priceLabel}</span>
                    </div>
                    <a href={deal.ctaUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      {deal.ctaText}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 CR AudioViz AI, LLC. All rights reserved.</p>
          <p className="text-gray-500 text-sm mt-2">Your Story. Our Design. Everyone connects. Everyone wins.</p>
        </div>
      </footer>
    </div>
  );
}
