import { NextResponse } from 'next/server'
import { signUp } from '@/lib/auth'
import { getSession } from '@/lib/session'

export async function POST(request) {
  try {
    const { name, email, password } = await request.json()
    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Name, email and password are required' }, { status: 400 })
    }

    const result = await signUp(name, email, password)
    
    if (!result.success) {
      console.error('Sign up failed for email:', email, 'Error:', result.error)
      // Return sanitized error based on content
      const errorMsg = result.error.includes('already exists') ? 'Email already exists' : 'Failed to create account'
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 })
    }

    // After successful sign-up, create a session for the user
    const session = await getSession();
    session.user = {
      email: email,
      name: name,
      isLoggedIn: true,
    };
    await session.save();

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Sign up API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}