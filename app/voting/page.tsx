'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MobileButton } from '@/components/mobile';
import { Vote, ThumbsUp, Trophy, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const votingItems = [
  { name: 'AI Image Generator Pro', votes: 1250, category: 'Tools', trend: '+15%' },
  { name: 'Game Builder 3000', votes: 980, category: 'Apps', trend: '+12%' },
  { name: 'Smart Resume Creator', votes: 875, category: 'Tools', trend: '+8%' },
  { name: 'Puzzle Adventure Pack', votes: 720, category: 'Games', trend: '+22%' },
];

export default function VotingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-cyan-500 via-cyan-500 to-red-600 text-white px-4 py-12 md:py-16 lg:py-20">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <Vote className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
              Community Voting
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-cyan-500 mb-6 md:mb-8">
              Vote for your favorite apps, tools, and games
            </p>
          </div>
        </div>
      </section>

      {/* Top Voted */}
      <section className="px-4 py-12 md:py-16 bg-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 flex items-center gap-2">
              <Trophy className="w-8 h-8 text-cyan-400" /> Top Voted This Week
            </h2>
            
            <div className="space-y-4">
              {votingItems.map((item, index) => (
                <Card key={item.name} className="hover:shadow-lg transition-all">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-cyan-400' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-cyan-500' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-sm md:text-base">{item.name}</h3>
                        <p className="text-xs text-gray-500">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-cyan-500 font-bold">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm md:text-base">{item.votes.toLocaleString()}</span>
                        </div>
                        <span className="text-xs text-cyan-500">{item.trend}</span>
                      </div>
                      <MobileButton size="sm" variant="outline">
                        Vote
                      </MobileButton>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-12 md:py-16 bg-gradient-to-br from-cyan-500 to-cyan-500 text-white">
        <div className="container mx-auto text-center">
          <Star className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Submit Your Creation</h2>
          <p className="text-base md:text-lg text-cyan-500 mb-6 md:mb-8 max-w-2xl mx-auto">
            Get your app, tool, or game featured in community voting
          </p>
          <Link href="/marketplace" className="inline-block">
            <MobileButton size="lg" className="bg-white text-cyan-500 hover:bg-cyan-500">
              Submit to Marketplace
            </MobileButton>
          </Link>
        </div>
      </section>
    </div>
  );
}
