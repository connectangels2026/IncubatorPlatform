import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalStartups: 128,
          totalStartupsGrowth: '+12%',
          applicationsReceived: 42,
          applicationsGrowth: '+8%',
          pendingEvaluation: 18,
          activeStartups: 38,
          admittedStartups: 24,
          graduatedStartups: 66,
          fundingRaised: '$14.2M',
          fundingGrowth: '+$2.1M',
          jobsCreated: '850+',
          jobsGrowth: '+45 this mo'
        },
        applications: [
          { id: 'APP-1042', name: 'NexHealth AI', sector: 'Biotech', type: 'Incubator', score: 88, status: 'submitted', date: 'Sep 24, 2026', email: 'sarah@nexhealth.ai' },
          { id: 'APP-1041', name: 'PayFlow Finance', sector: 'Fintech', type: 'Pre-Incubator', score: 64, status: 'under_review', date: 'Sep 23, 2026', email: 'alex@payflow.co' },
          { id: 'APP-1040', name: 'NeuroMed Tech', sector: 'HealthTech', type: 'Incubator', score: 92, status: 'admitted', date: 'Sep 21, 2026', email: 'emily@neuromed.io' },
          { id: 'APP-1039', name: 'UrbanFarms', sector: 'AgriTech', type: 'Pre-Incubator', score: 45, status: 'rejected', date: 'Sep 19, 2026', email: 'dan@urbanfarms.org' },
          { id: 'APP-1038', name: 'CloudScale OS', sector: 'SaaS', type: 'Incubator', score: 79, status: 'under_review', date: 'Sep 18, 2026', email: 'team@cloudscale.io' }
        ],
        pendingDecisions: [
          { id: 'APP-1041', name: 'PayFlow Finance', score: 64, type: 'Pre-Incubator', recommendation: 'Borderline - Requires interview' },
          { id: 'APP-1038', name: 'CloudScale OS', score: 79, type: 'Incubator', recommendation: 'Recommended for Admission' },
          { id: 'APP-1042', name: 'NexHealth AI', score: 88, type: 'Incubator', recommendation: 'High Priority Admission' }
        ],
        mentorshipSessions: [
          { mentor: 'Dr. Marcus Vance', role: 'Fintech Specialist', startup: 'PayFlow Finance', time: 'Today, 3:00 PM', link: 'https://meet.google.com' },
          { mentor: 'Elena Rostova', role: 'AI Advisor', startup: 'NexHealth AI', time: 'Tomorrow, 10:00 AM', link: 'https://meet.google.com' },
          { mentor: 'David Chen', role: 'Venture Partner', startup: 'NeuroMed Tech', time: 'Sep 28, 2:30 PM', link: 'https://meet.google.com' }
        ]
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch dashboard reports' },
      { status: 500 }
    );
  }
}
