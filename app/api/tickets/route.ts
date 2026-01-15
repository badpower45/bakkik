import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler } from '@/lib/middleware/error';
import { supabaseAdmin } from '@/lib/supabase/client';

/**
 * GET /api/tickets
 * Get user's tickets
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    // Get user ID
    const { data: userData } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

    if (!userData) {
        throw new Error('User not found');
    }

    let query = supabaseAdmin
        .from('tickets')
        .select(`
      *,
      event:events(id, name, event_date, location, poster_image),
      ticket_type:ticket_types(id, name, price)
    `)
        .eq('user_id', userData.id)
        .eq('payment_status', 'completed')
        .order('purchased_at', { ascending: false });

    if (eventId) {
        query = query.eq('event_id', eventId);
    }

    const { data: tickets, error } = await query;

    if (error) {
        throw new Error('Failed to fetch tickets');
    }

    return successResponse(tickets || []);
});
