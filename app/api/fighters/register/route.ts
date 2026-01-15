import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { withErrorHandler, ValidationError } from '@/lib/middleware/error';
import { successResponse } from '@/lib/utils/response';
import { supabaseAdmin } from '@/lib/supabase/client';
import { z } from 'zod';

const fighterApplicationSchema = z.object({
  full_name: z.string().min(1).optional(),
  nickname: z.string().min(1),
  age: z.number().int().positive().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  nationality: z.string().optional(),
  stylistics: z.string().optional(),
  place: z.string().optional(),
  gym_team: z.string().optional(),
  coach: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  facebook_link: z.string().url().optional(),
  instagram_link: z.string().url().optional(),
  sherdog_link: z.string().url().optional(),
  tapology_link: z.string().url().optional(),
  weight_class_id: z.number(),
  record_wins: z.number().default(0),
  record_losses: z.number().default(0),
  record_draws: z.number().default(0),
  bio: z.string().optional(),
  profile_picture: z.string().url().optional(),
});

/**
 * POST /api/fighters/register
 * Submit fighter application (authenticated user)
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  const authUser = await requireAuth(request);
  const body = await request.json();

  const validation = fighterApplicationSchema.safeParse(body);
  if (!validation.success) {
    throw new ValidationError(JSON.stringify(validation.error.flatten().fieldErrors));
  }

  const data = validation.data;

  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('id, name, email, phone')
    .eq('auth_id', authUser.id)
    .single();

  if (userError || !userData) {
    throw new ValidationError('User profile not found');
  }

  const { data: existingFighter } = await supabaseAdmin
    .from('fighters')
    .select('id, status')
    .eq('user_id', userData.id)
    .maybeSingle();

  if (existingFighter) {
    throw new ValidationError('Fighter application already exists');
  }

  const { data: fighter, error } = await supabaseAdmin
    .from('fighters')
    .insert({
      user_id: userData.id,
      full_name: data.full_name ?? userData.name,
      nickname: data.nickname,
      bio: data.bio,
      stylistics: data.stylistics,
      place: data.place,
      gym_team: data.gym_team,
      coach: data.coach,
      phone: data.phone ?? userData.phone,
      email: data.email ?? userData.email,
      facebook_link: data.facebook_link,
      instagram_link: data.instagram_link,
      sherdog_link: data.sherdog_link,
      tapology_link: data.tapology_link,
      weight_class_id: data.weight_class_id,
      record_wins: data.record_wins,
      record_losses: data.record_losses,
      record_draws: data.record_draws,
      profile_picture: data.profile_picture,
      height: data.height,
      weight: data.weight,
      age: data.age,
      nationality: data.nationality,
      status: 'pending',
    })
    .select()
    .single();

  if (error || !fighter) {
    throw new Error('Failed to submit fighter application: ' + error?.message);
  }

  return successResponse(fighter, 201);
});
