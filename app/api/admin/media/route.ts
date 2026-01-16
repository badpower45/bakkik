import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler, ValidationError } from '@/lib/middleware/error';
import { supabaseAdmin } from '@/lib/supabase/client';
import { z } from 'zod';

const mediaItemSchema = z.object({
  type: z.enum(['photo', 'video']).default('photo'),
  title: z.string().optional(),
  url: z.string().url(),
  thumbnail_url: z.string().url().optional(),
  duration: z.number().int().positive().optional(),
  event_id: z.string().nullable().optional(),
  fighter_id: z.string().uuid().nullable().optional(),
  is_featured: z.boolean().optional(),
});

const createMediaSchema = z.object({
  items: z.array(mediaItemSchema).min(1),
});

/**
 * POST /api/admin/media
 * Create media items (admin only)
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin(request);

  const body = await request.json();
  const validation = createMediaSchema.safeParse(body);

  if (!validation.success) {
    throw new ValidationError(JSON.stringify(validation.error.flatten().fieldErrors));
  }

  const { items } = validation.data;

  const { data, error } = await supabaseAdmin
    .from('media')
    .insert(items)
    .select();

  if (error) {
    throw new Error('Failed to create media: ' + error.message);
  }

  return successResponse(data, 201);
});
