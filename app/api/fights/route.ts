import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { successResponse, paginatedResponse } from '@/lib/utils/response';
import { withErrorHandler } from '@/lib/middleware/error';

/**
 * GET /api/fights
 * Get all fights with pagination and filtering
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const eventId = searchParams.get('eventId');
    const status = searchParams.get('status');
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
        .from('fights')
        .select(`
      *,
      event:events(id, name, event_date),
      fighter1:fighters!fights_fighter1_id_fkey(id, nickname, profile_picture, record_wins, record_losses),
      fighter2:fighters!fights_fighter2_id_fkey(id, nickname, profile_picture, record_wins, record_losses),
      weight_class:weight_classes(id, name, name_arabic),
      winner:fighters!fights_winner_id_fkey(id, nickname)
    `, { count: 'exact' })
        .order('scheduled_time', { ascending: false });

    if (eventId) {
        query = query.eq('event_id', eventId);
    }

    if (status) {
        query = query.eq('status', status);
    }

    const { data: fights, error, count } = await query
        .range(offset, offset + limit - 1);

    if (error) {
        throw new Error('Failed to fetch fights');
    }

    return paginatedResponse(fights || [], page, limit, count || 0);
});
