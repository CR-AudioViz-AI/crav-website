'use client';

/**
 * UNIVERSAL MARKETING DISTRIBUTION DASHBOARD
 * CR AudioViz AI - Post to ALL platforms from one interface
 * Created: Saturday, November 01, 2025 - 2:46 PM ET
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Send,
  Image as ImageIcon,
  Video,
  Calendar,
  Sparkles,
  Users,
  Target,
  Globe,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  X,
  Zap,
  TrendingUp,
  Settings
} from 'lucide-react';

interface ConnectedAccount {
  id: string;
  platform_type: string;
  platform_username: string;
  platform_display_name: string;
  avatar_url: string;
  follower_count: number;
  is_verified: boolean;
  status: 'active' | 'expired' | 'error';
}

interface AccountGroup {
  id: string;
  name: string;
  color: string;
  icon: string;
  account_count: number;
}

interface DistributionPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  account_count: number;
}

interface ContentDraft {
  id?: string;
  title: string;
  content: string;
  media_urls: string[];
  platform_variations: Record<string, string>;
}

const PLATFORM_ICONS: Record<string, any> = {
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Video,
  pinterest: ImageIcon,
  reddit: Globe,
  discord: Users,
  telegram: Send,
  mastodon: Globe,
  threads: Globe,
};

const PLATFORM_COLORS: Record<string, string> = {
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
  facebook: '#1877F2',
  instagram: '#E4405F',
  youtube: '#FF0000',
  tiktok: '#000000',
  pinterest: '#E60023',
  reddit: '#FF4500',
  discord: '#5865F2',
  telegram: '#26A5E4',
  mastodon: '#6364FF',
  threads: '#000000',
};

export default function MarketingDashboardPage() {
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Content state
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  
  // Distribution state
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [distributionMode, setDistributionMode] = useState<'accounts' | 'groups' | 'platforms' | 'preset'>('accounts');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  
  // Scheduling state
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later'>('now');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  
  // Data
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [accountGroups, setAccountGroups] = useState<AccountGroup[]>([]);
  const [distributionPresets, setDistributionPresets] = useState<DistributionPreset[]>([]);
  const [platformVariations, setPlatformVariations] = useState<Record<string, string>>({});
  
  // UI state
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [showAdvancedTargeting, setShowAdvancedTargeting] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  
  useEffect(() => {
    fetchUserData();
    fetchConnectedAccounts();
    fetchAccountGroups();
    fetchDistributionPresets();
  }, []);
  
  useEffect(() => {
    setCharacterCount(content.length);
  }, [content]);
  
  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/user');
      const data = await response.json();
      setUserId(data.user.id);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };
  
  const fetchConnectedAccounts = async () => {
    try {
      const response = await fetch('/api/marketing/accounts');
      const data = await response.json();
      setConnectedAccounts(data.accounts || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };
  
  const fetchAccountGroups = async () => {
    try {
      const response = await fetch('/api/marketing/groups');
      const data = await response.json();
      setAccountGroups(data.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };
  
  const fetchDistributionPresets = async () => {
    try {
      const response = await fetch('/api/marketing/presets');
      const data = await response.json();
      setDistributionPresets(data.presets || []);
    } catch (error) {
      console.error('Error fetching presets:', error);
    }
  };
  
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setMediaFiles([...mediaFiles, ...files]);
    }
  };
  
  const removeMedia = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };
  
  const toggleAccount = (accountId: string) => {
    setSelectedAccounts(prev =>
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };
  
  const toggleGroup = (groupId: string) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };
  
  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };
  
  const selectAllPlatforms = () => {
    const allPlatforms = Object.keys(PLATFORM_ICONS);
    setSelectedPlatforms(allPlatforms);
  };
  
  const clearAllSelections = () => {
    setSelectedAccounts([]);
    setSelectedGroups([]);
    setSelectedPlatforms([]);
    setSelectedPreset(null);
  };
  
  const generateWithAI = async () => {
    setShowAIAssist(true);
    // This will integrate with your existing marketing tool
    // For now, show the dialog
  };
  
  const applyPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    setDistributionMode('preset');
  };
  
  const handleDistribute = async () => {
    if (!content.trim()) {
      alert('Please enter some content to post');
      return;
    }
    
    if (selectedAccounts.length === 0 && selectedGroups.length === 0 && 
        selectedPlatforms.length === 0 && !selectedPreset) {
      alert('Please select at least one account, group, platform, or preset');
      return;
    }
    
    setLoading(true);
    
    try {
      // Upload media files first
      const uploadedMediaUrls: string[] = [];
      if (mediaFiles.length > 0) {
        const formData = new FormData();
        mediaFiles.forEach(file => formData.append('files', file));
        
        const uploadResponse = await fetch('/api/marketing/upload-media', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadResponse.json();
        uploadedMediaUrls.push(...uploadData.urls);
      }
      
      // Create distribution plan
      const distributionData = {
        content,
        title,
        media_urls: uploadedMediaUrls,
        platform_variations: platformVariations,
        distribution_mode: distributionMode,
        selected_accounts: selectedAccounts,
        selected_groups: selectedGroups,
        selected_platforms: selectedPlatforms,
        preset_id: selectedPreset,
        schedule_mode: scheduleMode,
        scheduled_for: scheduleMode === 'later' ? scheduledTime : null,
      };
      
      const response = await fetch('/api/marketing/distribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(distributionData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Distribution ${scheduleMode === 'now' ? 'started' : 'scheduled'}! Posting to ${result.total_accounts} accounts.`);
        
        // Reset form
        setContent('');
        setTitle('');
        setMediaFiles([]);
        setPlatformVariations({});
        clearAllSelections();
      } else {
        alert('❌ Distribution failed: ' + result.error);
      }
    } catch (error) {
      console.error('Error distributing content:', error);
      alert('❌ Error distributing content');
    } finally {
      setLoading(false);
    }
  };
  
  const getSelectedAccountsCount = () => {
    // This would calculate based on selected accounts + groups + platforms + presets
    return selectedAccounts.length;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Universal Marketing Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Create once, distribute everywhere. Post to unlimited social accounts, email lists, and marketing channels.
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{connectedAccounts.length}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Connected Accounts</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{accountGroups.length}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Account Groups</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{distributionPresets.length}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Saved Presets</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">98.2%</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Success Rate</p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content Creator - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Create Content</h2>
                <Button
                  onClick={generateWithAI}
                  variant="outline"
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  AI Assist
                </Button>
              </div>
              
              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Title (Optional)
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your content a title..."
                  className="text-lg"
                />
              </div>
              
              {/* Main Content */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">
                    Content
                  </label>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {characterCount} characters
                  </span>
                </div>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your message here... This will be posted to all selected platforms."
                  rows={8}
                  className="resize-none text-base"
                />
              </div>
              
              {/* Media Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Media (Images, Videos, GIFs)
                </label>
                <div className="flex flex-wrap gap-4">
                  {mediaFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt=""
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Video className="w-8 h-8 text-slate-400" />
                        )}
                      </div>
                      <button
                        onClick={() => removeMedia(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  
                  <label className="w-24 h-24 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                    <Plus className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs text-slate-500">Add Media</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              {/* Platform Variations */}
              <details className="mb-4">
                <summary className="cursor-pointer text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  Customize content for specific platforms
                </summary>
                <div className="mt-4 space-y-3 pl-4">
                  {Object.keys(PLATFORM_ICONS).map((platform) => (
                    <div key={platform}>
                      <label className="block text-sm font-medium mb-1 capitalize">
                        {platform}
                      </label>
                      <Textarea
                        value={platformVariations[platform] || ''}
                        onChange={(e) => setPlatformVariations({
                          ...platformVariations,
                          [platform]: e.target.value
                        })}
                        placeholder={`Custom content for ${platform} (leave empty to use main content)`}
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
              </details>
              
              {/* Scheduling */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  When to Post
                </label>
                <div className="flex gap-2 mb-3">
                  <Button
                    variant={scheduleMode === 'now' ? 'default' : 'outline'}
                    onClick={() => setScheduleMode('now')}
                    className="flex-1 gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Post Now
                  </Button>
                  <Button
                    variant={scheduleMode === 'later' ? 'default' : 'outline'}
                    onClick={() => setScheduleMode('later')}
                    className="flex-1 gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </Button>
                </div>
                
                {scheduleMode === 'later' && (
                  <Input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full"
                  />
                )}
              </div>
              
              {/* Distribution Button */}
              <Button
                onClick={handleDistribute}
                disabled={loading || !content.trim()}
                className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    {scheduleMode === 'now' ? 'Posting...' : 'Scheduling...'}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {scheduleMode === 'now' 
                      ? `Post to ${getSelectedAccountsCount()} Account${getSelectedAccountsCount() !== 1 ? 's' : ''}`
                      : `Schedule for ${getSelectedAccountsCount()} Account${getSelectedAccountsCount() !== 1 ? 's' : ''}`
                    }
                  </>
                )}
              </Button>
            </Card>
          </div>
          
          {/* Distribution Targeting - Right Side */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Distribution Targeting</h2>
              
              <Tabs value={distributionMode} onValueChange={(v) => setDistributionMode(v as any)}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="preset">Preset</TabsTrigger>
                  <TabsTrigger value="platforms">Platforms</TabsTrigger>
                  <TabsTrigger value="groups">Groups</TabsTrigger>
                  <TabsTrigger value="accounts">Accounts</TabsTrigger>
                </TabsList>
                
                {/* Presets Tab */}
                <TabsContent value="preset" className="space-y-3">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Select a saved distribution preset
                  </div>
                  {distributionPresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset.id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedPreset === preset.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: preset.color + '20' }}>
                          <Target className="w-5 h-5" style={{ color: preset.color }} />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{preset.name}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {preset.description} • {preset.account_count} accounts
                          </div>
                        </div>
                        {selectedPreset === preset.id && (
                          <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </TabsContent>
                
                {/* Platforms Tab */}
                <TabsContent value="platforms" className="space-y-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Select platforms to post to
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={selectAllPlatforms}
                    >
                      Select All
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(PLATFORM_ICONS).map((platform) => {
                      const Icon = PLATFORM_ICONS[platform];
                      const color = PLATFORM_COLORS[platform];
                      const isSelected = selectedPlatforms.includes(platform);
                      const accountCount = connectedAccounts.filter(
                        a => a.platform_type === platform
                      ).length;
                      
                      return (
                        <button
                          key={platform}
                          onClick={() => togglePlatform(platform)}
                          disabled={accountCount === 0}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : accountCount > 0
                                ? 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                                : 'border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-5 h-5" style={{ color }} />
                            <div className="text-left flex-1">
                              <div className="text-sm font-medium capitalize">
                                {platform}
                              </div>
                              <div className="text-xs text-slate-500">
                                {accountCount} account{accountCount !== 1 ? 's' : ''}
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </TabsContent>
                
                {/* Groups Tab */}
                <TabsContent value="groups" className="space-y-3">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Select account groups
                  </div>
                  {accountGroups.map((group) => {
                    const isSelected = selectedGroups.includes(group.id);
                    return (
                      <button
                        key={group.id}
                        onClick={() => toggleGroup(group.id)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: group.color + '20' }}>
                            <Users className="w-5 h-5" style={{ color: group.color }} />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold">{group.name}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {group.account_count} accounts
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </TabsContent>
                
                {/* Individual Accounts Tab */}
                <TabsContent value="accounts" className="space-y-2 max-h-96 overflow-y-auto">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Select individual accounts
                  </div>
                  {connectedAccounts.map((account) => {
                    const Icon = PLATFORM_ICONS[account.platform_type] || Globe;
                    const color = PLATFORM_COLORS[account.platform_type] || '#666';
                    const isSelected = selectedAccounts.includes(account.id);
                    
                    return (
                      <button
                        key={account.id}
                        onClick={() => toggleAccount(account.id)}
                        disabled={account.status !== 'active'}
                        className={`w-full p-3 rounded-lg border transition-all text-left ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : account.status === 'active'
                              ? 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                              : 'border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={account.avatar_url || '/default-avatar.png'}
                            alt={account.platform_username}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
                              <span className="font-medium truncate">
                                {account.platform_display_name}
                              </span>
                              {account.is_verified && (
                                <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                              )}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              @{account.platform_username} • {account.follower_count.toLocaleString()} followers
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </TabsContent>
              </Tabs>
              
              {(selectedAccounts.length > 0 || selectedGroups.length > 0 || 
                selectedPlatforms.length > 0 || selectedPreset) && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">
                      Selected: {getSelectedAccountsCount()} accounts
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearAllSelections}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              )}
            </Card>
            
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => window.location.href = '/marketing/connect'}
                >
                  <Plus className="w-4 h-4" />
                  Connect New Account
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => window.location.href = '/marketing/groups'}
                >
                  <Users className="w-4 h-4" />
                  Manage Groups
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => window.location.href = '/marketing/analytics'}
                >
                  <TrendingUp className="w-4 h-4" />
                  View Analytics
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => window.location.href = '/marketing/settings'}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
