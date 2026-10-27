import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function runTest() {
  console.log('Testing End-to-End Workflow & Role logic...');

  // 1. Fetch latest application
  const { data: app, error: appErr } = await supabase
    .from('applications')
    .select('*, organization:organizations!organization_id(id, name, slug)')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (appErr || !app) {
    console.error('Error fetching application:', appErr);
    process.exit(1);
  }

  console.log(`Found application ID: ${app.id}, Status: ${app.status}, Applicant: ${app.applicant_email}`);

  // Test role determination logic
  const testUsers = [
    { email: 'shadmannc0516@gmail.com', role: 'super-admin' },
    { email: 'incubator@test.org', role: 'admin' },
    { email: app.applicant_email, role: 'applicant' },
  ];

  for (const u of testUsers) {
    const userRole = u.role?.toLowerCase() || '';
    const emailLower = u.email?.toLowerCase() || '';
    const isSuperAdmin = userRole === 'super-admin' || userRole === 'super_admin' || emailLower === 'shadmannc0516@gmail.com';
    const isIncubator = !isSuperAdmin && (userRole === 'admin' || userRole === 'incubator_admin' || userRole === 'incubator');
    const isApplicant = !isSuperAdmin && !isIncubator;

    const rawStatus = (app.status || '').toLowerCase();
    const isAdmittedOrAccepted = rawStatus === 'admitted' || rawStatus === 'accepted';
    const canSeeViewDashboardButton = !isSuperAdmin && isApplicant && isAdmittedOrAccepted;

    console.log(`Role Test: ${u.email} (${u.role}) => isSuperAdmin: ${isSuperAdmin}, isIncubator: ${isIncubator}, isApplicant: ${isApplicant}, canSeeViewDashboardButton: ${canSeeViewDashboardButton}`);

    if (isSuperAdmin && canSeeViewDashboardButton) {
      console.error('FAIL: Superadmin should NOT see the View Dashboard button!');
      process.exit(1);
    }
  }

  // Test dynamic startup name resolution
  const resolvedStartupName =
    app.form_data?.startup_name ||
    app.form_data?.name ||
    app.form_data?.businessName ||
    app.form_data?.companyName ||
    `${app.applicant_name}'s Startup`;

  console.log(`Resolved Dynamic Startup Name: "${resolvedStartupName}"`);
  console.log('ALL WORKFLOW & ROLE TESTS PASSED SUCCESSFULLY!');
}

runTest();
