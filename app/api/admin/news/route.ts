import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler, ValidationError } from '@/lib/middleware/error';
import { supabaseAdmin } from '@/lib/supabase/client';
import { z } from 'zod';

const createNewsSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    image_url: z.string().url().optional(),
    event_id: z.string().nullable().optional(),
    fighter_id: z.string().uuid().nullable().optional(),
    published: z.boolean().default(false),
});

/**
 * POST /api/admin/news
 * Create news article (admin only)
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
    const { userData } = await requireAdmin(request);

    const body = await request.json();
    const validation = createNewsSchema.safeParse(body);

    if (!validation.success) {
        throw new ValidationError(JSON.stringify(validation.error.flatten().fieldErrors));
    }

    const data = validation.data;

    const { data: article, error } = await supabaseAdmin
        .from('news')
        .insert({
            ...data,
            author_id: userData.id,
            published_at: data.published ? new Date().toISOString() : null,
        })
        .select()
        .single();

    if (error) {
        throw new Error('Failed to create news: ' + error.message);
    }

    return successResponse(article, 201);
});
