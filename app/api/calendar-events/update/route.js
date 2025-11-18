import { NextResponse } from 'next/server'
import { updateCalendarEvent } from '../../../../lib/calendarEvents'
import { getUser } from '../../../../lib/auth'

export async function POST(request) {
  try {
    const { email, event_id, update } = await request.json()
    
    if (!email || !event_id || !update) {
      return NextResponse.json({ success: false, error: 'Email, event_id, and update object are required' }, { status: 400 })
    }

    // Verify user is authenticated
    const userData = await getUser(email)
    if (!userData.success) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 })
    }

    const result = await updateCalendarEvent(email, event_id, update)
    return NextResponse.json(result)
  } catch (error) {
    console.error('updateCalendarEvent error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

