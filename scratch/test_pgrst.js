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

async function testUpdate() {
  const { data: latestApp } = await supabase.from('applications').select('id, form_data').order('created_at', { ascending: false }).limit(1).single();
  if (!latestApp) return;

  const body = {
    selected_id: '5069eb23-9cc7-4e21-818b-c62727b63769',
    selected_incubator_id: '5069eb23-9cc7-4e21-818b-c62727b63769',
    super_admin_status: 'forwarded'
  };

  const updatePayload = {
    updated_at: new Date().toISOString(),
    ...body
  };
  const selectedIncId = body.selected_incubator_id || body.selected_id;
  delete updatePayload.selected_id;
  delete updatePayload.selected_incubator_id;
  updatePayload.form_data = {
    ...(latestApp.form_data || {}),
    selected_incubator_id: selectedIncId,
    selected_id: selectedIncId
  };

  const { data, error } = await supabase.from('applications').update(updatePayload).eq('id', latestApp.id).select().single();
  if (error) {
    console.error('Update Error:', error);
  } else {
    console.log('Update Successful! No PGRST204 error. Form data:', data.form_data.selected_incubator_id);
  }
}

testUpdate().catch(console.error);
