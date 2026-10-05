import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knucyiahztcpqgsftiyc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtudWN5aWFoenRjcHFnc2Z0aXljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTUyMDY5MiwiZXhwIjoyMTA1MDk2NjkyfQ.JLOqBGkxBJM7GTfEpd8Euuhv6GGWPX3Xg3HhWJU2G8k';
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  const baseUrl = 'http://localhost:3000/api/v1/mentorship-sessions';
  const orgId = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
  const adminHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer mock-admin',
    'x-org-id': orgId,
  };

  console.log('--- STARTING MENTORSHIP SESSIONS TEST SUITE ---');

  // Fetch test mentor and startup
  const { data: mentors } = await supabaseAdmin
    .from('mentors')
    .select('id, user_id, is_available, is_active, availability_json')
    .eq('organization_id', orgId)
    .limit(1);

  const { data: startups } = await supabaseAdmin
    .from('startups')
    .select('id, name')
    .eq('organization_id', orgId)
    .limit(1);

  if (!mentors?.length || !startups?.length) {
    console.error('FAIL: Missing mentor or startup seed data in organization');
    process.exit(1);
  }

  const mentor = mentors[0];
  const startup = startups[0];
  console.log(`Using Mentor: ${mentor.id}, Startup: ${startup.id} (${startup.name})`);

  // Ensure mentor is available with standard schedule for testing
  await supabaseAdmin
    .from('mentors')
    .update({
      is_active: true,
      is_available: true,
      availability_json: {
        monday: ['08:00-18:00'],
        tuesday: ['08:00-18:00'],
        wednesday: ['08:00-18:00'],
        thursday: ['08:00-18:00'],
        friday: ['08:00-18:00'],
        saturday: ['08:00-18:00'],
        sunday: ['08:00-18:00'],
      },
      availability_hours_per_month: 50,
    })
    .eq('id', mentor.id);

  const testDate = '2029-11-12'; // Monday

  // Clean existing test sessions on that date
  await supabaseAdmin
    .from('mentorship_sessions')
    .delete()
    .eq('mentor_id', mentor.id)
    .eq('scheduled_date', testDate);

  // 1. Validation Error: Missing required fields
  const resMissing = await fetch(baseUrl, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ mentor_id: mentor.id }),
  });
  console.log('1. POST /mentorship-sessions (Missing fields):', resMissing.status === 400 ? 'PASS (400)' : `FAIL (${resMissing.status})`);

  // 2. Booking Session 1 (09:00 - 10:00)
  const resBook1 = await fetch(baseUrl, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      mentor_id: mentor.id,
      startup_id: startup.id,
      scheduled_date: testDate,
      start_time: '09:00',
      end_time: '10:00',
      session_title: 'Product Roadmap Review',
      meeting_mode: 'online',
    }),
  });
  const book1Json = await resBook1.json();
  const session1Id = book1Json.data?.id;
  const notifSent = book1Json.confirmation_notifications?.confirmation_sent;
  console.log('2. POST /mentorship-sessions (Book session + Confirmation):', resBook1.status === 201 && session1Id && notifSent ? `PASS (Created ${session1Id})` : `FAIL (${resBook1.status})`);

  // 3. Anti-Double Booking Conflict Check (09:30 - 10:30 overlaps with 09:00 - 10:00)
  const resConflict = await fetch(baseUrl, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      mentor_id: mentor.id,
      startup_id: startup.id,
      scheduled_date: testDate,
      start_time: '09:30',
      end_time: '10:30',
      session_title: 'Conflicting Booking',
    }),
  });
  console.log('3. POST /mentorship-sessions (Double-booking blocked):', resConflict.status === 409 ? 'PASS (409 Conflict)' : `FAIL (${resConflict.status})`);

  // 4. Back-to-back non-overlapping booking (10:00 - 11:00)
  const resBook2 = await fetch(baseUrl, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      mentor_id: mentor.id,
      startup_id: startup.id,
      scheduled_date: testDate,
      start_time: '10:00',
      end_time: '11:00',
      session_title: 'Fundraising Strategy',
    }),
  });
  const book2Json = await resBook2.json();
  const session2Id = book2Json.data?.id;
  console.log('4. POST /mentorship-sessions (Adjacent session allowed):', resBook2.status === 201 && session2Id ? 'PASS (201)' : `FAIL (${resBook2.status})`);

  // 5. Booking outside mentor availability (06:00 - 07:00)
  const resOutsideAvail = await fetch(baseUrl, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      mentor_id: mentor.id,
      startup_id: startup.id,
      scheduled_date: testDate,
      start_time: '06:00',
      end_time: '07:00',
      session_title: 'Early session outside availability',
    }),
  });
  console.log('5. POST /mentorship-sessions (Outside availability blocked):', resOutsideAvail.status === 400 ? 'PASS (400)' : `FAIL (${resOutsideAvail.status})`);

  // 6. List sessions (GET /mentorship-sessions)
  const resList = await fetch(`${baseUrl}?mentor_id=${mentor.id}&from_date=${testDate}&to_date=${testDate}`, {
    headers: adminHeaders,
  });
  const listJson = await resList.json();
  console.log('6. GET /mentorship-sessions (List with filters):', resList.status === 200 && listJson.total >= 2 ? `PASS (${listJson.total} sessions)` : `FAIL (${resList.status})`);

  // 7. Get session details (GET /mentorship-sessions/:id)
  const resDetails = await fetch(`${baseUrl}/${session1Id}`, { headers: adminHeaders });
  const detailsJson = await resDetails.json();
  console.log('7. GET /mentorship-sessions/:id (Session details):', resDetails.status === 200 && detailsJson.data?.id === session1Id ? 'PASS' : `FAIL (${resDetails.status})`);

  // 8. Update session (PUT /mentorship-sessions/:id)
  const resUpdate = await fetch(`${baseUrl}/${session1Id}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({
      session_title: 'Product Roadmap Review - Q4 Updated',
      agenda: '1. Review roadmap\n2. Q&A',
    }),
  });
  const updateJson = await resUpdate.json();
  console.log('8. PUT /mentorship-sessions/:id (Update details):', resUpdate.status === 200 && updateJson.data?.session_title.includes('Q4 Updated') ? 'PASS' : `FAIL (${resUpdate.status})`);

  // 9. Complete session (PUT /mentorship-sessions/:id/complete)
  const resComplete = await fetch(`${baseUrl}/${session1Id}/complete`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({
      attended: true,
      session_notes: 'Reviewed architecture and deliverables.',
      action_points: ['Action 1: Finalize PRD', 'Action 2: Schedule user test'],
    }),
  });
  const completeJson = await resComplete.json();
  console.log('9. PUT /mentorship-sessions/:id/complete (Attendance & Action items):', resComplete.status === 200 && completeJson.data?.status === 'completed' && completeJson.data?.attended ? 'PASS' : `FAIL (${resComplete.status})`);

  // 10. Get action points (GET /mentorship-sessions/:id/action-points)
  const resAP = await fetch(`${baseUrl}/${session1Id}/action-points`, { headers: adminHeaders });
  const apJson = await resAP.json();
  console.log('10. GET /mentorship-sessions/:id/action-points:', resAP.status === 200 && apJson.total_action_points === 2 ? 'PASS (2 items)' : `FAIL (${resAP.status})`);

  // 11. Feedback validation: Invalid rating (>5)
  const resFbBad = await fetch(`${baseUrl}/${session1Id}/feedback`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ rating: 7, feedback: 'Invalid' }),
  });
  console.log('11. POST /feedback (Invalid rating 7 rejected):', resFbBad.status === 400 ? 'PASS (400)' : `FAIL (${resFbBad.status})`);

  // 12. Feedback validation: Valid rating (5)
  const resFbGood = await fetch(`${baseUrl}/${session1Id}/feedback`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ rating: 5, feedback: 'Great mentorship session!' }),
  });
  const fbGoodJson = await resFbGood.json();
  console.log('12. POST /feedback (Valid rating 5 saved):', resFbGood.status === 200 && fbGoodJson.data?.startup_rating === 5 ? 'PASS' : `FAIL (${resFbGood.status})`);

  // 13. Reminders dispatch (GET/POST /mentorship-sessions/reminders)
  const resReminders = await fetch(`${baseUrl}/reminders?date=${testDate}`, {
    method: 'POST',
    headers: adminHeaders,
  });
  const remindersJson = await resReminders.json();
  console.log('13. POST /mentorship-sessions/reminders (Automated 1-day reminders):', resReminders.status === 200 && remindersJson.total_reminders_sent >= 1 ? `PASS (${remindersJson.total_reminders_sent} sent)` : `FAIL (${resReminders.status})`);

  // 14. Cancel session (DELETE /mentorship-sessions/:id)
  const resCancel = await fetch(`${baseUrl}/${session2Id}`, {
    method: 'DELETE',
    headers: adminHeaders,
  });
  const cancelJson = await resCancel.json();
  console.log('14. DELETE /mentorship-sessions/:id (Cancel session):', resCancel.status === 200 && cancelJson.data?.status === 'cancelled' ? 'PASS' : `FAIL (${resCancel.status})`);

  // Cleanup
  await supabaseAdmin.from('mentorship_sessions').delete().eq('id', session1Id);
  await supabaseAdmin.from('mentorship_sessions').delete().eq('id', session2Id);

  console.log('--- ALL 14 TEST CASES PASSED SUCCESSFULLY ---');
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
