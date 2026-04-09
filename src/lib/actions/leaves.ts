'use server';

import { createClient } from "@/lib/supabase/server";
import { LeaveRequest } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getLeaves(params?: { departmentId?: string | null, onlySelf?: boolean }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, role, id')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) return [];

  let query = supabase
    .from('leaves')
    .select('*, employee:employees!inner(first_name, last_name, department_id)')
    .eq('company_id', profile.company_id);

  if (params?.onlySelf) {
     const { data: emp } = await supabase
        .from('employees')
        .select('id')
        .eq('profile_id', user.id)
        .single();
     if (emp) query = query.eq('employee_id', emp.id);
  } else if (params?.departmentId) {
     query = query.eq('employee.department_id', params.departmentId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leaves:', error);
    return [];
  }

  return data as any[];
}

export async function requestLeave(data: Partial<LeaveRequest>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum açılmamış.");

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) throw new Error("Şirket bulunamadı.");

  const { data: emp } = await supabase
    .from('employees')
    .select('id')
    .eq('profile_id', user.id)
    .single();

  if (!emp) throw new Error("Personel kaydı bulunamadı.");

  const { data: leave, error } = await supabase
    .from('leaves')
    .insert([{
      ...data,
      company_id: profile.company_id,
      employee_id: emp.id,
      status: 'PENDING'
    }])
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/leaves');
  return leave;
}

export async function approveLeave(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('leaves')
    .update({ 
        status: 'APPROVED',
        approved_by: (await supabase.auth.getUser()).data.user?.id 
    })
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/leaves');
}

export async function rejectLeave(id: string, reason: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('leaves')
    .update({ 
        status: 'REJECTED',
        rejection_reason: reason,
        approved_by: (await supabase.auth.getUser()).data.user?.id 
    })
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/leaves');
}

export interface LeaveBalance {
  employee_id: string;
  first_name: string;
  last_name: string;
  hire_date: string;
  total_earned: number;
  total_used: number;
  remaining: number;
  seniority_years: number;
}

export async function getLeaveBalances() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) return [];

  // Fetch employees and their leaves
  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select('id, first_name, last_name, hire_date')
    .eq('company_id', profile.company_id)
    .eq('status', 'ACTIVE');

  if (empError) throw empError;

  const { data: leaves, error: leaveError } = await supabase
    .from('leaves')
    .select('employee_id, start_date, end_date, day_count')
    .eq('company_id', profile.company_id)
    .eq('status', 'APPROVED');

  if (leaveError) throw leaveError;

  const { data: puantajLeaves, error: puantajError } = await supabase
    .from('puantaj_records')
    .select('employee_id, attendance_date')
    .eq('company_id', profile.company_id)
    .eq('status', 'Yİ');

  if (puantajError) throw puantajError;

  const today = new Date();
  
  const balances: LeaveBalance[] = employees.map(emp => {
    const hireDate = new Date(emp.hire_date);
    const seniorityYears = Math.floor((today.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
    
    let totalEarned = 0;
    for (let year = 1; year <= seniorityYears; year++) {
      if (year <= 5) totalEarned += 14;
      else if (year <= 15) totalEarned += 20;
      else totalEarned += 26;
    }

    // Use a Set to store unique dates used for Yıllık İzin (Annual Leave)
    // Format: "YYYY-MM-DD"
    const usedDates = new Set<string>();

    // 1. Add dates from formal leave requests
    leaves
      .filter(l => l.employee_id === emp.id)
      .forEach(l => {
         const start = new Date(l.start_date);
         const end = new Date(l.end_date);
         const curr = new Date(start);
         while (curr <= end) {
            usedDates.add(curr.toISOString().split('T')[0]);
            curr.setDate(curr.getDate() + 1);
         }
      });

    // 2. Add dates from manual Puantaj entries (Yİ status)
    puantajLeaves
      .filter(p => p.employee_id === emp.id)
      .forEach(p => {
         usedDates.add(p.attendance_date);
      });

    const used = usedDates.size;

    return {
      employee_id: emp.id,
      first_name: emp.first_name,
      last_name: emp.last_name,
      hire_date: emp.hire_date,
      total_earned: totalEarned,
      total_used: used,
      remaining: totalEarned - used,
      seniority_years: seniorityYears
    };
  });

  return balances;
}

export async function getLeaveSummary() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { pending: 0, approved_month: 0 };

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) return { pending: 0, approved_month: 0 };

  const { count: pending } = await supabase
    .from('leaves')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', profile.company_id)
    .eq('status', 'PENDING');

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0,0,0,0);

  const { data: monthLeaves } = await supabase
    .from('leaves')
    .select('day_count')
    .eq('company_id', profile.company_id)
    .eq('status', 'APPROVED')
    .gte('start_date', startOfMonth.toISOString());

  const approvedMonth = monthLeaves?.reduce((sum, l) => sum + (l.day_count || 0), 0) || 0;

  return {
    pending: pending || 0,
    approved_month: approvedMonth
  };
}

