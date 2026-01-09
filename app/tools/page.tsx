'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MobileButton, MobileInput } from '@/components/mobile';
import { 
  Code2, Download, Share2, Sparkles, Search,
  Image, FileText, Video, Music, Palette, Wand2
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const toolCategories = [
  {
    id: 'image',
    name: 'Image Tools',
    icon: Image,
    color: 'blue',
    tools: [
      { name: 'Image Generator', slug: 'image-generator', icon: '🎨' },
      { name: 'Image Resizer', slug: 'image-resizer', icon: '📐' },
      { name: 'Background Remover', slug: 'background-remover', icon: '✂️' },
      { name: 'Thumbnail Creator', slug: 'thumbnail-creator', icon: '🖼️' }
    ]
  },
  {
    id: 'document',
    name: 'Document Tools',
    icon: FileText,
    color: 'green',
    tools: [
      { name: 'eBook Creator', slug: 'ebook-creator', icon: '📚' },
      { name: 'Invoice Generator', slug: 'invoice-generator', icon: '💰' },
      { name: 'PDF Editor', slug: 'pdf-editor', icon: '📄' },
      { name: 'Resume Builder', slug: 'resume-builder', icon: '📝' }
    ]
  },
  {
    id: 'creative',
    name: 'Creative Tools',
    icon: Palette,
    color: 'purple',
    tools: [
      { name: 'Meme Generator', slug: 'meme-generator', icon: '😂' },
      { name: 'Logo Maker', slug: 'logo-maker', icon: '🎭' },
      { name: 'Poster Designer', slug: 'poster-designer', icon: '🎨' },
      { name: 'Social Media Kit', slug: 'social-media-kit', icon: '📱' }
    ]
  },
  {
    id: 'video',
    name: 'Video Tools',
    icon: Video,
    color: 'red',
    tools: [
      { name: 'Video Editor', slug: 'video-editor', icon: '🎬' },
      { name: 'Subtitle Generator', slug: 'subtitle-generator', icon: '💬' },
      { name: 'Animation Studio', slug: 'animation-studio', icon: '🎞️' },
      { name: 'Screen Recorder', slug: 'screen-recorder', icon: '📹' }
    ]
  },
  {
    id: 'audio',
    name: 'Audio Tools',
    icon: Music,
    color: 'orange',
    tools: [
      { name: 'Audio Editor', slug: 'audio-editor', icon: '🎵' },
      { name: 'Voice Generator', slug: 'voice-generator', icon: '🎤' },
      { name: 'Music Mixer', slug: 'music-mixer', icon: '🎧' },
      { name: 'Podcast Editor', slug: 'podcast-editor', icon: '🎙️' }
    ]
  },
  {
    id: 'ai',
    name: 'AI-Powered Tools',
    icon: Wand2,
    color: 'pink',
    tools: [
      { name: 'AI Writer', slug: 'ai-writer', icon: '✍️' },
      { name: 'AI Chatbot', slug: 'ai-chatbot', icon: '💬' },
      { name: 'AI Analyzer', slug: 'ai-analyzer', icon: '🔍' },
      { name: 'AI Translator', slug: 'ai-translator', icon: '🌐' }
    ]
  }
];

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = toolCategories.map(category => ({
    ...category,
    tools: category.tools.filter(tool =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.tools.length > 0);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; hover: string }> = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', hover: 'hover:bg-blue-100' },
      green: { bg: 'bg-green-50', text: 'text-cyan-500', border: 'border-cyan-500', hover: 'hover:bg-cyan-500' },
      purple: { bg: 'bg-purple-50', text: 'text-cyan-500', border: 'border-cyan-500', hover: 'hover:bg-cyan-500' },
      red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', hover: 'hover:bg-red-100' },
      orange: { bg: 'bg-orange-50', text: 'text-cyan-500', border: 'border-cyan-500', hover: 'hover:bg-cyan-500' },
      pink: { bg: 'bg-pink-50', text: 'text-cyan-500', border: 'border-cyan-500', hover: 'hover:bg-cyan-500' },
    };
    return colors[color] || colors.blue;
  };

  const totalTools = toolCategories.reduce((sum, cat) => sum + cat.tools.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-cyan-500 to-cyan-500 text-white px-4 py-12 md:py-16 lg:py-20">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6">
              {totalTools}+ Creative Tools
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-cyan-500 mb-6 md:mb-8">
              Everything you need to create, design, and build - all powered by AI
            </p>
            <MobileInput
              type="search"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-5 h-5" />}
              className="max-w-2xl mx-auto bg-white/90 text-gray-900"
            />
          </div>
        </div>
      </section>

      {/* App Builder Highlight */}
      <section className="px-4 py-12 md:py-16 bg-white">
        <div className="container mx-auto">
          <Card className="max-w-5xl mx-auto border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                <Code2 className="inline-block w-6 h-6 md:w-8 md:h-8 mr-2 text-blue-600" />
                Build Custom Tools with AI
              </CardTitle>
              <p className="text-sm md:text-base lg:text-lg text-gray-600">
                Create custom apps with Javari AI assistance - no coding required
              </p>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm md:text-base">AI-Powered</p>
                    <p className="text-xs md:text-sm text-gray-600">Let Javari build your app</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Share2 className="w-5 h-5 text-cyan-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm md:text-base">Host or Export</p>
                    <p className="text-xs md:text-sm text-gray-600">Keep code or earn 70%</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Download className="w-5 h-5 text-cyan-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm md:text-base">Full Control</p>
                    <p className="text-xs md:text-sm text-gray-600">Download source code</p>
                  </div>
                </div>
              </div>
              <Link href="/apps" className="block">
                <MobileButton 
                  fullWidth
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Start Building Your App
                </MobileButton>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tools by Category */}
      <section className="px-4 py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
            {filteredCategories.map((category) => {
              const Icon = category.icon;
              const colors = getColorClasses(category.color);
              
              return (
                <div key={category.id}>
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <div className={`w-10 h-10 md:w-12 md:h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 md:w-6 md:h-6 ${colors.text}`} />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {category.name}
                    </h2>
                    <span className="text-sm md:text-base text-gray-500">
                      ({category.tools.length})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {category.tools.map((tool) => (
                      <Link
                        key={tool.slug}
                        href={`/tools/${tool.slug}`}
                        className={`${colors.bg} ${colors.border} border-2 rounded-xl p-4 md:p-6 ${colors.hover} transition-all group`}
                      >
                        <div className="text-4xl md:text-5xl mb-3 md:mb-4">{tool.icon}</div>
                        <h3 className={`text-base md:text-lg font-bold ${colors.text} group-hover:underline`}>
                          {tool.name}
                        </h3>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* No Results */}
          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No tools found</h3>
              <p className="text-gray-600 mb-6">Try a different search term</p>
              <MobileButton
                onClick={() => setSearchQuery('')}
                variant="outline"
              >
                Clear Search
              </MobileButton>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-12 md:py-16 bg-gradient-to-br from-cyan-500 to-cyan-500 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            Ready to Start Creating?
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-cyan-500 mb-6 md:mb-8 max-w-2xl mx-auto">
            Access all {totalTools}+ tools with a Creative Pro subscription
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link href="/signup" className="flex-1">
              <MobileButton 
                size="lg" 
                fullWidth
                className="bg-white text-cyan-500 hover:bg-purple-50"
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
