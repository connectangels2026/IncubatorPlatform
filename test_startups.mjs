async function runTests() {
  const baseUrl = 'http://localhost:3000/api/v1/startups';
  const orgId = 'org_test_123';
  const adminHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer mock-admin',
    'x-org-id': orgId
  };
  const founderHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer mock-founder',
    'x-org-id': orgId
  };
  const userHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer mock-viewer',
    'x-org-id': orgId
  };

  console.log('--- STARTING STARTUPS ENDPOINTS TEST SUITE ---');

  // 1. POST /api/v1/startups - unauthorized role
  const resForbidden = await fetch(baseUrl, {
    method: 'POST',
    headers: userHeaders,
    body: JSON.stringify({ name: 'HackStartup', founder_name: 'Hacker' })
  });
  console.log('1. POST (Non-admin/founder):', resForbidden.status === 403 ? 'PASS (403)' : `FAIL (${resForbidden.status})`);

  // 2. POST /api/v1/startups - admin creates startup
  const resCreate = await fetch(baseUrl, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      name: 'QuantumAI Labs',
      founder_name: 'Dr. Sarah Connor',
      email: 'founder@example.com',
      sector: 'AI & DeepTech',
      stage: 'Seed',
      status: 'active',
      revenue: 75000
    })
  });
  const createdJson = await resCreate.json();
  const createdId = createdJson.data?.id;
  console.log('2. POST /api/v1/startups (Admin):', resCreate.status === 201 && createdId ? `PASS (Created ${createdId})` : `FAIL (${resCreate.status})`);

  // 3. GET /api/v1/startups - list with org isolation
  const resList = await fetch(`${baseUrl}?limit=10&offset=0`, { headers: adminHeaders });
  const listJson = await resList.json();
  console.log('3. GET /api/v1/startups (List):', resList.status === 200 && Array.isArray(listJson.data) ? `PASS (${listJson.total} total)` : 'FAIL');

  // 4. Filtering, Sorting, Search, Pagination
  const resSearch = await fetch(`${baseUrl}?search=Quantum&sort=revenue&order=desc`, { headers: adminHeaders });
  const searchJson = await resSearch.json();
  const foundSearch = searchJson.data?.some(s => s.name.includes('QuantumAI'));
  console.log('4. Filtering/Search/Sort:', resSearch.status === 200 && foundSearch ? 'PASS' : 'FAIL');

  // 5. GET /api/v1/startups/:id
  const resGetOne = await fetch(`${baseUrl}/${createdId}`, { headers: adminHeaders });
  const oneJson = await resGetOne.json();
  console.log('5. GET /api/v1/startups/:id:', resGetOne.status === 200 && oneJson.data?.name === 'QuantumAI Labs' ? 'PASS' : 'FAIL');

  // 6. PUT /api/v1/startups/:id - Founder ownership check
  const resPutOtherFounder = await fetch(`${baseUrl}/${createdId}`, {
    method: 'PUT',
    headers: { ...founderHeaders, 'Authorization': 'Bearer mock-otherfounder' },
    body: JSON.stringify({ name: 'Hacked Name' })
  });
  console.log('6. PUT /api/v1/startups/:id (Unowned Founder):', resPutOtherFounder.status === 403 ? 'PASS (403)' : `FAIL (${resPutOtherFounder.status})`);

  // 7. PUT /api/v1/startups/:id - Admin update
  const resUpdate = await fetch(`${baseUrl}/${createdId}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({ revenue: 150000 })
  });
  const updateJson = await resUpdate.json();
  console.log('7. PUT /api/v1/startups/:id (Admin Update):', resUpdate.status === 200 && updateJson.data?.revenue === 150000 ? 'PASS' : 'FAIL');

  // 8. POST /api/v1/startups/:id/team
  const resAddTeam = await fetch(`${baseUrl}/${createdId}/team`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ name: 'Alice Cooper', role: 'Head of AI', email: 'alice@quantum.ai' })
  });
  const teamMemberJson = await resAddTeam.json();
  const memberId = teamMemberJson.data?.id;
  console.log('8. POST /api/v1/startups/:id/team:', resAddTeam.status === 201 && memberId ? `PASS (Member ${memberId})` : 'FAIL');

  // 9. GET /api/v1/startups/:id/team
  const resGetTeam = await fetch(`${baseUrl}/${createdId}/team`, { headers: adminHeaders });
  const teamList = await resGetTeam.json();
  console.log('9. GET /api/v1/startups/:id/team:', resGetTeam.status === 200 && teamList.data?.length > 0 ? 'PASS' : 'FAIL');

  // 10. PUT /api/v1/startups/:id/team/:memberId
  const resUpdateTeam = await fetch(`${baseUrl}/${createdId}/team/${memberId}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({ role: 'Chief Technology Officer' })
  });
  const updatedMember = await resUpdateTeam.json();
  console.log('10. PUT /api/v1/startups/:id/team/:memberId:', resUpdateTeam.status === 200 && updatedMember.data?.role === 'Chief Technology Officer' ? 'PASS' : 'FAIL');

  // 11. DELETE /api/v1/startups/:id/team/:memberId
  const resDelTeam = await fetch(`${baseUrl}/${createdId}/team/${memberId}`, {
    method: 'DELETE',
    headers: adminHeaders
  });
  console.log('11. DELETE /api/v1/startups/:id/team/:memberId:', resDelTeam.status === 200 ? 'PASS' : 'FAIL');

  // 12. DELETE /api/v1/startups/:id (Soft Delete)
  const resSoftDel = await fetch(`${baseUrl}/${createdId}`, {
    method: 'DELETE',
    headers: adminHeaders
  });
  console.log('12. DELETE /api/v1/startups/:id (Soft delete):', resSoftDel.status === 200 ? 'PASS' : 'FAIL');

  // 13. Verify soft-deleted startup returns 404
  const resCheckDeleted = await fetch(`${baseUrl}/${createdId}`, { headers: adminHeaders });
  console.log('13. GET after soft-delete:', resCheckDeleted.status === 404 ? 'PASS (404 Not Found)' : 'FAIL');

  console.log('--- ALL TEST SCENARIOS COMPLETED ---');
}

runTests().catch(console.error);
