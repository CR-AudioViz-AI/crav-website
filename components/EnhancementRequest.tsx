// /components/EnhancementRequest.tsx
// Enhancement Request Component - CR AudioViz AI
// Feature requests with voting and community prioritization

'use client';

import React, { useState, useEffect } from 'react';
import { useSupport, EnhancementRequest, ENHANCEMENT_CATEGORIES, ENHANCEMENT_STATUSES } from '@/hooks/useSupport';

// =============================================================================
// TYPES
// =============================================================================

interface EnhancementListProps {
  userId?: string;
  onSelect?: (enhancement: EnhancementRequest) => void;
  showCreateButton?: boolean;
  filterModule?: string;
}

interface EnhancementFormProps {
  userId?: string;
  userEmail?: string;
  userName?: string;
  defaultModule?: string;
  onSuccess?: (enhancement: EnhancementRequest) => void;
  onCancel?: () => void;
}

interface EnhancementCardProps {
  enhancement: EnhancementRequest;
  userId?: string;
  onVote?: (id: string, vote: 1 | -1 | 0) => void;
  onClick?: () => void;
}

// =============================================================================
// ENHANCEMENT CARD
// =============================================================================

export function EnhancementCard({ enhancement, userId, onVote, onClick }: EnhancementCardProps) {
  const [localVote, setLocalVote] = useState(enhancement.user_vote || 0);
  const [voteScore, setVoteScore] = useState(enhancement.vote_score);
  
  const handleVote = async (vote: 1 | -1) => {
    if (!userId || !onVote) return;
    
    const newVote = localVote === vote ? 0 : vote;
    setLocalVote(newVote);
    
    // Optimistic update
    setVoteScore(prev => prev - localVote + newVote);
    
    onVote(enhancement.id, newVote as 1 | -1 | 0);
  };
  
  const statusConfig = ENHANCEMENT_STATUSES.find(s => s.value === enhancement.status);
  const categoryConfig = ENHANCEMENT_CATEGORIES.find(c => c.value === enhancement.category);
  
  return (
    <div 
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex gap-4">
        {/* Vote Section */}
        <div className="flex flex-col items-center gap-1 min-w-[50px]">
          <button
            onClick={(e) => { e.stopPropagation(); handleVote(1); }}
            disabled={!userId}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              localVote === 1 ? 'text-green-600' : 'text-gray-400'
            } ${!userId ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={userId ? 'Upvote' : 'Login to vote'}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          <span className={`font-bold text-lg ${
            voteScore > 0 ? 'text-green-600' : voteScore < 0 ? 'text-red-600' : 'text-gray-500'
          }`}>
            {voteScore}
          </span>
          
          <button
            onClick={(e) => { e.stopPropagation(); handleVote(-1); }}
            disabled={!userId}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              localVote === -1 ? 'text-red-600' : 'text-gray-400'
            } ${!userId ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={userId ? 'Downvote' : 'Login to vote'}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {enhancement.title}
            </h3>
            <span className={`shrink-0 text-xs px-2 py-1 rounded-full bg-${statusConfig?.color}-100 text-${statusConfig?.color}-700 dark:bg-${statusConfig?.color}-900/30 dark:text-${statusConfig?.color}-400`}>
              {statusConfig?.label}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {enhancement.description}
          </p>
          
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              {categoryConfig?.icon} {categoryConfig?.label}
            </span>
            {enhancement.module && (
              <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                {enhancement.module}
              </span>
            )}
            <span>
              {enhancement.request_number}
            </span>
            {enhancement.target_release && (
              <span className="text-blue-600 dark:text-blue-400">
                🎯 {enhancement.target_release}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// ENHANCEMENT LIST
// =============================================================================

export function EnhancementList({ 
  userId, 
  onSelect, 
  showCreateButton = true,
  filterModule 
}: EnhancementListProps) {
  const { getEnhancements, voteOnEnhancement, loading, error } = useSupport({ userId });
  
  const [enhancements, setEnhancements] = useState<EnhancementRequest[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    sort: 'votes' as 'votes' | 'newest' | 'priority'
  });
  const [showForm, setShowForm] = useState(false);
  
  useEffect(() => {
    loadEnhancements();
  }, [filters, filterModule]);
  
  const loadEnhancements = async () => {
    const data = await getEnhancements({
      status: filters.status || undefined,
      category: filters.category || undefined,
      module: filterModule,
      sort: filters.sort
    });
    setEnhancements(data);
  };
  
  const handleVote = async (id: string, vote: 1 | -1 | 0) => {
    const result = await voteOnEnhancement(id, vote);
    if (result) {
      // Update local state
      setEnhancements(prev => prev.map(e => 
        e.id === id 
          ? { ...e, ...result, user_vote: vote }
          : e
      ));
    }
  };
  
  if (showForm) {
    return (
      <EnhancementForm
        userId={userId}
        defaultModule={filterModule}
        onSuccess={(enhancement) => {
          setEnhancements(prev => [enhancement, ...prev]);
          setShowForm(false);
        }}
        onCancel={() => setShowForm(false)}
      />
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Feature Requests
        </h2>
        {showCreateButton && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <span>+</span>
            Submit Request
          </button>
        )}
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <select
          value={filters.status}
          onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
        >
          <option value="">All Statuses</option>
          {ENHANCEMENT_STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        
        <select
          value={filters.category}
          onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
        >
          <option value="">All Categories</option>
          {ENHANCEMENT_CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
          ))}
        </select>
        
        <select
          value={filters.sort}
          onChange={(e) => setFilters(f => ({ ...f, sort: e.target.value as any }))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
        >
          <option value="votes">Most Voted</option>
          <option value="newest">Newest</option>
          <option value="priority">Priority</option>
        </select>
      </div>
      
      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      
      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : enhancements.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No feature requests yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Be the first to submit one!
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {enhancements.map(enhancement => (
            <EnhancementCard
              key={enhancement.id}
              enhancement={enhancement}
              userId={userId}
              onVote={handleVote}
              onClick={() => onSelect?.(enhancement)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// ENHANCEMENT FORM
// =============================================================================

export function EnhancementForm({
  userId,
  userEmail,
  userName,
  defaultModule,
  onSuccess,
  onCancel
}: EnhancementFormProps) {
  const { createEnhancement, loading, error } = useSupport({ userId });
  
  const [form, setForm] = useState({
    email: userEmail || '',
    name: userName || '',
    title: '',
    description: '',
    use_case: '',
    expected_benefit: '',
    category: 'feature',
    module: defaultModule || ''
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.email || !form.title || !form.description) {
      return;
    }
    
    const enhancement = await createEnhancement(form);
    if (enhancement && onSuccess) {
      onSuccess(enhancement);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Submit Feature Request
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contact Info (if not logged in) */}
        {!userId && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
              />
            </div>
          </div>
        )}
        
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            required
            placeholder="Brief, descriptive title for your request"
            value={form.title}
            onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
          />
        </div>
        
        {/* Category & Module */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category *
            </label>
            <select
              required
              value={form.category}
              onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
            >
              {ENHANCEMENT_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Module/Product
            </label>
            <input
              type="text"
              placeholder="e.g., Javari AI, Javari Spirits"
              value={form.module}
              onChange={(e) => setForm(f => ({ ...f, module: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
            />
          </div>
        </div>
        
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description *
          </label>
          <textarea
            required
            rows={4}
            placeholder="Describe what you'd like to see and why it would be valuable"
            value={form.description}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
          />
        </div>
        
        {/* Use Case */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Use Case
          </label>
          <textarea
            rows={2}
            placeholder="How would you use this feature?"
            value={form.use_case}
            onChange={(e) => setForm(f => ({ ...f, use_case: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
          />
        </div>
        
        {/* Expected Benefit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Expected Benefit
          </label>
          <textarea
            rows={2}
            placeholder="What benefit would this provide?"
            value={form.expected_benefit}
            onChange={(e) => setForm(f => ({ ...f, expected_benefit: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
          />
        </div>
        
        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default EnhancementList;
