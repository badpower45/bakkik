import axios from 'axios';
import crypto from 'crypto';

export interface PaymentIntentData {
    amount: number;
    orderId: string;
    currency?: string;
    customerEmail?: string;
    customerPhone?: string;
}

export interface PaymentIntentResponse {
    paymentUrl: string;
    paymentToken: string;
    paymobOrderId: number;
}

export class PaymobService {
    private apiKey: string;
    private integrationId: string;
    private iframeId: string;
    private hmacSecret: string;
    private baseUrl = 'https://accept.paymob.com/api';

    constructor() {
        this.apiKey = process.env.PAYMOB_API_KEY || '';
        this.integrationId = process.env.PAYMOB_INTEGRATION_ID || '';
        this.iframeId = process.env.PAYMOB_IFRAME_ID || '';
        this.hmacSecret = process.env.PAYMOB_HMAC_SECRET || '';

        if (!this.apiKey || !this.integrationId || !this.iframeId) {
            console.warn('Paymob credentials not configured');
        }
    }

    /**
     * Create payment intent with Paymob
     */
    async createPaymentIntent(data: PaymentIntentData): Promise<PaymentIntentResponse> {
        try {
            // Step 1: Get authentication token
            const authToken = await this.getAuthToken();

            // Step 2: Create order
            const paymobOrder = await this.createOrder(authToken, data);

            // Step 3: Get payment key
            const paymentKey = await this.getPaymentKey(
                authToken,
                paymobOrder.id,
                data.amount,
                data
            );

            // Step 4: Return payment URL
            return {
                paymentUrl: `${this.baseUrl}/acceptance/iframes/${this.iframeId}?payment_token=${paymentKey}`,
                paymentToken: paymentKey,
                paymobOrderId: paymobOrder.id,
            };
        } catch (error) {
            console.error('Paymob payment intent error:', error);
            throw new Error('Failed to create payment intent');
        }
    }

    /**
     * Get Paymob authentication token
     */
    private async getAuthToken(): Promise<string> {
        const response = await axios.post(`${this.baseUrl}/auth/tokens`, {
            api_key: this.apiKey,
        });

        return response.data.token;
    }

    /**
     * Create order in Paymob
     */
    private async createOrder(authToken: string, data: PaymentIntentData) {
        const response = await axios.post(
            `${this.baseUrl}/ecommerce/orders`,
            {
                auth_token: authToken,
                delivery_needed: 'false',
                amount_cents: Math.round(data.amount * 100), // Convert to cents
                currency: data.currency || 'EGP',
                merchant_order_id: data.orderId,
            }
        );

        return response.data;
    }

    /**
     * Get payment key
     */
    private async getPaymentKey(
        authToken: string,
        orderId: number,
        amount: number,
        data: PaymentIntentData
    ): Promise<string> {
        const response = await axios.post(
            `${this.baseUrl}/acceptance/payment_keys`,
            {
                auth_token: authToken,
                amount_cents: Math.round(amount * 100),
                expiration: 3600, // 1 hour
                order_id: orderId,
                billing_data: {
                    email: data.customerEmail || 'customer@example.com',
                    first_name: 'Customer',
                    last_name: 'Name',
                    phone_number: data.customerPhone || '+20123456789',
                    country: 'EG',
                    city: 'Cairo',
                    street: 'N/A',
                    building: 'N/A',
                    floor: 'N/A',
                    apartment: 'N/A',
                },
                currency: data.currency || 'EGP',
                integration_id: this.integrationId,
            }
        );

        return response.data.token;
    }

    /**
     * Verify webhook HMAC signature
     */
    verifyWebhookSignature(data: any): boolean {
        if (!this.hmacSecret) {
            console.warn('HMAC secret not configured, skipping verification');
            return true; // In development, allow all webhooks
        }

        const {
            amount_cents,
            created_at,
            currency,
            error_occured,
            has_parent_transaction,
            id,
            integration_id,
            is_3d_secure,
            is_auth,
            is_capture,
            is_refunded,
            is_standalone_payment,
            is_voided,
            order,
            owner,
            pending,
            source_data_pan,
            source_data_sub_type,
            source_data_type,
            success,
        } = data;

        const concatenatedString = [
            amount_cents,
            created_at,
            currency,
            error_occured,
            has_parent_transaction,
            id,
            integration_id,
            is_3d_secure,
            is_auth,
            is_capture,
            is_refunded,
            is_standalone_payment,
            is_voided,
            order,
            owner,
            pending,
            source_data_pan,
            source_data_sub_type,
            source_data_type,
            success,
        ].join('');

        const calculatedHmac = crypto
            .createHmac('sha512', this.hmacSecret)
            .update(concatenatedString)
            .digest('hex');

        return calculatedHmac === data.hmac;
    }

    /**
     * Process refund
     */
    async processRefund(transactionId: string, amount: number): Promise<any> {
        try {
            const authToken = await this.getAuthToken();

            const response = await axios.post(
                `${this.baseUrl}/acceptance/void_refund/refund`,
                {
                    auth_token: authToken,
                    transaction_id: transactionId,
                    amount_cents: Math.round(amount * 100),
                }
            );

            return response.data;
        } catch (error) {
            console.error('Paymob refund error:', error);
            throw new Error('Failed to process refund');
        }
    }
}

// Export singleton instance
export const paymobService = new PaymobService();
