import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/response';

/**
 * GET /api/livestreams
 * Get all live streams
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'scheduled', 'live', 'ended'
    const eventId = searchParams.get('eventId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('live_streams')
      .select('*')
      .order('scheduled_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data: streams, error } = await query;

    if (error) {
      return errorResponse('Failed to fetch live streams', 500);
    }

    return successResponse(streams);
  } catch (error) {
    console.error('Get live streams error:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * POST /api/livestreams
 * Create a new live stream (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      eventId,
      title,
      description,
      thumbnailUrl,
      streamUrl,
      price,
      scheduledAt,
    } = body;

    // Validate required fields
    if (!eventId || !title || !scheduledAt) {
      return errorResponse('Missing required fields', 400);
    }

    // Create live stream
    const { data: stream, error } = await supabaseAdmin
      .from('live_streams')
      .insert({
        event_id: eventId,
        title,
        description,
        thumbnail_url: thumbnailUrl,
        stream_url: streamUrl,
        price: price || 1.0,
        status: 'scheduled',
        viewers_count: 0,
        scheduled_at: scheduledAt,
      })
      .select()
      .single();

    if (error) {
      return errorResponse('Failed to create live stream', 500);
    }

    return successResponse(stream, 201);
  } catch (error) {
    console.error('Create live stream error:', error);
    return errorResponse('Internal server error', 500);
  }
}
