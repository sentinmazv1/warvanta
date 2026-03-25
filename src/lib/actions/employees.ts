'use server';

import { createClient } from "@/lib/supabase/server";
import { Employee } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getEmployees() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) return [];

  // Fetch with joins for names
  const { data, error } = await supabase
    .from('employees')
    .select(`
      *,
      departments:department_id(name),
      positions:position_id(name),
      branches:branch_id(name)
    `)
    .eq('company_id', profile.company_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching employees:', error);
    return [];
  }

  // Flatten the response for the UI
  return data.map(emp => ({
    ...emp,
    department_name: emp.departments?.name,
    position_name: emp.positions?.name,
    branch_name: emp.branches?.name
  })) as Employee[];
}

export async function addEmployee(formData: Partial<Employee>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum açılmamış.");

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) throw new Error("Şirket kaydı bulunamadı.");

  const { data, error } = await supabase
    .from('employees')
    .insert([{
      ...formData,
      company_id: profile.company_id,
      status: 'ACTIVE'
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding employee:', error);
    throw new Error(`Personel kaydedilirken hata oluştu: ${error.message} (${error.code})`);
  }

  revalidatePath('/personnel');
  return data;
}

export async function updateEmployee(id: string, formData: Partial<Employee>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('employees')
    .update(formData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/personnel');
  return data;
}

export async function getEmployee(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('employees')
    .select(`
      *,
      departments:department_id(name),
      positions:position_id(name),
      branches:branch_id(name)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  
  return {
    ...data,
    department_name: data.departments?.name,
    position_name: data.positions?.name,
    branch_name: data.branches?.name
  } as Employee;
}

export async function getEmployeeDocuments(employeeId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('employee_documents')
    .select('*')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addEmployeeDocument(employeeId: string, name: string, fileUrl: string, category: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('employee_documents')
    .insert([{
      employee_id: employeeId,
      name,
      file_url: fileUrl,
      category
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCelebrations() {
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
    .from('employees')
    .select('id, first_name, last_name, birth_date, hire_date, photo_url')
    .eq('company_id', profile.company_id)
    .eq('status', 'ACTIVE');

  if (error) return [];

  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1-12
  const currentDay = today.getDate();

  const events: any[] = [];

  data.forEach(emp => {
    // Birthday
    if (emp.birth_date) {
      const bDate = new Date(emp.birth_date);
      events.push({
        id: `${emp.id}-bday`,
        employee_id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        photo_url: emp.photo_url,
        type: 'BIRTHDAY',
        date: emp.birth_date,
        month: bDate.getMonth() + 1,
        day: bDate.getDate(),
        original_year: bDate.getFullYear()
      });
    }

    // Anniversary
    if (emp.hire_date) {
      const hDate = new Date(emp.hire_date);
      events.push({
        id: `${emp.id}-anniv`,
        employee_id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        photo_url: emp.photo_url,
        type: 'ANNIVERSARY',
        date: emp.hire_date,
        month: hDate.getMonth() + 1,
        day: hDate.getDate(),
        original_year: hDate.getFullYear(),
        years_completed: today.getFullYear() - hDate.getFullYear()
      });
    }
  });

  // Sort and filter for "upcoming" (this month and next)
  // Or just return all and let UI filter by month. Let's return all but sorted by month/day.
  return events.sort((a, b) => {
    if (a.month !== b.month) return a.month - b.month;
    return a.day - b.day;
  });
}
