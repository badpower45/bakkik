import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/response';
import { verifyAuth } from '@/lib/middleware/auth';

/**
 * POST /api/livestreams/[id]/purchase
 * Purchase access to a live stream ($1)
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

    // Get live stream details
    const { data: stream, error: streamError } = await supabaseAdmin
      .from('live_streams')
      .select('*')
      .eq('id', liveStreamId)
      .single();

    if (streamError || !stream) {
      return errorResponse('Live stream not found', 404);
    }

    // Check if user already has access
    const { data: existingAccess } = await supabaseAdmin
      .from('live_stream_access')
      .select('*')
      .eq('user_id', userId)
      .eq('live_stream_id', liveStreamId)
      .eq('is_active', true)
      .single();

    if (existingAccess) {
      return successResponse({
        message: 'You already have access to this live stream',
        access: existingAccess,
      });
    }

    // TODO: Integrate with payment gateway (Paymob/Stripe)
    // For now, we'll create access directly
    // In production, this should be called from payment webhook

    // Generate session token
    const sessionToken = `stream_${userId}_${liveStreamId}_${Date.now()}`;

    // Create access record
    const { data: access, error: accessError } = await supabaseAdmin
      .from('live_stream_access')
      .insert({
        user_id: userId,
        live_stream_id: liveStreamId,
        price_paid: stream.price || 1.0,
        purchased_at: new Date().toISOString(),
        is_active: true,
        session_token: sessionToken,
      })
      .select()
      .single();

    if (accessError) {
      return errorResponse('Failed to create access', 500);
    }

    return successResponse({
      message: 'Access granted successfully',
      access,
      stream: {
        id: stream.id,
        title: stream.title,
        stream_url: stream.stream_url,
      },
    });
  } catch (error) {
    console.error('Purchase live stream error:', error);
    return errorResponse('Internal server error', 500);
  }
}
