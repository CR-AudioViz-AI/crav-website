// /app/about/page.tsx
// About Page - CR AudioViz AI

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AboutPage() {
  const team = [
    { name: 'Roy Henderson', role: 'CEO & Co-Founder', emoji: '👨‍💼', bio: 'Technical visionary building the future of AI-powered creativity' },
    { name: 'Cindy Henderson', role: 'CMO & Co-Founder', emoji: '👩‍💼', bio: 'Marketing strategist driving brand growth and community' },
    { name: 'Javari', role: 'AI Assistant', emoji: '🤖', bio: 'Your friendly AI companion for all creative tasks' }
  ];

  const values = [
    { icon: '🎯', title: 'Quality First', desc: 'Fortune 50 standards in everything we build' },
    { icon: '💡', title: 'Innovation', desc: 'Pushing boundaries with AI-powered tools' },
    { icon: '🤝', title: 'Customer Success', desc: 'Your success is our success' },
    { icon: '🔒', title: 'Trust & Security', desc: 'Your data stays yours, always' },
    { icon: '🌍', title: 'Social Impact', desc: 'Building for communities that need it most' },
    { icon: '🚀', title: 'Accessibility', desc: 'Powerful tools for everyone, everywhere' }
  ];

  const milestones = [
    { year: '2024', event: 'CR AudioViz AI founded in Fort Myers, Florida' },
    { year: '2024', event: 'Launched Javari AI assistant' },
    { year: '2025', event: 'Expanded to comprehensive creative platform' },
    { year: '2025', event: 'Launched Creator Marketplace' },
    { year: 'Future', event: 'Social impact modules for underserved communities' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 via-cyan-600 to-cyan-500 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-6"
          >
            Your Story. Our Design.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-blue-100 max-w-2xl mx-auto"
          >
            We're building the future of AI-powered creativity. A platform where everyone connects and everyone wins.
          </motion.p>
        </div>
      </div>

      {/* Mission */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Our Mission</h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              CR AudioViz AI exists to democratize creative power. We believe everyone deserves access to professional-grade 
              AI tools, regardless of technical skill or budget. From entrepreneurs to artists, students to seasoned professionals, 
              our platform empowers creators to bring their visions to life.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
              Beyond creativity, we're committed to social impact. A portion of our revenue funds modules for first responders, 
              veterans, faith communities, and animal rescue organizations. Technology should lift everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, idx) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-xl p-6 text-center shadow-lg"
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">Meet the Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, idx) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                  {member.emoji}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{member.name}</h3>
                <p className="text-blue-600 dark:text-blue-400 text-sm mb-2">{member.role}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">Our Journey</h2>
          <div className="space-y-6">
            {milestones.map((milestone, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex gap-6"
              >
                <div className="w-20 flex-shrink-0 text-right">
                  <span className="font-bold text-blue-600 dark:text-blue-400">{milestone.year}</span>
                </div>
                <div className="flex-1 pb-6 border-l-2 border-blue-500 pl-6 relative">
                  <div className="absolute w-4 h-4 bg-blue-500 rounded-full -left-[9px] top-1" />
                  <p className="text-gray-700 dark:text-gray-300">{milestone.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Ready to Create?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
            Join our growing community of creators and start building something amazing today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-slate-700"
            >
              Get Started Free →
            </Link>
            <Link
              href="/socials"
              className="px-8 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Follow Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <section className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-medium text-white mb-2">CR AudioViz AI, LLC</p>
          <p>Fort Myers, Florida 🌴</p>
          <p className="mt-4 text-sm">
            A Florida S-Corporation | EIN: 93-4520864
          </p>
        </div>
      </section>
    </div>
  );
}
