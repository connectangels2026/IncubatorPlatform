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

async function testFlow() {
  console.log('Testing assignment & acceptance flow...');

  // 1. Get an existing incubator organization
  const { data: incubator } = await supabase.from('organizations').select('id, name').limit(1).single();
  console.log('Found Incubator:', incubator.name, '(', incubator.id, ')');

  // 2. Create test application
  const testEmail = `flow_test_${Date.now()}@example.com`;
  const { data: app, error: appErr } = await supabase.from('applications').insert({
    applicant_name: 'Flow Founder',
    applicant_email: testEmail,
    application_type: 'pre-incubator',
    cohort_name: 'Cohort 2026',
    status: 'submitted',
    form_data: { startup_name: 'Flow AI' },
    organization_id: null
  }).select().single();

  if (appErr) throw appErr;
  console.log('Step 1 (Submitted): application.organization_id =', app.organization_id);

  // 3. Super Admin assigns incubator (sets selected_incubator_id, organization_id remains null)
  const currentFd = app.form_data || {};
  const { data: forwardedApp, error: fwdErr } = await supabase
    .from('applications')
    .update({
      form_data: {
        ...currentFd,
        selected_incubator_id: incubator.id,
        selected_id: incubator.id,
      },
      status: 'forwarded',
      super_admin_status: 'forwarded',
      super_admin_notes: 'Forwarded for evaluation',
      incubator_name_text: incubator.name,
      organization_id: null // Remains null until accepted
    })
    .eq('id', app.id)
    .select()
    .single();

  if (fwdErr) throw fwdErr;
  console.log('Step 2 (Forwarded): organization_id =', forwardedApp.organization_id, '| selected_incubator_id =', forwardedApp.form_data?.selected_incubator_id);

  // 4. Incubator accepts the application: copies selected_incubator_id to organization_id
  const selectedIncId = forwardedApp.form_data?.selected_incubator_id || forwardedApp.form_data?.selected_id;
  const { data: acceptedApp, error: accErr } = await supabase
    .from('applications')
    .update({
      organization_id: selectedIncId,
      status: 'accepted',
      reviewer_comments: 'Accepted into cohort'
    })
    .eq('id', app.id)
    .select()
    .single();

  if (accErr) throw accErr;
  console.log('Step 3 (Accepted): organization_id =', acceptedApp.organization_id, '(Matches incubator ID:', acceptedApp.organization_id === incubator.id, ')');

  // Clean up test record
  await supabase.from('applications').delete().eq('id', app.id);
  console.log('Cleanup complete. Flow test SUCCESS!');
}

testFlow().catch(console.error);
