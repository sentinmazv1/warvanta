import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkSchema() {
  // Check common tables
  const tables = ['employees', 'profiles', 'departments', 'positions'];
  
  for (const table of tables) {
    console.log(`\n--- Table: ${table} ---`);
    const { data, error } = await supabase.rpc('get_table_info', { table_name: table });
    if (error) {
      console.log(`Error checking schema for ${table}:`, error.message);
      // Fallback: try to select 1 row to see what we get
      const { data: rows, error: rowError } = await supabase.from(table).select('*').limit(1);
      if (rowError) {
        console.log(`Row Error for ${table}:`, rowError.message);
      } else {
        console.log(`Columns for ${table}:`, rows.length > 0 ? Object.keys(rows[0]) : "No data to infer columns");
      }
    } else {
      console.log(`Schema for ${table}:`, data);
    }
  }
}

checkSchema();
