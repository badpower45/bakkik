import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler } from '@/lib/middleware/error';
import { supabaseAdmin } from '@/lib/supabase/client';

/**
 * PUT /api/admin/tickets/[id]
 * Update ticket (admin only)
 */
export const PUT = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    const body = await request.json();
    
    const { data, error } = await supabaseAdmin
        .from('tickets')
        .update(body)
        .eq('id', params.id)
        .select()
        .single();

    if (error) {
        throw new Error('Failed to update ticket');
    }

    return successResponse(data);
});

/**
 * DELETE /api/admin/tickets/[id]
 * Delete ticket (admin only)
 */
export const DELETE = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    const { error } = await supabaseAdmin
        .from('tickets')
        .delete()
        .eq('id', params.id);

    if (error) {
        throw new Error('Failed to delete ticket');
    }

    return successResponse({ message: 'Ticket deleted successfully' });
});
