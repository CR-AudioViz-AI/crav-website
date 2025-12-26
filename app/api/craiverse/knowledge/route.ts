import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('q');
  const slug = searchParams.get('slug');

  // Get single article by slug
  if (slug) {
    const { data: article, error } = await supabase
      .from('craiverse_knowledge_articles')
      .select('*, category:craiverse_knowledge_categories(*)')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Increment view count
    await supabase.rpc('increment', { row_id: article.id, table_name: 'craiverse_knowledge_articles', column_name: 'view_count' }).catch(() => {});

    return NextResponse.json({ article });
  }

  // Get categories
  const { data: categories } = await supabase
    .from('craiverse_knowledge_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  // Get articles
  let query = supabase
    .from('craiverse_knowledge_articles')
    .select('id, title, slug, excerpt, category_id, view_count, tags')
    .eq('status', 'published')
    .order('view_count', { ascending: false });

  if (category) {
    const cat = categories?.find(c => c.slug === category);
    if (cat) query = query.eq('category_id', cat.id);
  }

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  const { data: articles } = await query.limit(50);

  return NextResponse.json({ categories: categories || [], articles: articles || [] });
}
