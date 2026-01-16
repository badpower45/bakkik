import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/response';
import { verifyAuth } from '@/lib/middleware/auth';

/**
 * GET /api/livestreams/[id]
 * Get single live stream details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: stream, error } = await supabaseAdmin
      .from('live_streams')
      .select('*, events(name, poster_image)')
      .eq('id', id)
      .single();

    if (error || !stream) {
      return errorResponse('Live stream not found', 404);
    }

    return successResponse(stream);
  } catch (error) {
    console.error('Get live stream error:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * PATCH /api/livestreams/[id]
 * Update live stream (Admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const { data: stream, error } = await supabaseAdmin
      .from('live_streams')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return errorResponse('Failed to update live stream', 500);
    }

    return successResponse(stream);
  } catch (error) {
    console.error('Update live stream error:', error);
    return errorResponse('Internal server error', 500);
  }
}
