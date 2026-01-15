import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { withErrorHandler, ValidationError } from '@/lib/middleware/error';
import { orderService } from '@/lib/services/order.service';
import { supabase } from '@/lib/supabase/client';
import { z } from 'zod';

// Validation schema
const ticketCheckoutSchema = z.object({
    eventId: z.string(),
    tickets: z.array(
        z.object({
            ticketTypeId: z.string().uuid(),
            quantity: z.number().int().min(1).max(10),
        })
    ).min(1),
});

/**
 * POST /api/checkout/tickets
 * Create ticket checkout session
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
    const user = await requireAuth(request);
    const body = await request.json();

    // Validate input
    const validation = ticketCheckoutSchema.safeParse(body);
    if (!validation.success) {
        throw new ValidationError(JSON.stringify(validation.error.flatten().fieldErrors));
    }

    const { eventId, tickets } = validation.data;

    // Get user data
    const { data: userData } = await supabase
        .from('users')
        .select('email, phone')
        .eq('auth_id', user.id)
        .single();

    // Prepare order items
    const orderItems = [];

    for (const ticket of tickets) {
        // Get ticket type details
        const { data: ticketType, error } = await supabase
            .from('ticket_types')
            .select('*')
            .eq('id', ticket.ticketTypeId)
            .eq('event_id', eventId)
            .single();

        if (error || !ticketType) {
            return errorResponse('Invalid ticket type', 400);
        }

        // Check availability
        if (ticketType.available_seats < ticket.quantity) {
            return errorResponse(`Not enough seats available for ${ticketType.name}`, 400);
        }

        orderItems.push({
            itemType: 'ticket' as const,
            itemId: ticketType.id,
            itemName: `${ticketType.name} - ${eventId}`,
            quantity: ticket.quantity,
            unitPrice: ticketType.price,
        });
    }

    // Create order
    const order = await orderService.createOrder({
        userId: (await supabase.from('users').select('id').eq('auth_id', user.id).single()).data!.id,
        orderType: 'ticket',
        items: orderItems,
        userEmail: userData?.email,
        userPhone: userData?.phone,
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
