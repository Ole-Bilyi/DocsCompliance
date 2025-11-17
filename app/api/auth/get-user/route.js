import { NextResponse } from 'next/server'
import { getUser } from '../../../../lib/auth'

export async function POST(request) {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    const result = await getUser(email)
    return NextResponse.json(result)
  } catch (error) {
    console.error('getUser error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
