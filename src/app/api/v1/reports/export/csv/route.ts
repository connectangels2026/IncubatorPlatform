import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);

// Helper to escape values for CSV / Excel
function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) return '';
  let str = typeof val === 'object' ? JSON.stringify(val) : String(val);
  str = str.replace(/"/g, '""');
  if (str.includes(',') || str.includes('\n') || str.includes('"') || str.includes(';')) {
    return `"${str}"`;
  }
  return str;
}

function jsonToCsv(rows: Record<string, any>[], columns: { key: string; label: string }[]): string {
  const headerLine = columns.map((c) => escapeCsvValue(c.label)).join(',');
  const rowLines = rows.map((row) =>
    columns.map((c) => escapeCsvValue(row[c.key])).join(',')
  );
  return [headerLine, ...rowLines].join('\r\n');
}

// GET /api/v1/reports/export/csv?type=startups|applications|progress
export async function GET(req: NextRequest) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const { orgId } = requireOrg(req);
    const realOrgId = resolveOrg(orgId);

    const { searchParams } = new URL(req.url);
    const exportType = (searchParams.get('type') || 'startups').toLowerCase();
    const sector = searchParams.get('sector');
    const stage = searchParams.get('stage');
    const status = searchParams.get('status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    const todayStr = new Date().toISOString().split('T')[0];
    let csvData = '';
    let reportName = exportType;

    if (exportType === 'startups') {
      let query = supabaseAdmin
        .from('startups')
        .select('*')
        .eq('organization_id', realOrgId)
        .order('created_at', { ascending: false });

      if (sector) query = query.eq('sector', sector);
      if (stage) query = query.eq('stage', stage);
      if (status) query = query.eq('status', status);
      if (startDate) query = query.gte('created_at', startDate);
      if (endDate) query = query.lte('created_at', endDate);

      const { data, error } = await query;
      if (error) throw error;

      const columns = [
        { key: 'name', label: 'Startup Name' },
        { key: 'sector', label: 'Sector' },
        { key: 'stage', label: 'Stage' },
        { key: 'status', label: 'Status' },
        { key: 'lifecycle_stage', label: 'Lifecycle Stage' },
        { key: 'monthly_revenue', label: 'Monthly Revenue ($)' },
        { key: 'annual_revenue', label: 'Annual Revenue ($)' },
        { key: 'funding_raised', label: 'Funding Raised ($)' },
        { key: 'team_size', label: 'Team Size (Jobs)' },
        { key: 'founder_email', label: 'Founder Email' },
        { key: 'created_at', label: 'Registration Date' },
      ];

      csvData = jsonToCsv(data || [], columns);
      reportName = 'startups_directory';

    } else if (exportType === 'applications') {
      let query = supabaseAdmin
        .from('applications')
        .select('*')
        .eq('organization_id', realOrgId)
        .order('created_at', { ascending: false });

      if (sector) query = query.eq('sector', sector);
      if (stage) query = query.eq('stage', stage);
      if (status) query = query.eq('status', status);
      if (startDate) query = query.gte('created_at', startDate);
      if (endDate) query = query.lte('created_at', endDate);

      const { data, error } = await query;
      if (error) throw error;

      const columns = [
        { key: 'startup_name', label: 'Applicant Startup' },
        { key: 'applicant_name', label: 'Primary Contact' },
        { key: 'applicant_email', label: 'Contact Email' },
        { key: 'sector', label: 'Sector' },
        { key: 'stage', label: 'Stage' },
        { key: 'status', label: 'Application Status' },
        { key: 'created_at', label: 'Application Date' },
      ];

      csvData = jsonToCsv(data || [], columns);
      reportName = 'applications_report';

    } else if (exportType === 'progress') {
      let query = supabaseAdmin
        .from('startup_reviews')
        .select(`
          *,
          startup:startups (id, name, sector)
        `)
        .eq('organization_id', realOrgId)
        .order('review_period_start', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      const flattened = (data || []).map((r: any) => ({
        ...r,
        startup_name: r.startup?.name || 'Unknown',
        startup_sector: r.startup?.sector || 'Unknown',
      }));

      const columns = [
        { key: 'startup_name', label: 'Startup Name' },
        { key: 'startup_sector', label: 'Sector' },
        { key: 'review_type', label: 'Review Period Type' },
        { key: 'review_period_start', label: 'Period Start' },
        { key: 'review_period_end', label: 'Period End' },
        { key: 'revenue', label: 'Revenue ($)' },
        { key: 'customer_count', label: 'Customer Count' },
        { key: 'team_size', label: 'Team Size' },
        { key: 'performance_rating', label: 'Performance Rating' },
        { key: 'overall_score', label: 'Score' },
        { key: 'review_status', label: 'Review Status' },
        { key: 'action_plan', label: 'Action Plan' },
      ];

      csvData = jsonToCsv(flattened, columns);
      reportName = 'progress_tracking';

    } else {
      return NextResponse.json({
        success: false,
        error: `Unsupported export type: ${exportType}. Allowed types: startups, applications, progress`,
      }, { status: 400 });
    }

    // Filename: {report_name}_{org_id}_{date}.csv
    const filename = `${reportName}_${realOrgId.slice(0, 8)}_${todayStr}.csv`;

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
