import { NextRequest } from 'next/server';
import { supabase } from '../supabase/client';

export interface AuthenticatedRequest extends NextRequest {
    user?: {
        id: string;
        email?: string;
        role?: string;
    };
}

/**
 * Authentication middleware for API routes
 * Extracts and validates JWT token from Authorization header
 */
export async function requireAuth(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        throw new Error('Missing token');
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        throw new Error('Invalid or expired token');
    }

    return user;
}

/**
 * Optional authentication - doesn't throw if not authenticated
 */
export async function optionalAuth(request: NextRequest) {
    try {
        return await requireAuth(request);
    } catch {
        return null;
    }
}

/**
 * Require admin role
 */
export async function requireAdmin(request: NextRequest) {
    const user = await requireAuth(request);

    // Check if user is admin in users table
    const { data: userData, error } = await supabase
        .from('users')
        .select('user_type')
        .eq('auth_id', user.id)
        .single();

    if (error || !userData || userData.user_type !== 'admin') {
        throw new Error('Admin access required');
    }

    return user;
}

// Export alias for compatibility
export const verifyAdmin = requireAdmin;
