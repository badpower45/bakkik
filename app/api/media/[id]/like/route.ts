import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/response';
import { verifyAuth } from '@/lib/middleware/auth';

/**
 * POST /api/media/[id]/like
 * Like/Unlike a media post
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return errorResponse('Unauthorized', 401);
    }

    const userId = authResult.user.id;
    const { id: mediaId } = params;

    // Check if media exists
    const { data: media, error: mediaError } = await supabaseAdmin
      .from('media')
      .select('id')
      .eq('id', mediaId)
      .single();

    if (mediaError || !media) {
      return errorResponse('Media not found', 404);
    }

    // Check if already liked
    const { data: existingLike } = await supabaseAdmin
      .from('media_likes')
      .select('id')
      .eq('media_id', mediaId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Unlike - remove the like
      await supabaseAdmin
        .from('media_likes')
        .delete()
        .eq('id', existingLike.id);

      // Get updated count
      const { count } = await supabaseAdmin
        .from('media_likes')
        .select('*', { count: 'exact', head: true })
        .eq('media_id', mediaId);

      return successResponse({
        action: 'unliked',
        likes_count: count || 0,
      });
    } else {
      // Like - add new like
      await supabaseAdmin
        .from('media_likes')
        .insert({
          media_id: mediaId,
          user_id: userId,
        });

      // Get updated count
      const { count } = await supabaseAdmin
        .from('media_likes')
        .select('*', { count: 'exact', head: true })
        .eq('media_id', mediaId);

      return successResponse({
        action: 'liked',
        likes_count: count || 0,
      });
    }
  } catch (error) {
    console.error('Like media error:', error);
    return errorResponse('Internal server error', 500);
  }
}
