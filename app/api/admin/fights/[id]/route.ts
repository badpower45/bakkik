import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler, ValidationError, NotFoundError } from '@/lib/middleware/error';
import { supabaseAdmin } from '@/lib/supabase/client';
import { z } from 'zod';

const updateFightSchema = z.object({
    event_id: z.string().optional(),
    fighter1_id: z.string().uuid().nullable().optional(),
    fighter2_id: z.string().uuid().nullable().optional(),
    weight_class_id: z.number().optional(),
    scheduled_time: z.string().optional(),
    fight_type: z.enum(['mainEvent', 'coMain', 'undercard']).optional(),
    bracket_round: z.enum(['round_of_16', 'quarterfinal', 'semifinal', 'final', 'bronze', 'exhibition']).optional(),
    bracket_position: z.number().optional(),
    next_fight_id: z.string().uuid().nullable().optional(),
    next_fight_slot: z.enum(['fighter1', 'fighter2']).nullable().optional(),
    status: z.enum(['scheduled', 'ongoing', 'completed', 'cancelled']).optional(),
    winner_id: z.string().uuid().nullable().optional(),
    win_method: z.enum(['ko', 'tko', 'submission', 'decision', 'disqualification', 'draw', 'no_contest']).nullable().optional(),
    round: z.number().nullable().optional(),
    time: z.string().nullable().optional(),
});

/**
 * PUT /api/admin/fights/[id]
 * Update fight (admin only)
 */
export const PUT = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    await requireAdmin(request);

    const body = await request.json();
    const validation = updateFightSchema.safeParse(body);

    if (!validation.success) {
        throw new ValidationError(JSON.stringify(validation.error.flatten().fieldErrors));
    }

    const { data: fight, error } = await supabaseAdmin
        .from('fights')
        .update(validation.data)
        .eq('id', params.id)
        .select()
        .single();

    if (error || !fight) {
        throw new NotFoundError('Fight not found');
    }

    return successResponse(fight);
});

/**
 * DELETE /api/admin/fights/[id]
 * Delete fight (admin only)
 */
export const DELETE = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    await requireAdmin(request);

    const { error } = await supabaseAdmin
        .from('fights')
        .delete()
        .eq('id', params.id);

    if (error) {
        throw new Error('Failed to delete fight: ' + error.message);
    }

    return successResponse({ deleted: true });
});
