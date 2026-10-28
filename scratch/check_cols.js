const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envFile.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
  const idx = trimmed.indexOf('=');
  env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkCols() {
  const { data, error } = await supabase.from('applications').select('*').limit(1).single();
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('CURRENT APPLICATIONS COLUMNS:', Object.keys(data));
  console.log('selected_id in data?', 'selected_id' in data, 'value:', data.selected_id);
  console.log('selected_incubator_id in data?', 'selected_incubator_id' in data, 'value:', data.selected_incubator_id);
}
checkCols();
