import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler, NotFoundError } from '@/lib/middleware/error';

/**
 * GET /api/news/[id]
 * Get news article details
 */
export const GET = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    const { data: article, error } = await supabaseAdmin
        .from('news')
        .select(`
      *,
      author:users(id, name, profile_picture),
      event:events(id, name, event_date),
      fighter:fighters(id, nickname, profile_picture)
    `)
        .eq('id', params.id)
        .eq('published', true)
        .single();

    if (error || !article) {
        throw new NotFoundError('News article not found');
    }

    return successResponse(article);
});
