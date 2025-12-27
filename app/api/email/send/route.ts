import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail, emailTemplates, EmailTemplate } from "@/lib/email-service";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/email/send - Send transactional email
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, template, data, user_id } = body;

    if (!to || !template) {
      return NextResponse.json({ error: "Missing to or template" }, { status: 400 });
    }

    // Validate template exists
    if (!emailTemplates[template as EmailTemplate]) {
      return NextResponse.json({ error: "Invalid template" }, { status: 400 });
    }

    const result = await sendEmail({
      to,
      template: template as EmailTemplate,
      data
    });

    if (result.success) {
      // Log the email
      await supabase.from("craiverse_email_log").insert({
        user_id: user_id || null,
        to_email: to,
        template,
        resend_id: result.id
      });
    }

    return NextResponse.json(result);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/email/send - Get available templates
export async function GET() {
  return NextResponse.json({
    templates: Object.keys(emailTemplates),
    description: {
      welcome: "New user signup",
      subscriptionConfirmed: "After successful subscription",
      renewalReminder: "3 days before renewal",
      lowCredits: "When credits are low",
      paymentFailed: "When payment fails",
      weeklyDigest: "Weekly activity summary"
    }
  });
}

export const dynamic = "force-dynamic";
