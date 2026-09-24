import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'incubator-platform-api',
      version: '1.0.0',
    },
    { status: 200 }
  );
}
