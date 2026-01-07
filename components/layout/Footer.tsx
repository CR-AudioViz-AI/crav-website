/**
 * CR AudioViz AI - Universal Footer
 * 
 * Consistent footer across ALL pages with:
 * - Same nav links as header
 * - Legal links (Terms, Privacy, etc.)
 * - All social media links
 * - Copyright
 * 
 * @timestamp January 7, 2026 - 11:57 AM EST
 * @author Claude (for Roy Henderson)
 */

'use client';

import Link from 'next/link';
import { 
  Twitter, Facebook, Instagram, Linkedin, Youtube, 
  MessageCircle, Send, Github, Mail
} from 'lucide-react';

// Same nav links as header for consistency
const NAV_LINKS = [
  { label: 'Apps', href: '/apps' },
  { label: 'Games', href: '/games' },
  { label: 'Javari AI', href: '/javari' },
  { label: 'CRAIverse', href: '/craiverse' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

// Legal links
const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Cookie Policy', href: '/cookies' },
  { label: 'DMCA', href: '/dmca' },
  { label: 'Accessibility', href: '/accessibility' },
];

// Social links with icons
const SOCIAL_LINKS = [
  { name: 'Twitter/X', icon: Twitter, url: 'https://twitter.com/CRAudioVizAI' },
  { name: 'Facebook', icon: Facebook, url: 'https://facebook.com/CRAudioVizAI' },
  { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/CRAudioVizAI' },
  { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com/company/craudiovizai' },
  { name: 'YouTube', icon: Youtube, url: 'https://youtube.com/@CRAudioVizAI' },
  { name: 'Discord', icon: MessageCircle, url: 'https://discord.gg/javari' },
  { name: 'GitHub', icon: Github, url: 'https://github.com/CR-AudioViz-AI' },
  { name: 'Telegram', icon: Send, url: 'https://t.me/CRAudioVizAI' },
];

// Product links
const PRODUCT_LINKS = [
  { label: 'Javari AI', href: '/javari' },
  { label: 'Creative Tools', href: '/tools' },
  { label: 'Games Hub', href: '/games' },
  { label: 'API Access', href: '/api' },
  { label: 'Documentation', href: '/docs' },
];

// Support links
const SUPPORT_LINKS = [
  { label: 'Help Center', href: '/support' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Status', href: 'https://status.craudiovizai.com' },
  { label: 'Community', href: '/community' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-white/10">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <div className="relative">
                  <div className="flex gap-1 mb-0.5">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                  <div className="w-3 h-1 bg-white rounded-full mx-auto" />
                </div>
              </div>
              <span className="text-lg font-bold text-white">CR AudioViz AI</span>
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              Your Story. Our Design.
            </p>
            <p className="text-gray-500 text-xs">
              AI-powered creative tools for everyone.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-semibold mb-4">Products</h3>
            <ul className="space-y-2">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <span className="text-gray-500 text-sm">Follow us:</span>
              <div className="flex gap-3">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    aria-label={social.name}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-gray-500 text-sm">support@craudiovizai.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-slate-900/50 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
            <p className="text-gray-500 text-sm">
              © {currentYear} CR AudioViz AI, LLC. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs">
              Made with ❤️ in Fort Myers, Florida
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Default export for backwards compatibility
export default Footer;
