'use server';

import { createClient } from "@/lib/supabase/server";
import { Asset, AssetLog } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getAssets() {
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
    .from('assets')
    .select('*, employee:employees(first_name, last_name)')
    .eq('company_id', profile.company_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching assets:', error);
    return [];
  }

  return data as any[];
}

export async function getEmployeeAssets(employeeId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('employee_id', employeeId)
    .order('assigned_at', { ascending: false });

  if (error) {
    console.error('Error fetching employee assets:', error);
    return [];
  }

  return data as any[];
}

export async function addAsset(formData: Partial<Asset>) {
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
    .from('assets')
    .insert([{
      ...formData,
      company_id: profile.company_id,
      status: formData.employee_id ? 'ASSIGNED' : 'AVAILABLE',
      assigned_at: formData.employee_id ? new Date().toISOString() : null
    }])
    .select()
    .single();

  if (error) throw error;

  // If assigned, add a log entry
  if (formData.employee_id) {
    await supabase
      .from('asset_logs')
      .insert([{
        asset_id: data.id,
        employee_id: formData.employee_id,
        action: 'ASSIGN',
        note: 'Yeni kayıt ile birlikte zimmetlendi.',
        created_by: user.id
      }]);
  }

  revalidatePath('/assets');
  return data;
}

export async function assignAsset(assetId: string, employeeId: string, note?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum açılmamış.");

  // Start a transaction-like flow (manual)
  // 1. Update Asset
  const { error: assetError } = await supabase
    .from('assets')
    .update({ 
      employee_id: employeeId, 
      status: 'ASSIGNED',
      assigned_at: new Date().toISOString()
    })
    .eq('id', assetId);

  if (assetError) throw assetError;

  // 2. Add Log
  const { error: logError } = await supabase
    .from('asset_logs')
    .insert([{
      asset_id: assetId,
      employee_id: employeeId,
      action: 'ASSIGN',
      note: note || 'Personele zimmetlendi.',
      created_by: user.id
    }]);

  revalidatePath('/assets');
}

export async function returnAsset(assetId: string, note?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum açılmamış.");

  // 1. Get current assignee for log
  const { data: asset } = await supabase
    .from('assets')
    .select('employee_id')
    .eq('id', assetId)
    .single();

  // 2. Update Asset
  const { error: assetError } = await supabase
    .from('assets')
    .update({ 
      employee_id: null, 
      status: 'AVAILABLE',
      assigned_at: null
    })
    .eq('id', assetId);

  if (assetError) throw assetError;

  // 3. Add Log
  await supabase
    .from('asset_logs')
    .insert([{
      asset_id: assetId,
      employee_id: asset?.employee_id,
      action: 'RETURN',
      note: note || 'Zimmet iade alındı.',
      created_by: user.id
    }]);

  revalidatePath('/assets');
}
