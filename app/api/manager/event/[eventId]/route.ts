import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler } from '@/lib/middleware/error';
import { supabaseAdmin } from '@/lib/supabase/client';

/**
 * GET /api/manager/event/[eventId]
 * Get event tickets and stats for manager
 */
export const GET = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: { eventId: string } }
) => {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // all, checked_in, pending

    // Get stats
    const { data: stats } = await supabaseAdmin
        .from('ticket_stats')
        .select('*')
        .eq('event_id', params.eventId)
        .single();

    // Get tickets
    let query = supabaseAdmin
        .from('tickets')
        .select(`
      *,
      ticket_type:ticket_types(id, name, price),
      user:users(id, name, email),
      checked_in_by_user:users!tickets_checked_in_by_fkey(id, name)
    `)
        .eq('event_id', params.eventId)
        .eq('payment_status', 'completed')
        .order('created_at', { ascending: false });

    if (status === 'checked_in') {
        query = query.eq('checked_in', true);
    } else if (status === 'pending') {
        query = query.eq('checked_in', false);
    }

    const { data: tickets, error } = await query;

    if (error) {
        throw new Error('Failed to fetch tickets');
    }

    return successResponse({
        stats: stats || {
            total_tickets: 0,
            checked_in_count: 0,
            pending_count: 0,
        },
        tickets: tickets || [],
    });
});
