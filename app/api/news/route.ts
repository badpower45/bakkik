import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { successResponse, paginatedResponse } from '@/lib/utils/response';
import { withErrorHandler } from '@/lib/middleware/error';

/**
 * GET /api/news
 * Get all published news with pagination
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const featured = searchParams.get('featured') === 'true';
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
        .from('news')
        .select(`
      *,
      author:users(id, name),
      event:events(id, name),
      fighter:fighters(id, nickname)
    `, { count: 'exact' })
        .eq('published', true)
        .order('published_at', { ascending: false });

    if (featured) {
        // يمكن إضافة منطق featured news هنا
        // مثلاً: آخر 3 أخبار
        query = query.limit(3);
    }

    const { data: news, error, count } = await query
        .range(offset, offset + limit - 1);

    if (error) {
        throw new Error('Failed to fetch news');
    }

    return paginatedResponse(news || [], page, limit, count || 0);
});
