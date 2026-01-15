import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler } from '@/lib/middleware/error';

/**
 * GET /api/fights/latest
 * Get latest fight results (completed fights)
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const { data: fights, error } = await supabaseAdmin
        .from('fights')
        .select(`
      *,
      event:events(id, name, event_date),
      fighter1:fighters!fights_fighter1_id_fkey(id, nickname, profile_picture, record_wins, record_losses),
      fighter2:fighters!fights_fighter2_id_fkey(id, nickname, profile_picture, record_wins, record_losses),
      weight_class:weight_classes(id, name, name_arabic),
      winner:fighters!fights_winner_id_fkey(id, nickname)
    `)
        .eq('status', 'completed')
        .not('winner_id', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(limit);

    if (error) {
        throw new Error('Failed to fetch latest fights');
    }

    return successResponse(fights || []);
});
