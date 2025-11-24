import { NextResponse } from 'next/server'
import { updateDate } from '@/lib/dates'
import { getSession } from '@/lib/session'

export async function POST(request) {
  try {
    const session = await getSession();
    const user = session.user;

    if (!user || !user.isLoggedIn) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { date_id, update } = await request.json()
    
    if (!date_id || !update) {
      return NextResponse.json({ success: false, error: 'date_id and update object are required' }, { status: 400 })
    }

    const result = await updateDate(user.email, date_id, update)
    return NextResponse.json(result)
  } catch (error) {
    console.error('updateDate error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}