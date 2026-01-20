import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/response';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/fighters/[id]/profile
 * Get fighter's detailed profile
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { id } = params;
    
    const { data, error } = await supabase
      .from('fighter_profiles')
      .select('*')
      .eq('fighter_id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found, which is OK
    
    return successResponse({
      profile: data || null,
      message: 'Fighter profile retrieved successfully',
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

/**
 * POST /api/fighters/[id]/profile
 * Create or update fighter's detailed profile
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
      .from('fighter_profiles')
      .upsert([{
        fighter_id: id,
        ...body,
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return successResponse({
      profile: data,
      message: 'Fighter profile updated successfully',
    }, 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
