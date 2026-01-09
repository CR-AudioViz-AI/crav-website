import { Card, CardContent } from '@/components/ui/card';
import { MobileButton } from '@/components/mobile';
import { Users, MessageSquare, Star, Trophy, Heart, Zap, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const communityLinks = [
  { icon: MessageSquare, name: 'Discord', description: 'Join 10K+ creators', link: 'https://discord.gg/craudiovizai', color: 'indigo', members: '10,000+' },
  { icon: Users, name: 'Forum', description: 'Ask questions, share tips', link: '/community/forum', color: 'blue', members: '5,000+' },
  { icon: Star, name: 'Showcase', description: 'Show off your creations', link: '/community/showcase', color: 'yellow', members: '2,500+' },
  { icon: Trophy, name: 'Challenges', description: 'Compete and win prizes', link: '/community/challenges', color: 'orange', members: '1,200+' },
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cyan-500 via-cyan-500 to-red-600 text-white px-4 py-12 md:py-16 lg:py-20">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <Users className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
              Join Our Community
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-cyan-500 mb-6 md:mb-8">
              Connect with 100,000+ creators building amazing things
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-12 md:py-16 bg-white">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">100K+</div>
                <div className="text-xs md:text-sm text-gray-600">Community Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">50K+</div>
                <div className="text-xs md:text-sm text-gray-600">Projects Shared</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">5K+</div>
                <div className="text-xs md:text-sm text-gray-600">Daily Messages</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">24/7</div>
                <div className="text-xs md:text-sm text-gray-600">Active Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Channels */}
      <section className="px-4 py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">Ways to Connect</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {communityLinks.map((channel) => {
                const Icon = channel.icon;
                return (
                  <Card key={channel.name} className="hover:shadow-lg transition-all">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 md:w-16 md:h-16 bg-${channel.color}-100 rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-6 h-6 md:w-8 md:h-8 text-${channel.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1 text-base md:text-lg">{channel.name}</h3>
                          <p className="text-xs md:text-sm text-gray-600 mb-2">{channel.description}</p>
                          <p className="text-xs text-gray-500">{channel.members} members</p>
                        </div>
                      </div>
                      <Link href={channel.link} className="block mt-4">
                        <MobileButton fullWidth size="sm" variant="outline">
                          Join <ExternalLink className="w-4 h-4 ml-2" />
                        </MobileButton>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Creators */}
      <section className="px-4 py-12 md:py-16 bg-white">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">Featured Creators</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {[
                { name: 'Sarah M.', title: 'Top Contributor', projects: 150, icon: '🏆' },
                { name: 'Mike C.', title: 'Tutorial Creator', projects: 89, icon: '📚' },
                { name: 'Emily R.', title: 'Challenge Winner', projects: 67, icon: '🎨' },
              ].map((creator) => (
                <Card key={creator.name}>
                  <CardContent className="p-4 md:p-6 text-center">
                    <div className="text-4xl mb-3">{creator.icon}</div>
                    <h3 className="font-bold text-gray-900 mb-1">{creator.name}</h3>
                    <p className="text-xs md:text-sm text-gray-600 mb-2">{creator.title}</p>
                    <p className="text-xs text-gray-500">{creator.projects} projects</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-12 md:py-16 bg-gradient-to-br from-cyan-500 to-cyan-500 text-white">
        <div className="container mx-auto text-center">
          <Heart className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Join?</h2>
          <p className="text-base md:text-lg text-cyan-500 mb-6 md:mb-8 max-w-2xl mx-auto">
            Become part of our creative community today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <a href="https://discord.gg/craudiovizai" target="_blank" rel="noopener noreferrer" className="flex-1">
              <MobileButton size="lg" fullWidth className="bg-white text-cyan-500 hover:bg-cyan-500">
                Join Discord
              </MobileButton>
            </a>
            <Link href="/signup" className="flex-1">
              <MobileButton size="lg" fullWidth variant="outline" className="border-2 border-white text-white hover:bg-white/10">
                Create Account
              </MobileButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
