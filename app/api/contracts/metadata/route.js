import { NextResponse } from 'next/server'
import { setConMetadata } from '../../../../lib/contracts'
import { getSession } from '@/lib/session'

export async function POST(request) {
  try {
    const session = await getSession();
    const user = session.user;

    if (!user || !user.isLoggedIn) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { cont_id, metadata } = await request.json()
    
    if (!cont_id || !metadata) {
      return NextResponse.json({ success: false, error: 'cont_id and metadata are required' }, { status: 400 })
    }

    const result = await setConMetadata(cont_id, metadata)
    return NextResponse.json(result)
  } catch (error) {
    console.error('setConMetadata error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}