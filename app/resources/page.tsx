'use client';

import React, { useState } from 'react';
import { ExternalLink, Search, Sparkles, Video, Music, Code, FileText, Image, Gamepad2, BookOpen, Briefcase, Plane, Palette, Cpu } from 'lucide-react';

const RESOURCES = [
  { category: 'AI Video', icon: Video, color: 'purple', items: [
    { name: 'Kling AI', url: 'https://klingai.com', desc: 'AI video generation, 66 free credits/day', free: true, hot: true },
    { name: 'Runway ML', url: 'https://runwayml.com', desc: 'AI video editing suite', free: false },
    { name: 'HeyGen', url: 'https://heygen.com', desc: 'AI avatar videos', free: false },
  ]},
  { category: 'AI Image', icon: Image, color: 'pink', items: [
    { name: 'Krea AI', url: 'https://krea.ai', desc: '900 free images/day, 64+ AI models', free: true, hot: true },
    { name: 'Remove.bg', url: 'https://remove.bg', desc: 'AI background removal', free: true },
    { name: 'Photopea', url: 'https://photopea.com', desc: 'Free Photoshop alternative', free: true, hot: true },
    { name: 'Cleanup.pictures', url: 'https://cleanup.pictures', desc: 'AI object removal', free: true },
  ]},
  { category: 'AI Music', icon: Music, color: 'green', items: [
    { name: 'Suno AI', url: 'https://suno.com', desc: 'AI music generation, 50 free credits/day', free: true, hot: true },
    { name: 'ElevenLabs', url: 'https://elevenlabs.io', desc: 'AI voice synthesis', free: true },
    { name: 'Vocal Remover', url: 'https://vocalremover.org', desc: 'AI vocal separation', free: true },
  ]},
  { category: 'AI Dev', icon: Cpu, color: 'blue', items: [
    { name: 'DeepSeek', url: 'https://deepseek.com', desc: 'AI models 10-30x cheaper than OpenAI', free: true, hot: true },
    { name: 'Hugging Face', url: 'https://huggingface.co', desc: '200K+ AI models', free: true, hot: true },
    { name: 'Bolt.new', url: 'https://bolt.new', desc: 'AI app builder', free: true },
  ]},
  { category: 'PDF Tools', icon: FileText, color: 'red', items: [
    { name: 'CR PDF Tools', url: '/apps/pdf-tools', desc: 'Our 60+ PDF tools', free: true, hot: true },
    { name: 'StirlingPDF', url: 'https://stirlingpdf.io', desc: 'Open-source PDF tools', free: true },
    { name: 'iLovePDF', url: 'https://ilovepdf.com', desc: 'Online PDF suite', free: true },
  ]},
  { category: 'Learning', icon: BookOpen, color: 'indigo', items: [
    { name: 'ByteByteGo', url: 'https://bytebytego.com', desc: 'System design, 1M+ subscribers', free: true, hot: true },
    { name: 'The Hustle', url: 'https://thehustle.co', desc: 'Business newsletter', free: true },
    { name: 'TechPresso', url: 'https://techpresso.co', desc: 'Tech newsletter', free: true },
  ]},
  { category: 'Games', icon: Gamepad2, color: 'yellow', items: [
    { name: 'Emupedia', url: 'https://emupedia.net', desc: 'Classic PC games in browser', free: true, hot: true },
    { name: 'Neal.fun', url: 'https://neal.fun', desc: '35+ interactive experiences', free: true, hot: true },
    { name: 'Poki', url: 'https://poki.com', desc: '5000+ browser games', free: true },
    { name: 'CrazyGames', url: 'https://crazygames.com', desc: '5000+ browser games', free: true },
  ]},
  { category: 'Productivity', icon: Briefcase, color: 'teal', items: [
    { name: 'TinyWow', url: 'https://tinywow.com', desc: '200+ free online tools', free: true, hot: true },
    { name: '123Apps', url: 'https://123apps.com', desc: '50+ free tools', free: true },
    { name: '10 Minute Mail', url: 'https://10minutemail.com', desc: 'Disposable email', free: true },
  ]},
];

const COLORS: Record<string, string> = {
  purple: 'bg-cyan-500 text-cyan-500 border-cyan-500',
  pink: 'bg-cyan-500 text-cyan-500 border-cyan-500',
  green: 'bg-cyan-500 text-cyan-500 border-cyan-500',
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  red: 'bg-red-50 text-red-600 border-red-200',
  indigo: 'bg-cyan-500 text-cyan-500 border-cyan-500',
  yellow: 'bg-cyan-500 text-cyan-500 border-cyan-500',
  teal: 'bg-teal-50 text-teal-600 border-teal-200',
};

export default function ResourcesPage() {
  const [search, setSearch] = useState('');
  const total = RESOURCES.reduce((a, c) => a + c.items.length, 0);

  const filtered = RESOURCES.map(cat => ({
    ...cat,
    items: cat.items.filter(i => 
      i.name.toLowerCase().includes(search.toLowerCase()) || 
      i.desc.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(c => c.items.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-cyan-500" />
            <h1 className="text-3xl font-bold">Free Resources</h1>
          </div>
          <p className="text-gray-600 mb-6">{total}+ curated free tools to supercharge your creativity</p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-cyan-500 outline-none" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {filtered.map(cat => {
          const Icon = cat.icon;
          return (
            <div key={cat.category} className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${COLORS[cat.color].split(' ').slice(0, 2).join(' ')}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold">{cat.category}</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                {cat.items.map(item => (
                  <a key={item.name} href={item.url} target={item.url.startsWith('/') ? '_self' : '_blank'} rel="noopener noreferrer"
                    className={`block p-4 bg-white rounded-xl border hover:shadow-lg transition-all ${item.hot ? COLORS[cat.color].split(' ')[2] : 'border-gray-100'}`}>
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-semibold">{item.name}</span>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{item.desc}</p>
                    <div className="flex gap-1">
                      {item.free && <span className="px-2 py-0.5 bg-cyan-500 text-cyan-500 text-xs rounded-full">Free</span>}
                      {item.hot && <span className="px-2 py-0.5 bg-cyan-500 text-cyan-500 text-xs rounded-full">⭐ Hot</span>}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
