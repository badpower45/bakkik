import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { successResponse, paginatedResponse } from '@/lib/utils/response';
import { withErrorHandler } from '@/lib/middleware/error';

/**
 * GET /api/events
 * Get all events with pagination and filtering
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status');
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('events')
    .select('*, ticket_types(count), fights(count)', { count: 'exact' })
    .order('event_date', { ascending: true });

  if (status) {
    query = query.eq('status', status);
  }

  const { data: events, error, count } = await query
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error('Failed to fetch events');
  }

  return paginatedResponse(events || [], page, limit, count || 0);
});
