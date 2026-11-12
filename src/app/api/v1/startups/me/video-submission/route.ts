import { NextRequest } from 'next/server';
import { GET as getHandler, POST as postHandler } from '../../[id]/video-submission/route';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return getHandler(req, { params: Promise.resolve({ id: 'me' }) });
}

export async function POST(req: NextRequest) {
  return postHandler(req, { params: Promise.resolve({ id: 'me' }) });
}
