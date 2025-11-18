import { NextResponse } from 'next/server'
import { uploadFile } from '../../../../lib/contracts'
import { getSession } from '@/lib/session'

export async function POST(request) {
  try {
    const session = await getSession();
    const user = session.user;

    if (!user || !user.isLoggedIn) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ success: false, error: 'File is required' }, { status: 400 })
    }

    const result = await uploadFile(file, user.email)
    return NextResponse.json(result)
  } catch (error) {
    console.error('uploadFile error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}