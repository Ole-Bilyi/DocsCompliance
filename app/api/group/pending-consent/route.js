import { NextResponse } from 'next/server'
import { getConsent } from '../../../../lib/group'
import { getUser } from '../../../../lib/auth'

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

    const result = await getConsent(email)
    return NextResponse.json(result)
  } catch (error) {
    console.error('getConsent error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
