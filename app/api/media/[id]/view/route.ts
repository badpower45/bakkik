import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/response';

/**
 * POST /api/media/[id]/view
 * Track media view
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: mediaId } = params;

    // Check if media exists
    const { data: media, error: mediaError } = await supabaseAdmin
      .from('media')
      .select('views_count')
      .eq('id', mediaId)
      .single();

    if (mediaError || !media) {
      return errorResponse('Media not found', 404);
    }

    // Increment views count
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('media')
      .update({
        views_count: (media.views_count || 0) + 1,
      })
      .eq('id', mediaId)
      .select('views_count')
      .single();

    if (updateError) {
      return errorResponse('Failed to update views', 500);
    }

    return successResponse({
      message: 'View tracked successfully',
      views_count: updated.views_count,
    });
  } catch (error) {
    console.error('Track view error:', error);
    return errorResponse('Internal server error', 500);
  }
}
