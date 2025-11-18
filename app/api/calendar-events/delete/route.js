import { NextResponse } from 'next/server'
import { deleteCalendarEvent } from '../../../../lib/calendarEvents'
import { getUser } from '../../../../lib/auth'

export async function POST(request) {
  try {
    const { email, event_id } = await request.json()
    
    if (!email || !event_id) {
      return NextResponse.json({ success: false, error: 'Email and event_id are required' }, { status: 400 })
    }

    // Verify user is authenticated
    const userData = await getUser(email)
    if (!userData.success) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 })
    }

    const result = await deleteCalendarEvent(email, event_id)
    return NextResponse.json(result)
  } catch (error) {
    console.error('deleteCalendarEvent error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

