import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler, ValidationError } from '@/lib/middleware/error';
import { supabaseAdmin } from '@/lib/supabase/client';
import { z } from 'zod';

const updateBannerSchema = z
  .object({
    title: z.string().optional().nullable(),
    subtitle: z.string().optional().nullable(),
    image_url: z.string().url().optional(),
    type: z.enum(['event', 'image', 'teaser']).optional(),
    event_id: z.string().optional().nullable(),
    cta_text: z.string().optional().nullable(),
    is_active: z.boolean().optional(),
    sort_order: z.coerce.number().int().optional(),
    start_at: z.string().optional().nullable(),
    end_at: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'event' && !data.event_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'event_id is required when type is event',
        path: ['event_id'],
      });
    }
  });

/**
 * PUT /api/admin/banners/:id
 * Update banner (admin only)
 */
export const PUT = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  await requireAdmin(request);

  const body = await request.json();
  const validation = updateBannerSchema.safeParse(body);
  if (!validation.success) {
    throw new ValidationError(JSON.stringify(validation.error.flatten().fieldErrors));
  }

  const { data: banner, error } = await supabaseAdmin
    .from('home_banners')
    .update(validation.data)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update banner: ' + error.message);
  }

  return successResponse(banner);
});

/**
 * DELETE /api/admin/banners/:id
 * Delete banner (admin only)
 */
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  await requireAdmin(request);

  const { error } = await supabaseAdmin
    .from('home_banners')
    .delete()
    .eq('id', params.id);

  if (error) {
    throw new Error('Failed to delete banner: ' + error.message);
  }

  return successResponse({ id: params.id });
});
