import { NextResponse } from 'next/server'
import { updateDate } from '../../../../lib/dates'
import { getUser } from '../../../../lib/auth'
import { normalizeDeadlineDays } from '../../../../lib/calendarDefaults'

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

    // map update object fields from event -> date
    const updatePayload = {}
    if (update.event_name) updatePayload.date_title = update.event_name
    if (update.event_description) updatePayload.date_details = update.event_description
    if (update.event_date) updatePayload.due_date = update.event_date
    if (update.event_color) updatePayload.event_color = update.event_color
    if (update.deadline_days !== undefined) {
      updatePayload.deadline_days = normalizeDeadlineDays(update.deadline_days)
    }

    const result = await updateDate(email, event_id, updatePayload)
    if (!result.success) return NextResponse.json(result, { status: 500 })

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
    console.error('updateCalendarEvent error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

