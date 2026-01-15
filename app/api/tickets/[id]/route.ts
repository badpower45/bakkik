import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler, NotFoundError } from '@/lib/middleware/error';
import { supabaseAdmin } from '@/lib/supabase/client';

/**
 * GET /api/tickets/[id]
 * Get ticket details with QR code
 */
export const GET = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    const user = await requireAuth(request);

    // Get user ID
    const { data: userData } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

    if (!userData) {
        throw new Error('User not found');
    }

    const { data: ticket, error } = await supabaseAdmin
        .from('tickets')
        .select(`
      *,
      event:events(id, name, event_date, location, poster_image, status),
      ticket_type:ticket_types(id, name, description, price),
      order:orders(id, order_number, total_amount)
    `)
        .eq('id', params.id)
        .eq('user_id', userData.id)
        .single();

    if (error || !ticket) {
        throw new NotFoundError('Ticket not found');
    }

    return successResponse(ticket);
});
