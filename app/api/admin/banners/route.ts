import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler, ValidationError } from '@/lib/middleware/error';
import { supabaseAdmin } from '@/lib/supabase/client';
import { z } from 'zod';

const bannerSchema = z
  .object({
    title: z.string().optional().nullable(),
    subtitle: z.string().optional().nullable(),
    image_url: z.string().url(),
    type: z.enum(['event', 'image', 'teaser']),
    event_id: z.string().optional().nullable(),
    cta_text: z.string().optional().nullable(),
    is_active: z.boolean().default(true),
    sort_order: z.coerce.number().int().default(0),
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
 * GET /api/admin/banners
 * List all banners (admin only)
 */
export const GET = withErrorHandler(async (_request: NextRequest) => {
  await requireAdmin(_request);

  const { data, error } = await supabaseAdmin
    .from('home_banners')
    .select(
      `
      *,
      event:events(id, name, event_date, location, poster_image)
      `
    )
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch banners: ' + error.message);
  }

  return successResponse(data || []);
});

/**
 * POST /api/admin/banners
 * Create banner (admin only)
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin(request);

  const body = await request.json();
  const validation = bannerSchema.safeParse(body);
  if (!validation.success) {
    throw new ValidationError(JSON.stringify(validation.error.flatten().fieldErrors));
  }

  const data = validation.data;
  const { data: banner, error } = await supabaseAdmin
    .from('home_banners')
    .insert({
      title: data.title,
      subtitle: data.subtitle,
      image_url: data.image_url,
      type: data.type,
      event_id: data.event_id,
      cta_text: data.cta_text,
      is_active: data.is_active,
      sort_order: data.sort_order,
      start_at: data.start_at,
      end_at: data.end_at,
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create banner: ' + error.message);
  }

  return successResponse(banner, 201);
});
