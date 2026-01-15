import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler } from '@/lib/middleware/error';

/**
 * GET /api/banners
 * Get active home banners
 */
export const GET = withErrorHandler(async (_request: NextRequest) => {
  const now = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('home_banners')
    .select(
      `
      *,
      event:events(id, name, event_date, location, poster_image, registration_enabled, registration_open_at, registration_close_at)
      `
    )
    .eq('is_active', true)
    .or(`start_at.is.null,start_at.lte.${now}`)
    .or(`end_at.is.null,end_at.gte.${now}`)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch banners: ' + error.message);
  }

  return successResponse(data || []);
});
