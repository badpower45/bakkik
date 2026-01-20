import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/response';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/academies/:id
 * Get a single academy by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const { data, error } = await supabaseAdmin
            .from('academies')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return errorResponse('Academy not found', 404);
            }
            throw error;
        }

        return successResponse(data, 'Academy retrieved successfully');
    } catch (error: any) {
        console.error('Get academy error:', error);
        return errorResponse(error.message, 500);
    }
}

/**
 * PATCH /api/academies/:id
 * Update an academy (Admin only)
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();

        const updateData = {
            ...body,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabaseAdmin
            .from('academies')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return errorResponse('Academy not found', 404);
            }
            throw error;
        }

        return successResponse(data, 'Academy updated successfully');
    } catch (error: any) {
        console.error('Update academy error:', error);
        return errorResponse(error.message, 500);
    }
}

/**
 * DELETE /api/academies/:id
 * Delete an academy (Admin only)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const { error } = await supabaseAdmin
            .from('academies')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return successResponse(null, 'Academy deleted successfully');
    } catch (error: any) {
        console.error('Delete academy error:', error);
        return errorResponse(error.message, 500);
    }
}
