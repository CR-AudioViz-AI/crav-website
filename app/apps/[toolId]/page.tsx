// app/apps/[toolId]/page.tsx
// Individual Tool Page - Universal interface for all tools
// Timestamp: Dec 11, 2025 11:38 PM EST

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Sparkles, Loader2, Download, RefreshCw, 
  Share2, Heart, Clock, Coins, AlertCircle, CheckCircle,
  Image as ImageIcon, Settings, Wand2
} from 'lucide-react';

// Tool configurations (should match TOOLS_CATALOG)
const TOOL_CONFIGS: Record<string, any> = {
  'image-generator': {
    name: 'AI Image Generator',
    description: 'Create stunning images from text descriptions using state-of-the-art AI models.',
    category: 'image',
    credits: { standard: 5, hd: 10, premium: 25 },
    inputs: [
      { id: 'prompt', type: 'textarea', label: 'Describe your image', placeholder: 'A magical forest with glowing mushrooms at sunset...', required: true },
      { id: 'negative_prompt', type: 'textarea', label: 'Negative prompt (optional)', placeholder: 'blurry, low quality, distorted...' },
      { id: 'aspect_ratio', type: 'select', label: 'Aspect Ratio', options: ['1:1', '16:9', '9:16', '4:3', '3:4'] },
      { id: 'style', type: 'select', label: 'Style', options: ['Realistic', 'Anime', 'Digital Art', 'Oil Painting', 'Watercolor', 'Sketch', '3D Render'] },
    ],
    tiers: [
      { id: 'standard', name: 'Standard', credits: 5, resolution: '512x512' },
      { id: 'hd', name: 'HD', credits: 10, resolution: '1024x1024' },
      { id: 'premium', name: 'Premium (Flux)', credits: 25, resolution: '2048x2048' },
    ],
  },
  'background-remover': {
    name: 'Background Remover',
    description: 'Remove backgrounds from images instantly with AI precision.',
    category: 'image',
    credits: { default: 3 },
    inputs: [
      { id: 'image', type: 'file', label: 'Upload Image', accept: 'image/*', required: true },
    ],
    tiers: [{ id: 'default', name: 'Standard', credits: 3 }],
  },
  'text-to-speech': {
    name: 'Text to Speech',
    description: 'Convert text to natural-sounding speech with multiple voices.',
    category: 'audio',
    credits: { default: 5 },
    inputs: [
      { id: 'text', type: 'textarea', label: 'Enter text to convert', placeholder: 'Hello, welcome to CR AudioViz AI...', required: true },
      { id: 'voice', type: 'select', label: 'Voice', options: ['Rachel (Female)', 'Adam (Male)', 'Bella (Female)', 'Josh (Male)', 'Emily (Female)'] },
      { id: 'speed', type: 'slider', label: 'Speed', min: 0.5, max: 2, step: 0.1, default: 1 },
    ],
    tiers: [{ id: 'default', name: 'Standard', credits: 5 }],
  },
  // Add more tool configs as needed...
};

// Default config for tools not explicitly defined
const DEFAULT_CONFIG = {
  name: 'AI Tool',
  description: 'Powerful AI tool for creative work.',
  credits: { default: 10 },
  inputs: [
    { id: 'input', type: 'textarea', label: 'Input', placeholder: 'Enter your input...', required: true },
  ],
  tiers: [{ id: 'default', name: 'Standard', credits: 10 }],
};

