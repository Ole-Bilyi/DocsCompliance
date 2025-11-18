import { NextResponse } from 'next/server'
import { getGroup, getGroupByEmail } from '@/lib/group'
import { getSession } from '@/lib/session'

export async function POST(request) {
  try {
    const session = await getSession();
    const user = session.user;

    if (!user || !user.isLoggedIn) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Try to get groupId from the body, it's optional
    const body = await request.json().catch(() => ({}));
    const { groupId } = body;

    if (groupId) {
      const result = await getGroup(groupId)
      return NextResponse.json(result)
    }

    // If no groupId is provided, get the group for the logged-in user
    const result = await getGroupByEmail(user.email)
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('getGroup error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}