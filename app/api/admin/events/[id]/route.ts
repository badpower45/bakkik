import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler, ValidationError, NotFoundError } from '@/lib/middleware/error';
import { supabaseAdmin } from '@/lib/supabase/client';
import { z } from 'zod';

// Validation schema
const updateEventSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    event_date: z.string().optional(),
    location: z.string().min(1).optional(),
    poster_image: z.string().url().nullable().optional(),
    registration_open_at: z.string().optional(),
    registration_close_at: z.string().optional(),
    registration_fee: z.number().optional(),
    registration_paid: z.boolean().optional(),
    registration_enabled: z.boolean().optional(),
    status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).optional(),
    live_stream_enabled: z.boolean().optional(),
    stream_price: z.number().optional(),
    stream_url: z.string().url().optional(),
});

/**
 * PUT /api/admin/events/[id]
 * Update event (admin only)
 */
export const PUT = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    await requireAdmin(request);

    const body = await request.json();

    // Validate
    const validation = updateEventSchema.safeParse(body);
    if (!validation.success) {
        throw new ValidationError(JSON.stringify(validation.error.flatten().fieldErrors));
    }

    const data = validation.data;

    // Update event
    const { data: event, error } = await supabaseAdmin
        .from('events')
        .update(data)
        .eq('id', params.id)
        .select()
        .single();

    if (error || !event) {
        throw new NotFoundError('Event not found');
    }

    return successResponse(event);
});

/**
 * DELETE /api/admin/events/[id]
 * Delete event (admin only)
 */
export const DELETE = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    await requireAdmin(request);

    const { error } = await supabaseAdmin
        .from('events')
        .delete()
        .eq('id', params.id);

    if (error) {
        throw new Error('Failed to delete event: ' + error.message);
    }

    return successResponse({ deleted: true });
});
