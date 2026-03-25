'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { PuantajRecord, PuantajStatus } from "@/lib/types";

export async function getPuantajRecords(month: number, year: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) return [];

  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('puantaj_records')
    .select('*')
    .eq('company_id', profile.company_id)
    .gte('attendance_date', startDate)
    .lte('attendance_date', endDate);

  if (error) throw error;
  return data as PuantajRecord[];
}

export async function savePuantajRecord(record: {
  employee_id: string;
  attendance_date: string;
  check_in?: string;
  check_out?: string;
  status: PuantajStatus;
  notes?: string;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum açılmamış.");

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) throw new Error("Şirket bulunamadı.");

  const { data, error } = await supabase
    .from('puantaj_records')
    .upsert({
      ...record,
      company_id: profile.company_id
    }, {
        onConflict: 'employee_id,attendance_date'
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/personnel/puantaj');
  return data;
}

export async function deletePuantajRecord(employeeId: string, attendanceDate: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum açılmamış.");

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) throw new Error("Şirket bulunamadı.");

  const { error } = await supabase
    .from('puantaj_records')
    .delete()
    .eq('company_id', profile.company_id)
    .eq('employee_id', employeeId)
    .eq('attendance_date', attendanceDate);

  if (error) throw error;
  revalidatePath('/personnel/puantaj');
  return { success: true };
}

export async function getPuantajSummary(month: number, year: number) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};

    const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

    if (!profile?.company_id) return {};

    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('puantaj_records')
        .select('employee_id, status')
        .eq('company_id', profile.company_id)
        .gte('attendance_date', startDate)
        .lte('attendance_date', endDate);

    if (error) throw error;

    // Aggregate totals per employee
    const summary: Record<string, Record<string, number>> = {};
    data.forEach(rec => {
        if (!summary[rec.employee_id]) summary[rec.employee_id] = {};
        summary[rec.employee_id][rec.status] = (summary[rec.employee_id][rec.status] || 0) + 1;
    });

    return summary;
}
