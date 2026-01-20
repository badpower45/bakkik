import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler, ValidationError } from '@/lib/middleware/error';
import { supabaseAdmin } from '@/lib/supabase/client';
import { z } from 'zod';

const assignmentSchema = z.object({
    eventId: z.string().min(1),
    managerId: z.string().min(1),
});

/**
 * GET /api/admin/manager-assignments
 * Optional query params: eventId, managerId
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const managerId = searchParams.get('managerId');

    let query = supabaseAdmin
        .from('event_manager_assignments')
        .select(`
      event_id,
      manager_id,
      assigned_at,
      event:events(id, name, event_date, location),
      manager:users(id, name, email)
    `)
        .order('assigned_at', { ascending: false });

    if (eventId) {
        query = query.eq('event_id', eventId);
    }
    if (managerId) {
        query = query.eq('manager_id', managerId);
    }

    const { data: assignments, error } = await query;

    if (error) {
        throw new Error('Failed to fetch assignments: ' + error.message);
    }

    return successResponse(assignments || []);
});

/**
 * POST /api/admin/manager-assignments
 * Body: { eventId, managerId }
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
    await requireAdmin(request);

    const body = await request.json();
    const validation = assignmentSchema.safeParse(body);

    if (!validation.success) {
        throw new ValidationError('Invalid assignment data');
    }

    const { eventId, managerId } = validation.data;

    const { data, error } = await supabaseAdmin
        .from('event_manager_assignments')
        .insert({
            event_id: eventId,
            manager_id: managerId,
        })
        .select()
        .single();

    if (error) {
        throw new Error('Failed to assign manager: ' + error.message);
    }

    return successResponse(data, 201);
});

/**
 * DELETE /api/admin/manager-assignments
 * Body: { eventId, managerId }
 */
export const DELETE = withErrorHandler(async (request: NextRequest) => {
    await requireAdmin(request);

    const body = await request.json();
    const validation = assignmentSchema.safeParse(body);

    if (!validation.success) {
        throw new ValidationError('Invalid assignment data');
    }

    const { eventId, managerId } = validation.data;

    const { error } = await supabaseAdmin
        .from('event_manager_assignments')
        .delete()
        .eq('event_id', eventId)
        .eq('manager_id', managerId);

    if (error) {
        throw new Error('Failed to remove assignment: ' + error.message);
    }

    return successResponse({ success: true });
});
