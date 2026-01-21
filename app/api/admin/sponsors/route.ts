import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler } from '@/lib/middleware/error';

/**
 * GET /api/admin/sponsors
 * Get all sponsors (admin only)
 */
export const GET = withErrorHandler(async (_request: NextRequest) => {
    const { data, error } = await supabaseAdmin
        .from('sponsors')
        .select(`
      *,
      event:events(id, name, event_date, status)
    `)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error('Failed to fetch sponsors: ' + error.message);
    }

    return successResponse(data || []);
});

/**
 * POST /api/admin/sponsors
 * Create a new sponsor (admin only)
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
    const body = await request.json();
    const { event_id, name, logo_url, website } = body;

    // Validation
    if (!event_id || !name) {
        throw new Error('event_id and name are required');
    }

    // Verify event exists
    const { data: event } = await supabaseAdmin
        .from('events')
        .select('id')
        .eq('id', event_id)
        .single();

    if (!event) {
        throw new Error('Event not found');
    }

    const { data, error } = await supabaseAdmin
        .from('sponsors')
        .insert({
            event_id,
            name,
            logo_url: logo_url || null,
            website: website || null,
        })
        .select()
        .single();

    if (error) {
        throw new Error('Failed to create sponsor: ' + error.message);
    }

    return successResponse(data, 201);
});
