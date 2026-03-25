'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getNotes() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('user_notes')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addNote(title: string, content?: string, color: string = 'blue') {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum açılmamış.");

  const { data, error } = await supabase
    .from('user_notes')
    .insert([{ 
      profile_id: user.id,
      title,
      content,
      color
    }])
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/notes');
  return data;
}

export async function updateNote(id: string, data: any) {
  const supabase = createClient();
  const { error } = await supabase
    .from('user_notes')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/notes');
  return { success: true };
}

export async function deleteNote(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('user_notes')
    .delete()
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/notes');
  return { success: true };
}
