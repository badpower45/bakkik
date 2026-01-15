import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler, ValidationError } from '@/lib/middleware/error';
import { supabaseAdmin } from '@/lib/supabase/client';
import { z } from 'zod';

// Validation schema
const createFighterSchema = z.object({
    user_id: z.string().uuid().optional(),
    user_email: z.string().email().optional(),
    full_name: z.string().min(1),
    nickname: z.string().min(1),
    nationality: z.string().optional(),
    weight_class_id: z.number(),
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
    record_wins: z.number().default(0),
    record_losses: z.number().default(0),
    record_draws: z.number().default(0),
    profile_picture: z.string().url().optional(),
    bio: z.string().optional(),
    status: z.enum(['pending', 'approved', 'rejected', 'suspended', 'retired']).default('approved'),
});

/**
 * GET /api/admin/fighters
 * Get all fighters (admin only)
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const weightClassId = searchParams.get('weightClassId');

    let query = supabaseAdmin
        .from('fighters')
        .select(`
            *,
            user:users(id, name, email, phone),
            weight_class:weight_classes(id, name, name_arabic, weight_kg)
        `)
        .order('created_at', { ascending: false });

    if (status && status !== 'all') {
        query = query.eq('status', status);
    }

    if (weightClassId) {
        query = query.eq('weight_class_id', parseInt(weightClassId));
    }

    const { data: fighters, error } = await query;

    if (error) {
        throw new Error('Failed to fetch fighters: ' + error.message);
    }

    return successResponse(fighters);
});

/**
 * POST /api/admin/fighters
 * Create new fighter (admin only)
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
    await requireAdmin(request);

    const body = await request.json();

    // Validate
    const validation = createFighterSchema.safeParse(body);
    if (!validation.success) {
        throw new ValidationError(JSON.stringify(validation.error.flatten().fieldErrors));
    }

    const data = validation.data;

    if (!data.user_id && !data.user_email) {
        throw new ValidationError('user_id or user_email is required');
    }

    let userId = data.user_id;
    if (!userId && data.user_email) {
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('id, name, email, phone')
            .eq('email', data.user_email)
            .single();

        if (userError || !user) {
            throw new ValidationError('User not found for the provided email');
        }

        userId = user.id;
    }

    // Create fighter
    const { data: fighter, error } = await supabaseAdmin
        .from('fighters')
        .insert({
            user_id: userId,
            full_name: data.full_name,
            nickname: data.nickname,
            bio: data.bio,
            stylistics: data.stylistics,
            place: data.place,
            gym_team: data.gym_team,
            coach: data.coach,
            phone: data.phone,
            email: data.email,
            facebook_link: data.facebook_link,
            instagram_link: data.instagram_link,
            sherdog_link: data.sherdog_link,
            tapology_link: data.tapology_link,
            weight_class_id: data.weight_class_id,
            record_wins: data.record_wins,
            record_losses: data.record_losses,
            record_draws: data.record_draws,
            profile_picture: data.profile_picture,
            height: data.height,
            weight: data.weight,
            age: data.age,
            nationality: data.nationality,
            status: data.status,
        })
        .select()
        .single();

    if (error) {
        throw new Error('Failed to create fighter: ' + error.message);
    }

    return successResponse(fighter, 201);
});
