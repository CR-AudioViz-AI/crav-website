// /app/travel/page.tsx
// Travel Hub - CR AudioViz AI Revenue Trinity
// Multi-affiliate travel comparison
'use client';

import React, { useState, useEffect } from 'react';
import { ConversionFunnel, FUNNEL_CONFIGS } from '@/components/ConversionFunnel';
import { useAnalytics } from '@/hooks/useAnalytics';

// Travel categories
const TRAVEL_CATEGORIES = [
  { id: 'all', name: 'All', icon: '🌍' },
  { id: 'flights', name: 'Flights', icon: '✈️' },
  { id: 'hotels', name: 'Hotels', icon: '🏨' },
  { id: 'experiences', name: 'Experiences', icon: '🎭' },
  { id: 'packages', name: 'Packages', icon: '📦' },
  { id: 'cruises', name: 'Cruises', icon: '🚢' }
];

// Popular destinations
const POPULAR_DESTINATIONS = [
  { name: 'Orlando', image: '🏰', deals: 245 },
  { name: 'Miami', image: '🏖️', deals: 189 },
  { name: 'New York', image: '🗽', deals: 312 },
  { name: 'Las Vegas', image: '🎰', deals: 156 },
  { name: 'Los Angeles', image: '🌴', deals: 203 },
  { name: 'Hawaii', image: '🌺', deals: 134 }
];

// Mock travel deals
const MOCK_DEALS = [
  {
    id: 't-1',
    title: 'Universal Orlando Resort Package',
    description: '3 nights at Universal hotel + 2-park tickets. Experience the magic of Wizarding World.',
    price: 599,
    priceLabel: '/person',
    rating: 4.9,
    reviewCount: 8500,
    features: [
      '3-night hotel stay',
      '2-day park tickets',
      'Early park admission',
      'Free shuttle service'
    ],
    ctaText: 'View Deal',
    ctaUrl: 'https://www.viator.com/Orlando?ref=craudiovizai',
    affiliateId: 'viator',
    badge: 'Best Seller',
    image: '/images/universal.jpg'
  },
  {
    id: 't-2',
    title: 'Walt Disney World Magic Package',
    description: '4 nights near Disney + theme park tickets. Create magical memories.',
    price: 749,
    priceLabel: '/person',
    rating: 4.8,
    reviewCount: 12300,
    features: [
      '4-night hotel stay',
      'Multi-day park tickets',
      'Disney dining plan option',
      'Airport transfer included'
    ],
    ctaText: 'View Deal',
    ctaUrl: 'https://www.getyourguide.com/orlando?ref=craudiovizai',
    affiliateId: 'getyourguide',
    badge: 'Most Popular'
  },
  {
    id: 't-3',
    title: 'Miami Beach Getaway',
    description: 'Luxury beachfront resort with spa access and gourmet dining.',
    price: 399,
    priceLabel: '/night',
    rating: 4.7,
    reviewCount: 5600,
    features: [
      'Oceanfront room',
      'Full spa access',
      'Beach cabana included',
      'Complimentary breakfast'
    ],
    ctaText: 'Book Now',
    ctaUrl: 'https://www.hotels.com/miami?ref=craudiovizai',
    affiliateId: 'hotels',
    image: '/images/miami.jpg'
  },
  {
    id: 't-4',
    title: 'Orlando Airboat Adventure',
    description: 'Thrilling Everglades airboat tour with wildlife spotting.',
    price: 49,
    priceLabel: '/person',
    rating: 4.9,
    reviewCount: 3200,
    features: [
      '1-hour airboat ride',
      'Professional guide',
      'Wildlife guaranteed',
      'Photos included'
    ],
    ctaText: 'Book Experience',
    ctaUrl: 'https://www.viator.com/tours/Orlando/Airboat?ref=craudiovizai',
    affiliateId: 'viator',
    badge: 'Top Rated'
  },
  {
    id: 't-5',
    title: 'SeaWorld Orlando Day Pass',
    description: 'Full-day access to SeaWorld with shows, rides, and marine encounters.',
    price: 89,
    priceLabel: '/person',
    rating: 4.6,
    reviewCount: 7800,
    features: [
      'All-day park access',
      'Live shows included',
      'Unlimited rides',
      'Animal encounters'
    ],
    ctaText: 'Get Tickets',
    ctaUrl: 'https://www.getyourguide.com/seaworld?ref=craudiovizai',
    affiliateId: 'getyourguide'
  },
  {
    id: 't-6',
    title: 'Kennedy Space Center Tour',
    description: 'Full-day space exploration with astronaut encounter opportunity.',
    price: 75,
    priceLabel: '/person',
    rating: 4.8,
    reviewCount: 4500,
    features: [
      'All-access admission',
      'Bus tour included',
      'IMAX theaters',
      'Shuttle exhibit'
    ],
    ctaText: 'Explore Space',
    ctaUrl: 'https://www.viator.com/tours/Orlando/Kennedy-Space-Center?ref=craudiovizai',
    affiliateId: 'viator'
  }
];

