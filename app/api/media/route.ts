import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/response';
import { verifyAuth } from '@/lib/middleware/auth';

/**
 * GET /api/media
 * Get media posts (photos/videos) with likes and shares
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'photo' or 'video'
    const featured = searchParams.get('featured') === 'true';
    const fighterId = searchParams.get('fighter_id');
    const gymId = searchParams.get('gym_id');
    const eventId = searchParams.get('event_id');
    const fightId = searchParams.get('fight_id');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Try to get user ID for likes
    let userId: string | null = null;
    try {
      const authResult = await verifyAuth(request);
      if (authResult.success && authResult.user) {
        userId = authResult.user.id;
      }
    } catch (e) {
      // Not authenticated, continue without user context
    }

    let query = supabaseAdmin
      .from('media')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('type', type);
    }

    if (featured) {
      query = query.eq('is_featured', true);
    }
    
    // Entity filters for linked media
    if (fighterId) {
      query = query.eq('fighter_id', fighterId);
    }
    
    if (gymId) {
      query = query.eq('gym_id', gymId);
    }
    
    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    
    if (fightId) {
      query = query.eq('fight_id', fightId);
    }
    
    if (category) {
      query = query.eq('category', category);
    }

    const { data: media, error } = await query;

    if (error) {
      return errorResponse('Failed to fetch media', 500);
    }

    // Get likes and shares count for each media
    const mediaWithStats = await Promise.all(
      (media || []).map(async (item) => {
        // Get likes count
        const { count: likesCount } = await supabaseAdmin
          .from('media_likes')
          .select('*', { count: 'exact', head: true })
          .eq('media_id', item.id);

        // Get shares count
        const { count: sharesCount } = await supabaseAdmin
          .from('media_shares')
          .select('*', { count: 'exact', head: true })
          .eq('media_id', item.id);

        // Check if user liked
        let isLikedByUser = false;
        if (userId) {
          const { data: userLike } = await supabaseAdmin
            .from('media_likes')
            .select('id')
            .eq('media_id', item.id)
            .eq('user_id', userId)
            .single();
          isLikedByUser = !!userLike;
        }

        return {
          ...item,
          likes_count: likesCount || 0,
          shares_count: sharesCount || 0,
          views_count: item.views_count || 0,
          is_liked_by_user: isLikedByUser,
        };
      })
    );

    return successResponse(mediaWithStats);

  } catch (error) {
    console.error('Get media error:', error);
    return errorResponse('Internal server error', 500);
  }
}
