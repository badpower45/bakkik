import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/response';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/fighters/[id]/full
 * Get complete fighter profile with all related data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { id } = params;
    
    // Get full fighter info with gym from view
    const { data: fighter, error: fighterError } = await supabase
      .from('fighter_full_info')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fighterError) throw fighterError;
    
    // Get fight history
    const { data: fightHistory, error: historyError } = await supabase
      .from('fighter_fight_history')
      .select('*')
      .eq('fighter_id', id)
      .order('event_date', { ascending: false });
    
    if (historyError) throw historyError;
    
    // Get next fight
    const { data: nextFight, error: nextFightError } = await supabase
      .from('fighter_next_fights')
      .select('*')
      .eq('fighter_id', id)
      .single();
    
    // It's OK if there's no next fight
    
    // Get fighter media
    const { data: media, error: mediaError } = await supabase
      .from('media')
      .select('*')
      .eq('fighter_id', id)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (mediaError) throw mediaError;
    
    return successResponse({
      fighter,
      fight_history: fightHistory || [],
      next_fight: nextFight || null,
      media: media || []
    }, 'Fighter profile retrieved successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
