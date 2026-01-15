import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { successResponse, errorResponse, notFoundError } from '@/lib/response';

/**
 * GET /api/events/[id]
 * Get single event by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get event
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (eventError || !event) {
      return notFoundError('Event not found');
    }

    // Get ticket types
    const { data: ticketTypes } = await supabaseAdmin
      .from('ticket_types')
      .select('*')
      .eq('event_id', id);

    // Get sponsors
    const { data: sponsors } = await supabaseAdmin
      .from('sponsors')
      .select('*')
      .eq('event_id', id);

    // Get fights
    const { data: fights } = await supabaseAdmin
      .from('fights')
      .select(`
        *,
        fighter1:fighters!fights_fighter1_id_fkey(id, nickname, profile_picture, record_wins, record_losses, record_draws),
        fighter2:fighters!fights_fighter2_id_fkey(id, nickname, profile_picture, record_wins, record_losses, record_draws),
        weight_class:weight_classes(name, name_arabic)
      `)
      .eq('event_id', id)
      .order('fight_type', { ascending: true });

    return successResponse({
      ...event,
      ticketTypes: ticketTypes || [],
      sponsors: sponsors || [],
      fights: fights || [],
    });

  } catch (error) {
    console.error('Get event error:', error);
    return errorResponse('Internal server error', 500);
  }
}
