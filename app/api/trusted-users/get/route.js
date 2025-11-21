import { NextResponse } from 'next/server'
import { isTrustedUser } from '@/lib/trustedUsers'
import { getSession } from '@/lib/session'

export async function POST(request) {
  try {
    const session = await getSession();
    const user = session.user;

    if (!user || !user.isLoggedIn) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const result = await isTrustedUser(user.email)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Is trusted user error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}