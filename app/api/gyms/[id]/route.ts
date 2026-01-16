import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/response';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/gyms/[id]
 * Get gym details with statistics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { id } = params;
    
    // Get gym with statistics from view
    const { data: gym, error: gymError } = await supabase
      .from('gym_statistics')
      .select('*')
      .eq('id', id)
      .single();
    
    if (gymError) throw gymError;
    
    // Get fighters from this gym
    const { data: fighters, error: fightersError } = await supabase
      .from('fighters')
      .select('id, nickname, profile_picture, record_wins, record_losses, record_draws, weight_class_id, titles')
      .eq('gym_id', id)
      .eq('status', 'approved')
      .order('record_wins', { ascending: false })
      .limit(10);
    
    if (fightersError) throw fightersError;
    
    return successResponse({
      ...gym,
      fighters
    }, 'Gym details retrieved successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

/**
 * PATCH /api/gyms/[id]
 * Update gym details (Admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { id } = params;
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('gyms')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return successResponse(data, 'Gym updated successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
