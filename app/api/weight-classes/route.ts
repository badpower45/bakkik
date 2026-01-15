import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/response';

/**
 * GET /api/weight-classes
 * Get all weight classes
 */
export async function GET(request: NextRequest) {
  try {
    const { data: weightClasses, error } = await supabaseAdmin
      .from('weight_classes')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      return errorResponse('Failed to fetch weight classes', 500);
    }

    return successResponse(weightClasses);

  } catch (error) {
    console.error('Get weight classes error:', error);
    return errorResponse('Internal server error', 500);
  }
}
