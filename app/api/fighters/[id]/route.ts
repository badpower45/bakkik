import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { successResponse, errorResponse, notFoundError } from '@/lib/response';

/**
 * GET /api/fighters/[id]
 * Get single fighter by ID with full details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get fighter with user data
    const { data: fighter, error: fighterError } = await supabaseAdmin
      .from('fighters')
      .select(`
        *,
        user:users(id, name, email, phone),
        weight_class:weight_classes(id, name, name_arabic, weight_kg)
      `)
      .eq('id', id)
      .single();

    if (fighterError || !fighter) {
      return notFoundError('Fighter not found');
    }

    // Get fight history
    const { data: fights } = await supabaseAdmin
      .from('fights')
      .select(`
        *,
        event:events(id, name, event_date),
        opponent:fighters!fights_fighter2_id_fkey(id, nickname, profile_picture),
        weight_class:weight_classes(name, name_arabic)
      `)
      .or(`fighter1_id.eq.${id},fighter2_id.eq.${id}`)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(10);

    // Get media/highlights
    const { data: media } = await supabaseAdmin
      .from('media')
      .select('*')
      .eq('fighter_id', id)
      .order('created_at', { ascending: false })
      .limit(6);

    return successResponse({
      ...fighter,
      fightHistory: fights || [],
      media: media || [],
    });

  } catch (error) {
    console.error('Get fighter error:', error);
    return errorResponse('Internal server error', 500);
  }
}
