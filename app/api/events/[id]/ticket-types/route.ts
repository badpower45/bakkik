import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler } from '@/lib/middleware/error';
import { supabaseAdmin } from '@/lib/supabase/client';

/**
 * GET /api/events/[id]/ticket-types
 * Get available ticket types for an event
 */
export const GET = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    const { data: ticketTypes, error } = await supabaseAdmin
        .from('ticket_types')
        .select('*')
        .eq('event_id', params.id)
        .eq('is_active', true)
        .order('price', { ascending: true });

    if (error) {
        throw new Error('Failed to fetch ticket types');
    }

    // Get sold count for each ticket type
    const ticketTypesWithAvailability = await Promise.all(
        (ticketTypes || []).map(async (type) => {
            const { count } = await supabaseAdmin
                .from('tickets')
                .select('*', { count: 'exact', head: true })
                .eq('ticket_type_id', type.id)
                .eq('payment_status', 'completed');

            const sold = count || 0;
            const available = type.quantity - sold;

            return {
                ...type,
                sold,
                available,
                is_sold_out: available <= 0,
            };
        })
    );

    return successResponse(ticketTypesWithAvailability);
});
