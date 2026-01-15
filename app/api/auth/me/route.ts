import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler } from '@/lib/middleware/error';
import { supabase } from '@/lib/supabase/client';

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await requireAuth(request);

  // Get user data from database
  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single();

  if (error || !userData) {
    throw new Error('User not found');
  }

  return successResponse({
    id: userData.id,
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    profilePicture: userData.profile_picture,
    userType: userData.user_type,
    isAdmin: userData.is_admin || false, // ← Added admin field
    createdAt: userData.created_at,
  });
});
