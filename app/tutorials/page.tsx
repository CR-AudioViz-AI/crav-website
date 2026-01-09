'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MobileButton, MobileInput } from '@/components/mobile';
import { Video, Search, Play, Clock, Star, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const tutorials = [
  { title: 'Getting Started with CR AudioViz AI', duration: '5 min', level: 'Beginner', category: 'Basics' },
  { title: 'How to Use Credits Effectively', duration: '8 min', level: 'Beginner', category: 'Basics' },
  { title: 'Building Your First App with Javari', duration: '15 min', level: 'Intermediate', category: 'Development' },
  { title: 'Creating Professional Thumbnails', duration: '10 min', level: 'Beginner', category: 'Design' },
  { title: 'Advanced AI Image Generation', duration: '12 min', level: 'Advanced', category: 'AI Tools' },
  { title: 'Selling on the Marketplace', duration: '8 min', level: 'Intermediate', category: 'Marketplace' },
];

const categories = ['All', 'Basics', 'Development', 'Design', 'AI Tools', 'Marketplace'];

export default function TutorialsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTutorials = tutorials.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cyan-500 via-cyan-500 to-red-600 text-white px-4 py-12 md:py-16 lg:py-20">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <Video className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
              Video Tutorials
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-cyan-500 mb-6 md:mb-8">
              Learn to master CR AudioViz AI with step-by-step guides
            </p>
            <div className="max-w-2xl mx-auto">
              <MobileInput
                type="search"
                placeholder="Search tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-5 h-5" />}
                className="bg-white/90 text-gray-900"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 py-6 md:py-8 bg-white border-b">
        <div className="container mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 md:flex-wrap md:justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-all flex-shrink-0 text-sm ${
                  selectedCategory === category
                    ? 'bg-cyan-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tutorials Grid */}
      <section className="px-4 py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredTutorials.map((tutorial, index) => (
                <Card key={index} className="hover:shadow-lg transition-all cursor-pointer">
                  <div className="h-40 md:h-48 bg-gradient-to-br from-cyan-500 to-cyan-500 flex items-center justify-center relative">
                    <Play className="w-12 h-12 md:w-16 md:h-16 text-white/50" />
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {tutorial.duration}
                    </div>
                  </div>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-cyan-500 text-cyan-500 text-xs font-semibold rounded">
                        {tutorial.category}
                      </span>
                      <span className="text-xs text-gray-500">{tutorial.level}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-sm md:text-base line-clamp-2">
                      {tutorial.title}
                    </h3>
                    <MobileButton fullWidth size="sm" variant="outline">
                      <Play className="w-4 h-4 mr-2" /> Watch Now
                    </MobileButton>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTutorials.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No tutorials found</h3>
                <MobileButton onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} variant="outline">
                  Clear Filters
                </MobileButton>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-12 md:py-16 bg-gradient-to-br from-cyan-500 to-cyan-500 text-white">
        <div className="container mx-auto text-center">
          <BookOpen className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Want More Help?</h2>
          <p className="text-base md:text-lg text-cyan-500 mb-6 md:mb-8 max-w-2xl mx-auto">
            Check out our knowledge base for detailed documentation
          </p>
          <Link href="/knowledge-base" className="inline-block">
            <MobileButton size="lg" className="bg-white text-cyan-500 hover:bg-cyan-500">
              Browse Documentation
            </MobileButton>
          </Link>
        </div>
      </section>
    </div>
  );
}
