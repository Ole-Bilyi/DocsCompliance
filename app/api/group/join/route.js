import { NextResponse } from 'next/server'
import { joinGroup } from '@/lib/group'
import { getSession } from '@/lib/session'

export async function POST(request) {
  try {
    const session = await getSession();
    const user = session.user;

    if (!user || !user.isLoggedIn) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { adminEmail } = await request.json()
    if (!adminEmail) {
      return NextResponse.json({ success: false, error: 'adminEmail is required' }, { status: 400 })
    }

    const result = await joinGroup(user.email, adminEmail)
    return NextResponse.json(result)
  } catch (error) {
    console.error('joinGroup error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}