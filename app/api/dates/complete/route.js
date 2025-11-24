import { NextResponse } from 'next/server'
import { completeDate } from '@/lib/dates'
import { getSession } from '@/lib/session'

export async function POST(request) {
  try {
    const session = await getSession();
    const user = session.user;

    if (!user || !user.isLoggedIn) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { date_id } = await request.json()
    
    if (!date_id) {
      return NextResponse.json({ success: false, error: 'date_id is required' }, { status: 400 })
    }

    const result = await completeDate(user.email, date_id)
    return NextResponse.json(result)
  } catch (error) {
    console.error('completeDate error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}