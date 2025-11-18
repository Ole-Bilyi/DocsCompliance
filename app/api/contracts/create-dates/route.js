import { NextResponse } from 'next/server'
import { createConDates } from '../../../../lib/contracts'
import { getSession } from '@/lib/session'

export async function POST(request) {
  try {
    const session = await getSession();
    const user = session.user;

    if (!user || !user.isLoggedIn) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { cont_id, dates } = await request.json()
    
    if (!cont_id || !dates || !Array.isArray(dates)) {
      return NextResponse.json({ success: false, error: 'cont_id and dates array are required' }, { status: 400 })
    }

    const result = await createConDates(cont_id, dates)
    return NextResponse.json(result)
  } catch (error) {
    console.error('createConDates error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}