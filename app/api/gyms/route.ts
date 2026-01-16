import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/response';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/gyms
 * Get all gyms/clubs
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const verified = searchParams.get('verified');
    
    let query = supabase
      .from('gyms')
      .select('*')
      .eq('status', 'active')
      .order('name');
    
    if (city) {
      query = query.eq('city', city);
    }
    
    if (verified) {
      query = query.eq('verified', verified === 'true');
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return successResponse(data, 'Gyms retrieved successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

/**
 * POST /api/gyms
 * Create a new gym (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('gyms')
      .insert([body])
      .select()
      .single();
    
    if (error) throw error;
    
    return successResponse(data, 'Gym created successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
