import { NextResponse } from 'next/server'
import { uploadFile } from '../../../../lib/contracts'
import { getUser } from '../../../../lib/auth'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const email = formData.get('email')

    if (!file || !email) {
      return NextResponse.json({ success: false, error: 'File and email are required' }, { status: 400 })
    }

    // Verify user is authenticated
    const userData = await getUser(email)
    if (!userData.success) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 })
    }

    const result = await uploadFile(file, email)
    return NextResponse.json(result)
  } catch (error) {
    console.error('uploadFile error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
