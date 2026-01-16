import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin';
import { successResponse, paginatedResponse } from '@/lib/utils/response';
import { withErrorHandler, ValidationError } from '@/lib/middleware/error';
import { supabaseAdmin } from '@/lib/supabase/client';
import { z } from 'zod';

const createNewsSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    image_url: z.string().url().nullable().optional(),
    event_id: z.string().nullable().optional(),
    fighter_id: z.string().uuid().nullable().optional(),
    published: z.boolean().default(false),
});

/**
 * GET /api/admin/news
 * Get all news (admin only)
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const { data: news, error, count } = await supabaseAdmin
        .from('news')
        .select(`
      *,
      author:users(id, name),
      event:events(id, name),
      fighter:fighters(id, nickname)
    `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        throw new Error('Failed to fetch news');
    }

    return paginatedResponse(news || [], page, limit, count || 0);
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
