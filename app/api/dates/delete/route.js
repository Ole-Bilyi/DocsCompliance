import { NextResponse } from 'next/server'
import { deleteDate } from '../../../../lib/dates'
import { getUser } from '../../../../lib/auth'

export async function POST(request) {
  try {
    const { email, date_id } = await request.json()
    
    if (!email || !date_id) {
      return NextResponse.json({ success: false, error: 'Email and date_id are required' }, { status: 400 })
    }

    // Verify user is authenticated
    const userData = await getUser(email)
    if (!userData.success) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 })
    }

    const result = await deleteDate(email, date_id)
    return NextResponse.json(result)
  } catch (error) {
    console.error('deleteDate error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
