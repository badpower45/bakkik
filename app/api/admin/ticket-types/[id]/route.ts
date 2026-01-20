import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler } from '@/lib/middleware/error';
import { supabaseAdmin } from '@/lib/supabase/client';

/**
 * PUT /api/admin/ticket-types/[id]
 * Update ticket type (admin only)
 */
export const PUT = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    const body = await request.json();
    
    const { data, error } = await supabaseAdmin
        .from('ticket_types')
        .update(body)
        .eq('id', params.id)
        .select()
        .single();

    if (error) {
        throw new Error('Failed to update ticket type');
    }

    return successResponse(data);
});

/**
 * DELETE /api/admin/ticket-types/[id]
 * Delete ticket type (admin only)
 */
export const DELETE = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    // Check if any tickets have been sold for this type
    const { count } = await supabaseAdmin
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('ticket_type_id', params.id)
        .eq('payment_status', 'completed');

    if (count && count > 0) {
        throw new Error('Cannot delete ticket type with sold tickets');
    }

    const { error } = await supabaseAdmin
        .from('ticket_types')
        .delete()
        .eq('id', params.id);

    if (error) {
        throw new Error('Failed to delete ticket type');
    }

    return successResponse({ message: 'Ticket type deleted successfully' });
});
