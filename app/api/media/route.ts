import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/response';

/**
 * GET /api/media
 * Get media (photos/videos)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'photo' or 'video'
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

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

    const { data: media, error } = await query;

    if (error) {
      return errorResponse('Failed to fetch media', 500);
    }

    return successResponse(media);

  } catch (error) {
    console.error('Get media error:', error);
    return errorResponse('Internal server error', 500);
  }
}
