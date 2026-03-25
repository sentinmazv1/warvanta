"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createClient as createServerClient } from "@/lib/supabase/server";

const SUPERADMIN_EMAILS = ["ibrahimsentinmaz@gmail.com"];

// Initialize Supabase with the SERVICE_ROLE key to bypass RLS.
// WARNING: This client should ONLY be used in secure server actions for master admin tasks.
const masterSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/**
 * Verifies if the currently authenticated user is a Superadmin.
 * Returns true if the user's email is in the SUPERADMIN_EMAILS list.
 */
export async function checkSuperadmin() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) return false;
  return SUPERADMIN_EMAILS.includes(user.email);
}

/**
 * Retrieves platform-wide statistics for the Superadmin Dashboard.
 * Bypasses RLS to count all companies and employees.
 */
export async function getPlatformStats() {
  const isSuperadmin = await checkSuperadmin();
  if (!isSuperadmin)
    throw new Error("Unauthorized: Superadmin access required.");

  try {
    // Get total companies (from applications marked as APPROVED or active companies)
    // We count rows in the tenant/company table if we had one, but we use applications as a proxy for now
    const { count: totalCompanies, error: compErr } = await masterSupabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "APPROVED");

    if (compErr) throw compErr;

    // Get total employees across all companies
    const { count: totalUsers, error: empErr } = await masterSupabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (empErr) throw empErr;

    // Get pending applications
    const { count: pendingApps, error: pendErr } = await masterSupabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "PENDING");

    if (pendErr) throw pendErr;

    // Get active subscriptions
    const { count: activeSubs, error: subErr } = await masterSupabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .in("status", ["ACTIVE", "TRIALING"]);

    if (subErr) throw subErr;

    // Get recent 5 approved companies for activity feed
    const { data: recentCompanies } = await masterSupabase
      .from("applications")
      .select("company_name, created_at, contact_person_name")
      .eq("status", "APPROVED")
      .order("created_at", { ascending: false })
      .limit(5);

    return {
      totalCompanies: totalCompanies || 0,
      totalUsers: totalUsers || 0,
      pendingApps: pendingApps || 0,
      activeSubs: activeSubs || 0,
      recentCompanies: recentCompanies || [],
    };
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    throw new Error("Failed to fetch platform statistics.");
  }
}

/**
 * Retrieves a list of all active/approved companies for the master Superadmin dashboard.
 */
export async function getActiveCompanies() {
  const isSuperadmin = await checkSuperadmin();
  if (!isSuperadmin)
    throw new Error("Unauthorized: Superadmin access required.");

  try {
    const { data: companies, error } = await masterSupabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return companies || [];
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw new Error("Failed to fetch companies.");
  }
}
