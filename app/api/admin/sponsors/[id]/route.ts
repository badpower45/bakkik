import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { successResponse, notFoundError } from '@/lib/response';
import { withErrorHandler } from '@/lib/middleware/error';

/**
 * PUT /api/admin/sponsors/[id]
 * Update a sponsor (admin only)
 */
export const PUT = withErrorHandler(
    async (request: NextRequest, { params }: { params: { id: string } }) => {
        const id = params.id;
        const body = await request.json();
        const { event_id, name, logo_url, website } = body;

        // Verify sponsor exists
        const { data: existing } = await supabaseAdmin
            .from('sponsors')
            .select('id')
            .eq('id', id)
            .single();

        if (!existing) {
            return notFoundError('Sponsor not found');
        }

        // If event_id is being updated, verify it exists
        if (event_id) {
            const { data: event } = await supabaseAdmin
                .from('events')
                .select('id')
                .eq('id', event_id)
                .single();

            if (!event) {
                throw new Error('Event not found');
            }
        }

        const updateData: any = {};
        if (event_id !== undefined) updateData.event_id = event_id;
        if (name !== undefined) updateData.name = name;
        if (logo_url !== undefined) updateData.logo_url = logo_url || null;
        if (website !== undefined) updateData.website = website || null;

        const { data, error } = await supabaseAdmin
            .from('sponsors')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error('Failed to update sponsor: ' + error.message);
        }

        return successResponse(data);
    }
);

/**
 * DELETE /api/admin/sponsors/[id]
 * Delete a sponsor (admin only)
 */
export const DELETE = withErrorHandler(
    async (_request: NextRequest, { params }: { params: { id: string } }) => {
        const id = params.id;

        // Verify sponsor exists
        const { data: existing } = await supabaseAdmin
            .from('sponsors')
            .select('id')
            .eq('id', id)
            .single();

        if (!existing) {
            return notFoundError('Sponsor not found');
        }

        const { error } = await supabaseAdmin
            .from('sponsors')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error('Failed to delete sponsor: ' + error.message);
        }

        return successResponse({ message: 'Sponsor deleted successfully' });
    }
);
