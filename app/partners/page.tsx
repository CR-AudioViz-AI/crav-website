import { Card, CardContent } from '@/components/ui/card';
import { MobileButton } from '@/components/mobile';
import { HeartHandshake as Handshake, Rocket, DollarSign, Users, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const partnerTypes = [
  { icon: Rocket, name: 'Technology Partners', description: 'Integrate your tools with our platform', benefits: ['API Access', 'Joint Marketing', 'Technical Support'], color: 'blue' },
  { icon: Users, name: 'Agency Partners', description: 'Offer CR AudioViz AI to your clients', benefits: ['White-label Options', 'Volume Discounts', 'Priority Support'], color: 'purple' },
  { icon: Award, name: 'Affiliate Partners', description: 'Earn commissions on referrals', benefits: ['30% Commission', 'Marketing Materials', 'Dedicated Dashboard'], color: 'green' },
];

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-cyan-500 to-cyan-500 text-white px-4 py-12 md:py-16 lg:py-20">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <Handshake className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
              Partner With Us
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-cyan-500 mb-6 md:mb-8">
              Grow your business by partnering with CR AudioViz AI
            </p>
          </div>
        </div>
      </section>

      {/* Partner Types */}
      <section className="px-4 py-12 md:py-16 bg-white">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">Partnership Programs</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {partnerTypes.map((partner) => {
                const Icon = partner.icon;
                return (
                  <Card key={partner.name} className="hover:shadow-lg transition-all">
                    <CardContent className="p-4 md:p-6">
                      <Icon className={`w-10 h-10 md:w-12 md:h-12 text-${partner.color}-600 mb-3 md:mb-4`} />
                      <h3 className="font-bold text-gray-900 mb-2 text-base md:text-lg">{partner.name}</h3>
                      <p className="text-xs md:text-sm text-gray-600 mb-4">{partner.description}</p>
                      <ul className="space-y-2 mb-4">
                        {partner.benefits.map((benefit) => (
                          <li key={benefit} className="text-xs md:text-sm text-gray-600 flex items-center gap-2">
                            <span className="text-cyan-500">✓</span> {benefit}
                          </li>
                        ))}
                      </ul>
                      <Link href={`/partners/apply?type=${partner.name}`}>
                        <MobileButton fullWidth size="sm">
                          Apply Now <ArrowRight className="w-4 h-4 ml-2" />
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

      {/* Stats */}
      <section className="px-4 py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">500+</div>
                <div className="text-xs md:text-sm text-gray-600">Active Partners</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">$2M+</div>
                <div className="text-xs md:text-sm text-gray-600">Partner Earnings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">30%</div>
                <div className="text-xs md:text-sm text-gray-600">Commission Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">24/7</div>
                <div className="text-xs md:text-sm text-gray-600">Partner Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-12 md:py-16 bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
        <div className="container mx-auto text-center">
          <DollarSign className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Partner?</h2>
          <p className="text-base md:text-lg text-blue-100 mb-6 md:mb-8 max-w-2xl mx-auto">
            Join our partner program and start growing together
          </p>
          <Link href="/contact?subject=Partnership" className="inline-block">
            <MobileButton size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Apply to Partner Program
            </MobileButton>
          </Link>
        </div>
      </section>
    </div>
  );
}

