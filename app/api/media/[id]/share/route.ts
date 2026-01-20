import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/response';
import { verifyAuth } from '@/lib/middleware/auth';

/**
 * POST /api/media/[id]/share
 * Track media share
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication (optional for shares)
    let userId: string | null = null;
    try {
      const authResult = await verifyAuth(request);
      if (authResult.success && authResult.user) {
        userId = authResult.user.id;
      }
    } catch (e) {
      // Allow anonymous shares
    }

    const { id: mediaId } = params;
    const body = await request.json();
    const { platform } = body; // 'facebook', 'twitter', 'whatsapp', 'copy', etc.

    // Check if media exists
    const { data: media, error: mediaError } = await supabaseAdmin
      .from('media')
      .select('id')
      .eq('id', mediaId)
      .single();

    if (mediaError || !media) {
      return errorResponse('Media not found', 404);
    }

    // Track the share
    await supabaseAdmin
      .from('media_shares')
      .insert({
        media_id: mediaId,
        user_id: userId,
        platform: platform || 'unknown',
      });

    // Get updated count
    const { count } = await supabaseAdmin
      .from('media_shares')
      .select('*', { count: 'exact', head: true })
      .eq('media_id', mediaId);

    return successResponse({
      message: 'Share tracked successfully',
      shares_count: count || 0,
    });
  } catch (error) {
    console.error('Share media error:', error);
    return errorResponse('Internal server error', 500);
  }
}
