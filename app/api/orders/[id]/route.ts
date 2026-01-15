import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { withErrorHandler } from '@/lib/middleware/error';
import { orderService } from '@/lib/services/order.service';
import { supabase } from '@/lib/supabase/client';

/**
 * GET /api/orders/[id]
 * Get order details
 */
export const GET = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    const user = await requireAuth(request);
    const orderId = params.id;

    // Get order
    const order = await orderService.getOrder(orderId);

    // Verify ownership
    const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

    if (order.user_id !== userData?.id) {
        return errorResponse('Unauthorized', 403);
    }

    return successResponse(order);
});
