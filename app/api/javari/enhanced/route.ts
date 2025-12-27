import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const buildSystemPrompt = (context: string) => `You are Javari, the AI assistant for CR AudioViz AI (CRAIverse). 

KNOWLEDGE BASE CONTEXT:
${context || "No specific context available."}

CAPABILITIES:
1. Product Questions - Explain features, pricing, capabilities
2. Technical Support - Troubleshoot issues, guide through features  
3. Account Help - Billing, subscriptions, credits
4. App Guidance - Help users find the right tools

KEY INFO:
- CRAIverse offers 60+ AI-powered creative tools
- Credits: Free (100/mo), Pro ($19, 1000/mo), Business ($49, unlimited)
- Support: /dashboard/tickets or chat with me

GUIDELINES:
- Be helpful, friendly, concise
- Never make up information
- Suggest relevant apps when appropriate
- Keep responses under 200 words unless detail needed`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversation_id, user_id, context: userContext } = body;

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // Search knowledge base for relevant context
    const { data: kbResults } = await supabase
      .from("craiverse_knowledge_base")
      .select("title, content")
      .textSearch("content", message.split(" ").slice(0, 5).join(" & "), { type: "websearch" })
      .eq("status", "published")
      .limit(3);

    // Build RAG context - fixed join
    const ragContext = kbResults?.map(r => "[" + r.title + "]: " + r.content).join("\n\n") || "";

    // Get or create conversation
    let convId = conversation_id;
    if (!convId) {
      const { data: conv } = await supabase
        .from("craiverse_javari_conversations")
        .insert({
          user_id: user_id || null,
          source_app: userContext?.source_app || "enhanced",
          source_url: userContext?.source_url || null
        })
        .select("id")
        .single();
      convId = conv?.id;
    }

    // Get conversation history
    let messages: any[] = [];
    if (convId) {
      const { data: history } = await supabase
        .from("craiverse_javari_messages")
        .select("role, content")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true })
        .limit(10);
      
      messages = (history || []).map(m => ({ role: m.role, content: m.content }));
    }

    messages.push({ role: "user", content: message });

    let response = "";
    let provider = "anthropic";
    let tokensUsed = 0;

    try {
      if (process.env.ANTHROPIC_API_KEY) {
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const completion = await anthropic.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 500,
          system: buildSystemPrompt(ragContext),
          messages: messages.map(m => ({ 
            role: m.role as "user" | "assistant", 
            content: m.content 
          }))
        });
        response = completion.content[0].type === "text" ? completion.content[0].text : "";
        tokensUsed = completion.usage.input_tokens + completion.usage.output_tokens;
      } else {
        throw new Error("No Anthropic key");
      }
    } catch (e) {
      provider = "openai";
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 500,
        messages: [
          { role: "system", content: buildSystemPrompt(ragContext) },
          ...messages
        ]
      });
      response = completion.choices[0].message.content || "";
      tokensUsed = completion.usage?.total_tokens || 0;
    }

    // Save messages
    if (convId) {
      await supabase.from("craiverse_javari_messages").insert([
        { conversation_id: convId, role: "user", content: message },
        { conversation_id: convId, role: "assistant", content: response, provider, tokens_used: tokensUsed }
      ]);
    }

    // Log for training
    await supabase.from("craiverse_javari_training_data").insert({
      conversation_id: convId,
      user_message: message,
      assistant_response: response,
      rag_context_used: ragContext ? true : false,
      kb_articles_matched: kbResults?.length || 0,
      provider,
      tokens_used: tokensUsed
    });

    const shouldEscalate = 
      message.toLowerCase().includes("speak to human") ||
      message.toLowerCase().includes("talk to someone") ||
      response.toLowerCase().includes("support ticket");

    return NextResponse.json({
      response,
      conversation_id: convId,
      should_escalate: shouldEscalate,
      provider,
      tokens_used: tokensUsed,
      kb_articles_used: kbResults?.length || 0
    });

  } catch (error: any) {
    console.error("Javari enhanced error:", error);
    return NextResponse.json({ 
      error: "Failed to process message",
      fallback_response: "I apologize, but I am having trouble responding. Please try again or create a support ticket."
    }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
