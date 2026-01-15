import { NextRequest } from 'next/server';
import { withErrorHandler, ValidationError } from '@/lib/middleware/error';
import { requireAuth } from '@/lib/middleware/auth';
import { supabaseAdmin } from '@/lib/supabase/client';
import { successResponse } from '@/lib/utils/response';

/**
 * GET /api/events/[id]/registrations
 * Get current user's registration for an event
 */
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const authUser = await requireAuth(request);

  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('auth_id', authUser.id)
    .single();

  if (userError || !userData) {
    throw new ValidationError('User profile not found');
  }

  const { data: registration, error } = await supabaseAdmin
    .from('event_registrations')
    .select('*')
    .eq('event_id', params.id)
    .eq('user_id', userData.id)
    .maybeSingle();

  if (error) {
    throw new Error('Failed to fetch registration');
  }

  return successResponse(registration || null);
});

/**
 * POST /api/events/[id]/registrations
 * Register fighter for an event (authenticated)
 */
export const POST = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const authUser = await requireAuth(request);

  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('auth_id', authUser.id)
    .single();

  if (userError || !userData) {
    throw new ValidationError('User profile not found');
  }

  const { data: fighter, error: fighterError } = await supabaseAdmin
    .from('fighters')
    .select('id, status')
    .eq('user_id', userData.id)
    .single();

  if (fighterError || !fighter) {
    throw new ValidationError('Fighter profile not found');
  }

  if (fighter.status !== 'approved') {
    throw new ValidationError('Fighter must be approved before registering');
  }

  const { data: event, error: eventError } = await supabaseAdmin
    .from('events')
    .select('registration_open_at, registration_close_at, registration_paid, registration_enabled')
    .eq('id', params.id)
    .single();

  if (eventError || !event) {
    throw new ValidationError('Event not found');
  }

  if (event.registration_enabled === false) {
    throw new ValidationError('Registration is closed for this event');
  }

  const now = new Date();
  if (event.registration_open_at && now < new Date(event.registration_open_at)) {
    throw new ValidationError('Registration has not opened yet');
  }
  if (event.registration_close_at && now > new Date(event.registration_close_at)) {
    throw new ValidationError('Registration is closed for this event');
  }

  const { data: existing } = await supabaseAdmin
    .from('event_registrations')
    .select('id')
    .eq('event_id', params.id)
    .eq('fighter_id', fighter.id)
    .maybeSingle();

  if (existing) {
    throw new ValidationError('Already registered for this event');
  }

  const paymentStatus = event.registration_paid ? 'pending' : 'free';

  const { data: registration, error } = await supabaseAdmin
    .from('event_registrations')
    .insert({
      event_id: params.id,
      fighter_id: fighter.id,
      user_id: userData.id,
      status: 'pending',
      payment_status: paymentStatus,
    })
    .select()
    .single();

  if (error || !registration) {
    throw new Error('Failed to register for event');
  }

  return successResponse(registration, 201);
});
