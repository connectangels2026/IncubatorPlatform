import { NextResponse } from 'next/server';

export function handleApiError(error: any): NextResponse {
  console.error('[API Error]:', error);

  const status = error.status || error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  return NextResponse.json(
    {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}
