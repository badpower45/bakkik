import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/response';

/**
 * GET /api/fighters/champions
 * Get current champions for all weight classes
 */
export async function GET(request: NextRequest) {
  try {
    const { data: champions, error } = await supabaseAdmin
      .from('current_champions')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      return errorResponse('Failed to fetch champions', 500);
    }

    return successResponse(champions);

  } catch (error) {
    console.error('Get champions error:', error);
    return errorResponse('Internal server error', 500);
  }
}
