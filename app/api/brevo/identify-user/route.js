// app/api/brevo/identify-user/route.js
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getDeadlinesOverdueCounts } from '@/lib/dates';

export async function POST(request) {
  try {
    const session = await getSession();
    
    // Check if user is authenticated
    if (!session?.user?.isLoggedIn) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'User email not found' },
        { status: 400 }
      );
    }

    // Check if Brevo API key is configured
    if (!process.env.BREVO_API_KEY) {
      console.error('Brevo API key not configured');
      return NextResponse.json(
        { success: false, error: 'Brevo integration not configured' },
        { status: 500 }
      );
    }

    // Get deadline counts with better error handling
    const daysResult = await getDeadlinesOverdueCounts(userEmail);
    const deadlineDays = daysResult.success ? (daysResult.data?.deadlineDays || 0) : 0;
    const overdueDays = daysResult.success ? (daysResult.data?.overdueDays || 0) : 0;

    if (!daysResult.success) {
      console.warn('Failed to get deadline counts, using defaults:', daysResult.error);
    }

    // Extract first and last name safely
    const userName = session.user.name || '';

    // Prepare Brevo contact data
    const brevoContactData = {
      email: userEmail,
      attributes: {
        FIRSTNAME: userName,
        DEADLINE_COUNT: deadlineDays,
        OVERDUE_COUNT: overdueDays,
        LAST_SYNC: new Date().toISOString(),
      },
      updateEnabled: true
    };

    // Call Brevo API
    const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(brevoContactData)
    });

    const responseData = await brevoResponse.json();

    if (!brevoResponse.ok) {
      console.error('Brevo API error response:', responseData);
      throw new Error(`Brevo API error: ${responseData.message || 'Unknown error'}`);
    }

    console.log(`Brevo user sync successful for ${userEmail}: ${deadlineDays} deadlines, ${overdueDays} overdue`);

    return NextResponse.json({
      success: true,
      message: 'User identified in Brevo successfully',
      counts: { 
        deadlineDays, 
        overdueDays 
      },
      brevoId: responseData.id // Brevo contact ID if needed
    });

  } catch (error) {
    console.error('Brevo identify error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to identify user in Brevo'
      },
      { status: 500 }
    );
  }
}