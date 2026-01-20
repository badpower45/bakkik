import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler } from '@/lib/middleware/error';
import { supabaseAdmin } from '@/lib/supabase/client';

/**
 * GET /api/admin/managers
 * Get all users with manager role
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
    await requireAdmin(request);

    const { data: managers, error } = await supabaseAdmin
        .from('users')
        .select('id, name, email, user_type')
        .eq('user_type', 'manager')
        .order('name', { ascending: true });

    if (error) {
        throw new Error('Failed to fetch managers: ' + error.message);
    }

    return successResponse(managers || []);
});
