import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { successResponse, errorResponse, notFoundError } from '@/lib/response';

/**
 * GET /api/events/next
 * Get the next upcoming event
 */
export async function GET(request: NextRequest) {
  try {
    const now = new Date().toISOString();

    const { data: event, error } = await supabaseAdmin
      .from('events')
      .select(`
        *,
        ticket_types:ticket_types(*),
        sponsors:sponsors(*),
        fights:fights(
          *,
          fighter1:fighters!fights_fighter1_id_fkey(id, nickname, profile_picture),
          fighter2:fighters!fights_fighter2_id_fkey(id, nickname, profile_picture)
        )
      `)
      .eq('status', 'upcoming')
      .gte('event_date', now)
      .order('event_date', { ascending: true })
      .limit(1)
      .single();

    if (error || !event) {
      return notFoundError('No upcoming events found');
    }

    return successResponse(event);

  } catch (error) {
    console.error('Get next event error:', error);
    return errorResponse('Internal server error', 500);
  }
}
