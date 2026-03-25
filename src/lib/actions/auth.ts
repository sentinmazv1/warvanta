'use server';

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { resend } from "@/lib/resend";

export async function createInitialCompany(companyName: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum açılmamış.");

  // 1. Create Company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert([{ name: companyName }])
    .select()
    .single();

  if (companyError) throw companyError;

  // 2. Create Profile as COMPANY_ADMIN
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([{
      id: user.id,
      company_id: company.id,
      email: user.email!,
      role: 'COMPANY_ADMIN',
      first_name: 'Şirket',
      last_name: 'Yöneticisi',
      is_active: true
    }]);

  if (profileError) throw profileError;

  revalidatePath('/');
  return company;
}

export async function checkOnboardingStatus() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { isAuthenticated: false, hasCompany: false };

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, company_id, role, first_name')
    .eq('id', user.id)
    .single();

  let departmentId = null;
  let permissions = null;

  if (profile?.company_id) {
    const { data: employee } = await supabase
      .from('employees')
      .select('department_id, departments(permissions)')
      .eq('profile_id', user.id)
      .single();
    
    if (employee) {
        departmentId = employee.department_id;
        permissions = (employee.departments as any)?.permissions;
    }
  }

  return {
    isAuthenticated: true,
    hasCompany: !!profile?.company_id,
    role: profile?.role || 'EMPLOYEE',
    firstName: profile?.first_name || 'Kullanıcı',
    departmentId,
    permissions,
    user: user
  };
}

export async function submitApplication(data: any) {
  const supabase = createClient();
  const { error } = await supabase
    .from('company_applications')
    .insert([data]);

  if (error) throw error;
  revalidatePath('/master/applications');
  return { success: true };
}


export async function bypassSignup(email: string, password: string) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (error) {
    console.error("Bypass Signup Error:", error);
    throw error;
  }
  return data.user;
}

export async function forceConfirmUser(email: string) {
  const { data: { users }, error: findError } = await supabaseAdmin.auth.admin.listUsers();
  if (findError) throw findError;
  
  const user = users.find(u => u.email === email);
  if (!user) throw new Error("Kullanıcı bulunamadı.");

  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    email_confirm: true
  });

  if (error) throw error;
  return data.user;
}

export async function initializeStorage() {
  const buckets = ['avatars', 'company-logos', 'personnel-docs'];
  
  for (const bucket of buckets) {
    const { data, error } = await supabaseAdmin.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
    });
    if (error && error.message !== 'Bucket already exists') {
      console.error(`Error creating bucket ${bucket}:`, error);
    }
  }
  return { success: true };
}

export async function getSubscriptionInfo() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) return null;

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', profile.company_id)
    .single();

  return company;
}
