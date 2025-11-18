import { NextResponse } from 'next/server'
import { getDates } from '../../../../lib/dates'
import { getUser } from '../../../../lib/auth'
import { normalizeDeadlineDays } from '../../../../lib/calendarDefaults'

export async function POST(request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    // Verify user is authenticated
    const userData = await getUser(email)
    if (!userData.success) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 })
    }

    const result = await getDates(email)
    if (!result.success) return NextResponse.json(result, { status: 500 })

    // map dates -> calendar event shape expected by client
    const mapped = (result.data || []).map(d => ({
      event_id: d.date_id,
      event_name: d.date_title,
      event_description: d.date_details,
      event_date: d.due_date,
      event_color: d.event_color ? d.event_color : null,
      deadline_days: normalizeDeadlineDays(d.deadline_days),
      // include original fields in case UI needs them
      ...d
    }))

    return NextResponse.json({ success: true, data: mapped })
  } catch (error) {
    console.error('getCalendarEvents error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

