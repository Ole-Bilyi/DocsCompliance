import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { listTrustedUsers } from '@/lib/trustedUsers';

export async function POST(request) {
  try {
    const session = await getSession();
    const user = session.user;

    if (!user || !user.isLoggedIn) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const result = await listTrustedUsers(user.email);
    return NextResponse.json(result);
  } catch (error) {
    console.error('List trusted users error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
