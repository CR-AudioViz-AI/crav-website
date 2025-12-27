import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/dashboard/stats
export async function GET(req: NextRequest) {
  // Verify admin (check for admin role in profile)
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Parallel queries for dashboard stats
    const [
      totalUsers,
      activeSubscriptions,
      todayRevenue,
      monthRevenue,
      openTickets,
      todaySignups,
      creditBalance,
      recentTransactions
    ] = await Promise.all([
      // Total users
      supabase.from("craiverse_profiles").select("id", { count: "exact", head: true }),
      
      // Active subscriptions
      supabase.from("craiverse_subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      
      // Today revenue
      supabase.from("craiverse_payments")
        .select("amount")
        .gte("created_at", today.toISOString())
        .eq("status", "completed"),
      
      // This month revenue
      supabase.from("craiverse_payments")
        .select("amount")
        .gte("created_at", thisMonth.toISOString())
        .eq("status", "completed"),
      
      // Open tickets
      supabase.from("craiverse_tickets")
        .select("id", { count: "exact", head: true })
        .in("status", ["open", "in_progress"]),
      
      // Today signups
      supabase.from("craiverse_profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", today.toISOString()),
      
      // Total credit balance (across all users)
      supabase.from("craiverse_credits")
        .select("balance"),
      
      // Recent transactions
      supabase.from("craiverse_payments")
        .select("id, amount, status, provider, created_at, craiverse_profiles(display_name, email)")
        .order("created_at", { ascending: false })
        .limit(10)
    ]);

    const stats = {
      users: {
        total: totalUsers.count || 0,
        today: todaySignups.count || 0
      },
      subscriptions: {
        active: activeSubscriptions.count || 0
      },
      revenue: {
        today: (todayRevenue.data || []).reduce((sum, p) => sum + (p.amount || 0), 0) / 100,
        month: (monthRevenue.data || []).reduce((sum, p) => sum + (p.amount || 0), 0) / 100
      },
      tickets: {
        open: openTickets.count || 0
      },
      credits: {
        total_balance: (creditBalance.data || []).reduce((sum, c) => sum + (c.balance || 0), 0)
      },
      recent_transactions: recentTransactions.data || []
    };

    return NextResponse.json(stats);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
