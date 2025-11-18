import { NextResponse } from 'next/server'
import { deleteContract } from '../../../../lib/contracts'
import { getSession } from '@/lib/session'

export async function POST(request) {
  try {
    const session = await getSession();
    const user = session.user;

    if (!user || !user.isLoggedIn) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { cont_id } = await request.json()
    
    if (!cont_id) {
      return NextResponse.json({ success: false, error: 'cont_id is required' }, { status: 400 })
    }

    const result = await deleteContract(cont_id, user.email)
    return NextResponse.json(result)
  } catch (error) {
    console.error('deleteContract error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}