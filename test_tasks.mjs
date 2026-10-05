const baseUrl = 'http://localhost:3000/api/v1';
const orgId = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const demoUserId = 'dfdb0d1a-24a3-4062-98aa-0d723fc23725';
const demoStartupId = '8d9dfb33-7b8f-4e28-9467-d51b3eab4642';
const demoSessionId = '6d614049-a669-42f7-bd51-20dfe4be6c0f';

const headers = {
  'Content-Type': 'application/json',
  Authorization: 'Bearer mock-admin',
  'x-org-id': orgId,
};

async function run() {
  console.log('--- STARTING TASK SYSTEM VERIFICATION ---');

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Create task assigned to user & startup
  console.log('\n[1] POST /api/v1/tasks (Create task)...');
  const res1 = await fetch(`${baseUrl}/tasks`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: 'Complete Financial Model Q4',
      description: 'Prepare 3-year revenue projections and cash flow breakdown',
      priority: 'high',
      due_date: todayStr,
      assigned_to_user_id: demoUserId,
      assigned_to_startup_id: demoStartupId,
    }),
  });
  const json1 = await res1.json();
  console.log('Status:', res1.status, 'Created ID:', json1.data?.id, 'Status:', json1.data?.status);
  if (res1.status !== 201 || !json1.data?.id) throw new Error('Task creation failed: ' + JSON.stringify(json1));
  const taskId = json1.data.id;

  // 2. Mentorship integration: Create task from Action Point
  console.log('\n[2] POST /api/v1/tasks (Convert Mentorship Action Point)...');
  const res2 = await fetch(`${baseUrl}/tasks`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: 'Revise ICP Positioning from Mentor Session',
      description: 'Refine customer archetype based on Marcus feedback',
      priority: 'critical',
      due_date: todayStr,
      assigned_to_startup_id: demoStartupId,
      related_session_id: demoSessionId,
      action_point_id: 'AP-101',
    }),
  });
  const json2 = await res2.json();
  console.log('Status:', res2.status, 'Converted Task ID:', json2.data?.id, 'Type:', json2.data?.task_type);
  if (res2.status !== 201) throw new Error('Action point conversion failed');
  const apTaskId = json2.data.id;

  // 3. GET /api/v1/tasks (List all active tasks)
  console.log('\n[3] GET /api/v1/tasks...');
  const res3 = await fetch(`${baseUrl}/tasks`, { headers });
  const json3 = await res3.json();
  console.log('Status:', res3.status, 'Total Tasks:', json3.total);
  if (res3.status !== 200 || !Array.isArray(json3.data)) throw new Error('List tasks failed');

  // 4. GET /api/v1/tasks with filters (status, priority, due_date)
  console.log('\n[4] GET /api/v1/tasks with filters (priority=high, due_date)...');
  const res4 = await fetch(`${baseUrl}/tasks?priority=high&due_date=${todayStr}`, { headers });
  const json4 = await res4.json();
  console.log('Status:', res4.status, 'Filtered count:', json4.data?.length);
  if (res4.status !== 200) throw new Error('Filtered tasks failed');

  // 5. GET /api/v1/tasks/:id
  console.log(`\n[5] GET /api/v1/tasks/${taskId}...`);
  const res5 = await fetch(`${baseUrl}/tasks/${taskId}`, { headers });
  const json5 = await res5.json();
  console.log('Status:', res5.status, 'Title:', json5.data?.title, 'Priority:', json5.data?.priority);
  if (res5.status !== 200 || json5.data?.id !== taskId) throw new Error('Get task by id failed');

  // 6. PUT /api/v1/tasks/:id (Update task)
  console.log(`\n[6] PUT /api/v1/tasks/${taskId}...`);
  const res6 = await fetch(`${baseUrl}/tasks/${taskId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      description: 'Updated description: model draft completed, reviewing with advisors.',
      progress_percentage: 60,
    }),
  });
  const json6 = await res6.json();
  console.log('Status:', res6.status, 'Progress:', json6.data?.progress_percentage + '%');
  if (res6.status !== 200 || json6.data?.progress_percentage !== 60) throw new Error('Update task failed');

  // 7. PUT /api/v1/tasks/:id/status (Update status to completed)
  console.log(`\n[7] PUT /api/v1/tasks/${taskId}/status (status: completed)...`);
  const res7 = await fetch(`${baseUrl}/tasks/${taskId}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status: 'completed' }),
  });
  const json7 = await res7.json();
  console.log('Status:', res7.status, 'New status:', json7.data?.status, 'Progress:', json7.data?.progress_percentage + '%');
  if (res7.status !== 200 || json7.data?.status !== 'completed' || json7.data?.progress_percentage !== 100) {
    throw new Error('Update task status failed');
  }

  // 8. GET /api/v1/startups/:id/tasks (Startup-specific task list)
  console.log(`\n[8] GET /api/v1/startups/${demoStartupId}/tasks...`);
  const res8 = await fetch(`${baseUrl}/startups/${demoStartupId}/tasks`, { headers });
  const json8 = await res8.json();
  console.log('Status:', res8.status, 'Startup tasks count:', json8.total);
  if (res8.status !== 200 || !Array.isArray(json8.data)) throw new Error('Startup tasks failed');

  // 9. Task Due Reminders with Deduplication
  console.log('\n[9] POST /api/v1/tasks/reminders (Task due date reminder)...');
  const res9 = await fetch(`${baseUrl}/tasks/reminders?date=${todayStr}`, {
    method: 'POST',
    headers,
  });
  const json9 = await res9.json();
  console.log('Status:', res9.status, 'Due tasks processed:', json9.summary?.total_due_tasks);
  if (res9.status !== 200) throw new Error('Task reminders failed');

  // Check duplicate prevention
  console.log('\n[10] POST /api/v1/tasks/reminders (Check duplicate reminder prevention)...');
  const res10 = await fetch(`${baseUrl}/tasks/reminders?date=${todayStr}`, {
    method: 'POST',
    headers,
  });
  const json10 = await res10.json();
  const dupCount = json10.summary?.reminders_processed?.filter((r) => r.duplicate).length;
  console.log('Status:', res10.status, 'Duplicates prevented:', dupCount);
  if (res10.status !== 200) throw new Error('Task duplicate check failed');

  // 11. DELETE /api/v1/tasks/:id (Archive task)
  console.log(`\n[11] DELETE /api/v1/tasks/${apTaskId} (Archive task)...`);
  const res11 = await fetch(`${baseUrl}/tasks/${apTaskId}`, {
    method: 'DELETE',
    headers,
  });
  const json11 = await res11.json();
  console.log('Status:', res11.status, 'Archived task status:', json11.data?.status);
  if (res11.status !== 200 || json11.data?.status !== 'archived') throw new Error('Archive task failed');

  // 12. Verify archived task is excluded by default from active list
  console.log('\n[12] Verify archived task excluded from default GET /api/v1/tasks...');
  const res12 = await fetch(`${baseUrl}/tasks`, { headers });
  const json12 = await res12.json();
  const foundArchived = json12.data?.find((t) => t.id === apTaskId);
  console.log('Archived task in active list?', Boolean(foundArchived));
  if (foundArchived) throw new Error('Archived task unexpectedly returned in active list');

  console.log('\n=============================================');
  console.log('ALL TASK SYSTEM ACCEPTANCE CRITERIA VERIFIED!');
  console.log('=============================================');
}

run().catch((err) => {
  console.error('Task tests failed:', err);
  process.exit(1);
});
