import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/response';

/**
 * GET /api/fighters
 * Get all fighters or filter by weight class/status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weightClassId = searchParams.get('weightClassId');
    const status = searchParams.get('status') || 'approved';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('fighters')
      .select(`
        *,
        user:users(name, email),
        weight_class:weight_classes(name, name_arabic, weight_kg)
      `)
      .eq('status', status)
      .order('record_wins', { ascending: false })
      .range(offset, offset + limit - 1);

    if (weightClassId) {
      query = query.eq('weight_class_id', parseInt(weightClassId));
    }

    const { data: fighters, error } = await query;

    if (error) {
      return errorResponse('Failed to fetch fighters', 500);
    }

    return successResponse(fighters);

  } catch (error) {
    console.error('Get fighters error:', error);
    return errorResponse('Internal server error', 500);
  }
}
