import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler, ValidationError } from '@/lib/middleware/error';
import { supabaseAdmin } from '@/lib/supabase/client';
import { z } from 'zod';

// Validation schema
const createEventSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),
    event_date: z.string(), // ISO date
    location: z.string().min(1),
    poster_image: z.string().url().nullable().optional(),
    registration_open_at: z.string().optional(),
    registration_close_at: z.string().optional(),
    registration_fee: z.number().optional(),
    registration_paid: z.boolean().default(false),
    registration_enabled: z.boolean().default(true),
    status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).default('upcoming'),
    live_stream_enabled: z.boolean().default(false),
    stream_price: z.number().optional(),
    stream_url: z.string().url().optional(),
});

/**
 * POST /api/admin/events
 * Create new event (admin only)
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
    await requireAdmin(request);

    const body = await request.json();

    // Validate
    const validation = createEventSchema.safeParse(body);
    if (!validation.success) {
        throw new ValidationError(JSON.stringify(validation.error.flatten().fieldErrors));
    }

    const data = validation.data;

    // Create event
    const { data: event, error } = await supabaseAdmin
        .from('events')
        .insert({
            id: data.id,
            name: data.name,
            description: data.description,
            event_date: data.event_date,
            location: data.location,
            poster_image: data.poster_image,
            registration_open_at: data.registration_open_at,
            registration_close_at: data.registration_close_at,
            registration_fee: data.registration_fee,
            registration_paid: data.registration_paid,
            registration_enabled: data.registration_enabled,
            status: data.status,
            live_stream_enabled: data.live_stream_enabled,
            stream_price: data.stream_price,
            stream_url: data.stream_url,
        })
        .select()
        .single();

    if (error) {
        throw new Error('Failed to create event: ' + error.message);
    }

    return successResponse(event, 201);
});
