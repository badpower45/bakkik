import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler } from '@/lib/middleware/error';
import { supabase } from '@/lib/supabase/client';

/**
 * POST /api/auth/logout
 * Logout current user
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
    const user = await requireAuth(request);

    // Sign out from Supabase
    await supabase.auth.signOut();

    return successResponse({
        message: 'Logged out successfully',
    });
});
