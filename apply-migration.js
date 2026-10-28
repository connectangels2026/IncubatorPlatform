import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knucyiahztcpqgsftiyc.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is required.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  const migrationFile = process.argv[2];
  if (!migrationFile) {
    console.error('Usage: node apply-migration.js <path-to-sql-file>');
    process.exit(1);
  }

  let sql;
  try {
    sql = readFileSync(migrationFile, 'utf-8');
  } catch (err) {
    console.error('Failed to read migration file:', err.message);
    process.exit(1);
  }

  const { data, error } = await supabase.rpc('exec_sql', { sql });

  if (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }

  console.log(`Migration applied successfully! (${migrationFile})`);
  process.exit(0);
}

applyMigration();