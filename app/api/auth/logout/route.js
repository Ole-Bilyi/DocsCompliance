import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function POST(request) {
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ success: true });
}