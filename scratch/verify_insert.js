const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = (match[2] || '').trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[match[1]] = val;
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const INCUBATOR_ID = '1d96fade-187a-427c-9f92-c120345cad08';

async function verify() {
  const names = [
    'The Indi Mums',
    'CensorX',
    'GrindUp',
    'Mplus',
    'Neutraceuticals(Harira)',
    'VPU',
    'CompaniOn',
    'DROVA',
    'komunity',
    'hileofy'
  ];

  const { data: startups, error: sErr } = await supabase
    .from('startups')
    .select('id, startup_name, founder_id, founder_name, founder_email, stage, sector, status')
    .eq('organization_id', INCUBATOR_ID)
    .in('startup_name', names);

  console.log(`Verified startups in DB: ${startups?.length}/10`);
  console.table(startups);

  const founderIds = startups.map(s => s.founder_id);
  const { data: users, error: uErr } = await supabase
    .from('users')
    .select('id, email, full_name, phone, role')
    .in('id', founderIds);

  console.log(`Verified users in DB: ${users?.length}/10`);
  console.table(users);

  const { data: apps, error: aErr } = await supabase
    .from('applications')
    .select('id, startup_name, applicant_email, startup_id')
    .eq('organization_id', INCUBATOR_ID)
    .in('startup_name', names);

  console.log(`Verified applications in DB: ${apps?.length}/10`);
  console.table(apps);
}

verify().catch(console.error);
