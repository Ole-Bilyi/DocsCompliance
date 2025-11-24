import { NextResponse } from 'next/server'
import { deleteDate } from '@/lib/dates'
import { getSession } from '@/lib/session'

export async function POST(request) {
  try {
    const session = await getSession();
    const user = session.user;

    if (!user || !user.isLoggedIn) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { event_id } = await request.json()
    
    if (!event_id) {
      return NextResponse.json({ success: false, error: 'event_id is required' }, { status: 400 })
    }

    const result = await deleteDate(user.email, event_id)
    if (!result.success) return NextResponse.json(result, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('deleteCalendarEvent error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}