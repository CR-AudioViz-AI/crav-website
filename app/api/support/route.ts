// /api/support/route.ts
// Support & Success API - CR AudioViz AI
// Tickets, Enhancement Requests, Knowledge Base
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// =============================================================================
// SUPPORT TICKETS
// =============================================================================

interface CreateTicketInput {
  user_id?: string;
  email: string;
  name?: string;
  category_id?: string;
  subject: string;
  description: string;
  priority?: string;
  ticket_type?: string;
  source?: string;
}

async function createTicket(input: CreateTicketInput) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      user_id: input.user_id,
      email: input.email,
      name: input.name,
      category_id: input.category_id,
      subject: input.subject,
      description: input.description,
      priority: input.priority || 'medium',
      ticket_type: input.ticket_type || 'support',
      source: input.source || 'web'
    })
    .select(`
      *,
      category:support_categories(name, icon)
    `)
    .single();
  
  if (error) throw error;
  
  // Log activity
  await supabase.from('support_activity').insert({
    ticket_id: data.id,
    action: 'created',
    actor_id: input.user_id,
    actor_type: 'customer'
  });
  
  return data;
}

async function getTickets(userId: string, filters?: { status?: string; limit?: number }) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  let query = supabase
    .from('support_tickets')
    .select(`
      *,
      category:support_categories(name, icon),
      messages:support_messages(count)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  
  return data || [];
}

async function getTicketDetails(ticketId: string, userId: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  const { data: ticket, error } = await supabase
    .from('support_tickets')
    .select(`
      *,
      category:support_categories(name, icon, description)
    `)
    .eq('id', ticketId)
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  
  // Get messages (excluding internal notes for customer)
  const { data: messages } = await supabase
    .from('support_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .eq('is_internal', false)
    .order('created_at', { ascending: true });
  
  // Get activity
  const { data: activity } = await supabase
    .from('support_activity')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: false })
    .limit(20);
  
  return {
    ...ticket,
    messages: messages || [],
    activity: activity || []
  };
}

async function addTicketMessage(ticketId: string, userId: string, message: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  // Verify user owns ticket
  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('id, status')
    .eq('id', ticketId)
    .eq('user_id', userId)
    .single();
  
  if (!ticket) throw new Error('Ticket not found');
  
  // Add message
  const { data, error } = await supabase
    .from('support_messages')
    .insert({
      ticket_id: ticketId,
      author_id: userId,
      author_type: 'customer',
      message,
      is_internal: false
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Update ticket status if it was waiting on customer
  if (ticket.status === 'waiting_on_customer') {
    await supabase
      .from('support_tickets')
      .update({ status: 'in_progress', updated_at: new Date().toISOString() })
      .eq('id', ticketId);
  }
  
  return data;
}

// =============================================================================
// ENHANCEMENT REQUESTS
// =============================================================================

interface CreateEnhancementInput {
  user_id?: string;
  email: string;
  name?: string;
  title: string;
  description: string;
  use_case?: string;
  expected_benefit?: string;
  category: string;
  module?: string;
}

async function createEnhancement(input: CreateEnhancementInput) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  const { data, error } = await supabase
    .from('enhancement_requests')
    .insert({
      user_id: input.user_id,
      email: input.email,
      name: input.name,
      title: input.title,
      description: input.description,
      use_case: input.use_case,
      expected_benefit: input.expected_benefit,
      category: input.category,
      module: input.module
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Log activity
  await supabase.from('enhancement_activity').insert({
    enhancement_id: data.id,
    action: 'created',
    actor_id: input.user_id
  });
  
  // Auto-upvote by creator
  if (input.user_id) {
    await supabase.from('enhancement_votes').insert({
      enhancement_id: data.id,
      user_id: input.user_id,
      vote: 1
    });
  }
  
  return data;
}

async function getEnhancements(filters?: {
  status?: string;
  category?: string;
  module?: string;
  sort?: 'votes' | 'newest' | 'priority';
  limit?: number;
  user_id?: string;
}) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  let query = supabase
    .from('enhancement_requests')
    .select(`
      *,
      comments:enhancement_comments(count),
      user_vote:enhancement_votes!inner(vote)
    `);
  
  // Filter by user vote if user_id provided (to show their vote status)
  if (filters?.user_id) {
    query = supabase
      .from('enhancement_requests')
      .select(`
        *,
        comments:enhancement_comments(count)
      `);
  }
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  
  if (filters?.module) {
    query = query.eq('module', filters.module);
  }
  
  // Sorting
  switch (filters?.sort) {
    case 'votes':
      query = query.order('vote_score', { ascending: false });
      break;
    case 'priority':
      query = query.order('priority_score', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  
  // Get user's votes if user_id provided
  if (filters?.user_id && data) {
    const { data: votes } = await supabase
      .from('enhancement_votes')
      .select('enhancement_id, vote')
      .eq('user_id', filters.user_id)
      .in('enhancement_id', data.map(e => e.id));
    
    const voteMap = new Map(votes?.map(v => [v.enhancement_id, v.vote]) || []);
    
    return data.map(e => ({
      ...e,
      user_vote: voteMap.get(e.id) || 0
    }));
  }
  
  return data || [];
}

async function voteOnEnhancement(enhancementId: string, userId: string, vote: 1 | -1 | 0) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  if (vote === 0) {
    // Remove vote
    await supabase
      .from('enhancement_votes')
      .delete()
      .eq('enhancement_id', enhancementId)
      .eq('user_id', userId);
  } else {
    // Upsert vote
    await supabase
      .from('enhancement_votes')
      .upsert({
        enhancement_id: enhancementId,
        user_id: userId,
        vote
      }, {
        onConflict: 'enhancement_id,user_id'
      });
  }
  
  // Get updated counts
  const { data } = await supabase
    .from('enhancement_requests')
    .select('upvote_count, downvote_count, vote_score')
    .eq('id', enhancementId)
    .single();
  
  return data;
}

async function addEnhancementComment(
  enhancementId: string, 
  userId: string, 
  comment: string,
  parentId?: string
) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  const { data, error } = await supabase
    .from('enhancement_comments')
    .insert({
      enhancement_id: enhancementId,
      user_id: userId,
      comment,
      parent_id: parentId,
      is_official: false
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return data;
}

// =============================================================================
// KNOWLEDGE BASE
// =============================================================================

async function searchKnowledgeBase(query: string, limit: number = 10) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  // Search articles
  const { data: articles } = await supabase
    .from('kb_articles')
    .select(`
      id, title, slug, excerpt, collection_id,
      collection:kb_collections(name, slug)
    `)
    .eq('status', 'published')
    .textSearch('search_vector', query)
    .limit(limit);
  
  // Search FAQs
  const { data: faqs } = await supabase
    .from('faqs')
    .select('id, question, answer, category')
    .eq('is_active', true)
    .textSearch('search_vector', query)
    .limit(limit);
  
  return {
    articles: articles || [],
    faqs: faqs || []
  };
}

async function getKBCollections() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  const { data, error } = await supabase
    .from('kb_collections')
    .select(`
      *,
      articles:kb_articles(count)
    `)
    .eq('is_public', true)
    .order('sort_order', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

async function getKBArticle(slug: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  const { data, error } = await supabase
    .from('kb_articles')
    .select(`
      *,
      collection:kb_collections(name, slug)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  
  if (error) throw error;
  
  // Increment view count
  await supabase
    .from('kb_articles')
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq('id', data.id);
  
  // Get related articles
  let related: any[] = [];
  if (data.related_articles && data.related_articles.length > 0) {
    const { data: relatedData } = await supabase
      .from('kb_articles')
      .select('id, title, slug, excerpt')
      .in('id', data.related_articles)
      .eq('status', 'published');
    related = relatedData || [];
  }
  
  return { ...data, related };
}