export default function TravelPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [deals, setDeals] = useState(MOCK_DEALS);
  const [isLoading, setIsLoading] = useState(false);
  const { trackPageView, trackEvent } = useAnalytics();

  useEffect(() => {
    trackPageView('travel', { category: selectedCategory });
  }, [selectedCategory, trackPageView]);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    trackEvent('travel_search', { query, category: selectedCategory });
    
    // In production, this would call travel APIs
    setTimeout(() => {
      setDeals(MOCK_DEALS);
      setIsLoading(false);
    }, 500);
  };

  const handleDestinationClick = (destination: string) => {
    trackEvent('travel_destination_click', { destination });
    handleSearch(destination);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Your Perfect Trip
          </h1>
          <p className="text-xl text-orange-100 mb-8">
            Compare deals from Viator, GetYourGuide, Hotels.com & more
          </p>
          
          {/* Quick Search */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.querySelector('input') as HTMLInputElement;
              handleSearch(input.value);
            }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex gap-2 bg-white rounded-lg p-2">
              <input
                type="text"
                placeholder="Where do you want to go?"
                className="flex-1 px-4 py-3 text-gray-900 focus:outline-none"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="bg-white py-8 border-b">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-lg font-semibold mb-4">Popular Destinations</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {POPULAR_DESTINATIONS.map(dest => (
              <button
                key={dest.name}
                onClick={() => handleDestinationClick(dest.name)}
                className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-3xl mb-2">{dest.image}</div>
                <div className="font-medium">{dest.name}</div>
                <div className="text-sm text-gray-500">{dest.deals} deals</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-2 py-4 overflow-x-auto">
            {TRAVEL_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8 px-4">
        <ConversionFunnel
          config={FUNNEL_CONFIGS.travel}
          items={deals}
          onSearch={handleSearch}
          isLoading={isLoading}
        />
      </div>

      {/* Partner Logos */}
      <div className="bg-white py-8 border-t">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-gray-500 text-sm mb-6">
            We compare prices from trusted travel partners
          </p>
          <div className="flex justify-center items-center gap-8 flex-wrap opacity-60">
            <span className="text-xl font-bold">Viator</span>
            <span className="text-xl font-bold">GetYourGuide</span>
            <span className="text-xl font-bold">Hotels.com</span>
            <span className="text-xl font-bold">Expedia</span>
            <span className="text-xl font-bold">TripAdvisor</span>
          </div>
        </div>
      </div>

      {/* Why Book With Us */}
      <div className="py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Why Book With Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white rounded-lg">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-semibold mb-2">Best Price Guarantee</h3>
              <p className="text-sm text-gray-600">Find a lower price? We'll match it.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg">
              <div className="text-3xl mb-3">🎁</div>
              <h3 className="font-semibold mb-2">Earn Credits</h3>
              <p className="text-sm text-gray-600">Get 50 credits on your first booking.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg">
              <div className="text-3xl mb-3">⭐</div>
              <h3 className="font-semibold mb-2">Verified Reviews</h3>
              <p className="text-sm text-gray-600">Real reviews from real travelers.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="font-semibold mb-2">Secure Booking</h3>
              <p className="text-sm text-gray-600">Your payment is always protected.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
