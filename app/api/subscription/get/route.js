import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { subscriptionOfGroup } from '@/lib/subsciption';

export async function POST(request) {
  try {
    const session = await getSession();
    const user = session.user;

    if (!user || !user.isLoggedIn) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const result = await subscriptionOfGroup(user.email)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}