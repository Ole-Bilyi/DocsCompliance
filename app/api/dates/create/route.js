import { NextResponse } from 'next/server'
import { createDate } from '../../../../lib/dates'
import { getUser } from '../../../../lib/auth'

export async function POST(request) {
  try {
    const { email, date } = await request.json()
    
    if (!email || !date) {
      return NextResponse.json({ success: false, error: 'Email and date object are required' }, { status: 400 })
    }

    // Verify user is authenticated
    const userData = await getUser(email)
    if (!userData.success) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 })
    }

    const result = await createDate(date)
    return NextResponse.json(result)
  } catch (error) {
    console.error('createDate error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
