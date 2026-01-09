'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Database, Copy, Check } from 'lucide-react'

export default function AdminMigrationPage() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'ready' | 'error'>('idle')
  const [tableExists, setTableExists] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string>('')

  const migrationSQL = `-- LegalEase AI Database Migration
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/kteobfyferrukqeolofj/sql

CREATE TABLE IF NOT EXISTS public.legalease_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  original_content TEXT NOT NULL,
  converted_content TEXT,
  document_type TEXT DEFAULT 'other' CHECK (document_type IN ('contract', 'agreement', 'terms', 'policy', 'other')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.legalease_documents ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'legalease_documents' AND policyname = 'Users can view own legalease documents') THEN
    CREATE POLICY "Users can view own legalease documents" ON public.legalease_documents FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'legalease_documents' AND policyname = 'Users can create own legalease documents') THEN
    CREATE POLICY "Users can create own legalease documents" ON public.legalease_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'legalease_documents' AND policyname = 'Users can update own legalease documents') THEN
    CREATE POLICY "Users can update own legalease documents" ON public.legalease_documents FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'legalease_documents' AND policyname = 'Users can delete own legalease documents') THEN
    CREATE POLICY "Users can delete own legalease documents" ON public.legalease_documents FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_legalease_documents_user_id ON public.legalease_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_legalease_documents_created_at ON public.legalease_documents(created_at DESC);`

  const checkTableStatus = async () => {
    setStatus('checking')
    setError('')
    
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      
      if (data.database?.legalease_table) {
        setTableExists(true)
        setStatus('ready')
      } else {
        setTableExists(false)
        setStatus('error')
      }
    } catch (err: any) {
      setError(err.message)
      setStatus('error')
    }
  }

  const copySQL = () => {
    navigator.clipboard.writeText(migrationSQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">LegalEase AI Database Setup</h1>
          </div>
          <p className="text-gray-600">Complete the database migration to enable document history and persistence.</p>
        </div>

        {/* Status Check */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            System Status
          </h2>
          
          <button
            onClick={checkTableStatus}
            disabled={status === 'checking'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'checking' ? 'Checking...' : 'Check Database Status'}
          </button>

          {status !== 'idle' && (
            <div className="mt-6 p-4 rounded-lg border-2" style={{
              borderColor: tableExists ? '#10b981' : '#f59e0b',
              backgroundColor: tableExists ? '#ecfdf5' : '#fffbeb'
            }}>
              <div className="flex items-center gap-3">
                {tableExists ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-cyan-500" />
                    <div>
                      <p className="font-semibold text-cyan-500">✅ Database Ready</p>
                      <p className="text-sm text-cyan-500">All tables and policies are configured correctly.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-6 h-6 text-cyan-500" />
                    <div>
                      <p className="font-semibold text-cyan-500">⚠️ Migration Required</p>
                      <p className="text-sm text-cyan-500">The legalease_documents table needs to be created.</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Migration Instructions */}
        {!tableExists && status !== 'idle' && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-xl font-semibold mb-4">Migration Instructions</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-1">Copy the SQL script</p>
                  <p className="text-sm text-gray-600 mb-3">Click the button below to copy the migration SQL to your clipboard.</p>
                  <button
                    onClick={copySQL}
                    className="flex items-center gap-2 bg-white border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy SQL Script
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-1">Open Supabase SQL Editor</p>
                  <p className="text-sm text-gray-600 mb-3">Navigate to your Supabase project's SQL editor.</p>
                  <a
                    href="https://supabase.com/dashboard/project/kteobfyferrukqeolofj/sql"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-cyan-500 transition-colors"
                  >
                    Open SQL Editor →
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-1">Paste and Run</p>
                  <p className="text-sm text-gray-600">Paste the SQL script in the editor and click "Run" to execute the migration.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-1">Verify</p>
                  <p className="text-sm text-gray-600">Return to this page and click "Check Database Status" to verify the migration succeeded.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SQL Script Preview */}
        {!tableExists && status !== 'idle' && (
          <div className="bg-gray-900 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Migration SQL Script</h3>
              <button
                onClick={copySQL}
                className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="text-sm text-gray-300 overflow-x-auto">
              <code>{migrationSQL}</code>
            </pre>
          </div>
        )}

        {/* Success State */}
        {tableExists && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-cyan-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">✅ All Set!</h2>
              <p className="text-gray-600 mb-6">LegalEase AI database is fully configured and operational.</p>
              <a
                href="/apps/legalease"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Go to LegalEase AI →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
