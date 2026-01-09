'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { MobileInput, MobileButton } from '@/components/mobile';
import { Search, HelpCircle, Mail } from 'lucide-react';
import Link from 'next/link';

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cyan-500 via-teal-600 to-cyan-600 text-white px-4 py-12 md:py-16 lg:py-20">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <HelpCircle className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-lg md:text-xl text-cyan-100 mb-6 md:mb-8">
              Quick answers to common questions about CR AudioViz AI
            </p>
            
            {/* Search Bar - Mobile optimized */}
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <MobileInput
                    type="search"
                    placeholder="Search FAQs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/90 text-gray-900"
                  />
                </div>
                <MobileButton 
                  className="bg-white text-cyan-500 hover:bg-cyan-50 sm:w-auto"
                  icon={<Search className="w-5 h-5" />}
                >
                  <span className="sm:hidden">Search</span>
                </MobileButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="px-4 py-12 md:py-16">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            
            {/* General Questions */}
            <Card className="mb-6 md:mb-8">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-xl md:text-2xl">General Questions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-left text-base md:text-lg">
                      What is CR AudioViz AI?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm md:text-base text-gray-600">
                      CR AudioViz AI is a comprehensive AI-powered platform that empowers creators to build apps, games, 
                      websites, and more. We offer 60+ creative tools, 1,200+ games, and Javari AI assistant to help you 
                      bring your ideas to life without extensive coding knowledge.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-left text-base md:text-lg">
                      Who is CR AudioViz AI for?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm md:text-base text-gray-600">
                      Our platform is perfect for entrepreneurs, small businesses, content creators, designers, developers, 
                      educators, and anyone who wants to create digital content without the complexity of traditional 
                      development tools. Whether you're a complete beginner or an experienced professional, our tools 
                      scale to your needs.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-left text-base md:text-lg">
                      Do I need coding experience?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm md:text-base text-gray-600">
                      No coding experience is required! Our AI-powered tools, especially Javari, guide you through the 
                      creation process using natural language. However, if you are a developer, you have full access to 
                      the code and can customize everything to your heart's content.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger className="text-left text-base md:text-lg">
                      What can I build with CR AudioViz AI?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm md:text-base text-gray-600">
                      You can build websites, mobile apps, games, graphics, videos, logos, presentations, e-commerce stores, 
                      landing pages, and much more. Our 60+ tools cover design, development, marketing, and content creation. 
                      You can also purchase complete apps from our marketplace and white-label them.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Credits & Pricing */}
            <Card className="mb-6 md:mb-8">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-xl md:text-2xl">Credits & Pricing</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="pricing-1">
                    <AccordionTrigger className="text-left text-base md:text-lg">
                      How does the credit system work?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm md:text-base text-gray-600">
                      Each tool and feature consumes credits based on its complexity. Simple tools like QR generators use 
                      1-2 credits, while advanced AI features like app generation may use 10-20 credits. You get 50 free 
                      credits when you sign up, and credits never expire on paid plans.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="pricing-2">
                    <AccordionTrigger className="text-left text-base md:text-lg">
                      What are the pricing plans?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm md:text-base text-gray-600">
                      We offer a Free plan with 50 credits, a Pro plan at $29/month with 500 credits, and an Enterprise 
                      plan at $99/month with unlimited credits. All paid plans include priority support and advanced features.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="pricing-3">
                    <AccordionTrigger className="text-left text-base md:text-lg">
                      Do credits expire?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm md:text-base text-gray-600">
                      Free plan credits expire after 30 days of inactivity. However, credits on paid plans (Pro and Enterprise) 
                      never expire, so you can use them whenever you need them.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="pricing-4">
                    <AccordionTrigger className="text-left text-base md:text-lg">
                      Can I upgrade or downgrade my plan?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm md:text-base text-gray-600">
                      Yes! You can upgrade or downgrade your plan at any time. When you upgrade, you get immediate access 
                      to additional credits and features. When you downgrade, your current credits remain available until used.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Technical Questions */}
            <Card className="mb-6 md:mb-8">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-xl md:text-2xl">Technical Questions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="tech-1">
                    <AccordionTrigger className="text-left text-base md:text-lg">
                      What browsers are supported?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm md:text-base text-gray-600">
                      CR AudioViz AI works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend 
                      using the latest version of your browser for the best experience. Mobile browsers are fully supported.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="tech-2">
                    <AccordionTrigger className="text-left text-base md:text-lg">
                      Can I export my projects?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm md:text-base text-gray-600">
                      Yes! You own all content you create. You can export your projects as files, download source code, 
                      or deploy directly to your own hosting. We never lock you in.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="tech-3">
                    <AccordionTrigger className="text-left text-base md:text-lg">
                      Is my data secure?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm md:text-base text-gray-600">
                      Absolutely. We use enterprise-grade encryption for all data at rest and in transit. We're SOC 2 compliant 
                      and never sell your data. You can delete your account and all associated data at any time.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="tech-4">
                    <AccordionTrigger className="text-left text-base md:text-lg">
                      Do you offer API access?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm md:text-base text-gray-600">
                      Yes! Pro and Enterprise plans include API access. You can integrate our AI tools into your own 
                      applications and workflows. Full documentation is available in your dashboard.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="mb-6 md:mb-8">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-xl md:text-2xl">Support</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="support-1">
                    <AccordionTrigger className="text-left text-base md:text-lg">
                      How do I get support?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm md:text-base text-gray-600">
                      Free users can access our knowledge base and community forum. Pro users get email support with 24-hour 
                      response times. Enterprise users get priority support with dedicated account managers and 4-hour response times.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="support-2">
                    <AccordionTrigger className="text-left text-base md:text-lg">
                      Do you offer training or tutorials?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm md:text-base text-gray-600">
                      Yes! We have a comprehensive library of video tutorials, written guides, and interactive demos. We also 
                      offer live training sessions for Enterprise customers.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="support-3">
                    <AccordionTrigger className="text-left text-base md:text-lg">
                      What if I encounter a bug?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm md:text-base text-gray-600">
                      If you encounter any issues, please report them through our support portal. We prioritize bug fixes 
                      and typically resolve them within 48 hours. Critical bugs are addressed immediately.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Still have questions CTA */}
            <Card className="bg-gradient-to-br from-cyan-500 to-teal-600 text-white border-0">
              <CardContent className="p-6 md:p-8 text-center">
                <Mail className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4" />
                <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
                  Still have questions?
                </h3>
                <p className="text-cyan-100 mb-6 md:mb-8 text-base md:text-lg">
                  Our support team is here to help you succeed
                </p>
                <Link href="/contact" className="inline-block w-full sm:w-auto">
                  <MobileButton 
                    size="lg"
                    fullWidth
                    className="bg-white text-cyan-500 hover:bg-cyan-50 sm:w-auto"
                  >
                    Contact Support
                  </MobileButton>
                </Link>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>
    </div>
  );
}