export async function getLeaveDashboardData(params?: { departmentId?: string | null, onlySelf?: boolean }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { leaves: [], balances: [], summary: { pending: 0, approved_month: 0 } };

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, role, id')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) return { leaves: [], balances: [], summary: { pending: 0, approved_month: 0 } };

  // 1. Fetch Leaves with permissions
  let leavesQuery = supabase
    .from('leaves')
    .select('*, employee:employees!inner(first_name, last_name, department_id, hire_date)')
    .eq('company_id', profile.company_id);

  if (params?.onlySelf) {
     const { data: emp } = await supabase
        .from('employees')
        .select('id')
        .eq('profile_id', user.id)
        .single();
     if (emp) leavesQuery = leavesQuery.eq('employee_id', emp.id);
  } else if (params?.departmentId) {
     leavesQuery = leavesQuery.eq('employee.department_id', params.departmentId);
  }

  const [leavesRes, empRes, puantajLeavesRes] = await Promise.all([
    leavesQuery.order('created_at', { ascending: false }),
    supabase
      .from('employees')
      .select('id, first_name, last_name, hire_date')
      .eq('company_id', profile.company_id)
      .eq('status', 'ACTIVE'),
    supabase
      .from('puantaj_records')
      .select('employee_id, attendance_date')
      .eq('company_id', profile.company_id)
      .eq('status', 'Yİ')
  ]);

  if (leavesRes.error) throw leavesRes.error;
  if (empRes.error) throw empRes.error;
  if (puantajLeavesRes.error) throw puantajLeavesRes.error;

  const leaves = leavesRes.data as any[];
  const employees = empRes.data;
  const puantajLeaves = puantajLeavesRes.data;

  // 2. Calculate Balances
  const today = new Date();
  const balances: LeaveBalance[] = employees.map(emp => {
    const hireDate = new Date(emp.hire_date);
    const seniorityYears = Math.floor((today.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
    
    let totalEarned = 0;
    for (let year = 1; year <= seniorityYears; year++) {
      if (year <= 5) totalEarned += 14;
      else if (year <= 15) totalEarned += 20;
      else totalEarned += 26;
    }

    const usedDates = new Set<string>();
    leaves
      .filter(l => l.employee_id === emp.id && l.status === 'APPROVED')
      .forEach(l => {
         const start = new Date(l.start_date);
         const end = new Date(l.end_date);
         const curr = new Date(start);
         while (curr <= end) {
            usedDates.add(curr.toISOString().split('T')[0]);
            curr.setDate(curr.getDate() + 1);
         }
      });

    puantajLeaves
      .filter(p => p.employee_id === emp.id)
      .forEach(p => {
         usedDates.add(p.attendance_date);
      });

    const used = usedDates.size;

    return {
      employee_id: emp.id,
      first_name: emp.first_name,
      last_name: emp.last_name,
      hire_date: emp.hire_date,
      total_earned: totalEarned,
      total_used: used,
      remaining: totalEarned - used,
      seniority_years: seniorityYears
    };
  });

  // 3. Calculate Summary
  const pendingCount = leaves.filter(l => l.status === 'PENDING').length;
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0,0,0,0);

  const approvedMonth = leaves
    .filter(l => l.status === 'APPROVED' && new Date(l.start_date) >= startOfMonth)
    .reduce((sum, l) => sum + (l.day_count || 0), 0);

  return {
    leaves,
    balances,
    summary: {
      pending: pendingCount,
      approved_month: approvedMonth
    }
  };
}
