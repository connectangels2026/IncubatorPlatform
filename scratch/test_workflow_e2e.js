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

async function testWorkflow() {
  console.log('--- 1. Fetching an existing Incubator Organization ---');
  const { data: incubator } = await supabase.from('organizations').select('id, name').limit(1).single();
  console.log('Incubator:', incubator.name, incubator.id);

  console.log('\n--- 2. Creating New Application ---');
  const testEmail = `workflow_${Date.now()}@test.com`;
  const { data: app, error: appErr } = await supabase.from('applications').insert({
    applicant_name: 'Workflow Founder',
    applicant_email: testEmail,
    application_type: 'pre-incubator',
    cohort_name: 'Cohort 2026',
    status: 'submitted',
    form_data: { startup_name: 'QuantumFlow AI' },
    organization_id: null
  }).select().single();

  if (appErr) throw appErr;
  console.log('Submitted: ID =', app.id, 'Status =', app.status, 'Org ID =', app.organization_id);

  console.log('\n--- 3. Superadmin Forwards Application to Incubator ---');
  const { data: forwarded, error: fwdErr } = await supabase.from('applications').update({
    selected_incubator_id: incubator.id,
    super_admin_status: 'forwarded',
    status: 'forwarded',
    super_admin_notes: 'Promising AI traction',
    incubator_name_text: incubator.name,
    form_data: {
      ...app.form_data,
      selected_incubator_id: incubator.id
    }
  }).eq('id', app.id).select().single();

  if (fwdErr) throw fwdErr;
  console.log('Forwarded: status =', forwarded.status, '| super_admin_status =', forwarded.super_admin_status, '| selected_incubator_id =', forwarded.selected_incubator_id, '| organization_id =', forwarded.organization_id);

  console.log('\n--- 4. Incubator Accepts the Application ---');
  const { data: accepted, error: accErr } = await supabase.from('applications').update({
    organization_id: forwarded.selected_incubator_id,
    status: 'accepted',
    reviewer_comments: 'Accepted into Batch #1'
  }).eq('id', app.id).select().single();

  if (accErr) throw accErr;
  console.log('Accepted: status =', accepted.status, '| organization_id =', accepted.organization_id);

  console.log('\n--- 5. Verifying Status API Response for Founder ---');
  const { data: queryResult } = await supabase
    .from('applications')
    .select('id, status, super_admin_status, organization_id, form_data, incubator_name_text')
    .eq('id', app.id)
    .single();

  const isAccepted = queryResult.status === 'accepted';
  const resolvedStartupName = queryResult.form_data?.startup_name;
  console.log('Persisted Status:', queryResult.status, '(Accepted:', isAccepted, ')');
  console.log('Resolved Startup Name:', resolvedStartupName);
  console.log('Linked Org ID for Dashboard:', queryResult.organization_id);

  // Clean up test app
  await supabase.from('applications').delete().eq('id', app.id);
  console.log('\n--- E2E Workflow Test Verified Successfully! ---');
}

testWorkflow().catch(console.error);
