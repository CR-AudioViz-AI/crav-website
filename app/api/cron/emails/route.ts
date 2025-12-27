import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { EmailTemplates, sendEmail } from "@/lib/email/templates";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    lowCreditsEmails: 0,
    renewalReminders: 0,
    errors: [] as string[]
  };

  try {
    // 1. Send low credit warnings (balance < 50)
    const { data: lowCreditUsers } = await supabase
      .from("user_credits")
      .select(`
        user_id,
        balance,
        user_profiles(email, display_name)
      `)
      .lt("balance", 50)
      .gt("balance", 0);

    for (const user of lowCreditUsers || []) {
      const profile = user.user_profiles as any;
      if (profile?.email) {
        const template = EmailTemplates.lowCredits(
          profile.display_name || "there",
          user.balance
        );
        const result = await sendEmail(profile.email, template);
        if (result.success) results.lowCreditsEmails++;
        else results.errors.push(`Low credits email failed for ${profile.email}`);
      }
    }

    // 2. Send subscription renewal reminders (7 days before)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const sixDaysFromNow = new Date();
    sixDaysFromNow.setDate(sixDaysFromNow.getDate() + 6);

    const { data: upcomingRenewals } = await supabase
      .from("user_subscriptions")
      .select(`
        user_id,
        plan_id,
        current_period_end,
        user_profiles(email, display_name)
      `)
      .eq("status", "active")
      .gte("current_period_end", sixDaysFromNow.toISOString())
      .lte("current_period_end", sevenDaysFromNow.toISOString());

    const planPrices: Record<string, string> = {
      starter: "$9.99",
      pro: "$29.99",
      enterprise: "$99.99"
    };

    for (const sub of upcomingRenewals || []) {
      const profile = sub.user_profiles as any;
      if (profile?.email) {
        const template = EmailTemplates.subscriptionRenewal(
          profile.display_name || "there",
          sub.plan_id,
          new Date(sub.current_period_end).toLocaleDateString(),
          planPrices[sub.plan_id] || "$0"
        );
        const result = await sendEmail(profile.email, template);
        if (result.success) results.renewalReminders++;
        else results.errors.push(`Renewal email failed for ${profile.email}`);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...results
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      ...results 
    }, { status: 500 });
  }
}
