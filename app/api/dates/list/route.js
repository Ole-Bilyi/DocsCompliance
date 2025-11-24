import { NextResponse } from 'next/server'
import { getDates } from '@/lib/dates'
import { getSession } from '@/lib/session'

export async function POST(request) {
  try {
    const session = await getSession();
    const user = session.user;

    if (!user || !user.isLoggedIn) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const result = await getDates(user.email)
    return NextResponse.json(result)
  } catch (error) {
    console.error('getDates error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}