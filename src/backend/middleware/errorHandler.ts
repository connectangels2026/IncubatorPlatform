import { NextResponse } from 'next/server';

export function handleApiError(error: any): NextResponse {
  console.error('[API Error]:', error);

  // Handle PostgreSQL unique constraint violation (code 23505)
  if (error?.code === '23505') {
    return NextResponse.json(
      {
        success: false,
        error:
          error.customMessage ||
          'A record with this information already exists. Duplicate entries are not allowed.',
        details: error.details || error.message,
        code: 'DUPLICATE_ENTRY',
        timestamp: new Date().toISOString(),
      },
      { status: 409 }
    );
  }

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
