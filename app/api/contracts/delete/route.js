import { NextResponse } from 'next/server'
import { deleteContract } from '../../../../lib/contracts'
import { getUser } from '../../../../lib/auth'

export async function POST(request) {
  try {
    const { email, cont_id } = await request.json()
    
    if (!email || !cont_id) {
      return NextResponse.json({ success: false, error: 'Email and cont_id are required' }, { status: 400 })
    }

    // Verify user is authenticated
    const userData = await getUser(email)
    if (!userData.success) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 })
    }

    const result = await deleteContract(cont_id, email)
    return NextResponse.json(result)
  } catch (error) {
    console.error('deleteContract error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
