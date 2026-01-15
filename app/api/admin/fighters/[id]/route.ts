import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler, ValidationError, NotFoundError } from '@/lib/middleware/error';
import { supabaseAdmin } from '@/lib/supabase/client';
import { z } from 'zod';

const updateFighterSchema = z.object({
    nickname: z.string().min(1).optional(),
    full_name: z.string().min(1).optional(),
    nationality: z.string().optional(),
    weight_class_id: z.number().optional(),
    height: z.number().optional(),
    weight: z.number().optional(),
    age: z.number().optional(),
    stylistics: z.string().optional(),
    place: z.string().optional(),
    gym_team: z.string().optional(),
    coach: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    facebook_link: z.string().url().optional(),
    instagram_link: z.string().url().optional(),
    sherdog_link: z.string().url().optional(),
    tapology_link: z.string().url().optional(),
    record_wins: z.number().optional(),
    record_losses: z.number().optional(),
    record_draws: z.number().optional(),
    profile_picture: z.string().url().optional(),
    bio: z.string().optional(),
    status: z.enum(['pending', 'approved', 'rejected', 'suspended', 'retired']).optional(),
});

/**
 * PUT /api/admin/fighters/[id]
 * Update fighter (admin only)
 */
export const PUT = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    await requireAdmin(request);

    const body = await request.json();
    const validation = updateFighterSchema.safeParse(body);

    if (!validation.success) {
        throw new ValidationError(JSON.stringify(validation.error.flatten().fieldErrors));
    }

    const { data: fighter, error } = await supabaseAdmin
        .from('fighters')
        .update(validation.data)
        .eq('id', params.id)
        .select()
        .single();

    if (error || !fighter) {
        throw new NotFoundError('Fighter not found');
    }

    if (validation.data.status === 'approved') {
        await supabaseAdmin
            .from('users')
            .update({ user_type: 'fighter' })
            .eq('id', fighter.user_id);
    }

    return successResponse(fighter);
});

/**
 * DELETE /api/admin/fighters/[id]
 * Delete fighter (admin only)
 */
export const DELETE = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    await requireAdmin(request);

    const { error } = await supabaseAdmin
        .from('fighters')
        .delete()
        .eq('id', params.id);

    if (error) {
        throw new Error('Failed to delete fighter: ' + error.message);
    }

    return successResponse({ deleted: true });
});
