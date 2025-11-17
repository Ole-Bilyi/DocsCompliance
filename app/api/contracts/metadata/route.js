import { NextResponse } from 'next/server'
import { setConMetadata } from '../../../../lib/contracts'
import { getUser } from '../../../../lib/auth'

export async function POST(request) {
  try {
    const { email, cont_id, metadata } = await request.json()
    
    if (!email || !cont_id || !metadata) {
      return NextResponse.json({ success: false, error: 'Email, cont_id, and metadata are required' }, { status: 400 })
    }

    // Verify user is authenticated
    const userData = await getUser(email)
    if (!userData.success) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 })
    }

    const result = await setConMetadata(cont_id, metadata)
    return NextResponse.json(result)
  } catch (error) {
    console.error('setConMetadata error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
