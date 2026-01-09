import { Card, CardContent } from '@/components/ui/card';
import { MobileButton } from '@/components/mobile';
import { DollarSign, Shield, Heart, PawPrint, TreePine, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const grantPrograms = [
  { icon: Shield, name: 'First Responders', amount: '$400M+', description: 'Mental health support for police, fire, EMS', color: 'blue' },
  { icon: Heart, name: 'Military Families', amount: '$100M+', description: 'Support for veterans and families', color: 'red' },
  { icon: PawPrint, name: 'Animal Rescue', amount: '$40M+', description: 'Shelter management and adoption', color: 'orange' },
  { icon: TreePine, name: 'Environmental', amount: '$35M+', description: 'Conservation and sustainability', color: 'green' },
  { icon: Users, name: 'Nonprofits', amount: '$25M+', description: 'Operational support for 501(c)(3)', color: 'purple' },
];

export default function GrantsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cyan-500 via-teal-600 to-blue-600 text-white px-4 py-12 md:py-16 lg:py-20">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <DollarSign className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6">
              $600M+ in Grant Funding
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-cyan-500 mb-6 md:mb-8">
              Supporting social impact organizations through CRAIverse
            </p>
          </div>
        </div>
      </section>

      {/* Grant Programs */}
      <section className="px-4 py-12 md:py-16 bg-white">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">Available Grant Programs</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {grantPrograms.map((program) => {
                const Icon = program.icon;
                return (
                  <Card key={program.name} className="hover:shadow-lg transition-all">
                    <CardContent className="p-4 md:p-6">
                      <Icon className={`w-10 h-10 md:w-12 md:h-12 text-${program.color}-600 mb-3`} />
                      <h3 className="font-bold text-gray-900 mb-1 text-base md:text-lg">{program.name}</h3>
                      <p className="text-xl md:text-2xl font-bold text-cyan-500 mb-2">{program.amount}</p>
                      <p className="text-xs md:text-sm text-gray-600">{program.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">How to Apply</h2>
            
            <div className="space-y-4 md:space-y-6">
              {[
                { step: 1, title: 'Check Eligibility', description: 'Review grant requirements for your organization type' },
                { step: 2, title: 'Submit Application', description: 'Complete the online application with documentation' },
                { step: 3, title: 'Review Process', description: 'Our team reviews applications within 2-4 weeks' },
                { step: 4, title: 'Receive Funding', description: 'Approved organizations receive grant disbursement' },
              ].map((item) => (
                <Card key={item.step}>
                  <CardContent className="p-4 md:p-6 flex items-start gap-4">
                    <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-cyan-500">{item.step}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">{item.title}</h3>
                      <p className="text-xs md:text-sm text-gray-600">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-12 md:py-16 bg-gradient-to-br from-cyan-500 to-teal-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Apply?</h2>
          <p className="text-base md:text-lg text-cyan-500 mb-6 md:mb-8 max-w-2xl mx-auto">
            Start your grant application today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link href="/contact?subject=Grant Application" className="flex-1">
              <MobileButton size="lg" fullWidth className="bg-white text-cyan-500 hover:bg-cyan-500">
                Apply Now
              </MobileButton>
            </Link>
            <Link href="/craiverse" className="flex-1">
              <MobileButton size="lg" fullWidth variant="outline" className="border-2 border-white text-white hover:bg-white/10">
                Learn More
              </MobileButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
