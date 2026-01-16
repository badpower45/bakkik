import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler, ValidationError, NotFoundError } from '@/lib/middleware/error';
import { supabaseAdmin } from '@/lib/supabase/client';
import { z } from 'zod';

const updateNewsSchema = z.object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    image_url: z.string().url().nullable().optional(),
    event_id: z.string().nullable().optional(),
    fighter_id: z.string().uuid().nullable().optional(),
    published: z.boolean().optional(),
});

/**
 * PUT /api/admin/news/[id]
 * Update news article (admin only)
 */
export const PUT = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    await requireAdmin(request);

    const body = await request.json();
    const validation = updateNewsSchema.safeParse(body);

    if (!validation.success) {
        throw new ValidationError(JSON.stringify(validation.error.flatten().fieldErrors));
    }

    const data = validation.data;

    // If publishing for first time, set published_at
    if (data.published === true) {
        const { data: existing } = await supabaseAdmin
            .from('news')
            .select('published_at')
            .eq('id', params.id)
            .single();

        if (existing && !existing.published_at) {
            (data as any).published_at = new Date().toISOString();
        }
    }

    const { data: article, error } = await supabaseAdmin
        .from('news')
        .update(data)
        .eq('id', params.id)
        .select()
        .single();

    if (error || !article) {
        throw new NotFoundError('News article not found');
    }

    return successResponse(article);
});

/**
 * DELETE /api/admin/news/[id]
 * Delete news article (admin only)
 */
export const DELETE = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    await requireAdmin(request);

    const { error } = await supabaseAdmin
        .from('news')
        .delete()
        .eq('id', params.id);

    if (error) {
        throw new Error('Failed to delete news: ' + error.message);
    }

    return successResponse({ deleted: true });
});
