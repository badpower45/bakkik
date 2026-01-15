import { NextRequest } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase/client';
import { successResponse, errorResponse, createdResponse } from '@/lib/utils/response';
import { withErrorHandler, ValidationError } from '@/lib/middleware/error';
import { z } from 'zod';

// Validation schema
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  userType: z.enum(['fan', 'fighter', 'admin']).default('fan'),
});

/**
 * POST /api/auth/signup
 * Register a new user
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();

  // Validate input
  const validation = signupSchema.safeParse(body);
  if (!validation.success) {
    throw new ValidationError(JSON.stringify(validation.error.flatten().fieldErrors));
  }

  const { name, email, password, phone, userType } = validation.data;

  // Check if user already exists
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('email')
    .eq('email', email)
    .single();

  if (existingUser) {
    return errorResponse('Email already registered', 409);
  }

  // Create user in Supabase Auth
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authUser.user) {
    return errorResponse('Failed to create user account', 500);
  }

  // Create user record in database
  const { data: user, error: dbError } = await supabaseAdmin
    .from('users')
    .insert({
      auth_id: authUser.user.id,
      name,
      email,
      phone: phone || null,
      user_type: userType,
    })
    .select()
    .single();

  if (dbError || !user) {
    // Rollback: Delete auth user if database insert fails
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
    return errorResponse('Failed to create user profile', 500);
  }

  // Sign in the new user to return a session token
  const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !authData.session) {
    return errorResponse('Failed to sign in after registration', 500);
  }

  return createdResponse({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePicture: user.profile_picture,
      userType: user.user_type,
      isAdmin: user.is_admin || false,
    },
    token: authData.session.access_token,
    refreshToken: authData.session.refresh_token,
    message: 'User registered successfully.',
  });
});
