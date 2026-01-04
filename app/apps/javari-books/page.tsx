// Javari Books - Native Integration
// Timestamp: January 4, 2026 - 12:05 AM EST
// This runs NATIVELY on craudiovizai.com so OAuth works properly

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { 
  Headphones, FileAudio, Loader2, Download, Upload, CheckCircle, AlertCircle, 
  LogIn, Coins, Library, Crown, FileText, Play, Pause, SkipForward, SkipBack,
  Volume2, VolumeX, Clock, Sparkles, Zap, FileUp, X, ChevronDown, History, Copy, Check,
  BookOpen, ExternalLink
} from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

type Mode = 'ebook-to-audio' | 'audio-to-ebook'
type Voice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'

const VOICES: Record<Voice, { label: string; description: string }> = {
  alloy: { label: 'Alloy', description: 'Versatile, neutral voice' },
  echo: { label: 'Echo', description: 'Clear, masculine voice' },
  fable: { label: 'Fable', description: 'British accent, storytelling' },
  onyx: { label: 'Onyx', description: 'Deep, authoritative voice' },
  nova: { label: 'Nova', description: 'Warm, expressive female voice' },
  shimmer: { label: 'Shimmer', description: 'Soft, gentle female voice' }
}

const ADMIN_EMAILS = [
  'royhenderson@craudiovizai.com',
  'cindyhenderson@craudiovizai.com'
]

interface ConversionResult {
  title?: string
  voice?: string
  duration?: string
  downloadUrl?: string
  wordCount?: number
  fileSize?: number
  chunks?: number
  assetId?: string
}

interface User {
  id: string
  email: string
  user_metadata?: { full_name?: string }
}

