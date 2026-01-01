// Javari Asset Manager - Full Featured
// Timestamp: January 1, 2026 - 4:45 AM EST
// CR AudioViz AI - Universal Asset Registry

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  FolderOpen, Upload, Search, Filter, Grid, List, Download, Eye, Trash2,
  CheckCircle2, XCircle, AlertCircle, RefreshCw, ChevronLeft, ChevronRight,
  Calendar, HardDrive, FileText, Image, Music, Video, Archive, Code,
  SortAsc, SortDesc, MoreVertical, ExternalLink, Copy, Clock, Printer
} from 'lucide-react'

// =====================================================
// TYPES
// =====================================================

interface Asset {
  id: string
  name: string
  slug: string
  original_filename: string
  file_size_bytes: number
  mime_type: string
  file_extension: string
  storage_path: string
  category_id: string
  status: string
  created_at: string
  updated_at: string
  download_count: number
  view_count: number
  is_public: boolean
  is_free: boolean
  tags: string[]
}

interface Category {
  id: string
  slug: string
  name: string
  icon: string
  storage_folder: string
  file_count: number
  total_size_bytes: number
}

interface LandingZoneItem {
  id: string
  original_filename: string
  file_size_bytes: number
  file_extension: string
  mime_type: string
  status: string
  detection_confidence: number
  final_category_slug: string
  final_category_name: string
  final_folder: string
  uploaded_at: string
}

type ViewMode = 'grid' | 'list'
type SortField = 'name' | 'created_at' | 'file_size_bytes' | 'download_count'
type SortOrder = 'asc' | 'desc'

// =====================================================
// UTILITIES
// =====================================================

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/New_York'
  }) + ' EST'
}

const getFileIcon = (extension: string) => {
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
  const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'm4a']
  const videoExts = ['mp4', 'webm', 'mov', 'avi']
  const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz']
  const codeExts = ['js', 'ts', 'jsx', 'tsx', 'py', 'html', 'css', 'json']
  
  if (imageExts.includes(extension)) return Image
  if (audioExts.includes(extension)) return Music
  if (videoExts.includes(extension)) return Video
  if (archiveExts.includes(extension)) return Archive
  if (codeExts.includes(extension)) return Code
  return FileText
}

const getCategoryIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    'folder': FolderOpen,
    'file-text': FileText,
    'image': Image,
    'music': Music,
    'video': Video,
    'archive': Archive,
    'code': Code,
  }
  return icons[iconName] || FolderOpen
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function AssetManagerPage() {
  const supabase = createClientComponentClient()
  
  // State
  const [categories, setCategories] = useState<Category[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [landingZone, setLandingZone] = useState<LandingZoneItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set())
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null)
  const [isPrinting, setIsPrinting] = useState(false)

  // Print to Epson function
  const printReport = async (type: 'all' | 'category') => {
    setIsPrinting(true)
    try {
      const res = await fetch('/api/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'asset-list',
          title: type === 'category' && selectedCategory 
            ? categories.find(c => c.slug === selectedCategory)?.name 
            : 'All Assets',
          category: type === 'category' ? selectedCategory : undefined
        })
      })
      const data = await res.json()
      if (data.success) {
        alert('✅ Print job sent to Epson printer!')
      } else {
        alert('❌ Print failed: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      alert('❌ Print failed: Network error')
    } finally {
      setIsPrinting(false)
    }
  }
  
  const ITEMS_PER_PAGE = 24

  // =====================================================
  // DATA FETCHING
  // =====================================================

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from('v_asset_folders')
      .select('*')
      .order('category_name')

    if (error) {
      console.error('Error fetching categories:', error)
      return
    }

    setCategories(data?.map(d => ({
      id: d.category_slug,
      slug: d.category_slug,
      name: d.category_name,
      icon: d.icon || 'folder',
      storage_folder: d.storage_folder,
      file_count: d.asset_count || 0,
      total_size_bytes: d.total_size_bytes || 0
    })) || [])
  }, [supabase])

  const fetchAssets = useCallback(async (categorySlug?: string) => {
    let query = supabase
      .from('assets')
      .select(`
        id, name, slug, original_filename, file_size_bytes, mime_type,
        file_extension, storage_path, category_id, status, created_at,
        updated_at, download_count, view_count, is_public, is_free, tags
      `)
      .eq('status', 'active')

    if (categorySlug) {
      const category = categories.find(c => c.slug === categorySlug)
      if (category) {
        // Get category UUID from asset_categories
        const { data: catData } = await supabase
          .from('asset_categories')
          .select('id')
          .eq('slug', categorySlug)
          .single()
        
        if (catData) {
          query = query.eq('category_id', catData.id)
        }
      }
    }

    const { data, error } = await query.order(sortField, { ascending: sortOrder === 'asc' })

    if (error) {
      console.error('Error fetching assets:', error)
      return
    }

    setAssets(data || [])
  }, [supabase, categories, sortField, sortOrder])

  const fetchLandingZone = useCallback(async () => {
    const { data, error } = await supabase
      .from('v_landing_zone_dashboard')
      .select('*')
      .order('uploaded_at', { ascending: false })

    if (error) {
      console.error('Error fetching landing zone:', error)
      return
    }

    setLandingZone(data || [])
  }, [supabase])

  // Initial load
  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      await fetchCategories()
      await fetchLandingZone()
      setIsLoading(false)
    }
    load()
  }, [fetchCategories, fetchLandingZone])

  // Load assets when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchAssets(selectedCategory)
    } else {
      fetchAssets()
    }
  }, [selectedCategory, fetchAssets])

  // =====================================================
  // FILTERING & SORTING
  // =====================================================

  const filteredAssets = useMemo(() => {
    let result = [...assets]
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(a => 
        a.name.toLowerCase().includes(query) ||
        a.original_filename.toLowerCase().includes(query) ||
        a.tags?.some(t => t.toLowerCase().includes(query))
      )
    }

    return result
  }, [assets, searchQuery])

  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredAssets.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredAssets, currentPage])

  const totalPages = Math.ceil(filteredAssets.length / ITEMS_PER_PAGE)
  const totalAssets = categories.reduce((sum, c) => sum + c.file_count, 0)
  const totalSize = categories.reduce((sum, c) => sum + c.total_size_bytes, 0)

  // =====================================================
  // ACTIONS
  // =====================================================

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    await uploadFiles(files)
  }, [])

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return
    
    setIsUploading(true)
    
    for (const file of files) {
      try {
        const tempPath = `landing-zone/${Date.now()}-${file.name}`
        
        const { error: uploadError } = await supabase.storage
          .from('assets')
          .upload(tempPath, file)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          continue
        }

        await supabase
          .from('asset_landing_zone')
          .insert({
            original_filename: file.name,
            file_size_bytes: file.size,
            mime_type: file.type,
            file_extension: file.name.split('.').pop()?.toLowerCase(),
            temp_storage_path: tempPath
          })
      } catch (error) {
        console.error('Upload failed:', error)
      }
    }

    setIsUploading(false)
    await fetchLandingZone()
  }

  const approveFile = async (item: LandingZoneItem, categorySlug?: string) => {
    const { error } = await supabase.rpc('process_landing_zone_item', {
      p_landing_id: item.id,
      p_category_slug: categorySlug || item.final_category_slug
    })

    if (error) {
      console.error('Process error:', error)
      return
    }

    await Promise.all([fetchLandingZone(), fetchCategories(), fetchAssets(selectedCategory || undefined)])
  }

  const approveAllClassified = async () => {
    const classified = landingZone.filter(i => i.final_category_slug)
    for (const item of classified) {
      await approveFile(item)
    }
  }

  const changeCategory = async (item: LandingZoneItem, newCategorySlug: string) => {
    const { data: category } = await supabase
      .from('asset_categories')
      .select('id')
      .eq('slug', newCategorySlug)
      .single()

    if (!category) return

    await supabase
      .from('asset_landing_zone')
      .update({ 
        user_selected_category_id: category.id,
        status: 'classified'
      })
      .eq('id', item.id)

    await fetchLandingZone()
  }

  const downloadAsset = async (asset: Asset) => {
    const { data } = await supabase.storage
      .from('assets')
      .createSignedUrl(asset.storage_path, 3600)

    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
      
      // Increment download count
      await supabase
        .from('assets')
        .update({ download_count: (asset.download_count || 0) + 1 })
        .eq('id', asset.id)
    }
  }

  const copyAssetUrl = async (asset: Asset) => {
    const { data } = await supabase.storage
      .from('assets')
      .getPublicUrl(asset.storage_path)

    if (data?.publicUrl) {
      await navigator.clipboard.writeText(data.publicUrl)
    }
  }

  const deleteAsset = async (asset: Asset) => {
    if (!confirm(`Delete "${asset.name}"? This cannot be undone.`)) return

    await supabase
      .from('assets')
      .update({ status: 'deleted' })
      .eq('id', asset.id)

    await fetchAssets(selectedCategory || undefined)
    await fetchCategories()
  }

  // =====================================================
  // RENDER
  // =====================================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <span className="text-2xl">✨</span>
              Javari Asset Manager
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              AI-powered asset organization • Upload anywhere, file automatically
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => printReport(selectedCategory ? 'category' : 'all')}
              disabled={isPrinting || filteredAssets.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              title="Print to Epson"
            >
              <Printer className="w-4 h-4" />
              {isPrinting ? 'Printing...' : 'Print'}
            </button>
            <button
              onClick={() => {
                fetchCategories()
                fetchAssets(selectedCategory || undefined)
                fetchLandingZone()
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          
          {/* Sidebar - Categories */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-gray-900 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Asset Folders
              </h2>
              
              {/* All Assets */}
              <button
                onClick={() => { setSelectedCategory(null); setCurrentPage(1) }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg mb-1 transition ${
                  !selectedCategory ? 'bg-purple-600 text-white' : 'hover:bg-gray-800 text-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  All Assets
                </span>
                <span className="text-sm">{totalAssets}</span>
              </button>

              {/* Category List */}
              <div className="space-y-1 max-h-[60vh] overflow-y-auto">
                {categories.map(cat => (
                  <button
                    key={cat.slug}
                    onClick={() => { setSelectedCategory(cat.slug); setCurrentPage(1) }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition ${
                      selectedCategory === cat.slug 
                        ? 'bg-purple-600 text-white' 
                        : 'hover:bg-gray-800 text-gray-300'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <FolderOpen className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{cat.name}</span>
                    </span>
                    <span className="text-sm ml-2">{cat.file_count}</span>
                  </button>
                ))}
              </div>

              {/* Storage Stats */}
              <div className="mt-6 pt-4 border-t border-gray-800">
                <div className="text-xs text-gray-500 mb-2">Storage Used</div>
                <div className="text-lg font-semibold text-purple-400">
                  {formatBytes(totalSize)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {totalAssets} files
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            
            {/* Upload Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
              onDragLeave={() => setIsDragOver(false)}
              className={`
                border-2 border-dashed rounded-xl p-8 mb-6 text-center transition-all
                ${isDragOver 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-gray-700 hover:border-gray-600 bg-gray-900/50'
                }
              `}
            >
              <Upload className={`w-8 h-8 mx-auto mb-3 ${isDragOver ? 'text-purple-400' : 'text-gray-500'}`} />
              <p className="text-gray-300 font-medium">Drag & drop files here</p>
              <p className="text-sm text-gray-500 mt-1">
                or <label className="text-purple-400 cursor-pointer hover:underline">
                  browse
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && uploadFiles(Array.from(e.target.files))}
                  />
                </label> to select files
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Javari AI will automatically detect and organize your files
              </p>
            </div>

            {/* Landing Zone - Pending Classification */}
            {landingZone.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    Pending Classification
                    <span className="text-sm font-normal text-gray-400">
                      ({landingZone.length} files)
                    </span>
                  </h2>
                  <button
                    onClick={approveAllClassified}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve All Classified
                  </button>
                </div>

                <div className="bg-gray-900 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider text-gray-500 border-b border-gray-800">
                        <th className="px-4 py-3">File</th>
                        <th className="px-4 py-3">Size</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {landingZone.slice(0, 10).map(item => (
                        <tr key={item.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-gray-500" />
                              <div>
                                <p className="font-medium truncate max-w-[200px]">{item.original_filename}</p>
                                <p className="text-xs text-gray-500">.{item.file_extension}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">
                            {formatBytes(item.file_size_bytes)}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={item.final_category_slug || ''}
                              onChange={(e) => changeCategory(item, e.target.value)}
                              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
                            >
                              <option value="">Select category...</option>
                              {categories.map(cat => (
                                <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              item.status === 'classified' ? 'text-green-400 bg-green-500/20' :
                              item.status === 'pending' ? 'text-yellow-400 bg-yellow-500/20' :
                              'text-gray-400 bg-gray-500/20'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => approveFile(item)}
                              disabled={!item.final_category_slug}
                              className="p-1 text-green-400 hover:bg-green-500/20 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {landingZone.length > 10 && (
                    <div className="px-4 py-2 text-sm text-gray-500 text-center border-t border-gray-800">
                      Showing 10 of {landingZone.length} pending files
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Asset Browser */}
            <div>
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold">
                    {selectedCategory 
                      ? categories.find(c => c.slug === selectedCategory)?.name || 'Assets'
                      : 'All Assets'
                    }
                    <span className="text-sm font-normal text-gray-400 ml-2">
                      ({filteredAssets.length} files)
                    </span>
                  </h2>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search assets..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                      className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm w-64 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Sort */}
                  <select
                    value={`${sortField}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-')
                      setSortField(field as SortField)
                      setSortOrder(order as SortOrder)
                    }}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="created_at-desc">Newest First</option>
                    <option value="created_at-asc">Oldest First</option>
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                    <option value="file_size_bytes-desc">Largest First</option>
                    <option value="file_size_bytes-asc">Smallest First</option>
                    <option value="download_count-desc">Most Downloaded</option>
                  </select>

                  {/* View Toggle */}
                  <div className="flex bg-gray-800 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Asset Grid/List */}
              {paginatedAssets.length === 0 ? (
                <div className="bg-gray-900 rounded-xl p-12 text-center">
                  <FolderOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">
                    {searchQuery ? 'No assets match your search' : 'No assets in this category yet'}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Drag & drop files above to add them
                  </p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {paginatedAssets.map(asset => {
                    const IconComponent = getFileIcon(asset.file_extension)
                    return (
                      <div
                        key={asset.id}
                        className="bg-gray-900 rounded-xl p-4 hover:bg-gray-800/80 transition group"
                      >
                        <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center mb-3 relative">
                          <IconComponent className="w-12 h-12 text-gray-500" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                            <button
                              onClick={() => downloadAsset(asset)}
                              className="p-2 bg-purple-600 rounded-lg hover:bg-purple-500"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => copyAssetUrl(asset)}
                              className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                              title="Copy URL"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteAsset(asset)}
                              className="p-2 bg-red-600/80 rounded-lg hover:bg-red-500"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <h3 className="font-medium truncate text-sm" title={asset.name}>
                          {asset.name}
                        </h3>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>{formatBytes(asset.file_size_bytes)}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(asset.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="bg-gray-900 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider text-gray-500 border-b border-gray-800">
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Size</th>
                        <th className="px-4 py-3">Created</th>
                        <th className="px-4 py-3">Downloads</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAssets.map(asset => {
                        const IconComponent = getFileIcon(asset.file_extension)
                        return (
                          <tr key={asset.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <IconComponent className="w-5 h-5 text-gray-500" />
                                <div>
                                  <p className="font-medium truncate max-w-[300px]">{asset.name}</p>
                                  <p className="text-xs text-gray-500">{asset.original_filename}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-400 uppercase">
                              {asset.file_extension}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-400">
                              {formatBytes(asset.file_size_bytes)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-400">
                              {formatDate(asset.created_at)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-400">
                              {asset.download_count || 0}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => downloadAsset(asset)}
                                  className="p-1.5 hover:bg-gray-700 rounded"
                                  title="Download"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => copyAssetUrl(asset)}
                                  className="p-1.5 hover:bg-gray-700 rounded"
                                  title="Copy URL"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteAsset(asset)}
                                  className="p-1.5 hover:bg-red-500/20 text-red-400 rounded"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredAssets.length)} of {filteredAssets.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
