import { getApplications } from "@/lib/actions/master";
import { approveApplication } from "@/lib/actions/master";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  
  // Get the latest PENDING application
  const { data: apps, error: fetchError } = await supabase
    .from('company_applications')
    .select('id, contact_email')
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false })
    .limit(1);

  if (fetchError || !apps || apps.length === 0) {
    return NextResponse.json({ success: false, error: "No pending applications found." }, { status: 404 });
  }

  const appId = apps[0].id;
  try {
    const result = await approveApplication(appId);
    return NextResponse.json({ success: true, message: `Approved application for ${apps[0].contact_email}`, company: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
