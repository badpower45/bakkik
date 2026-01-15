import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { withErrorHandler, ValidationError } from '@/lib/middleware/error';
import { z } from 'zod';

// Validation schema
const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

/**
 * POST /api/auth/reset-password
 * Send password reset email
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();

  // Validate input
  const validation = resetPasswordSchema.safeParse(body);
  if (!validation.success) {
    throw new ValidationError(JSON.stringify(validation.error.flatten().fieldErrors));
  }

  const { email } = validation.data;

  // Check if user exists
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('email')
    .eq('email', email)
    .single();

  if (!user) {
    // Don't reveal if email exists for security
    return successResponse({
      message: 'If the email exists, a password reset link will be sent.',
    });
  }

  // Send password reset email
  const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
  });

  if (error) {
    console.error('Reset password error:', error);
    return errorResponse('Failed to send reset email', 500);
  }

  return successResponse({
    message: 'Password reset email sent successfully',
  });
});
