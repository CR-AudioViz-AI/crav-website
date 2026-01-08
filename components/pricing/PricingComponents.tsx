/**
 * CR AudioViz AI - Pricing UI Components
 * Reusable components for all pricing pages
 * 
 * @version 6.2
 * @timestamp January 8, 2026
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Check, Sparkles, Zap, ArrowRight, HelpCircle } from 'lucide-react';

// =============================================================================
// PLAN CARD
// =============================================================================
interface PlanCardProps {
  name: string;
  price: number;
  period?: string;
  credits: number;
  capacity?: { type: string; amount: number };
  badge?: string;
  features: string[];
  cta: string;
  ctaHref?: string;
  highlighted?: boolean;
  disabled?: boolean;
}

export function PlanCard({
  name,
  price,
  period = '/month',
  credits,
  capacity,
  badge,
  features,
  cta,
  ctaHref = '/signup',
  highlighted = false,
  disabled = false,
}: PlanCardProps) {
  const baseClasses = 'relative rounded-2xl p-6 md:p-8 transition-all duration-200';
  const highlightedClasses = highlighted
    ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white ring-4 ring-cyan-400 shadow-xl scale-105'
    : 'bg-white border border-slate-200 hover:border-cyan-300 hover:shadow-lg';

  return (
    <div className={`${baseClasses} ${highlightedClasses}`}>
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
          {badge}
        </span>
      )}
      
      <h3 className={`text-xl font-bold mb-2 ${highlighted ? 'text-white' : 'text-slate-900'}`}>
        {name}
      </h3>
      
      <div className="mb-4">
        <span className={`text-4xl font-bold ${highlighted ? 'text-white' : 'text-slate-900'}`}>
          ${price}
        </span>
        <span className={`text-sm ${highlighted ? 'text-cyan-100' : 'text-slate-500'}`}>
          {period}
        </span>
      </div>
      
      <div className={`text-sm mb-4 ${highlighted ? 'text-cyan-100' : 'text-slate-600'}`}>
        <div className="flex items-center gap-1">
          <Zap className="w-4 h-4" />
          <span>{credits.toLocaleString()} credits</span>
        </div>
        {capacity && (
          <div className="flex items-center gap-1 mt-1">
            <Sparkles className="w-4 h-4" />
            <span>{capacity.amount.toLocaleString()} {capacity.type}</span>
          </div>
        )}
      </div>
      
      <ul className="space-y-2 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${highlighted ? 'text-cyan-200' : 'text-green-500'}`} />
            <span className={`text-sm ${highlighted ? 'text-white' : 'text-slate-700'}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>
      
      <Link
        href={disabled ? '#' : ctaHref}
        className={`block w-full py-3 px-6 rounded-xl font-semibold text-center transition-all ${
          disabled
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : highlighted
            ? 'bg-white text-cyan-700 hover:bg-cyan-50'
            : 'bg-cyan-600 text-white hover:bg-cyan-700'
        }`}
        aria-disabled={disabled}
      >
        {cta}
      </Link>
    </div>
  );
}

// =============================================================================
// CREDIT PACK CARD
// =============================================================================
interface CreditPackCardProps {
  credits: number;
  price: number;
  badge?: string;
  disabled?: boolean;
  onSelect?: () => void;
}

export function CreditPackCard({
  credits,
  price,
  badge,
  disabled = false,
  onSelect,
}: CreditPackCardProps) {
  return (
    <div className={`relative rounded-xl p-5 border transition-all ${
      disabled 
        ? 'bg-slate-50 border-slate-200 opacity-60' 
        : 'bg-white border-slate-200 hover:border-cyan-400 hover:shadow-md cursor-pointer'
    }`}
    onClick={disabled ? undefined : onSelect}
    >
      {badge && (
        <span className="absolute -top-2 right-3 bg-amber-400 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      
      <div className="text-center">
        <div className="text-2xl font-bold text-slate-900 mb-1">
          {credits.toLocaleString()}
        </div>
        <div className="text-xs text-slate-500 mb-3">credits</div>
        <div className="text-lg font-semibold text-cyan-600">
          ${price}
        </div>
        <div className="text-xs text-slate-400 mt-1">
          ${(price / credits * 100).toFixed(1)}¢/credit
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// AUTO-RELOAD TIER SELECTOR
// =============================================================================
interface AutoReloadTier {
  credits: number;
  price: number;
}

interface AutoReloadSelectorProps {
  tiers: AutoReloadTier[];
  selectedTier?: AutoReloadTier;
  threshold: number;
  onTierChange?: (tier: AutoReloadTier) => void;
  onThresholdChange?: (threshold: number) => void;
  disabled?: boolean;
}

export function AutoReloadSelector({
  tiers,
  selectedTier,
  threshold,
  onTierChange,
  onThresholdChange,
  disabled = false,
}: AutoReloadSelectorProps) {
  return (
    <div className={`rounded-xl border border-slate-200 p-5 ${disabled ? 'opacity-60' : ''}`}>
      <h4 className="font-semibold text-slate-900 mb-4">Auto-Reload Settings</h4>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-600 mb-2">
            Reload when balance drops below:
          </label>
          <input
            type="number"
            min={10}
            value={threshold}
            onChange={(e) => onThresholdChange?.(Math.max(10, parseInt(e.target.value) || 10))}
            disabled={disabled}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-slate-100"
          />
          <p className="text-xs text-slate-500 mt-1">Minimum: 10 credits</p>
        </div>
        
        <div>
          <label className="block text-sm text-slate-600 mb-2">
            Reload amount:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {tiers.map((tier) => (
              <button
                key={tier.credits}
                onClick={() => onTierChange?.(tier)}
                disabled={disabled}
                className={`p-3 rounded-lg border text-center transition-all ${
                  selectedTier?.credits === tier.credits
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                    : 'border-slate-200 hover:border-cyan-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="font-semibold">+{tier.credits}</div>
                <div className="text-xs text-slate-500">${tier.price.toFixed(2)}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TRIAL BANNER
// =============================================================================
interface TrialBannerProps {
  vertical: string;
  credits: number;
  capacity?: { type: string; amount: number };
  days?: number;
}

export function TrialBanner({ vertical, credits, capacity, days = 30 }: TrialBannerProps) {
  return (
    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-6 mb-8">
      <div className="flex items-start gap-4">
        <div className="bg-cyan-100 rounded-full p-3">
          <Sparkles className="w-6 h-6 text-cyan-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-lg mb-1">
            {days}-Day Free Trial
          </h3>
          <p className="text-slate-600 mb-2">
            Try {vertical} risk-free with:
          </p>
          <ul className="space-y-1">
            <li className="flex items-center gap-2 text-sm text-slate-700">
              <Check className="w-4 h-4 text-green-500" />
              {credits} trial credits
            </li>
            {capacity && (
              <li className="flex items-center gap-2 text-sm text-slate-700">
                <Check className="w-4 h-4 text-green-500" />
                {capacity.amount} {capacity.type}
              </li>
            )}
            <li className="flex items-center gap-2 text-sm text-slate-700">
              <Check className="w-4 h-4 text-green-500" />
              Full feature access
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// VERTICAL NAVIGATION
// =============================================================================
interface VerticalNavProps {
  current: 'core' | 'realtors' | 'collectors' | 'hobbyists';
}

export function VerticalNav({ current }: VerticalNavProps) {
  const links = [
    { id: 'core', href: '/pricing', label: 'Core Plans' },
    { id: 'realtors', href: '/pricing/realtors', label: 'Realtors' },
    { id: 'collectors', href: '/pricing/collectors', label: 'Collectors' },
    { id: 'hobbyists', href: '/pricing/hobbyists', label: 'Hobbyists' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {links.map((link) => (
        <Link
          key={link.id}
          href={link.href}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            current === link.id
              ? 'bg-cyan-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

// =============================================================================
// EXPLORE OTHER OFFERINGS
// =============================================================================
interface ExploreOtherOfferingsProps {
  exclude: string;
}

export function ExploreOtherOfferings({ exclude }: ExploreOtherOfferingsProps) {
  const offerings = [
    { id: 'core', href: '/pricing', label: 'Core Platform', description: 'Access all apps with flexible credits' },
    { id: 'realtors', href: '/pricing/realtors', label: 'JavariKeys for Realtors', description: 'Professional real estate websites' },
    { id: 'collectors', href: '/pricing/collectors', label: 'Javari Collectors', description: 'Organize and manage collections' },
    { id: 'hobbyists', href: '/pricing/hobbyists', label: 'Hobby Plans', description: 'Creative projects and hobbies' },
  ].filter((o) => o.id !== exclude);

  return (
    <div className="mt-12 pt-8 border-t border-slate-200">
      <h3 className="text-lg font-bold text-slate-900 mb-4 text-center">
        Explore Other Offerings
      </h3>
      <div className="grid md:grid-cols-3 gap-4">
        {offerings.map((offering) => (
          <Link
            key={offering.id}
            href={offering.href}
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-cyan-300 hover:shadow-md transition-all group"
          >
            <div className="flex-1">
              <div className="font-semibold text-slate-900 group-hover:text-cyan-600">
                {offering.label}
              </div>
              <div className="text-sm text-slate-500">{offering.description}</div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-500 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// FAQ ACCORDION
// =============================================================================
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="border border-slate-200 rounded-xl overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
          >
            <span className="font-medium text-slate-900">{item.question}</span>
            <HelpCircle className={`w-5 h-5 text-slate-400 transition-transform ${
              openIndex === index ? 'rotate-180' : ''
            }`} />
          </button>
          {openIndex === index && (
            <div className="px-4 pb-4 text-sm text-slate-600">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// POLICY NOTICES
// =============================================================================
export function PolicyNotices() {
  return (
    <div className="mt-8 text-center space-y-2">
      <p className="text-slate-600 font-medium">
        All credit purchases are final. Cancel anytime; access continues through paid term.
      </p>
      <p className="text-sm text-slate-500">
        AI support with escalation to human agents when needed. Support is ticket-only.
      </p>
      <p className="text-sm text-slate-500">
        Billing dispute window: 7 days from transaction.
      </p>
    </div>
  );
}

// =============================================================================
// CREDIT EXPLANATION
// =============================================================================
export function CreditExplanation() {
  return (
    <div className="bg-slate-50 rounded-xl p-6 mb-8">
      <h3 className="font-bold text-slate-900 mb-3">How Credits Work</h3>
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-slate-600 mb-2">
            <span className="font-semibold text-slate-900">1 credit = $0.03</span>
          </p>
          <p className="text-slate-600">
            Quick tasks typically use 1–10 credits. Larger tasks may use 15–100+ credits.
          </p>
        </div>
        <div>
          <p className="text-slate-600 mb-2">
            <span className="font-semibold text-slate-900">Transparent pricing</span>
          </p>
          <p className="text-slate-600">
            You always see the credit cost before confirming. If an estimate changes, you'll see the updated cost.
          </p>
        </div>
      </div>
    </div>
  );
}
