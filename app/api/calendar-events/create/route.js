import { NextResponse } from 'next/server'
import { createCalendarEvent } from '../../../../lib/calendarEvents'
import { getUser } from '../../../../lib/auth'

export async function POST(request) {
  try {
    const { email, event } = await request.json()
    
    if (!email || !event) {
      return NextResponse.json({ success: false, error: 'Email and event object are required' }, { status: 400 })
    }

    // Verify user is authenticated
    const userData = await getUser(email)
    if (!userData.success) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 })
    }

    const result = await createCalendarEvent({ ...event, assigned_to: email })
    return NextResponse.json(result)
  } catch (error) {
    console.error('createCalendarEvent error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

