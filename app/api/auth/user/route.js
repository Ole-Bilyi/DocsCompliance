import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET(request) {
  const session = await getSession();
  const user = session.user;

  if (user && user.isLoggedIn) {
    return NextResponse.json({
      isLoggedIn: true,
      ...user,
    });
  } else {
    return NextResponse.json({
      isLoggedIn: false,
    });
  }
}