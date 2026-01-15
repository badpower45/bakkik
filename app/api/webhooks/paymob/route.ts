import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { withErrorHandler } from '@/lib/middleware/error';
import { paymobService } from '@/lib/services/payment.service';
import { orderService } from '@/lib/services/order.service';

/**
 * POST /api/webhooks/paymob
 * Handle Paymob payment webhook
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
    const data = await request.json();

    console.log('=== Paymob Webhook Received ===');
    console.log('Transaction ID:', data.id);
    console.log('Order ID:', data.order);
    console.log('Success:', data.success);

    // Verify webhook signature
    const isValid = paymobService.verifyWebhookSignature(data);

    if (!isValid) {
        console.error('Invalid webhook signature');
        return errorResponse('Invalid signature', 401);
    }

    // Extract order ID from merchant_order_id
    const orderId = data.obj?.order?.merchant_order_id || data.order;

    if (!orderId) {
        console.error('No order ID in webhook');
        return errorResponse('No order ID', 400);
    }

    try {
        if (data.success === 'true' || data.success === true) {
            // Payment successful
            console.log(`✅ Payment successful for order: ${orderId}`);

            await orderService.completeOrder(
                orderId,
                data.id?.toString(),
                {
                    payment_method: data.source_data_type || 'card',
                    amount: data.amount_cents / 100,
                    currency: data.currency,
                    transaction_id: data.id,
                    ...data,
                }
            );

            // TODO: Send confirmation email
            console.log('📧 Sending confirmation email...');

        } else {
            // Payment failed
            console.log(`❌ Payment failed for order: ${orderId}`);

            await orderService.failOrder(
                orderId,
                data.data?.message || 'Payment failed'
            );
        }

        return successResponse({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);

        // Still return 200 to prevent Paymob retries
        return successResponse({ received: true, error: 'Processing failed' });
    }
});

