import { NextResponse } from 'next/server'
import { createDate } from '@/lib/dates'
import { getSession } from '@/lib/session'

export async function POST(request) {
  try {
    const session = await getSession();
    const user = session.user;

    if (!user || !user.isLoggedIn) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { date } = await request.json()
    
    if (!date) {
      return NextResponse.json({ success: false, error: 'Date object is required' }, { status: 400 })
    }

    if (!user.admin && date.assigned_to !== user.email) {
      return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 });
    }

    const result = await createDate(date)
    return NextResponse.json(result)
  } catch (error) {
    console.error('createDate error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}