import { NextResponse } from 'next/server'
import { createDate } from '../../../../lib/dates'
import { getUser } from '../../../../lib/auth'
import { normalizeDeadlineDays } from '../../../../lib/calendarDefaults'

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

    // map incoming event -> date shape
    const deadlineDays = normalizeDeadlineDays(event.deadline_days)
    const datePayload = {
      date_title: event.event_name,
      date_details: event.event_description,
      due_date: event.event_date,
      assigned_to: email,
      deadline_days: deadlineDays
    }

    const result = await createDate(datePayload)
    if (!result.success) return NextResponse.json(result, { status: 500 })

    // map created date back to calendar-event shape
    const d = result.data
    const mapped = {
      event_id: d.date_id,
      event_name: d.date_title,
      event_description: d.date_details,
      event_date: d.due_date,
      event_color: d.event_color ? d.event_color : null,
      ...d
    }

    return NextResponse.json({ success: true, data: mapped })
  } catch (error) {
    console.error('createCalendarEvent error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

