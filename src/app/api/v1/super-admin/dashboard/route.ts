import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    status: 'success',
    timestamp: new Date().toISOString(),
    kpis: {
      totalRevenue: {
        amount: 2998,
        currency: 'USD',
        period: 'this month',
        percentageChange: '+14.2%',
        trend: 'up',
      },
      activeOrganizations: {
        count: 5,
        status: 'Active pulse',
      },
      blockedOrganizations: {
        count: 1,
        status: 'Action Needed',
      },
      overduePayments: {
        count: 2,
        status: '2 Invoices Pending',
      },
      newSignups: {
        count: 3,
        period: 'this month',
      },
    },
    revenueTrend: [
      { month: 'Jan', amount: 950 },
      { month: 'Feb', amount: 1400 },
      { month: 'Mar', amount: 1300 },
      { month: 'Apr', amount: 1800 },
      { month: 'May', amount: 2150 },
      { month: 'Jun', amount: 1750 },
      { month: 'Jul', amount: 2300 },
      { month: 'Aug', amount: 2600 },
      { month: 'Sep', amount: 2998 },
      { month: 'Oct', amount: 2400 },
      { month: 'Nov', amount: 3100 },
      { month: 'Dec', amount: 3300 },
    ],
    ratio: {
      paid: { percentage: 60, count: 3 },
      free: { percentage: 40, count: 2 },
    },
    quickActions: [
      { id: 'pending-payments', label: 'View Pending Payments', badge: '2 overdue', badgeType: 'danger' },
      { id: 'payment-reminders', label: 'Send Payment Reminders', badge: 'Batch Email', badgeType: 'neutral' },
      { id: 'manage-pricing', label: 'Manage Pricing Tiers', badge: null, badgeType: 'action' },
    ],
    activityFeed: [
      {
        id: 1,
        text: 'Acme Ventures upgraded to Pro Tier ($499/mo)',
        badge: 'Emerald',
        type: 'success',
      },
      {
        id: 2,
        text: 'Alpha Tech suspended due to overdue invoice #1084',
        badge: 'Overdue',
        type: 'danger',
      },
      {
        id: 3,
        text: 'Beta Hub registered as a new organization',
        badge: 'New Org',
        type: 'info',
      },
    ],
  };

  return NextResponse.json(data);
}
