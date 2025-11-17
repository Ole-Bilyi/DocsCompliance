import { NextResponse } from 'next/server'
import { updateDate } from '../../../../lib/dates'
import { getUser } from '../../../../lib/auth'

export async function POST(request) {
  try {
    const { email, date_id, update } = await request.json()
    
    if (!email || !date_id || !update) {
      return NextResponse.json({ success: false, error: 'Email, date_id, and update object are required' }, { status: 400 })
    }

    // Verify user is authenticated
    const userData = await getUser(email)
    if (!userData.success) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 })
    }

    const result = await updateDate(email, date_id, update)
    return NextResponse.json(result)
  } catch (error) {
    console.error('updateDate error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
