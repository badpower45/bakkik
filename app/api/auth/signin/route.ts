import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { withErrorHandler, ValidationError } from '@/lib/middleware/error';
import { z } from 'zod';

// Validation schema
const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * POST /api/auth/signin
 * Sign in user
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();

  // Validate input
  const validation = signinSchema.safeParse(body);
  if (!validation.success) {
    throw new ValidationError(JSON.stringify(validation.error.flatten().fieldErrors));
  }

  const { email, password } = validation.data;

  // Sign in with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user || !authData.session) {
    return errorResponse('البريد الإلكتروني أو كلمة المرور غير صحيحة', 401);
  }

  // Get user data from database
  const { data: user, error: dbError } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authData.user.id)
    .single();

  if (dbError || !user) {
    return errorResponse('User profile not found', 404);
  }

  return successResponse({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePicture: user.profile_picture,
      userType: user.user_type,
      isAdmin: user.is_admin || false, // ← Added admin field
    },
    token: authData.session.access_token, // Use Supabase session token
    refreshToken: authData.session.refresh_token,
  });
});
