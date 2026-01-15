import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler, ValidationError } from '@/lib/middleware/error';
import { supabaseAdmin } from '@/lib/supabase/client';
import { z } from 'zod';

const createFightSchema = z.object({
    event_id: z.string(),
    fighter1_id: z.string().uuid().optional().nullable(),
    fighter2_id: z.string().uuid().optional().nullable(),
    weight_class_id: z.number(),
    scheduled_time: z.string().optional(), // ISO datetime
    status: z.enum(['scheduled', 'ongoing', 'completed', 'cancelled']).default('scheduled'),
    fight_type: z.enum(['mainEvent', 'coMain', 'undercard']).default('undercard'),
    bracket_round: z.enum(['round_of_16', 'quarterfinal', 'semifinal', 'final', 'bronze', 'exhibition']).optional(),
    bracket_position: z.number().optional(),
    next_fight_id: z.string().uuid().optional().nullable(),
    next_fight_slot: z.enum(['fighter1', 'fighter2']).optional(),
});

/**
 * POST /api/admin/fights
 * Create new fight (admin only)
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
    await requireAdmin(request);

    const body = await request.json();
    const validation = createFightSchema.safeParse(body);

    if (!validation.success) {
        throw new ValidationError(JSON.stringify(validation.error.flatten().fieldErrors));
    }

    const data = validation.data;

    // Validate fighters exist if provided
    if (data.fighter1_id) {
        const { data: fighter1 } = await supabaseAdmin
            .from('fighters')
            .select('id')
            .eq('id', data.fighter1_id)
            .single();
        if (!fighter1) {
            throw new ValidationError('Fighter1 not found');
        }
    }

    if (data.fighter2_id) {
        const { data: fighter2 } = await supabaseAdmin
            .from('fighters')
            .select('id')
            .eq('id', data.fighter2_id)
            .single();
        if (!fighter2) {
            throw new ValidationError('Fighter2 not found');
        }
    }

    // Create fight
    const { data: fight, error } = await supabaseAdmin
        .from('fights')
        .insert(data)
        .select()
        .single();

    if (error) {
        throw new Error('Failed to create fight: ' + error.message);
    }

    return successResponse(fight, 201);
});
