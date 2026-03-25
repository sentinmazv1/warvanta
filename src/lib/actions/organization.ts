'use server';

import { createClient } from "@/lib/supabase/server";
import { Department, Branch, Position, Company } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getDepartments() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) return [];

  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('company_id', profile.company_id)
    .order('name');

  if (error) throw error;
  return data as Department[];
}

export async function addDepartment(name: string) {
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
    .from('departments')
    .insert([{ name, company_id: profile.company_id }])
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/settings');
  return data;
}

export async function getPositions() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) return [];

  const { data, error } = await supabase
    .from('positions')
    .select('*')
    .eq('company_id', profile.company_id)
    .order('name');

  if (error) throw error;
  return data as Position[];
}

export async function addPosition(name: string) {
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
    .from('positions')
    .insert([{ name, company_id: profile.company_id }])
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/settings');
  return data;
}

export async function deletePosition(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('positions')
    .delete()
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/settings');
}

export async function getCompany() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) return null;

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', profile.company_id)
    .single();

  if (error) throw error;
  return data as Company;
}

export async function updateCompany(formData: Partial<Company>) {
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
    .from('companies')
    .update(formData)
    .eq('id', profile.company_id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/settings');
  return data;
}

export async function updateDepartmentPermissions(deptId: string, permissions: Department['permissions']) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum açılmamış.");

  // Verify Admin/HR
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['COMPANY_ADMIN', 'HR_MANAGER'].includes(profile.role)) {
    throw new Error("Bu işlem için yetkiniz yok.");
  }

  const { error } = await supabase
    .from('departments')
    .update({ permissions })
    .eq('id', deptId);

  if (error) throw error;
  revalidatePath('/settings');
  return { success: true };
}
