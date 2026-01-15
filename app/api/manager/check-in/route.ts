import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler, ValidationError } from '@/lib/middleware/error';
import { supabaseAdmin } from '@/lib/supabase/client';
import { z } from 'zod';

const checkInSchema = z.object({
    ticketId: z.string().uuid(),
});

/**
 * POST /api/manager/check-in
 * Check in a ticket
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
    const { userData } = await requireAdmin(request);

    const body = await request.json();
    const validation = checkInSchema.safeParse(body);

    if (!validation.success) {
        throw new ValidationError('Invalid ticket ID');
    }

    const { ticketId } = validation.data;

    // Call stored function to check in
    const { data, error } = await supabaseAdmin
        .rpc('check_in_ticket', {
            p_ticket_id: ticketId,
            p_manager_id: userData.id,
        });

    if (error) {
        throw new Error('Check-in failed: ' + error.message);
    }

    const result = data as any;

    if (!result.success) {
        return successResponse({
            success: false,
            error: result.error,
            checked_in_at: result.checked_in_at,
        }, 400);
    }

    // Get updated ticket
    const { data: ticket } = await supabaseAdmin
        .from('tickets')
        .select(`
      *,
      event:events(id, name, event_date),
      ticket_type:ticket_types(id, name),
      user:users(id, name, email)
    `)
        .eq('id', ticketId)
        .single();

    return successResponse({
        success: true,
        message: 'Ticket checked in successfully',
        ticket,
    });
});
