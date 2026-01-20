import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/response';
import { verifyAuth } from '@/lib/middleware/auth';

/**
 * POST /api/livestreams/[id]/verify-access
 * Verify if user has access to a live stream
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

    // Check if user has active access
    const { data: access, error } = await supabaseAdmin
      .from('live_stream_access')
      .select('*, live_streams(*)')
      .eq('user_id', userId)
      .eq('live_stream_id', liveStreamId)
      .eq('is_active', true)
      .single();

    if (error || !access) {
      return successResponse({
        hasAccess: false,
        message: 'No active access found. Please purchase access to watch this stream.',
      });
    }

    // Verify session token if provided
    if (sessionToken && access.session_token !== sessionToken) {
      return successResponse({
        hasAccess: false,
        message: 'Invalid session token',
      });
    }

    // Check if stream is still accessible
    const stream = access.live_streams;
    if (stream.status === 'cancelled') {
      return successResponse({
        hasAccess: false,
        message: 'This stream has been cancelled',
      });
    }

    // Update last heartbeat
    await supabaseAdmin
      .from('live_stream_access')
      .update({
        last_heartbeat_at: new Date().toISOString(),
      })
      .eq('id', access.id);

    return successResponse({
      hasAccess: true,
      access: {
        id: access.id,
        sessionToken: access.session_token,
        purchasedAt: access.purchased_at,
      },
      stream: {
        id: stream.id,
        title: stream.title,
        status: stream.status,
        streamUrl: stream.stream_url,
      },
    });
  } catch (error) {
    console.error('Verify access error:', error);
    return errorResponse('Internal server error', 500);
  }
}
