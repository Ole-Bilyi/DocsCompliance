import { NextResponse } from 'next/server'
import { createGroup } from '@/lib/group'
import { getSession } from '@/lib/session'

export async function POST(request) {
  try {
    const session = await getSession();
    const user = session.user;

    if (!user || !user.isLoggedIn) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { groupName } = await request.json()
    if (!groupName) {
      return NextResponse.json({ success: false, error: 'groupName is required' }, { status: 400 })
    }

    const result = await createGroup(user.email, groupName)
    
    if (!result.success) {
      console.error('Create group failed for email:', user.email, 'Error:', result.error)
      return NextResponse.json({ success: false, error: 'Failed to create group' }, { status: 400 })
    }
    session.user.group = {
      group_name: groupName
    };
    await session.save();
    return NextResponse.json({ success: true, data: { group_name: groupName } })
  } catch (error) {
    console.error('Create group API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}