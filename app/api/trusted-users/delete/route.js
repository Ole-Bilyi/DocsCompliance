import { NextResponse } from 'next/server'
import { removeTrustedUser } from '@/lib/trustedUsers'
import { getSession } from '@/lib/session'

export async function POST(request) {
  try {
    const session = await getSession();
    const user = session.user;

    if (!user || !user.isLoggedIn) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { user_email } = await request.json()
    
    if (!user_email) {
      return NextResponse.json({ success: false, error: 'user_email is required' }, { status: 400 })
    }

    const result = await removeTrustedUser(user_email, user.email)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Remove trusted user error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}