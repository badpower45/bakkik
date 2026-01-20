import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler } from '@/lib/middleware/error';
import { supabaseAdmin } from '@/lib/supabase/client';

/**
 * GET /api/admin/tickets
 * Get all tickets (admin only)
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('event_id');
    const status = searchParams.get('status');

    let query = supabaseAdmin
        .from('tickets')
        .select(`
            *,
            user:users!tickets_user_id_fkey(id, name, email),
            event:events!tickets_event_id_fkey(id, name, event_date, location),
            ticket_type:ticket_types!tickets_ticket_type_id_fkey(id, name, price)
        `)
        .order('purchased_at', { ascending: false });

    if (eventId) {
        query = query.eq('event_id', eventId);
    }

    if (status && status !== 'all') {
        query = query.eq('payment_status', status);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error('Failed to fetch tickets');
    }

    return successResponse(data || []);
});
