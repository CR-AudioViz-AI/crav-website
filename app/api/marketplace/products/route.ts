// /api/marketplace/products/route.ts
// Marketplace Products API - CR AudioViz AI
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// GET: List or search products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');
    const vendorId = searchParams.get('vendorId');
    const categoryId = searchParams.get('categoryId');
    const category = searchParams.get('category'); // slug
    const productType = searchParams.get('type');
    const search = searchParams.get('q');
    const featured = searchParams.get('featured');
    const sort = searchParams.get('sort') || 'newest';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get single product
    if (productId) {
      const { data, error } = await supabase
        .from('marketplace_products')
        .select(`
          *,
          vendor:marketplace_vendors(id, store_name, store_slug, logo_url, average_rating),
          category:marketplace_categories(id, name, slug),
          variants:marketplace_product_variants(*)
        `)
        .eq('id', productId)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      // Increment view count
      await supabase
        .from('marketplace_products')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', productId);

      return NextResponse.json({ product: data });
    }

    // Build query
    let query = supabase
      .from('marketplace_products')
      .select(`
        *,
        vendor:marketplace_vendors(id, store_name, store_slug, logo_url),
        category:marketplace_categories(id, name, slug)
      `, { count: 'exact' })
      .eq('status', 'active');

    // Filters
    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (category) {
      // Join with category by slug
      query = query.eq('category.slug', category);
    }

    if (productType) {
      query = query.eq('product_type', productType);
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Sorting
    switch (sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'price_low':
        query = query.order('price_cents', { ascending: true });
        break;
      case 'price_high':
        query = query.order('price_cents', { ascending: false });
        break;
      case 'popular':
        query = query.order('sales_count', { ascending: false });
        break;
      case 'rating':
        query = query.order('average_rating', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Products query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      products: data || [],
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit
    });

  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create product (vendor only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      vendorId,
      title,
      description,
      shortDescription,
      productType,
      categoryId,
      priceCents,
      compareAtPriceCents,
      billingPeriod,
      downloadUrl,
      downloadLimit,
      images,
      tags,
      requiresShipping,
      trackInventory,
      inventoryCount,
      metaTitle,
      metaDescription,
      status = 'draft'
    } = body;

    if (!vendorId || !title || !productType || priceCents === undefined) {
      return NextResponse.json(
        { error: 'vendorId, title, productType, and priceCents required' },
        { status: 400 }
      );
    }

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Generate unique slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const { data: slugCheck } = await supabase
        .from('marketplace_products')
        .select('id')
        .eq('vendor_id', vendorId)
        .eq('slug', slug)
        .single();

      if (!slugCheck) break;
      slug = `${baseSlug}-${counter++}`;
    }

    // Create product
    const { data: product, error } = await supabase
      .from('marketplace_products')
      .insert({
        vendor_id: vendorId,
        title,
        slug,
        description: description || '',
        short_description: shortDescription,
        product_type: productType,
        category_id: categoryId,
        price_cents: priceCents,
        compare_at_price_cents: compareAtPriceCents,
        billing_period: billingPeriod || 'one_time',
        download_url: downloadUrl,
        download_limit: downloadLimit,
        images: images || [],
        tags: tags || [],
        requires_shipping: requiresShipping || false,
        track_inventory: trackInventory || false,
        inventory_count: inventoryCount || 0,
        meta_title: metaTitle,
        meta_description: metaDescription,
        status,
        published_at: status === 'active' ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (error) {
      console.error('Product creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update vendor product count
    await supabase.rpc('increment_vendor_products', { p_vendor_id: vendorId });

    return NextResponse.json({
      success: true,
      product,
      message: status === 'active' ? 'Product published!' : 'Product saved as draft'
    });

  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update product
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, vendorId, ...updates } = body;

    if (!productId) {
      return NextResponse.json({ error: 'productId required' }, { status: 400 });
    }

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Convert camelCase to snake_case and filter allowed fields
    const allowedFields = [
      'title', 'description', 'short_description', 'product_type',
      'category_id', 'price_cents', 'compare_at_price_cents',
      'billing_period', 'download_url', 'download_limit',
      'images', 'tags', 'requires_shipping', 'track_inventory',
      'inventory_count', 'meta_title', 'meta_description', 'status'
    ];

    const sanitizedUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (allowedFields.includes(snakeKey)) {
        sanitizedUpdates[snakeKey] = value;
      }
    }

    // Handle status change to active
    if (sanitizedUpdates.status === 'active') {
      sanitizedUpdates.published_at = new Date().toISOString();
    }

    sanitizedUpdates.updated_at = new Date().toISOString();

    let query = supabase
      .from('marketplace_products')
      .update(sanitizedUpdates)
      .eq('id', productId);

    // Optionally verify vendor ownership
    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }

    const { data, error } = await query.select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: data });

  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete product (soft delete via status)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');
    const vendorId = searchParams.get('vendorId');

    if (!productId) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    let query = supabase
      .from('marketplace_products')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', productId);

    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }

    const { error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Product archived' });

  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
