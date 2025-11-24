import { updateAllContactDeadlineCounts } from "@/lib/dates";

export async function GET(request) {
  try {
    // Get the search params from the URL
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    // Validate token
    const validToken = process.env.VALID_WEBHOOK_TOKENS;
    
    if (validToken!==token) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    // Update contact data
    await updateAllContactDeadlineCounts();

    return Response.json({ 
      success: true, 
      message: 'Contact counts updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}