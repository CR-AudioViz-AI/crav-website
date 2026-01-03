// Javari Books - Embedded App Page
// Timestamp: January 2, 2026 - 7:30 PM EST
// CR AudioViz AI - Full integration with central services

'use client'

import { useEffect, useState } from 'react'
import { BookOpen, ExternalLink, Loader2 } from 'lucide-react'

export default function JavariBooksPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Track page view
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        event: 'page_view',
        properties: { page: '/apps/javari-books', app_id: 'javari-books' }
      })
    }).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Javari Books</h1>
                <p className="text-sm text-muted-foreground">
                  Convert eBooks to Audiobooks & vice versa
                </p>
              </div>
            </div>
            <a
              href="https://javari-books.vercel.app/convert"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm border rounded-lg hover:bg-muted"
            >
              <ExternalLink className="h-4 w-4" />
              Open in New Tab
            </a>
          </div>
        </div>
      </div>

      {/* Embedded App */}
      <div className="relative" style={{ height: 'calc(100vh - 80px)' }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading Javari Books...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="text-center max-w-md">
              <p className="text-red-500 mb-4">{error}</p>
              <a
                href="https://javari-books.vercel.app/convert"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg"
              >
                <ExternalLink className="h-4 w-4" />
                Open Directly
              </a>
            </div>
          </div>
        )}

        <iframe
          src="https://javari-books.vercel.app/convert"
          className="w-full h-full border-0"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false)
            setError('Failed to load. Please try opening in a new tab.')
          }}
          allow="clipboard-read; clipboard-write"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
        />
      </div>
    </div>
  )
}
