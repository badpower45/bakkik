import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/response';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/fighters/[id]/history
 * Get fighter's complete fight history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { id } = params;
    
    const { data, error } = await supabase
      .from('fighter_fight_history')
      .select('*')
      .eq('fighter_id', id)
      .order('event_date', { ascending: false });
    
    if (error) throw error;
    
    return successResponse(data, 'Fight history retrieved successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

/**
 * POST /api/fighters/[id]/history
 * Add fight to fighter's history
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { id } = params;
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('fighter_fight_history')
      .insert([{
        fighter_id: id,
        ...body
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return successResponse(data, 'Fight added to history successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
