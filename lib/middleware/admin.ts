import { NextRequest } from 'next/server';
import { supabaseAdmin } from '../supabase/client';
import { UnauthorizedError, ForbiddenError } from './error';

/**
 * Require admin role
 * Use this middleware for admin-only endpoints
 */
export async function requireAdmin(request: NextRequest) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);

    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
        throw new UnauthorizedError('Invalid token');
    }

    // Get user from database to check admin status
    const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, email, name, is_admin')
        .eq('auth_id', user.id)
        .single();

    if (userError || !userData) {
        throw new UnauthorizedError('User not found');
    }

    // Check if user is admin
    if (!userData.is_admin) {
        throw new ForbiddenError('Admin access required');
    }

    return {
        user,
        userData,
    };
}
