import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function POST(request) {
  try {
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
  } catch (error) {
    console.error('Error in /api/auth/user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}