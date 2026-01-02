'use client';

import { useState } from 'react';
import { Shield, FileText, Briefcase, GraduationCap, Heart, Users, MapPin, Phone, ChevronRight, Star, Award, Home } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  icon: React.ElementType;
}

const resources: Resource[] = [
  {
    id: '1',
    title: 'VA Benefits Navigator',
    description: 'Step-by-step guide to understanding and claiming your VA benefits',
    category: 'Benefits',
    url: '#',
    icon: FileText
  },
  {
    id: '2',
    title: 'Career Transition Toolkit',
    description: 'Translate military skills to civilian job requirements',
    category: 'Employment',
    url: '#',
    icon: Briefcase
  },
  {
    id: '3',
    title: 'Education Benefits Guide',
    description: 'GI Bill, scholarships, and education assistance programs',
    category: 'Education',
    url: '#',
    icon: GraduationCap
  },
  {
    id: '4',
    title: 'Mental Health Resources',
    description: 'Confidential support and counseling services',
    category: 'Health',
    url: '#',
    icon: Heart
  },
  {
    id: '5',
    title: 'Veteran Service Organizations',
    description: 'Connect with VFW, American Legion, DAV, and more',
    category: 'Community',
    url: '#',
    icon: Users
  },
  {
    id: '6',
    title: 'Housing Assistance',
    description: 'VA home loans, housing grants, and emergency shelter',
    category: 'Housing',
    url: '#',
    icon: Home
  }
];

const categories = ['All', 'Benefits', 'Employment', 'Education', 'Health', 'Community', 'Housing'];

export default function VeteranHubPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResources = resources.filter(r => {
    const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const quickLinks = [
    { label: 'VA.gov', url: 'https://va.gov', description: 'Official VA website' },
    { label: 'eBenefits', url: 'https://ebenefits.va.gov', description: 'Manage your benefits' },
    { label: 'Veterans Crisis Line', url: 'tel:988', description: 'Press 1 for veterans' },
    { label: 'Find VA Locations', url: 'https://va.gov/find-locations', description: 'Hospitals & clinics' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Veteran Transition Hub</h1>
                <p className="text-sm text-gray-400">Resources for those who served</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="tel:988"
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <Phone className="w-4 h-4" />
                Crisis Line: 988
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900/50 to-red-900/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              ))}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Thank You for Your Service
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Access benefits, find employment, connect with community, and build your next chapter.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickLinks.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition group"
            >
              <div className="font-semibold text-white group-hover:text-blue-400 transition">
                {link.label}
              </div>
              <div className="text-sm text-gray-400">{link.description}</div>
            </a>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg transition ${activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredResources.map(resource => (
            <a
              key={resource.id}
              href={resource.url}
              className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                  <resource.icon className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition">
                      {resource.title}
                    </h3>
                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition" />
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{resource.description}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                    {resource.category}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Tools Section */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-8 mb-12">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Award className="w-7 h-7 text-yellow-500" />
            Veteran Tools
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white/5 rounded-xl">
              <h4 className="font-semibold text-white mb-2">Resume Builder</h4>
              <p className="text-gray-400 text-sm mb-4">
                Translate your military experience into civilian terms with our AI-powered resume builder.
              </p>
              <a href="/apps/resume-builder" className="text-blue-400 hover:text-blue-300 text-sm">
                Build Your Resume →
              </a>
            </div>
            <div className="p-6 bg-white/5 rounded-xl">
              <h4 className="font-semibold text-white mb-2">Benefits Calculator</h4>
              <p className="text-gray-400 text-sm mb-4">
                Estimate your VA disability rating and potential monthly compensation.
              </p>
              <a href="#" className="text-blue-400 hover:text-blue-300 text-sm">
                Calculate Benefits →
              </a>
            </div>
            <div className="p-6 bg-white/5 rounded-xl">
              <h4 className="font-semibold text-white mb-2">Document Generator</h4>
              <p className="text-gray-400 text-sm mb-4">
                Create DD-214 requests, appeals, and other official documents.
              </p>
              <a href="/apps/pdf-builder" className="text-blue-400 hover:text-blue-300 text-sm">
                Generate Documents →
              </a>
            </div>
          </div>
        </div>

        {/* Emergency Resources */}
        <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-4">Need Immediate Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-red-400 font-semibold">Veterans Crisis Line</div>
              <div className="text-2xl text-white font-bold">988 (Press 1)</div>
              <div className="text-gray-400 text-sm">24/7 confidential support</div>
            </div>
            <div>
              <div className="text-red-400 font-semibold">Text Support</div>
              <div className="text-2xl text-white font-bold">838255</div>
              <div className="text-gray-400 text-sm">Text for help anytime</div>
            </div>
            <div>
              <div className="text-red-400 font-semibold">Online Chat</div>
              <a href="https://veteranscrisisline.net/get-help/chat" target="_blank" rel="noopener noreferrer" className="text-2xl text-blue-400 hover:text-blue-300 font-bold">
                Start Chat →
              </a>
              <div className="text-gray-400 text-sm">Connect with a counselor</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>This resource hub is provided by CR AudioViz AI as part of our Social Impact Initiative.</p>
          <p className="mt-2">For official VA information, please visit <a href="https://va.gov" className="text-blue-400 hover:text-blue-300">VA.gov</a></p>
        </div>
      </div>
    </div>
  );
}
