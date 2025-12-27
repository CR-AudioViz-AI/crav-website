import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/javari/knowledge - Get knowledge base articles
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") || "10");

  try {
    let dbQuery = supabase
      .from("craiverse_knowledge_base")
      .select("id, title, content, category, tags, helpful_count")
      .eq("status", "published");

    if (category) {
      dbQuery = dbQuery.eq("category", category);
    }

    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`);
    }

    dbQuery = dbQuery.order("helpful_count", { ascending: false }).limit(limit);

    const { data, error } = await dbQuery;

    if (error) throw error;

    return NextResponse.json({ articles: data });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/javari/knowledge - Admin: Add knowledge article
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, category, tags } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("craiverse_knowledge_base")
      .insert({
        title,
        content,
        category: category || "general",
        tags: tags || [],
        status: "published"
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, article: data });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
