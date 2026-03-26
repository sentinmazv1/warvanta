"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
  
  const userEmail = user.email.toLowerCase();
  const isAllowed = SUPERADMIN_EMAILS.some(email => email.toLowerCase() === userEmail);
  
  console.log(`Superadmin check for ${userEmail}: ${isAllowed}`);
  return isAllowed;
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

/**
 * Retrieves all company applications.
 */
export async function getApplications() {
  const isSuperadmin = await checkSuperadmin();
  if (!isSuperadmin) throw new Error("Unauthorized");

  const { data, error } = await masterSupabase
    .from("company_applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Approves a company application and initializes the company record.
 */
export async function approveApplication(
  appId: string,
  period: string = "1_YEAR",
) {
  const isSuperadmin = await checkSuperadmin();
  if (!isSuperadmin) throw new Error("Unauthorized");

  // 1. Get Application
  const { data: app, error: appError } = await masterSupabase
    .from("company_applications")
    .select("*")
    .eq("id", appId)
    .single();

  if (appError) throw appError;

  // 2. Create Company
  const { data: company, error: companyError } = await masterSupabase
    .from("companies")
    .insert([
      {
        name: app.company_name,
        subscription_period: period,
        subscription_start_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (companyError) throw companyError;

  // 3. Update Application Status
  await masterSupabase
    .from("company_applications")
    .update({ status: "APPROVED", processed_at: new Date().toISOString() })
    .eq("id", appId);

  revalidatePath("/master/applications");
  revalidatePath("/master");
  return { success: true };
}

/**
 * Rejects a company application with a reason.
 */
export async function rejectApplication(appId: string, reason: string) {
  const isSuperadmin = await checkSuperadmin();
  if (!isSuperadmin) throw new Error("Unauthorized");

  const { error } = await masterSupabase
    .from("company_applications")
    .update({
      status: "REJECTED",
      processed_at: new Date().toISOString(),
      notes: reason,
    })
    .eq("id", appId);

  if (error) throw error;
  revalidatePath("/master/applications");
  return { success: true };
}

/**
 * Deletes a company application record permanently.
 */
export async function deleteApplication(appId: string) {
  const isSuperadmin = await checkSuperadmin();
  if (!isSuperadmin) throw new Error("Unauthorized");

  const { error } = await masterSupabase
    .from("company_applications")
    .delete()
    .eq("id", appId);

  if (error) throw error;
  revalidatePath("/master/applications");
  revalidatePath("/master");
  return { success: true };
}
