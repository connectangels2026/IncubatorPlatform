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

async function testForward() {
  const { data: latestApp } = await supabase.from('applications').select('id, applicant_name').order('created_at', { ascending: false }).limit(1).single();
  if (!latestApp) return;

  const testOrgId = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';

  // Simulate what PUT /api/v1/applications/[id] does when superadmin forwards
  const body = {
    selected_id: testOrgId,
    selected_incubator_id: testOrgId,
    status: 'forwarded',
    super_admin_status: 'forwarded',
    super_admin_notes: 'Forwarded by Super Admin'
  };

  const updatePayload = {
    updated_at: new Date().toISOString(),
    ...body
  };

  const selectedIncId = body.selected_incubator_id || body.selected_id;
  delete updatePayload.selected_id;
  if (selectedIncId) {
    updatePayload.selected_incubator_id = selectedIncId;
  }

  const { data: updated, error } = await supabase
    .from('applications')
    .update(updatePayload)
    .eq('id', latestApp.id)
    .select('id, applicant_name, selected_incubator_id, super_admin_status, organization_id')
    .single();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('SUCCESS! Updated application in Supabase:');
    console.log('Application ID:', updated.id);
    console.log('selected_incubator_id column value:', updated.selected_incubator_id);
    console.log('super_admin_status:', updated.super_admin_status);
    console.log('organization_id (stays null until incubator accepts):', updated.organization_id);
  }
}

testForward().catch(console.error);
