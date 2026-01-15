import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { withErrorHandler } from '@/lib/middleware/error';
import { orderService } from '@/lib/services/order.service';
import { supabase } from '@/lib/supabase/client';

/**
 * GET /api/orders
 * Get user orders
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
    const user = await requireAuth(request);

    // Get user ID
    const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

    if (!userData) {
        return errorResponse('User not found', 404);
    }

    // Get pagination params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const orders = await orderService.getUserOrders(userData.id, limit, offset);

    return successResponse({
        orders,
        pagination: {
            limit,
            offset,
            total: orders.length,
        },
    });
});
