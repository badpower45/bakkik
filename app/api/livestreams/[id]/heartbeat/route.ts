import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/response';
import { verifyAuth } from '@/lib/middleware/auth';

/**
 * POST /api/livestreams/[id]/heartbeat
 * Keep-alive heartbeat for active viewers
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return errorResponse('Unauthorized', 401);
    }

    const userId = authResult.user.id;
    const { id: liveStreamId } = params;
    const body = await request.json();
    const { sessionToken } = body;

    // Verify access and update heartbeat
    const { data: access, error } = await supabaseAdmin
      .from('live_stream_access')
      .select('*')
      .eq('user_id', userId)
      .eq('live_stream_id', liveStreamId)
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .single();

    if (error || !access) {
      return errorResponse('Access denied', 403);
    }

    // Update last heartbeat
    await supabaseAdmin
      .from('live_stream_access')
      .update({
        last_heartbeat_at: new Date().toISOString(),
      })
      .eq('id', access.id);

    return successResponse({
      message: 'Heartbeat updated',
      status: 'active',
    });
  } catch (error) {
    console.error('Heartbeat error:', error);
    return errorResponse('Internal server error', 500);
  }
}
