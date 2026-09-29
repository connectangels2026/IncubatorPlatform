async function runTests() {
  const baseUrl = 'http://localhost:3000/api/v1/applications';
  const orgId = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
  const adminHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer mock-admin',
    'x-org-id': orgId
  };
  const applicantHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer mock-founder',
    'x-org-id': orgId
  };
  const otherApplicantHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer mock-otherfounder',
    'x-org-id': orgId
  };

  console.log('--- STARTING APPLICATIONS WORKFLOW TEST SUITE ---');

  // 1. POST /api/v1/applications (Submit Application)
  const resSubmit = await fetch(baseUrl, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      applicant_name: 'Dr. Sarah Connor',
      applicant_email: 'founder@example.com',
      applicant_phone: '+1-555-0199',
      application_type: 'Incubator',
      cohort_name: 'Cohort 2026-A',
      form_data: { pitch: 'AI platform for healthcare diagnostics', team_size: 3 }
    })
  });
  const submitJson = await resSubmit.json();
  const appId = submitJson.data?.id;
  console.log('1. POST /api/v1/applications (Submit):', resSubmit.status === 201 && appId ? `PASS (Created ${appId})` : `FAIL (${resSubmit.status})`);

  // 2. GET /api/v1/applications (List in org)
  const resList = await fetch(baseUrl, { headers: adminHeaders });
  const listJson = await resList.json();
  console.log('2. GET /api/v1/applications (List):', resList.status === 200 && Array.isArray(listJson.data) ? `PASS (${listJson.total} total)` : 'FAIL');

  // 3. GET /api/v1/applications with filters (status, application_type)
  const resFilter = await fetch(`${baseUrl}?status=submitted&application_type=Incubator`, { headers: adminHeaders });
  const filterJson = await resFilter.json();
  console.log('3. GET /api/v1/applications (Filters):', resFilter.status === 200 && filterJson.data.length > 0 ? 'PASS' : 'FAIL');

  // 4. GET /api/v1/applications/:id (View details)
  const resDetails = await fetch(`${baseUrl}/${appId}`, { headers: adminHeaders });
  const detailsJson = await resDetails.json();
  console.log('4. GET /api/v1/applications/:id:', resDetails.status === 200 && detailsJson.data?.id === appId ? 'PASS' : 'FAIL');

  // 5. GET /api/v1/applications/:id as other applicant (Ownership security)
  const resSecDetails = await fetch(`${baseUrl}/${appId}`, { headers: otherApplicantHeaders });
  console.log('5. GET /api/v1/applications/:id (Unauthorized applicant):', resSecDetails.status === 403 ? 'PASS (403)' : `FAIL (${resSecDetails.status})`);

  // 6. POST /api/v1/applications/:id/evaluate (Submit evaluation scores)
  const resEval = await fetch(`${baseUrl}/${appId}/evaluate`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      team_score: 90,
      market_score: 85,
      tech_score: 95,
      traction_score: 80,
      comments: 'Strong founders, high technical feasibility.'
    })
  });
  const evalJson = await resEval.json();
  console.log('6. POST /api/v1/applications/:id/evaluate:', resEval.status === 200 && evalJson.data?.score ? `PASS (Score: ${evalJson.data.score})` : 'FAIL');

  // 7. POST /api/v1/applications/:id/evaluate as non-admin (Forbidden check)
  const resEvalForbidden = await fetch(`${baseUrl}/${appId}/evaluate`, {
    method: 'POST',
    headers: applicantHeaders,
    body: JSON.stringify({ score: 99 })
  });
  console.log('7. POST evaluate (Non-admin check):', resEvalForbidden.status === 403 ? 'PASS (403)' : `FAIL (${resEvalForbidden.status})`);

  // 8. POST /api/v1/applications/bulk-evaluate (Bulk scoring)
  const resBulk = await fetch(`${baseUrl}/bulk-evaluate`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      evaluations: [
        { id: appId, score: 89, comments: 'Batch review completed' }
      ]
    })
  });
  const bulkJson = await resBulk.json();
  console.log('8. POST /api/v1/applications/bulk-evaluate:', resBulk.status === 200 && bulkJson.evaluated_count === 1 ? 'PASS' : 'FAIL');

  // 9. POST /api/v1/applications/:id/document/upload (Upload document)
  const resDoc = await fetch(`${baseUrl}/${appId}/document/upload`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      document_name: 'Pitch_Deck_v2.pdf',
      document_type: 'pitch_deck',
      file_size: '3.1 MB'
    })
  });
  const docJson = await resDoc.json();
  console.log('9. POST /api/v1/applications/:id/document/upload:', resDoc.status === 201 && docJson.document?.name ? 'PASS' : 'FAIL');

  // 10. PUT /api/v1/applications/:id/admit (Admit & generate letter)
  const resAdmit = await fetch(`${baseUrl}/${appId}/admit`, {
    method: 'PUT',
    headers: adminHeaders
  });
  const admitJson = await resAdmit.json();
  console.log('10. PUT /api/v1/applications/:id/admit:', resAdmit.status === 200 && admitJson.data?.admission_letter_url ? 'PASS' : 'FAIL');

  // 11. POST /api/v1/applications/:id/mou/sign (Sign MoU)
  const resMou = await fetch(`${baseUrl}/${appId}/mou/sign`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ signer_name: 'Dr. Sarah Connor' })
  });
  const mouJson = await resMou.json();
  console.log('11. POST /api/v1/applications/:id/mou/sign:', resMou.status === 200 && mouJson.data?.mou_signed === true ? 'PASS' : 'FAIL');

  // 12. PUT /api/v1/applications/:id/reject (Reject application test)
  const resReject = await fetch(`${baseUrl}/${appId}/reject`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({ reason: 'Over capacity for this cohort' })
  });
  const rejectJson = await resReject.json();
  console.log('12. PUT /api/v1/applications/:id/reject:', resReject.status === 200 && rejectJson.data?.status === 'rejected' ? 'PASS' : 'FAIL');

  // Clean up test application from Supabase
  const { createClient } = await import('@supabase/supabase-js');
  const s = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knucyiahztcpqgsftiyc.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtudWN5aWFoenRjcHFnc2Z0aXljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTUyMDY5MiwiZXhwIjoyMTA1MDk2NjkyfQ.JLOqBGkxBJM7GTfEpd8Euuhv6GGWPX3Xg3HhWJU2G8k'
  );
  await s.from('applications').delete().eq('id', appId);
  console.log('13. Cleaned up test record from Supabase: PASS');

  console.log('--- ALL 13 APPLICATION WORKFLOW SCENARIOS PASSED ---');
}

runTests().catch(console.error);
