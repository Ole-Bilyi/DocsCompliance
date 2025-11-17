import { NextResponse } from 'next/server'
import { createConDates } from '../../../../lib/contracts'
import { getUser } from '../../../../lib/auth'

export async function POST(request) {
  try {
    const { email, cont_id, dates } = await request.json()
    
    if (!email || !cont_id || !dates || !Array.isArray(dates)) {
      return NextResponse.json({ success: false, error: 'Email, cont_id, and dates array are required' }, { status: 400 })
    }

    // Verify user is authenticated
    const userData = await getUser(email)
    if (!userData.success) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 })
    }

    const result = await createConDates(cont_id, dates)
    return NextResponse.json(result)
  } catch (error) {
    console.error('createConDates error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
