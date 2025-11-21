import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { updateSubscription } from '@/lib/subsciption';

export async function POST(request) {
  try {
    const session = await getSession();
    const user = session.user;

    if (!user || !user.isLoggedIn) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { subscriptionData } = await request.json();
    if (!subscriptionData) {
      return NextResponse.json({ success: false, error: 'No subscription data provided' }, { status: 400 });
    }

    const result = await updateSubscription(user.email, subscriptionData)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}