async function submitKBFeedback(articleId: string, helpful: boolean, userId?: string, feedbackText?: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  await supabase.from('kb_feedback').insert({
    article_id: articleId,
    user_id: userId,
    helpful,
    feedback_text: feedbackText
  });
  
  // Update article counts
  if (helpful) {
    await supabase.rpc('increment_helpful', { article_id: articleId });
  } else {
    await supabase.rpc('increment_not_helpful', { article_id: articleId });
  }
  
  return { success: true };
}

// =============================================================================
// SUPPORT CATEGORIES
// =============================================================================

async function getCategories() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  const { data, error } = await supabase
    .from('support_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

// =============================================================================
// API HANDLERS
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    
    switch (action) {
      // Tickets
      case 'tickets':
        if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
        const tickets = await getTickets(userId, {
          status: searchParams.get('status') || undefined,
          limit: parseInt(searchParams.get('limit') || '20')
        });
        return NextResponse.json({ tickets });
      
      case 'ticket':
        const ticketId = searchParams.get('ticketId');
        if (!ticketId || !userId) {
          return NextResponse.json({ error: 'ticketId and userId required' }, { status: 400 });
        }
        const ticket = await getTicketDetails(ticketId, userId);
        return NextResponse.json({ ticket });
      
      case 'categories':
        const categories = await getCategories();
        return NextResponse.json({ categories });
      
      // Enhancements
      case 'enhancements':
        const enhancements = await getEnhancements({
          status: searchParams.get('status') || undefined,
          category: searchParams.get('category') || undefined,
          module: searchParams.get('module') || undefined,
          sort: (searchParams.get('sort') as any) || 'votes',
          limit: parseInt(searchParams.get('limit') || '50'),
          user_id: userId || undefined
        });
        return NextResponse.json({ enhancements });
      
      // Knowledge Base
      case 'kb_search':
        const query = searchParams.get('q');
        if (!query) return NextResponse.json({ error: 'query required' }, { status: 400 });
        const results = await searchKnowledgeBase(query);
        return NextResponse.json(results);
      
      case 'kb_collections':
        const collections = await getKBCollections();
        return NextResponse.json({ collections });
      
      case 'kb_article':
        const slug = searchParams.get('slug');
        if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });
        const article = await getKBArticle(slug);
        return NextResponse.json({ article });
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Support GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;
    
    switch (action) {
      // Tickets
      case 'create_ticket':
        const ticket = await createTicket(data);
        return NextResponse.json({ success: true, ticket });
      
      case 'add_message':
        if (!data.ticket_id || !data.user_id || !data.message) {
          return NextResponse.json({ error: 'ticket_id, user_id, and message required' }, { status: 400 });
        }
        const message = await addTicketMessage(data.ticket_id, data.user_id, data.message);
        return NextResponse.json({ success: true, message });
      
      // Enhancements
      case 'create_enhancement':
        const enhancement = await createEnhancement(data);
        return NextResponse.json({ success: true, enhancement });
      
      case 'vote':
        if (!data.enhancement_id || !data.user_id || data.vote === undefined) {
          return NextResponse.json({ error: 'enhancement_id, user_id, and vote required' }, { status: 400 });
        }
        const voteResult = await voteOnEnhancement(data.enhancement_id, data.user_id, data.vote);
        return NextResponse.json({ success: true, ...voteResult });
      
      case 'add_comment':
        if (!data.enhancement_id || !data.user_id || !data.comment) {
          return NextResponse.json({ error: 'enhancement_id, user_id, and comment required' }, { status: 400 });
        }
        const comment = await addEnhancementComment(
          data.enhancement_id, 
          data.user_id, 
          data.comment,
          data.parent_id
        );
        return NextResponse.json({ success: true, comment });
      
      // Knowledge Base
      case 'kb_feedback':
        if (!data.article_id || data.helpful === undefined) {
          return NextResponse.json({ error: 'article_id and helpful required' }, { status: 400 });
        }
        await submitKBFeedback(data.article_id, data.helpful, data.user_id, data.feedback_text);
        return NextResponse.json({ success: true });
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Support POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