export default function JavariBooksPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  // Core state
  const [mode, setMode] = useState<Mode>('ebook-to-audio')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [creditBalance, setCreditBalance] = useState<number>(0)
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [progressText, setProgressText] = useState<string>('')
  
  // File handling
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  // eBook to Audio state
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [voice, setVoice] = useState<Voice>('nova')
  const [showVoiceSelector, setShowVoiceSelector] = useState(false)

  // Audio to eBook state
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [outputFormat, setOutputFormat] = useState<'txt' | 'md'>('txt')

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Clipboard
  const [copied, setCopied] = useState(false)

  // Admin check
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email)

  // Credit costs
  const CREDIT_COST_EBOOK_TO_AUDIO = 50
  const CREDIT_COST_AUDIO_TO_EBOOK = 75
  const currentCost = mode === 'ebook-to-audio' ? CREDIT_COST_EBOOK_TO_AUDIO : CREDIT_COST_AUDIO_TO_EBOOK

  // Word count and estimated duration
  const wordCount = text.split(/\s+/).filter(w => w).length
  const estimatedMinutes = Math.ceil(wordCount / 150)
  const estimatedDuration = estimatedMinutes >= 60 
    ? `${Math.floor(estimatedMinutes / 60)}h ${estimatedMinutes % 60}m`
    : `${estimatedMinutes}m`

  // Check auth on mount using SUPABASE directly (same domain = cookies work)
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    setCheckingAuth(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user as User)
        
        // Get credit balance from central API
        const res = await fetch('/api/credits/balance', { credentials: 'include' })
        const data = await res.json()
        if (data.success) {
          setCreditBalance(data.balance || 0)
        }
      }
    } catch (err) {
      console.error('Auth check failed:', err)
    } finally {
      setCheckingAuth(false)
    }
  }

  const handleLogin = () => {
    router.push('/login?redirect=/apps/javari-books')
  }

  // File upload handling
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) await processFile(files[0])
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) await processFile(files[0])
  }

  const processFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    
    if (mode === 'ebook-to-audio') {
      if (!['txt', 'md'].includes(ext || '')) {
        alert('Please upload a TXT or MD file')
        return
      }
      const content = await file.text()
      setText(content)
      setTitle(file.name.replace(/\.[^/.]+$/, ''))
    } else {
      if (!['mp3', 'wav', 'm4a', 'ogg', 'webm'].includes(ext || '')) {
        alert('Please upload an audio file (MP3, WAV, M4A, OGG, WebM)')
        return
      }
      setAudioFile(file)
      setTitle(file.name.replace(/\.[^/.]+$/, ''))
    }
  }

  const handleEbookToAudio = async () => {
    if (!user) { handleLogin(); return }
    if (!text) { alert('Please enter text to convert'); return }
    if (!isAdmin && creditBalance < currentCost) {
      alert(`Insufficient credits. Need ${currentCost}, have ${creditBalance}`)
      return
    }

    setLoading(true)
    setResult(null)
    setError(null)
    setProgress(10)
    setProgressText('Processing...')

    try {
      // Deduct credits via central API (admin bypass happens server-side)
      if (!isAdmin) {
        const deductRes = await fetch('/api/credits/spend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            amount: currentCost,
            description: `Audiobook: ${title || 'Untitled'}`,
            app_id: 'javari-books'
          })
        })
        const deductData = await deductRes.json()
        if (!deductData.success) {
          setError('Failed to process credits')
          setLoading(false)
          return
        }
        setCreditBalance(deductData.balance || creditBalance - currentCost)
      }

      setProgress(30)
      setProgressText('Converting to audio...')

      // Call the javari-books API for conversion
      const response = await fetch('https://javari-books.vercel.app/api/ebook-to-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice,
          userId: user.id,
          userEmail: user.email,
          title: title || 'Untitled',
          saveToLibrary: true
        })
      })

      setProgress(80)
      const data = await response.json()

      if (data.success && data.audiobook) {
        setResult(data.audiobook)
        setProgress(100)
        setProgressText('Complete!')
      } else {
        // Refund on failure
        if (!isAdmin) {
          await fetch('/api/credits/refund', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              amount: currentCost,
              reason: 'Conversion failed',
              app_id: 'javari-books'
            })
          })
          await checkAuth()
        }
        setError(data.error || 'Conversion failed')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to convert')
    } finally {
      setLoading(false)
      setProgressText('')
    }
  }

  const handleAudioToEbook = async () => {
    if (!user) { handleLogin(); return }
    if (!audioFile) { alert('Please select an audio file'); return }
    if (!isAdmin && creditBalance < currentCost) {
      alert(`Insufficient credits. Need ${currentCost}, have ${creditBalance}`)
      return
    }

    setLoading(true)
    setResult(null)
    setError(null)
    setProgress(10)
    setProgressText('Uploading audio...')

    try {
      if (!isAdmin) {
        const deductRes = await fetch('/api/credits/spend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            amount: currentCost,
            description: `Transcription: ${title || audioFile.name}`,
            app_id: 'javari-books'
          })
        })
        const deductData = await deductRes.json()
        if (!deductData.success) {
          setError('Failed to process credits')
          setLoading(false)
          return
        }
        setCreditBalance(deductData.balance || creditBalance - currentCost)
      }

      setProgress(30)
      setProgressText('Transcribing audio...')

      const formData = new FormData()
      formData.append('audio', audioFile)
      formData.append('title', title || audioFile.name.replace(/\.[^/.]+$/, ''))
      formData.append('format', outputFormat)
      formData.append('userId', user.id)
      formData.append('userEmail', user.email)
      formData.append('saveToLibrary', 'true')

      const response = await fetch('https://javari-books.vercel.app/api/audio-to-ebook', {
        method: 'POST',
        body: formData
      })

      setProgress(80)
      const data = await response.json()

      if (data.success && data.ebook) {
        setResult(data.ebook)
        setProgress(100)
        setProgressText('Complete!')
      } else {
        if (!isAdmin) {
          await fetch('/api/credits/refund', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              amount: currentCost,
              reason: 'Transcription failed',
              app_id: 'javari-books'
            })
          })
          await checkAuth()
        }
        setError(data.error || 'Transcription failed')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to transcribe')
    } finally {
      setLoading(false)
      setProgressText('')
    }
  }

  // Audio player controls
  const togglePlayback = () => {
    if (!audioRef.current) return
    if (isPlaying) audioRef.current.pause()
    else audioRef.current.play()
    setIsPlaying(!isPlaying)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const copyToClipboard = async (url: string) => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetForm = () => {
    setResult(null)
    setError(null)
    setText('')
    setTitle('')
    setAudioFile(null)
    setProgress(0)
  }

  // Loading state
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 py-12">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="bg-card border rounded-2xl p-8 text-center shadow-xl">
            <BookOpen className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h1 className="text-2xl font-bold mb-4">Javari Books</h1>
            <p className="text-muted-foreground mb-6">
              Convert eBooks to audiobooks or transcribe audio to text.
            </p>
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90"
            >
              <LogIn className="h-5 w-5" />
              Sign In to Continue
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  Javari Books
                  {isAdmin && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-full text-xs">
                      <Crown className="h-3 w-3" /> Admin
                    </span>
                  )}
                </h1>
                <p className="text-sm text-muted-foreground">eBooks ↔ Audiobooks</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                <Coins className="h-5 w-5 text-primary" />
                <span className="font-bold">{isAdmin ? '∞' : creditBalance}</span>
                <span className="text-sm text-muted-foreground">credits</span>
              </div>
              <a href="/dashboard/library" className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted">
                <Library className="h-5 w-5" />
                Library
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-muted p-1 rounded-xl">
            <button
              onClick={() => { setMode('ebook-to-audio'); resetForm() }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                mode === 'ebook-to-audio' ? 'bg-primary text-primary-foreground shadow' : ''
              }`}
            >
              <Headphones className="h-5 w-5" />
              eBook → Audio
              {!isAdmin && <span className="text-xs opacity-75">({CREDIT_COST_EBOOK_TO_AUDIO} cr)</span>}
            </button>
            <button
              onClick={() => { setMode('audio-to-ebook'); resetForm() }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                mode === 'audio-to-ebook' ? 'bg-primary text-primary-foreground shadow' : ''
              }`}
            >
              <FileAudio className="h-5 w-5" />
              Audio → eBook
              {!isAdmin && <span className="text-xs opacity-75">({CREDIT_COST_AUDIO_TO_EBOOK} cr)</span>}
            </button>
          </div>
        </div>

        {/* Insufficient Credits Warning */}
        {!isAdmin && creditBalance < currentCost && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <div>
                <p className="font-medium">Insufficient Credits</p>
                <p className="text-sm text-muted-foreground">
                  Need {currentCost} credits. You have {creditBalance}.
                </p>
              </div>
              <a href="/pricing" className="ml-auto px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium">
                Buy Credits
              </a>
            </div>
          </div>
        )}

        <div className="bg-card border rounded-2xl p-6 shadow-lg">
          {/* eBook to Audio */}
          {mode === 'ebook-to-audio' && !result && (
            <div className="space-y-6">
              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              >
                <input ref={fileInputRef} type="file" accept=".txt,.md" onChange={handleFileSelect} className="hidden" />
                <FileUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="font-medium">Drop your file or click to upload</p>
                <p className="text-sm text-muted-foreground">TXT, MD files</p>
              </div>

              {/* Text Area */}
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Or paste your text here..."
                  className="w-full h-48 px-4 py-3 border rounded-xl resize-none bg-background"
                />
                <div className="absolute bottom-3 right-3 text-sm text-muted-foreground">
                  {wordCount} words • ~{estimatedDuration}
                </div>
              </div>

              {/* Title */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title..."
                className="w-full px-4 py-3 border rounded-xl bg-background"
              />

              {/* Voice Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowVoiceSelector(!showVoiceSelector)}
                  className="w-full flex items-center justify-between px-4 py-3 border rounded-xl bg-background"
                >
                  <div className="flex items-center gap-3">
                    <Volume2 className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">{VOICES[voice].label}</p>
                      <p className="text-xs text-muted-foreground">{VOICES[voice].description}</p>
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition ${showVoiceSelector ? 'rotate-180' : ''}`} />
                </button>
                
                {showVoiceSelector && (
                  <div className="absolute z-10 w-full mt-2 bg-card border rounded-xl shadow-xl overflow-hidden">
                    {Object.entries(VOICES).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => { setVoice(key as Voice); setShowVoiceSelector(false) }}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted ${voice === key ? 'bg-primary/10' : ''}`}
                      >
                        <Volume2 className="h-5 w-5 text-primary" />
                        <div className="text-left">
                          <p className="font-medium">{val.label}</p>
                          <p className="text-xs text-muted-foreground">{val.description}</p>
                        </div>
                        {voice === key && <Check className="h-4 w-4 text-primary ml-auto" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Convert Button */}
              <button
                onClick={handleEbookToAudio}
                disabled={loading || !text || (!isAdmin && creditBalance < currentCost)}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {progressText || 'Converting...'}
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    Convert to Audiobook
                    {!isAdmin && <span className="opacity-75">({currentCost} credits)</span>}
                  </>
                )}
              </button>

              {loading && progress > 0 && (
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
          )}

          {/* Audio to eBook */}
          {mode === 'audio-to-ebook' && !result && (
            <div className="space-y-6">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => audioInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  audioFile ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                }`}
              >
                <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleFileSelect} className="hidden" />
                {audioFile ? (
                  <>
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p className="font-medium">{audioFile.name}</p>
                    <p className="text-sm text-muted-foreground">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </>
                ) : (
                  <>
                    <FileAudio className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="font-medium">Drop audio file or click to upload</p>
                    <p className="text-sm text-muted-foreground">MP3, WAV, M4A, OGG, WebM</p>
                  </>
                )}
              </div>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title..."
                className="w-full px-4 py-3 border rounded-xl bg-background"
              />

              <div className="grid grid-cols-2 gap-2">
                {(['txt', 'md'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setOutputFormat(fmt)}
                    className={`px-4 py-3 border rounded-xl font-medium uppercase ${
                      outputFormat === fmt ? 'border-primary bg-primary/10 ring-2 ring-primary' : ''
                    }`}
                  >
                    .{fmt}
                  </button>
                ))}
              </div>

              <button
                onClick={handleAudioToEbook}
                disabled={loading || !audioFile || (!isAdmin && creditBalance < currentCost)}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {progressText || 'Transcribing...'}
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    Transcribe to eBook
                    {!isAdmin && <span className="opacity-75">({currentCost} credits)</span>}
                  </>
                )}
              </button>

              {loading && progress > 0 && (
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <h2 className="text-2xl font-bold">
                  {mode === 'ebook-to-audio' ? 'Audiobook Created!' : 'eBook Created!'}
                </h2>
                <p className="text-muted-foreground">Saved to your library</p>
              </div>

              <div className="bg-muted/50 rounded-xl p-4">
                <h3 className="font-semibold">{result.title}</h3>
                <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                  {result.voice && <span>Voice: {result.voice}</span>}
                  {result.duration && <span>Duration: {result.duration}</span>}
                  {result.wordCount && <span>{result.wordCount.toLocaleString()} words</span>}
                </div>
              </div>

              {/* Audio Player */}
              {mode === 'ebook-to-audio' && result.downloadUrl && (
                <div className="bg-muted rounded-xl p-4">
                  <audio
                    ref={audioRef}
                    src={result.downloadUrl}
                    onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
                    onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
                    onEnded={() => setIsPlaying(false)}
                  />
                  <div className="flex items-center gap-4">
                    <button onClick={togglePlayback} className="p-3 bg-primary text-primary-foreground rounded-full">
                      {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </button>
                    <div className="flex-1">
                      <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={(e) => {
                          const time = parseFloat(e.target.value)
                          if (audioRef.current) audioRef.current.currentTime = time
                          setCurrentTime(time)
                        }}
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <a
                  href={result.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold"
                >
                  <Download className="h-5 w-5" />
                  Download
                </a>
                <button
                  onClick={() => result.downloadUrl && copyToClipboard(result.downloadUrl)}
                  className="flex items-center justify-center gap-2 px-6 py-3 border rounded-xl"
                >
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>

              <button onClick={resetForm} className="w-full px-6 py-3 border rounded-xl hover:bg-muted">
                <Sparkles className="h-5 w-5 inline mr-2" />
                Create Another
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-red-700 dark:text-red-300">Error</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  {!isAdmin && <p className="text-sm text-muted-foreground mt-2">Credits have been refunded.</p>}
                </div>
              </div>
              <button onClick={resetForm} className="mt-4 w-full px-4 py-2 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg">
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
