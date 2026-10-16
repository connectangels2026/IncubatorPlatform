import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://knucyiahztcpqgsftiyc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtudWN5aWFoenRjcHFnc2Z0aXljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTUyMDY5MiwiZXhwIjoyMTA1MDk2NjkyfQ.JLOqBGkxBJM7GTfEpd8Euuhv6GGWPX3Xg3HhWJU2G8k';

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