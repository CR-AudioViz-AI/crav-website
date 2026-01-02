'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { QrCode, Download, Copy, Palette, Link, Mail, Phone, Wifi, MapPin, Calendar, CreditCard, Loader2, AlertCircle, Coins, Check } from 'lucide-react';

/**
 * QR Code Generator - CR AudioViz AI
 * ====================================
 * Standardized with: Auth, Credits, Error Handling, Accessibility
 */

type QRType = 'url' | 'text' | 'email' | 'phone' | 'wifi' | 'location' | 'event' | 'vcard';

interface QRConfig {
  type: QRType;
  data: string;
  size: number;
  fgColor: string;
  bgColor: string;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
}

const CREDIT_COST = 1;

export default function QRGeneratorPage() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [config, setConfig] = useState<QRConfig>({
    type: 'url', data: '', size: 256, fgColor: '#000000', bgColor: '#ffffff', errorCorrection: 'M'
  });
  const [wifiConfig, setWifiConfig] = useState({ ssid: '', password: '', encryption: 'WPA' });
  const [vcardConfig, setVcardConfig] = useState({ firstName: '', lastName: '', email: '', phone: '', company: '', title: '', website: '' });

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        if (session?.user) {
          const { data: profile } = await supabase.from('profiles').select('credits').eq('id', session.user.id).single();
          setCredits(profile?.credits || 0);
          await supabase.from('app_usage').insert({ user_id: session.user.id, app_id: 'qr-generator', action: 'open', timestamp: new Date().toISOString() }).catch(() => {});
        }
      } catch (err) { console.error('Init error:', err); }
      finally { setIsLoading(false); }
    };
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => { setUser(session?.user || null); });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const qrTypes: { id: QRType; label: string; icon: React.ElementType }[] = [
    { id: 'url', label: 'URL', icon: Link },
    { id: 'text', label: 'Text', icon: QrCode },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'phone', label: 'Phone', icon: Phone },
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'vcard', label: 'Contact', icon: CreditCard }
  ];

  const generateQRData = (): string => {
    switch (config.type) {
      case 'url': return config.data;
      case 'text': return config.data;
      case 'email': return `mailto:${config.data}`;
      case 'phone': return `tel:${config.data}`;
      case 'wifi': return `WIFI:T:${wifiConfig.encryption};S:${wifiConfig.ssid};P:${wifiConfig.password};;`;
      case 'location': return `geo:${config.data}`;
      case 'vcard': return `BEGIN:VCARD\nVERSION:3.0\nN:${vcardConfig.lastName};${vcardConfig.firstName}\nFN:${vcardConfig.firstName} ${vcardConfig.lastName}\nORG:${vcardConfig.company}\nTITLE:${vcardConfig.title}\nTEL:${vcardConfig.phone}\nEMAIL:${vcardConfig.email}\nURL:${vcardConfig.website}\nEND:VCARD`;
      default: return config.data;
    }
  };

  const qrData = generateQRData();
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${config.size}x${config.size}&data=${encodeURIComponent(qrData)}&color=${config.fgColor.replace('#', '')}&bgcolor=${config.bgColor.replace('#', '')}&ecc=${config.errorCorrection}`;

  const downloadQR = async () => {
    if (!qrData) { setError('Please enter content first'); return; }
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `qr-code-${Date.now()}.png`;
    link.click();
    
    if (user) {
      await supabase.from('app_usage').insert({ user_id: user.id, app_id: 'qr-generator', action: 'download', timestamp: new Date().toISOString() }).catch(() => {});
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(qrData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center" role="status">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900" role="main" aria-label="QR Code Generator">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center" aria-hidden="true">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">QR Code Generator</h1>
                <p className="text-sm text-gray-400">Create custom QR codes instantly</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg" role="status" aria-label={`${credits} credits`}>
                <Coins className="w-4 h-4 text-emerald-400" />
                <span className="text-white font-medium">{credits}</span>
              </div>
              <button onClick={copyToClipboard} disabled={!qrData} className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition disabled:opacity-50" aria-label="Copy QR data">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={downloadQR} disabled={!qrData} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50" aria-label="Download QR code">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-4 pt-4" role="alert">
          <div className="flex items-center gap-3 p-4 bg-red-900/30 border border-red-500/30 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-300">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300" aria-label="Dismiss">×</button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">QR Code Type</h2>
              <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="QR code type">
                {qrTypes.map(type => (
                  <button key={type.id} onClick={() => setConfig(prev => ({ ...prev, type: type.id, data: '' }))}
                    role="radio" aria-checked={config.type === type.id}
                    className={`p-3 rounded-xl flex flex-col items-center gap-2 transition ${config.type === type.id ? 'bg-emerald-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>
                    <type.icon className="w-5 h-5" aria-hidden="true" />
                    <span className="text-xs">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Content</h2>
              {config.type === 'wifi' ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="ssid" className="block text-sm text-gray-400 mb-1">Network Name (SSID)</label>
                    <input id="ssid" type="text" value={wifiConfig.ssid} onChange={(e) => setWifiConfig(prev => ({ ...prev, ssid: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="MyWiFiNetwork" />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm text-gray-400 mb-1">Password</label>
                    <input id="password" type="password" value={wifiConfig.password} onChange={(e) => setWifiConfig(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label htmlFor="encryption" className="block text-sm text-gray-400 mb-1">Encryption</label>
                    <select id="encryption" value={wifiConfig.encryption} onChange={(e) => setWifiConfig(prev => ({ ...prev, encryption: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="WPA">WPA/WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="qrContent" className="block text-sm text-gray-400 mb-1">
                    {config.type === 'url' ? 'Website URL' : config.type === 'email' ? 'Email Address' : config.type === 'phone' ? 'Phone Number' : config.type === 'location' ? 'Coordinates' : 'Text Content'}
                  </label>
                  <input id="qrContent" type={config.type === 'email' ? 'email' : config.type === 'phone' ? 'tel' : config.type === 'url' ? 'url' : 'text'}
                    value={config.data} onChange={(e) => setConfig(prev => ({ ...prev, data: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder={config.type === 'url' ? 'https://example.com' : config.type === 'email' ? 'hello@example.com' : config.type === 'phone' ? '+1 555 123 4567' : 'Enter content...'} />
                </div>
              )}
            </div>

            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" aria-hidden="true" />
                Customize
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="size" className="block text-sm text-gray-400 mb-1">Size</label>
                  <select id="size" value={config.size} onChange={(e) => setConfig(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="128">Small (128px)</option>
                    <option value="256">Medium (256px)</option>
                    <option value="512">Large (512px)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="fgColor" className="block text-sm text-gray-400 mb-1">Color</label>
                  <input id="fgColor" type="color" value={config.fgColor} onChange={(e) => setConfig(prev => ({ ...prev, fgColor: e.target.value }))} className="w-full h-10 rounded-lg cursor-pointer" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 text-center">Preview</h2>
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              {qrData ? (
                <div className="p-4 rounded-2xl" style={{ backgroundColor: config.bgColor }}>
                  <img src={qrUrl} alt={`QR Code for ${config.type}: ${qrData.substring(0, 50)}`} className="max-w-full" style={{ width: Math.min(config.size, 300), height: Math.min(config.size, 300) }} />
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <QrCode className="w-24 h-24 mx-auto mb-4 opacity-20" aria-hidden="true" />
                  <p>Enter content to generate QR code</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
