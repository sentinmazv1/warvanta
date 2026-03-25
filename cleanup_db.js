
const { createClient } = require('@supabase/supabase-js');

// Using the keys from .env.local
const SUPABASE_URL = "https://apduhrltapwtxtogywql.supabase.co";
const SUPABASE_KEY = "sb_publishable_quR23CXbQ4cSggBJPK_gcg_fOxDEAxJ"; // Note: This script might need SERVICE_ROLE_KEY to delete all records

const s = createClient(SUPABASE_URL, SUPABASE_KEY);

async function cleanup() {
  console.log("Cleaning up test data...");

  // Note: These might fail if RLS is strict and we don't use SERVICE_ROLE_KEY.
  // But we can try to delete what we created if we were authenticated or if policies allow.
  
  try {
    const { error: appErr } = await s.from('company_applications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (appErr) console.error("Error deleting applications:", appErr.message);
    else console.log("Removed all company applications.");

    const { error: inviteErr } = await s.from('pending_invitations').delete().neq('email', 'keep@example.com');
    if (inviteErr) console.error("Error deleting invitations:", inviteErr.message);
    else console.log("Removed all pending invitations.");

    console.log("Cleanup attempt finished.");
  } catch (e) {
    console.error("Cleanup failed:", e.message);
  }
}

cleanup();
