// ================================================================================
// JAVARI DOCUMENT ASK API - /api/docs/ask
// Answer questions grounded in documents WITH CITATIONS
// ================================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const maxDuration = 120;

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

// POST /api/docs/ask - Ask questions about documents
export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { question, user_id, project_id, document_ids, session_id } = body;

    if (!question) {
      return NextResponse.json({ error: 'Question required' }, { status: 400 });
    }

    // Get relevant documents
    let dbQuery = supabase
      .from('documents')
      .select('id, display_name, original_filename, extracted_text, metadata')
      .eq('status', 'processed')
      .not('extracted_text', 'is', null);

    if (user_id) {
      dbQuery = dbQuery.eq('owner_id', user_id);
    }
    if (project_id) {
      dbQuery = dbQuery.eq('project_id', project_id);
    }
    if (document_ids && document_ids.length > 0) {
      dbQuery = dbQuery.in('id', document_ids);
    }

    const { data: docs, error } = await dbQuery.limit(10);

    if (error || !docs || docs.length === 0) {
      return NextResponse.json({
        answer: "I don't have any documents to reference. Please upload some documents first.",
        citations: [],
        documents_searched: 0,
      });
    }

    // Build context from documents
    const context = docs.map(doc => ({
      id: doc.id,
      name: doc.display_name,
      text: doc.extracted_text?.slice(0, 10000) || '', // Limit per doc
    }));

    // In production, call LLM here. For now, provide grounded response
    const relevantDocs = context.filter(doc => 
      doc.text.toLowerCase().includes(question.toLowerCase().split(' ')[0])
    );

    // Build citations
    const citations = relevantDocs.slice(0, 3).map((doc, idx) => {
      const text = doc.text;
      const words = question.toLowerCase().split(' ');
      let bestSnippet = '';
      
      for (const word of words) {
        const index = text.toLowerCase().indexOf(word);
        if (index >= 0) {
          const start = Math.max(0, index - 50);
          const end = Math.min(text.length, index + 150);
          bestSnippet = text.slice(start, end);
          break;
        }
      }

      return {
        document_id: doc.id,
        document_name: doc.name,
        snippet: bestSnippet || text.slice(0, 200),
        citation_index: idx + 1,
      };
    });

    // Generate answer (placeholder - in production, use LLM)
    const answer = citations.length > 0
      ? `Based on the documents you've uploaded, I found relevant information in ${citations.length} document(s). ` +
        `The document "${citations[0].document_name}" contains: "${citations[0].snippet}..." ` +
        `[Citation 1]`
      : `I searched ${docs.length} documents but couldn't find specific information about "${question}". ` +
        `Try rephrasing your question or uploading more relevant documents.`;

    // Log the query
    await supabase.from('document_audit_log').insert({
      user_id,
      action: 'ask',
      action_details: {
        question,
        documents_searched: docs.length,
        citations_found: citations.length,
        session_id,
      },
    });

    return NextResponse.json({
      question,
      answer,
      citations,
      documents_searched: docs.length,
      grounded: citations.length > 0,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
