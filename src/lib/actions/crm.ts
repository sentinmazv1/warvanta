'use server';

import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/lib/types";
import { revalidatePath } from "next/cache";

// --- Helper: Get Company Profiles ---

export async function getCompanyProfiles() {
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
    .from('profiles')
    .select('id, first_name, last_name, role')
    .eq('company_id', profile.company_id)
    .eq('is_active', true);

  if (error) return [];
  return data as Partial<Profile>[];
}
