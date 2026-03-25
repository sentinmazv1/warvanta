'use server';

import { createClient } from "@/lib/supabase/server";
import { CustomFieldDefinition, CustomFieldValue } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getCustomFieldDefinitions() {
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
    .from('custom_field_definitions')
    .select('*')
    .eq('company_id', profile.company_id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching field definitions:', error);
    return [];
  }

  return data as CustomFieldDefinition[];
}

export async function saveCustomFieldDefinition(data: Partial<CustomFieldDefinition>) {
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
    .from('custom_field_definitions')
    .upsert([{ ...data, company_id: profile.company_id }]);

  if (error) throw error;
  
  revalidatePath('/settings');
}

export async function getEmployeeCustomValues(employeeId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('custom_field_values')
    .select('*')
    .eq('employee_id', employeeId);

  if (error) {
    console.error('Error fetching custom values:', error);
    return [];
  }

  return data as CustomFieldValue[];
}

export async function saveEmployeeCustomValues(employeeId: string, values: Record<string, string>) {
  const supabase = createClient();
  
  const insertData = Object.entries(values).map(([defId, val]) => ({
    employee_id: employeeId,
    field_definition_id: defId,
    value: val
  }));

  const { error } = await supabase
    .from('custom_field_values')
    .upsert(insertData, { onConflict: 'employee_id,field_definition_id' });

  if (error) throw error;
}
