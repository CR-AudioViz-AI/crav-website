'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MobileButton } from '@/components/mobile';
import { 
  Star, 
  Quote, 
  CheckCircle2, 
  Award,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

interface Testimonial {
  id: string;
  author: string;
  role: string;
  company: string;
  rating: number;
  quote: string;
  result?: string;
  verified: boolean;
  featured: boolean;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    author: 'Sarah Mitchell',
    role: 'Creative Director',
    company: 'Creative Spark Agency',
    rating: 5,
    quote: 'CR AudioViz AI literally saved our agency. We went from drowning in subscriptions to having everything we need in one place. The ROI was immediate - we saved $720/month in tool costs and delivered projects 5x faster.',
    result: '5x faster delivery, 89% cost savings',
    verified: true,
    featured: true
  },
  {
    id: '2',
    author: 'Marcus Thompson',
    role: 'Content Creator',
    company: 'Tech Tomorrow Channel',
    rating: 5,
    quote: 'My channel exploded after I started using CR AudioViz AI. The thumbnail creator alone is worth 10x the subscription price. I went from 5K to 500K subscribers in 18 months. This platform is a game-changer for creators.',
    result: '500K subscribers gained, $85K sponsorship revenue',
    verified: true,
    featured: true
  },
  {
    id: '3',
    author: 'Jessica Rodriguez',
    role: 'Founder',
    company: 'Mindful Wellness Co.',
    rating: 5,
    quote: 'As a solo entrepreneur, I needed to look professional on a bootstrap budget. CR AudioViz AI gave me everything - branding, course materials, marketing content. I built a 6-figure business without hiring anyone. Incredible value.',
    result: '$147K Year 1 revenue as solopreneur',
    verified: true,
    featured: true
  },
  {
    id: '4',
    author: 'David Chen',
    role: 'Product Manager',
    company: 'StartupFlow',
    rating: 5,
    quote: 'We use CR AudioViz AI for everything - pitch decks, product mockups, marketing campaigns. The AI tools are incredibly accurate and save us hundreds of hours. Best investment we made this year.',
    result: '300+ hours saved monthly',
    verified: true,
    featured: false
  },
  {
    id: '5',
    author: 'Emily Patterson',
    role: 'Freelance Designer',
    company: 'EP Creative Studio',
    rating: 5,
    quote: 'I doubled my client capacity without sacrificing quality. The design tools are professional-grade, and the AI assistance is like having a junior designer on my team 24/7.',
    result: '2x client capacity, 40% revenue increase',
    verified: true,
    featured: false
  },
  {
    id: '6',
    author: 'Michael Santos',
    role: 'Marketing Director',
    company: 'GrowthHub Inc.',
    rating: 5,
    quote: 'CR AudioViz AI transformed our marketing operations. We went from outsourcing everything to producing high-quality content in-house. The cost savings paid for the platform 10x over.',
    result: '$50K annual savings, 3x content output',
    verified: true,
    featured: false
  }
];

export default function TestimonialsPage() {
  const avgRating = 5.0;
  const totalReviews = 1247;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-cyan-500 to-cyan-500 text-white px-4 py-12 md:py-16 lg:py-20">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4 md:mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 md:w-8 md:h-8 fill-cyan-400 text-cyan-400" />
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6">
              Loved by Creators Worldwide
            </h1>
            <p className="text-lg md:text-xl text-cyan-500 mb-3">
              <span className="font-bold text-2xl md:text-3xl">{avgRating}</span> average rating from{' '}
              <span className="font-bold">{totalReviews.toLocaleString()}+</span> reviews
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-12 md:py-16 bg-white">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
              <div className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">98%</div>
                <div className="text-sm md:text-base text-gray-600">Customer Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Award className="w-6 h-6 md:w-8 md:h-8 text-cyan-500" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">4.9/5</div>
                <div className="text-sm md:text-base text-gray-600">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-cyan-500" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">100K+</div>
                <div className="text-sm md:text-base text-gray-600">Happy Creators</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="px-4 py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8 md:mb-12">
              What Our Customers Say
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {testimonials.map((testimonial) => (
                <Card 
                  key={testimonial.id}
                  className={`hover:shadow-xl transition-all ${
                    testimonial.featured ? 'border-2 border-cyan-500' : ''
                  }`}
                >
                  <CardContent className="p-4 md:p-6">
                    {/* Featured Badge */}
                    {testimonial.featured && (
                      <div className="flex items-center gap-1 mb-3">
                        <Award className="w-4 h-4 text-cyan-500" />
                        <span className="text-xs font-bold text-cyan-500 uppercase">Featured</span>
                      </div>
                    )}

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-cyan-400 text-cyan-400" />
                      ))}
                      {testimonial.verified && (
                        <CheckCircle2 className="w-4 h-4 text-cyan-500 ml-2" />
                      )}
                    </div>

                    {/* Quote */}
                    <div className="relative mb-4">
                      <Quote className="w-6 h-6 text-gray-300 absolute -top-2 -left-1" />
                      <p className="text-sm md:text-base text-gray-700 pl-6 leading-relaxed">
                        {testimonial.quote}
                      </p>
                    </div>

                    {/* Result */}
                    {testimonial.result && (
                      <div className="bg-cyan-500 border border-cyan-500 rounded-lg p-3 mb-4">
                        <p className="text-xs md:text-sm font-semibold text-cyan-500">
                          📈 {testimonial.result}
                        </p>
                      </div>
                    )}

                    {/* Author */}
                    <div className="border-t pt-4">
                      <div className="font-semibold text-gray-900 text-sm md:text-base">
                        {testimonial.author}
                      </div>
                      <div className="text-xs md:text-sm text-gray-600">
                        {testimonial.role}
                      </div>
                      <div className="text-xs text-gray-500">
                        {testimonial.company}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="px-4 py-12 md:py-16 bg-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">
              Trusted by Industry Leaders
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {['Fortune 500s', 'Startups', 'Freelancers', 'Agencies'].map((badge, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 md:p-6">
                  <div className="font-semibold text-gray-900 text-sm md:text-base">{badge}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-12 md:py-16 bg-gradient-to-br from-cyan-500 to-cyan-500 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            Join Thousands of Happy Creators
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-cyan-500 mb-6 md:mb-8 max-w-2xl mx-auto">
            Start creating amazing content today with 50 free credits
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link href="/signup" className="flex-1">
              <MobileButton 
                size="lg" 
                fullWidth
                className="bg-white text-cyan-500 hover:bg-cyan-500"
              >
                Start Free Trial
              </MobileButton>
            </Link>
            <Link href="/pricing" className="flex-1">
              <MobileButton 
                size="lg" 
                fullWidth
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10"
              >
                View Pricing
              </MobileButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
