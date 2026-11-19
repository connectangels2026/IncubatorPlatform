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

async function countApps() {
  const { count, error } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .or(`organization_id.eq.${INCUBATOR_ID},selected_incubator_id.eq.${INCUBATOR_ID}`);

  console.log(`Applications count for incubator ${INCUBATOR_ID}:`, count, error);

  const { count: pendingCount } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .or(`organization_id.eq.${INCUBATOR_ID},selected_incubator_id.eq.${INCUBATOR_ID}`)
    .in('status', ['submitted', 'under_review', 'pending']);

  console.log(`Pending/submitted applications count:`, pendingCount);
}

countApps().catch(console.error);
