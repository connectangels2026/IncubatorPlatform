const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envFile.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
  const idx = trimmed.indexOf('=');
  const key = trimmed.slice(0, idx).trim();
  const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
  env[key] = val;
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Supabase Query Error:', error);
    process.exit(1);
  }

  console.log('All Applications Columns:', Object.keys(data || {}));

  const { data: orgSample } = await supabase.from('organizations').select('*').limit(1).single();
  console.log('All Organizations Columns:', Object.keys(orgSample || {}));

  console.log('=== LATEST APPLICATION RECORD ===');
  console.log('Application ID:', data.id);
  console.log('Applicant Email:', data.applicant_email);
  console.log('Created By (User ID):', data.created_by);
  console.log('Startup ID:', data.startup_id);
  console.log('Submitted At:', data.submitted_at);
  console.log('Uploaded Documents:', JSON.stringify(data.uploaded_documents, null, 2));
  console.log('Form Data Keys:', Object.keys(data.form_data || {}));
}

check().catch(console.error);
