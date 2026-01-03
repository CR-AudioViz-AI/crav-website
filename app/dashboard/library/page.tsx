// /app/dashboard/library/page.tsx
// User's Personal Asset Library - Audiobooks, eBooks, Generated Content
// Timestamp: January 3, 2026 - 3:56 PM EST
// CR AudioViz AI - Henderson Standard Quality

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  BookOpen, Headphones, FileText, Download, Play, Pause,
  Search, Filter, Grid, List, Clock, Calendar, Trash2,
  ExternalLink, RefreshCw, FolderOpen, Music, FileAudio,
  ChevronDown, MoreVertical, Eye, Share2, Heart, Loader2
} from 'lucide-react'

// =============================================================================
// TYPES
// =============================================================================

interface Asset {
  id: string
  name: string
  slug: string
  description?: string
  file_extension: string
  mime_type: string
  storage_path: string
  file_size_bytes: number
  download_count: number
  created_at: string
  updated_at: string
  tags: string[]
  metadata?: {
    voice?: string
    voiceLabel?: string
    duration?: string
    wordCount?: number
    chapters?: number
    generatedBy?: string
    generatedAt?: string
  }
}

type ViewMode = 'grid' | 'list'
type SortBy = 'newest' | 'oldest' | 'name' | 'size'
type FilterType = 'all' | 'audiobook' | 'ebook' | 'document'

// =============================================================================
// CONSTANTS
// =============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co'

