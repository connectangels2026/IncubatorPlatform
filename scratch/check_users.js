const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envFile.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
  const idx = trimmed.indexOf('=');
  env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  console.log('Connecting to:', env.NEXT_PUBLIC_SUPABASE_URL);
  const { data: authUsers, error: aErr } = await supabase.auth.admin.listUsers();
  if (aErr) console.error('Auth error:', aErr);
  else {
    console.log(`--- AUTH USERS (${authUsers.users.length}) ---`);
    authUsers.users.slice(0, 15).forEach(u => {
      console.log(`ID: ${u.id} | Email: ${u.email} | Confirmed: ${u.email_confirmed_at ? 'YES' : 'NO'} | Role: ${u.user_metadata?.role}`);
    });
  }

  const { data: dbUsers, error: dErr } = await supabase.from('users').select('id, email, email_verified, role').limit(15);
  if (dErr) console.error('DB error:', dErr);
  else {
    console.log(`--- PUBLIC.USERS (${dbUsers.length}) ---`);
    dbUsers.forEach(u => console.log(`ID: ${u.id} | Email: ${u.email} | Verified: ${u.email_verified} | Role: ${u.role}`));
  }
}

check().catch(console.error);

