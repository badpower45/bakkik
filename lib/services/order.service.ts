import { supabaseAdmin } from '../supabase/client';
import { paymobService } from './payment.service';
import QRCode from 'qrcode';

export interface OrderItem {
    itemType: 'ticket' | 'ppv';
    itemId: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
}

export interface CreateOrderData {
    userId: string;
    orderType: 'ticket' | 'ppv';
    items: OrderItem[];
    userEmail?: string;
    userPhone?: string;
}

export class OrderService {
    /**
     * Create new order
     */
    async createOrder(data: CreateOrderData) {
        try {
            // 1. Calculate total
            const totalAmount = data.items.reduce(
                (sum, item) => sum + item.unitPrice * item.quantity,
                0
            );

            // 2. Generate order number
            const { data: orderNumberResult } = await supabaseAdmin
                .rpc('generate_order_number');

            const orderNumber = orderNumberResult || `ORD-${Date.now()}`;

            // 3. Set expiration (15 minutes)
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

            // 4. Create order
            const { data: order, error: orderError } = await supabaseAdmin
                .from('orders')
                .insert({
                    user_id: data.userId,
                    order_number: orderNumber,
                    order_type: data.orderType,
                    total_amount: totalAmount,
                    currency: 'EGP',
                    status: 'pending',
                    expires_at: expiresAt.toISOString(),
                })
                .select()
                .single();

            if (orderError || !order) {
                throw new Error('Failed to create order');
            }

            // 5. Create order items
            const orderItems = data.items.map((item) => ({
                order_id: order.id,
                item_type: item.itemType,
                item_id: item.itemId,
                item_name: item.itemName,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                total_price: item.unitPrice * item.quantity,
            }));

            const { error: itemsError } = await supabaseAdmin
                .from('order_items')
                .insert(orderItems);

            if (itemsError) {
                // Rollback: delete order
                await supabaseAdmin.from('orders').delete().eq('id', order.id);
                throw new Error('Failed to create order items');
            }

            // 6. Create payment intent
            const paymentIntent = await paymobService.createPaymentIntent({
                amount: totalAmount,
                orderId: order.id,
                customerEmail: data.userEmail,
                customerPhone: data.userPhone,
            });

            // 7. Create payment transaction record
            await supabaseAdmin.from('payment_transactions').insert({
                order_id: order.id,
                payment_gateway: 'paymob',
                amount: totalAmount,
                currency: 'EGP',
                status: 'pending',
            });

            return {
                ...order,
                paymentUrl: paymentIntent.paymentUrl,
                paymentToken: paymentIntent.paymentToken,
            };
        } catch (error) {
            console.error('Create order error:', error);
            throw error;
        }
    }

    /**
     * Get order by ID
     */
    async getOrder(orderId: string) {
        const { data: order, error } = await supabaseAdmin
            .from('orders')
            .select(`
        *,
        order_items (*),
        payment_transactions (*)
      `)
            .eq('id', orderId)
            .single();

        if (error || !order) {
            throw new Error('Order not found');
        }

        return order;
    }

    /**
     * Complete order after successful payment
     */
    async completeOrder(orderId: string, transactionId: string, paymentData: any) {
        try {
            // 1. Update order status
            const { error: orderError } = await supabaseAdmin
                .from('orders')
                .update({
                    status: 'completed',
                    payment_method: paymentData.payment_method || 'card',
                })
                .eq('id', orderId);

            if (orderError) {
                throw new Error('Failed to update order status');
            }

            // 2. Update transaction
            await supabaseAdmin
                .from('payment_transactions')
                .update({
                    transaction_id: transactionId,
                    status: 'success',
                    gateway_response: paymentData,
                })
                .eq('order_id', orderId)
                .eq('status', 'pending');

            // 3. Get order details
            const order = await this.getOrder(orderId);

            // 4. Grant access based on order type
            if (order.order_type === 'ticket') {
                await this.createTickets(order);
            } else if (order.order_type === 'ppv') {
                await this.grantPPVAccess(order);
            }

            return order;
        } catch (error) {
            console.error('Complete order error:', error);
            throw error;
        }
    }

    /**
     * Fail order
     */
    async failOrder(orderId: string, errorMessage?: string) {
        await supabaseAdmin
            .from('orders')
            .update({ status: 'failed' })
            .eq('id', orderId);

        await supabaseAdmin
            .from('payment_transactions')
            .update({
                status: 'failed',
                error_message: errorMessage,
            })
            .eq('order_id', orderId)
            .eq('status', 'pending');
    }

    /**
     * Create tickets from order
     */
    private async createTickets(order: any) {
        const ticketsToCreate = [];

        for (const item of order.order_items) {
            if (item.item_type === 'ticket') {
                // Get ticket type details
                const { data: ticketType } = await supabaseAdmin
                    .from('ticket_types')
                    .select('event_id')
                    .eq('id', item.item_id)
                    .single();

                // Create tickets for quantity
                for (let i = 0; i < item.quantity; i++) {
                    const qrData = `TICKET-${order.id}-${item.id}-${i}`;
                    const qrCode = await QRCode.toDataURL(qrData);

                    ticketsToCreate.push({
                        user_id: order.user_id,
                        event_id: ticketType?.event_id,
                        ticket_type_id: item.item_id,
                        quantity: 1,
                        total_price: item.unit_price,
                        payment_status: 'completed',
                        qr_code: qrCode,
                        order_id: order.id,
                    });
                }
            }
        }

        if (ticketsToCreate.length > 0) {
            await supabaseAdmin.from('tickets').insert(ticketsToCreate);
        }
    }

    /**
     * Grant PPV access
     */
    private async grantPPVAccess(order: any) {
        for (const item of order.order_items) {
            if (item.item_type === 'ppv') {
                await supabaseAdmin.from('ppv_purchases').insert({
                    user_id: order.user_id,
                    event_id: item.item_id,
                    price: item.total_price,
                    payment_status: 'completed',
                    order_id: order.id,
                });
            }
        }
    }

    /**
     * Get user orders
     */
    async getUserOrders(userId: string, limit = 20, offset = 0) {
        const { data: orders, error } = await supabaseAdmin
            .from('orders')
            .select(`
        *,
        order_items (*),
        payment_transactions (*)
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw new Error('Failed to fetch orders');
        }

        return orders || [];
    }

    /**
     * Expire old pending orders
     */
    async expireOldOrders() {
        await supabaseAdmin.rpc('expire_pending_orders');
    }
}

// Export singleton instance
export const orderService = new OrderService();
