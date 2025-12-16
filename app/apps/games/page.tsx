'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function GamesPage() {
  const [loading, setLoading] = useState(true)

  return (
    <div className="min-h-screen bg-stone-950">
      <div className="bg-stone-900/95 border-b border-stone-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/apps" className="text-stone-400 hover:text-white">← All Apps</Link>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎮</span>
              <span className="font-bold text-green-500">CRAV Games</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://games.craudiovizai.com" target="_blank" className="text-sm text-stone-400 hover:text-white">
              Open in new tab ↗
            </a>
            <Link href="/apps" className="px-4 py-1.5 bg-green-600/20 text-green-400 rounded-full text-sm">
              Explore More Apps
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-stone-900 to-stone-800 border-b border-stone-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-stone-400">
            🎮 1,200+ games free to play! Premium games: <span className="text-green-400">10 credits</span>
          </p>
          <div className="flex gap-3">
            <Link href="/apps/barrelverse" className="text-xs px-3 py-1 bg-amber-600/20 text-amber-400 rounded-full">
              🥃 Try CRAVBarrels
            </Link>
            <Link href="/apps/javari" className="text-xs px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full">
              🤖 Try Javari AI
            </Link>
          </div>
        </div>
      </div>

      <div className="relative" style={{ height: 'calc(100vh - 120px)' }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-950">
            <div className="text-center">
              <div className="text-6xl mb-4">🎮</div>
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-500 mx-auto"></div>
              <p className="mt-4 text-stone-400">Loading Games...</p>
            </div>
          </div>
        )}
        <iframe
          src="https://games.craudiovizai.com?embedded=true"
          className="w-full h-full border-0"
          onLoad={() => setLoading(false)}
          title="CRAV Games"
        />
      </div>
    </div>
  )
}
