'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { AttendanceLog } from "@/lib/types";

export async function getTodayStatus() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('attendance_logs')
    .select('*')
    .eq('profile_id', user.id)
    .gte('created_at', today)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  return data as AttendanceLog | null;
}

export async function checkIn(lat: number, lng: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum açılmamış.");

  // Fetch company settings for geofencing and work hours
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, companies(latitude, longitude, radius_meters, settings)')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) throw new Error("Şirket bulunamadı.");

  const company = profile.companies as any;
  const { latitude: targetLat, longitude: targetLng, radius_meters: radius } = company;

  // 1. Geofencing Check
  if (targetLat && targetLng && radius) {
    const distance = getDistance(lat, lng, targetLat, targetLng);
    if (distance > radius) {
      throw new Error(`Kayıt başarısız. Belirlenen mesai alanı dışındasınız. (Uzaklık: ${Math.round(distance)}m, Limit: ${radius}m)`);
    }
  }

  const settings = company.settings;
  const workStart = settings?.work_start || "09:00";
  const tolerance = settings?.late_tolerance_min || 15;

  const now = new Date();
  const [h, m] = workStart.split(':').map(Number);
  const startLimit = new Date();
  startLimit.setHours(h, m + tolerance, 0, 0);

  let status: AttendanceLog['status'] = 'PRESENT';
  if (now > startLimit) {
    status = 'LATE';
  }

  const { data, error } = await supabase
    .from('attendance_logs')
    .insert([{
      company_id: profile.company_id,
      profile_id: user.id,
      check_in_at: now.toISOString(),
      check_in_lat: lat,
      check_in_lng: lng,
      status
    }])
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/attendance');
  return data;
}

export async function checkOut(lat: number, lng: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum açılmamış.");

  const todayStatus = await getTodayStatus();
  if (!todayStatus) throw new Error("Giriş kaydı bulunamadı.");

  const { data, error } = await supabase
    .from('attendance_logs')
    .update({
      check_out_at: new Date().toISOString(),
      check_out_lat: lat,
      check_out_lng: lng
    })
    .eq('id', todayStatus.id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/attendance');
  return data;
}

export async function getMonthlyLogs(month: number, year: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const startOfMonth = new Date(year, month - 1, 1).toISOString();
  const endOfMonth = new Date(year, month, 0, 23, 59, 59).toISOString();

  const { data, error } = await supabase
    .from('attendance_logs')
    .select('*')
    .eq('profile_id', user.id)
    .gte('created_at', startOfMonth)
    .lte('created_at', endOfMonth)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as AttendanceLog[];
}

export async function getCompanyAttendance(month: number, year: number, departmentId?: string | null) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, role')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) return [];

  // Security check: If not COMPANY_ADMIN/HR_MANAGER, must have dept permissions
  // (Note: More advanced check could be done here if permissions were passed)

  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

  let query = supabase
    .from('attendance_logs')
    .select(`
      *,
      profiles:profile_id (
        first_name,
        last_name,
        employees!inner (
            department_id
        )
      )
    `)
    .eq('company_id', profile.company_id)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false });

  if (departmentId) {
    query = query.eq('profiles.employees.department_id', departmentId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as any[];
}

// Helper: Haversine Formula for distance calculation in meters
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
