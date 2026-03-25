'use server';

import { createClient } from "@/lib/supabase/server";

export async function getReportStats() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) return null;

  const companyId = profile.company_id;

  // 1. Employee Counts
  const { count: totalEmployees } = await supabase
    .from('employees')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);

  // 2. Department Breakdown
  const { data: deptCounts } = await supabase
    .from('employees')
    .select('department_id, departments(name)')
    .eq('company_id', companyId);

  const depts: Record<string, number> = {};
  deptCounts?.forEach(d => {
    const name = (d.departments as any)?.name || 'Merkez';
    depts[name] = (depts[name] || 0) + 1;
  });

  // 3. Asset Stats
  const { data: assets } = await supabase
    .from('assets')
    .select('status')
    .eq('company_id', companyId);

  const assetStats = {
    total: assets?.length || 0,
    assigned: assets?.filter(a => a.status === 'ASSIGNED').length || 0,
    available: assets?.filter(a => a.status === 'AVAILABLE').length || 0,
  };

  // 4. Leave Stats (Last 30 days approved)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: leaves } = await supabase
    .from('leaves')
    .select('status, start_date, end_date')
    .eq('company_id', companyId)
    .eq('status', 'APPROVED')
    .gte('created_at', thirtyDaysAgo.toISOString());

  let totalLeaveDays = 0;
  leaves?.forEach(l => {
    const s = new Date(l.start_date);
    const e = new Date(l.end_date);
    totalLeaveDays += Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  });

  return {
    employees: { total: totalEmployees || 0, depts },
    assets: assetStats,
    leaves: { totalDays: totalLeaveDays }
  };
}
