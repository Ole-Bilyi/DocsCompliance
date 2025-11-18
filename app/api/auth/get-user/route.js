import { NextResponse } from 'next/server'
import { getUser } from '../../../../lib/auth'
import { getSession } from '@/lib/session'

export async function POST(request) {
  try {
    const session = await getSession();
    const user = session.user;

    if (!user || !user.isLoggedIn) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const result = await getUser(user.email)
    return NextResponse.json(result)
  } catch (error) {
    console.error('getUser error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}