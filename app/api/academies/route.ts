import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/response';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/academies
 * Get all academies with optional filters
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        let query = supabaseAdmin
            .from('academies')
            .select('*')
            .order('name')
            .range(offset, offset + limit - 1);

        // Search filter
        if (search) {
            query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        return successResponse({
            academies: data || [],
            message: 'Academies retrieved successfully',
        });
    } catch (error: any) {
        console.error('Get academies error:', error);
        return errorResponse(error.message, 500);
    }
}

/**
 * POST /api/academies
 * Create a new academy (Admin only)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Add default values
        const academyData = {
            ...body,
            students_count: body.students_count || 0,
            rating: body.rating || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabaseAdmin
            .from('academies')
            .insert([academyData])
            .select()
            .single();

        if (error) throw error;

        return successResponse({
            academy: data,
            message: 'Academy created successfully',
        }, 201);
    } catch (error: any) {
        console.error('Create academy error:', error);
        return errorResponse(error.message, 500);
    }
}
