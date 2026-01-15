import { NextRequest } from 'next/server';
import { withErrorHandler, ValidationError } from '@/lib/middleware/error';
import { requireAdmin } from '@/lib/middleware/admin';
import { supabaseAdmin } from '@/lib/supabase/client';
import { successResponse } from '@/lib/utils/response';
import { z } from 'zod';

const updateRegistrationSchema = z.object({
  registration_id: z.string().uuid(),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']),
});

/**
 * GET /api/admin/events/[id]/registrations
 * List fighter registrations for an event (admin)
 */
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  await requireAdmin(request);

  const { data: registrations, error } = await supabaseAdmin
    .from('event_registrations')
    .select(`
      *,
      fighter:fighters(id, full_name, nickname, weight_class_id, status),
      user:users(id, name, email, phone)
    `)
    .eq('event_id', params.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch registrations');
  }

  return successResponse(registrations || []);
});

/**
 * PUT /api/admin/events/[id]/registrations
 * Update registration status (admin)
 */
export const PUT = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin(request);

  const body = await request.json();
  const validation = updateRegistrationSchema.safeParse(body);

  if (!validation.success) {
    throw new ValidationError(JSON.stringify(validation.error.flatten().fieldErrors));
  }

  const { registration_id, status } = validation.data;

  const { data: registration, error } = await supabaseAdmin
    .from('event_registrations')
    .update({ status })
    .eq('id', registration_id)
    .select()
    .single();

  if (error || !registration) {
    throw new Error('Failed to update registration');
  }

  return successResponse(registration);
});
