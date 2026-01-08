'use client';

/**
 * CR AudioViz AI - HEADER COMPONENT (FINAL LOCK)
 * 
 * UNIFIED SYSTEM: Header + CR Bar + Credits Bar
 * - Light teal background (logo-safe)
 * - All bars same color family
 * - Subtle separators only
 * - Logo dominates
 * - Nav: navy text, teal hover/active
 * - Sign Up: teal (not red)
 * - Cindy & Roy: RED
 * 
 * DO NOT MODIFY AFTER LOCK
 * @timestamp January 8, 2026 - FINAL
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, LogOut, Sparkles, Zap } from 'lucide-react';

const NAV_LINKS = [
  { id: 'home', href: '/', label: 'Home' },
  { id: 'apps', href: '/apps', label: 'Apps' },
  { id: 'games', href: '/games', label: 'Games' },
  { id: 'javari-ai', href: '/javari', label: 'Javari AI' },
  { id: 'javari-verse', href: '/javari-verse', label: 'JavariVerse' },
  { id: 'pricing', href: '/pricing', label: 'Pricing' },
  { id: 'about', href: '/about', label: 'About' },
  { id: 'contact', href: '/contact', label: 'Contact' },
];

const CR_PHRASES = [
  "Creative Results", "Customer Rewards", "Cutting-edge Resources", "Community Reach",
  "Content Revolution", "Collaborative Realms", "Curated Riches", "Captivating Realities",
  "Clever Resources", "Comprehensive Results", "Connected Realms", "Crafted Reactions",
  "Crystal Reality", "Continuous Rewards", "Certified Reliability", "Compelling Reasons",
  "Confident Returns", "Celebrated Revelations", "Curious Roaming", "Countless Riches",
  "Cohesive Resources", "Conquering Realms", "Cultivated Rewards", "Collaborative Reach",
  "Capable Responses", "Caring Relationships", "Celebrated Results", "Central Resources",
  "Certain Returns", "Champion Rank", "Charged Reactions", "Charming Results",
  "Clear Reasoning", "Clever Renditions", "Cloud Resources", "Coastal Retreats",
  "Coded Reality", "Colorful Renders", "Combined Reach", "Commanding Respect",
  "Complete Resources", "Concentrated Results", "Connected Reality", "Conscious Responsibility",
  "Consistent Results", "Constructive Reviews", "Core Reliability", "Cosmic Rays",
  "Creative Reach", "Crisp Resolution", "Critical Reviews", "Crowning Rewards",
  "Crucial Resources", "Cumulative Returns", "Curious Readers", "Current Relevance",
  "Custom Requests", "Cybernetic Realms", "Calculated Risks", "Calm Reflection",
];

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState<string>('Free');
  const [loading, setLoading] = useState(true);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [rotationCount, setRotationCount] = useState(0);
  const [showCindyRoy, setShowCindyRoy] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    const interval = setInterval(() => {
      setRotationCount(prev => {
        const newCount = prev + 1;
        setShowCindyRoy(newCount % 25 === 0);
        return newCount;
      });
      setCurrentPhraseIndex((prev) => (prev + 1) % CR_PHRASES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          const adminEmails = ['royhenderson@craudiovizai.com', 'cindyhenderson@craudiovizai.com'];
          const isAdminEmail = user.email && adminEmails.includes(user.email.toLowerCase());
          const { data: profile } = await supabase
            .from('profiles')
            .select('credits, subscription_tier, is_admin, role')
            .eq('id', user.id)
            .single();
          const isAdminUser = profile?.is_admin || profile?.role === 'admin' || isAdminEmail;
          setIsAdmin(isAdminUser);
          if (isAdminUser) {
            setPlan('Admin');
            setCredits(null);
          } else if (profile) {
            setCredits(profile.credits ?? 0);
            setPlan(profile.subscription_tier || 'Free');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => checkAuth());
    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    window.location.href = '/';
  }, [supabase]);

  const getDisplayName = () => {
    if (!user) return '';
    return user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const displayPhrase = showCindyRoy ? "Cindy & Roy" : CR_PHRASES[currentPhraseIndex];

  // UNIFIED HEADER SYSTEM - Same light teal family throughout
  return (
    <header className="bg-cyan-50 border-b border-cyan-100" data-testid="site-header">
      {/* MAIN HEADER BAR */}
      <div className="h-[76px] md:h-[84px] flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo - DOMINATES header, increased ~15% */}
          <Link 
            href="/" 
            data-testid="header-logo" 
            aria-label="CR AudioViz AI Home"
            className="flex-shrink-0 w-[240px] md:w-[320px] lg:w-[380px] flex items-center px-2"
          >
            <Image
              src="/craudiovizailogo.png"
              alt="CR AudioViz AI"
              width={274}
              height={72}
              className="h-[48px] md:h-[56px] lg:h-[60px] w-auto max-w-full block"
              priority
            />
          </Link>

          {/* Right side: Nav + Auth */}
          <div className="flex flex-col items-end gap-1">
            {/* Desktop Navigation - Navy text, teal hover/active */}
            <nav className="hidden lg:flex items-center space-x-1" data-testid="desktop-nav">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'bg-cyan-100 text-cyan-700 border-b-2 border-cyan-500'
                      : 'text-slate-700 hover:text-cyan-600 hover:bg-cyan-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Auth Section */}
            <div className="flex items-center gap-2" data-testid="auth-section">
              {loading ? (
                <div className="w-16 h-7 bg-cyan-100 rounded animate-pulse" />
              ) : user ? (
                <div className="flex items-center gap-2">
                  <Link href="/dashboard" className="flex items-center gap-1.5 px-2 py-1 text-sm text-slate-700 hover:text-cyan-600">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{getDisplayName()}</span>
                  </Link>
                  <button onClick={handleSignOut} className="flex items-center gap-1 text-sm text-slate-500 hover:text-cyan-600">
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="px-3 py-1 text-sm text-slate-700 hover:text-cyan-600">Log In</Link>
                  {/* Sign Up = TEAL (not red) */}
                  <Link href="/signup" className="px-3 py-1.5 bg-cyan-600 text-white hover:bg-cyan-700 rounded-lg text-sm font-medium">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CR = BAR - SAME background family, subtle separator */}
      <div className="flex justify-center py-1.5 bg-cyan-50 border-t border-cyan-100/50">
        <div className="flex items-center gap-2 text-slate-700 text-sm">
          <span className="font-bold text-cyan-600">CR</span>
          <span className="text-slate-400">=</span>
          {/* Cindy & Roy = RED (action color exception) */}
          <span className={`transition-all duration-300 ${showCindyRoy ? 'text-red-500 font-bold' : ''}`}>
            {displayPhrase}
          </span>
        </div>
      </div>

      {/* CREDITS BAR - SAME background, only shows when logged in */}
      {user && (
        <div className="bg-cyan-50 border-t border-cyan-100/50 py-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-3 text-xs">
              <span className={`px-2 py-0.5 rounded-full ${
                isAdmin ? 'bg-cyan-100 text-cyan-700' :
                plan === 'Pro' ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-600'
              }`}>
                <Sparkles className="w-3 h-3 inline mr-1" />
                {isAdmin ? 'Admin' : plan}
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <Zap className="w-3 h-3 text-cyan-500" />
                {isAdmin ? 'Unlimited credits' : `${credits?.toLocaleString()} credits`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation - Same color family */}
      <div className="lg:hidden border-t border-cyan-100 bg-cyan-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-1 py-1.5 overflow-x-auto scrollbar-hide">
            {NAV_LINKS.slice(0, 6).map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive(link.href) ? 'bg-cyan-100 text-cyan-700' : 'text-slate-600 hover:text-cyan-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/about" className="px-2 py-1 rounded text-xs font-medium whitespace-nowrap text-slate-500 hover:text-cyan-600">
              More...
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
