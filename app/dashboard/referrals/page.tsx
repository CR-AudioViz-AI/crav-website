// app/dashboard/referrals/page.tsx
// Referral Program - Earn credits by inviting friends
// Timestamp: Dec 11, 2025 11:42 PM EST

'use client';

import { useState, useEffect } from 'react';
import { Gift, Users, Copy, Check, Share2, Twitter, Facebook, Mail, TrendingUp } from 'lucide-react';

export default function ReferralsPage() {
  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState({ total: 0, converted: 0, earned: 0 });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate/fetch referral code
    fetch('/api/referrals/code')
      .then(res => res.json())
      .then(data => {
        setReferralCode(data.code || 'LOADING');
        setReferralStats(data.stats || { total: 0, converted: 0, earned: 0 });
      });
  }, []);

  const referralLink = `https://craudiovizai.com/signup?ref=${referralCode}`;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=Create amazing AI content with CR AudioViz AI! Use my link to get 25 bonus credits: ${encodeURIComponent(referralLink)}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
  };

  const shareEmail = () => {
    window.open(`mailto:?subject=Try CR AudioViz AI&body=Hey! I've been using CR AudioViz AI to create amazing AI content. Sign up with my link and get 25 bonus credits: ${encodeURIComponent(referralLink)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <Gift className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Refer Friends, Earn Credits</h1>
          <p className="text-purple-100 text-lg">
            Give 25 credits, Get 50 credits for every friend who signs up!
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 -mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <Users className="w-8 h-8 text-blue-500 mb-2" />
            <p className="text-sm text-gray-500">Total Referrals</p>
            <p className="text-3xl font-bold text-gray-900">{referralStats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <TrendingUp className="w-8 h-8 text-green-500 mb-2" />
            <p className="text-sm text-gray-500">Converted</p>
            <p className="text-3xl font-bold text-gray-900">{referralStats.converted}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <Gift className="w-8 h-8 text-purple-500 mb-2" />
            <p className="text-sm text-gray-500">Credits Earned</p>
            <p className="text-3xl font-bold text-gray-900">{referralStats.earned}</p>
          </div>
        </div>

        {/* Referral Link Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Referral Link</h2>
          
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600"
            />
            <button
              onClick={copyToClipboard}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 flex items-center gap-2"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Share Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={shareTwitter}
              className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a8cd8]"
            >
              <Twitter className="w-4 h-4" /> Share on Twitter
            </button>
            <button
              onClick={shareFacebook}
              className="flex items-center gap-2 px-4 py-2 bg-[#4267B2] text-white rounded-lg hover:bg-[#375695]"
            >
              <Facebook className="w-4 h-4" /> Share on Facebook
            </button>
            <button
              onClick={shareEmail}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <Mail className="w-4 h-4" /> Share via Email
            </button>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">1</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Share Your Link</h3>
              <p className="text-gray-500 text-sm">Send your unique referral link to friends and family</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-xl">2</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Friend Signs Up</h3>
              <p className="text-gray-500 text-sm">They create an account and get 25 bonus credits</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-xl">3</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">You Earn Credits</h3>
              <p className="text-gray-500 text-sm">Get 50 credits when they sign up (100 if they upgrade!)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
