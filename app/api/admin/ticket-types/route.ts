import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler } from '@/lib/middleware/error';
import { supabaseAdmin } from '@/lib/supabase/client';
import { z } from 'zod';

const ticketTypeSchema = z.object({
    event_id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    price: z.number(),
    available_seats: z.number().int().positive(),
    total_seats: z.number().int().positive(),
    currency: z.string().optional().default('EGP'),
});

/**
 * POST /api/admin/ticket-types
 * Create ticket type (admin only)
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
    const body = await request.json();
    const validation = ticketTypeSchema.safeParse(body);

    if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
    }

    const { data, error } = await supabaseAdmin
        .from('ticket_types')
        .insert(validation.data)
        .select()
        .single();

    if (error) {
        throw new Error('Failed to create ticket type');
    }

    return successResponse(data, 201);
});
