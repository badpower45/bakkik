import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { withErrorHandler, ValidationError } from '@/lib/middleware/error';
import { orderService } from '@/lib/services/order.service';
import { supabase } from '@/lib/supabase/client';
import { z } from 'zod';

// Validation schema
const ppvCheckoutSchema = z.object({
    eventId: z.string(),
});

/**
 * POST /api/checkout/ppv
 * Create PPV checkout session
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
    const user = await requireAuth(request);
    const body = await request.json();

    // Validate input
    const validation = ppvCheckoutSchema.safeParse(body);
    if (!validation.success) {
        throw new ValidationError(JSON.stringify(validation.error.flatten().fieldErrors));
    }

    const { eventId } = validation.data;

    // Get event details
    const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

    if (eventError || !event) {
        return errorResponse('Event not found', 404);
    }

    if (!event.live_stream_enabled) {
        return errorResponse('Live stream not available for this event', 400);
    }

    // Get user ID
    const { data: userData } = await supabase
        .from('users')
        .select('id, email, phone')
        .eq('auth_id', user.id)
        .single();

    if (!userData) {
        return errorResponse('User not found', 404);
    }

    // Check if user already purchased PPV
    const { data: existingPurchase } = await supabase
        .from('ppv_purchases')
        .select('id')
        .eq('user_id', userData.id)
        .eq('event_id', eventId)
        .eq('payment_status', 'completed')
        .single();

    if (existingPurchase) {
        return errorResponse('You have already purchased PPV for this event', 400);
    }

    // Create order
    const order = await orderService.createOrder({
        userId: userData.id,
        orderType: 'ppv',
        items: [
            {
                itemType: 'ppv',
                itemId: eventId,
                itemName: `PPV Access - ${event.name}`,
                quantity: 1,
                unitPrice: event.stream_price || 1.0,
            },
        ],
        userEmail: userData.email,
        userPhone: userData.phone,
    });

    return successResponse({
        orderId: order.id,
        orderNumber: order.order_number,
        totalAmount: order.total_amount,
        currency: order.currency,
        paymentUrl: order.paymentUrl,
        expiresAt: order.expires_at,
    });
});