export default function ToolPage() {
  const params = useParams();
  const router = useRouter();
  const toolId = params.toolId as string;
  
  const config = TOOL_CONFIGS[toolId] || { ...DEFAULT_CONFIG, name: toolId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) };
  
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [selectedTier, setSelectedTier] = useState(config.tiers?.[0]?.id || 'default');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user data
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUserId(data.user.id);
          // Fetch credits
          fetch(`/api/credits/balance?user_id=${data.user.id}`)
            .then(res => res.json())
            .then(credits => setUserCredits(credits.balance || 0));
        }
      });
  }, []);

  const currentTier = config.tiers?.find((t: any) => t.id === selectedTier) || config.tiers?.[0];
  const creditsNeeded = currentTier?.credits || 10;

  const handleInputChange = (id: string, value: any) => {
    setInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    if (!userId) {
      router.push('/login');
      return;
    }

    if (userCredits < creditsNeeded) {
      setError('Insufficient credits. Please purchase more credits to continue.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/tools/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_id: toolId,
          tier: selectedTier,
          input: inputs,
          user_id: userId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        setUserCredits(prev => prev - data.credits_used);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Failed to process request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (result?.result?.output) {
      const url = Array.isArray(result.result.output) ? result.result.output[0] : result.result.output;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/apps" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Apps
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Sparkles className="w-7 h-7 text-blue-600" />
                {config.name}
              </h1>
              <p className="text-gray-500 mt-1">{config.description}</p>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl">
              <Coins className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-blue-600">{userCredits.toLocaleString()}</span>
              <span className="text-blue-500 text-sm">credits</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-400" />
              Configuration
            </h2>

            {/* Tier Selection */}
            {config.tiers && config.tiers.length > 1 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quality Tier</label>
                <div className="grid grid-cols-3 gap-3">
                  {config.tiers.map((tier: any) => (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedTier(tier.id)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        selectedTier === tier.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">{tier.name}</p>
                      <p className="text-xs text-gray-500">{tier.resolution || ''}</p>
                      <p className="text-sm font-bold text-blue-600 mt-1">{tier.credits} credits</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic Inputs */}
            <div className="space-y-4">
              {config.inputs?.map((input: any) => (
                <div key={input.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {input.label} {input.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {input.type === 'textarea' && (
                    <textarea
                      value={inputs[input.id] || ''}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      placeholder={input.placeholder}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                  
                  {input.type === 'select' && (
                    <select
                      value={inputs[input.id] || input.options?.[0]}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      {input.options?.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                  
                  {input.type === 'file' && (
                    <input
                      type="file"
                      accept={input.accept}
                      onChange={(e) => handleInputChange(input.id, e.target.files?.[0])}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                    />
                  )}
                  
                  {input.type === 'slider' && (
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min={input.min}
                        max={input.max}
                        step={input.step}
                        value={inputs[input.id] || input.default}
                        onChange={(e) => handleInputChange(input.id, parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-gray-600 font-mono w-12">{inputs[input.id] || input.default}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800">Error</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading || userCredits < creditsNeeded}
              className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generate ({creditsNeeded} credits)
                </>
              )}
            </button>

            {userCredits < creditsNeeded && (
              <Link 
                href="/dashboard/credits"
                className="block text-center mt-3 text-blue-600 hover:text-blue-700 text-sm font-semibold"
              >
                Need more credits? Buy now →
              </Link>
            )}
          </div>

          {/* Output Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gray-400" />
              Result
            </h2>

            {!result && !isLoading && (
              <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your creation will appear here</p>
                  <p className="text-sm text-gray-400 mt-1">Configure your settings and click Generate</p>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600 font-semibold">Creating your masterpiece...</p>
                  <p className="text-sm text-gray-400 mt-1">This may take a few seconds</p>
                </div>
              </div>
            )}

            {result && (
              <div>
                {/* Result Display */}
                <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
                  {result.result?.output && (
                    <img 
                      src={Array.isArray(result.result.output) ? result.result.output[0] : result.result.output}
                      alt="Generated result"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleDownload}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700"
                  >
                    <Download className="w-5 h-5" /> Download
                  </button>
                  <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Stats */}
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {result.processing_time_ms}ms
                  </div>
                  <div className="flex items-center gap-1">
                    <Coins className="w-4 h-4" />
                    {result.credits_used} credits used
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Saved to assets
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