const FILE_TYPE_CONFIG: Record<string, { icon: typeof BookOpen; color: string; label: string }> = {
  mp3: { icon: Headphones, color: 'bg-purple-500', label: 'Audiobook' },
  wav: { icon: Music, color: 'bg-purple-400', label: 'Audio' },
  pdf: { icon: BookOpen, color: 'bg-red-500', label: 'PDF' },
  epub: { icon: BookOpen, color: 'bg-green-500', label: 'eBook' },
  docx: { icon: FileText, color: 'bg-blue-500', label: 'Document' },
  txt: { icon: FileText, color: 'bg-gray-500', label: 'Text' },
  md: { icon: FileText, color: 'bg-gray-600', label: 'Markdown' }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

function getDownloadUrl(storagePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/assets/${storagePath}`
}

// =============================================================================
// COMPONENTS
// =============================================================================

function AssetCard({ asset, viewMode, onPlay, playingId }: { 
  asset: Asset
  viewMode: ViewMode
  onPlay: (id: string, url: string) => void
  playingId: string | null
}) {
  const config = FILE_TYPE_CONFIG[asset.file_extension] || FILE_TYPE_CONFIG.txt
  const Icon = config.icon
  const downloadUrl = getDownloadUrl(asset.storage_path)
  const isPlaying = playingId === asset.id
  const isAudio = ['mp3', 'wav', 'ogg'].includes(asset.file_extension)

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
      >
        <div className={`w-12 h-12 ${config.color} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white truncate">{asset.name}</h3>
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span>{config.label}</span>
            <span>•</span>
            <span>{formatFileSize(asset.file_size_bytes)}</span>
            <span>•</span>
            <span>{formatDate(asset.created_at)}</span>
            {asset.metadata?.duration && (
              <>
                <span>•</span>
                <span>{asset.metadata.duration}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAudio && (
            <button
              onClick={() => onPlay(asset.id, downloadUrl)}
              className={`p-2 rounded-full ${isPlaying ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
          )}
          <a
            href={downloadUrl}
            download={asset.name}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400"
          >
            <Download className="w-5 h-5" />
          </a>
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </motion.div>
    )
  }

  // Grid view
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow group"
    >
      {/* Preview Area */}
      <div className={`h-32 ${config.color} bg-opacity-10 flex items-center justify-center relative`}>
        <Icon className={`w-16 h-16 ${config.color.replace('bg-', 'text-')} opacity-50`} />
        
        {isAudio && (
          <button
            onClick={() => onPlay(asset.id, downloadUrl)}
            className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors"
          >
            <div className={`w-14 h-14 rounded-full ${isPlaying ? 'bg-purple-500' : 'bg-white/90'} flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity`}>
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-gray-800 ml-1" />
              )}
            </div>
          </button>
        )}

        <span className={`absolute top-2 right-2 px-2 py-1 ${config.color} text-white text-xs font-medium rounded`}>
          {config.label}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-white truncate mb-1" title={asset.name}>
          {asset.name}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
          <span>{formatFileSize(asset.file_size_bytes)}</span>
          {asset.metadata?.duration && (
            <>
              <span>•</span>
              <Clock className="w-3 h-3" />
              <span>{asset.metadata.duration}</span>
            </>
          )}
        </div>

        {asset.metadata?.voiceLabel && (
          <div className="text-xs text-gray-400 dark:text-gray-500 mb-3">
            Voice: {asset.metadata.voiceLabel}
          </div>
        )}

        <div className="flex items-center gap-2">
          <a
            href={downloadUrl}
            download={asset.name}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </a>
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(asset.created_at)}
        </div>
      </div>
    </motion.div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
        <FolderOpen className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Your library is empty
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Start creating audiobooks and eBooks to build your personal library. 
        All your generated content will appear here.
      </p>
      <Link
        href="/apps/javari-books"
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
      >
        <Headphones className="w-5 h-5" />
        Create Your First Audiobook
      </Link>
    </div>
  )
}

function AudioPlayer({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-2xl z-50"
    >
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
            <Headphones className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate">{title}</p>
            <audio 
              src={url} 
              controls 
              autoPlay 
              className="w-full h-8 mt-1"
              style={{ filter: 'invert(0)' }}
            />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            ✕
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function DashboardLibraryPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [playingUrl, setPlayingUrl] = useState<string | null>(null)
  const [playingTitle, setPlayingTitle] = useState<string>('')

  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/user/assets', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Please log in to view your library')
          return
        }
        throw new Error('Failed to fetch assets')
      }
      
      const data = await response.json()
      setAssets(data.assets || [])
    } catch (err) {
      console.error('Failed to fetch assets:', err)
      setError('Failed to load your library. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePlay = (id: string, url: string) => {
    if (playingId === id) {
      setPlayingId(null)
      setPlayingUrl(null)
      setPlayingTitle('')
    } else {
      const asset = assets.find(a => a.id === id)
      setPlayingId(id)
      setPlayingUrl(url)
      setPlayingTitle(asset?.name || 'Audiobook')
    }
  }

  const closePlayer = () => {
    setPlayingId(null)
    setPlayingUrl(null)
    setPlayingTitle('')
  }

  // Filter and sort assets
  const filteredAssets = assets
    .filter(asset => {
      // Type filter
      if (filterType === 'audiobook' && !['mp3', 'wav'].includes(asset.file_extension)) return false
      if (filterType === 'ebook' && !['pdf', 'epub'].includes(asset.file_extension)) return false
      if (filterType === 'document' && !['docx', 'txt', 'md'].includes(asset.file_extension)) return false
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return asset.name.toLowerCase().includes(query) ||
               asset.tags?.some(t => t.toLowerCase().includes(query))
      }
      
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'name': return a.name.localeCompare(b.name)
        case 'size': return b.file_size_bytes - a.file_size_bytes
        default: return 0
      }
    })

  // Stats
  const totalSize = assets.reduce((sum, a) => sum + a.file_size_bytes, 0)
  const audiobooks = assets.filter(a => ['mp3', 'wav'].includes(a.file_extension))
  const documents = assets.filter(a => ['pdf', 'epub', 'docx'].includes(a.file_extension))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
                  <FolderOpen className="w-6 h-6 text-white" />
                </div>
                My Library
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Your audiobooks, eBooks, and generated content
              </p>
            </div>
            
            <Link
              href="/apps/javari-books"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
            >
              <Headphones className="w-5 h-5" />
              Create New
            </Link>
          </div>

          {/* Stats Bar */}
          {!loading && assets.length > 0 && (
            <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Headphones className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Audiobooks</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{audiobooks.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Documents</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{documents.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <FileAudio className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Size</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{formatFileSize(totalSize)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search your library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All Types</option>
                <option value="audiobook">Audiobooks</option>
                <option value="ebook">eBooks</option>
                <option value="document">Documents</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
                <option value="size">Largest First</option>
              </select>

              {/* View Toggle */}
              <div className="flex border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={fetchAssets}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Log In
            </Link>
          </div>
        ) : filteredAssets.length === 0 ? (
          searchQuery || filterType !== 'all' ? (
            <div className="text-center py-16">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No items match your search</p>
              <button
                onClick={() => { setSearchQuery(''); setFilterType('all') }}
                className="mt-4 text-purple-600 hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <EmptyState />
          )
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'flex flex-col gap-3'
          }>
            {filteredAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                viewMode={viewMode}
                onPlay={handlePlay}
                playingId={playingId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Audio Player */}
      <AnimatePresence>
        {playingUrl && (
          <AudioPlayer
            url={playingUrl}
            title={playingTitle}
            onClose={closePlayer}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
