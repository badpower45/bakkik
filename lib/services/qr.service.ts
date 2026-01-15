import crypto from 'crypto';
import QRCode from 'qrcode';

interface TicketQRData {
    ticketId: string;
    orderId: string;
    userId: string;
    eventId: string;
    ticketType: string;
    timestamp: number;
}

export class QRService {
    private secret: string;

    constructor() {
        this.secret = process.env.JWT_SECRET || 'default-secret-change-in-production';
    }

    /**
     * Generate QR code for ticket
     */
    async generateTicketQR(ticketData: TicketQRData): Promise<string> {
        // Create payload
        const payload = {
            ...ticketData,
            timestamp: Date.now(),
        };

        // Sign payload
        const signature = this.signPayload(payload);
        const signedData = {
            ...payload,
            signature,
        };

        // Encode to base64
        const encoded = Buffer.from(JSON.stringify(signedData)).toString('base64');

        // Generate QR code
        const qrCode = await QRCode.toDataURL(encoded, {
            errorCorrectionLevel: 'H',
            margin: 1,
            width: 400,
        });

        return qrCode;
    }

    /**
     * Validate QR code
     */
    validateTicketQR(qrData: string): { valid: boolean; data?: TicketQRData; error?: string } {
        try {
            // Decode from base64
            const decoded = Buffer.from(qrData, 'base64').toString('utf8');
            const parsed = JSON.parse(decoded);

            // Verify signature
            const { signature, ...payload } = parsed;
            const expectedSignature = this.signPayload(payload);

            if (signature !== expectedSignature) {
                return { valid: false, error: 'Invalid signature' };
            }

            // Check timestamp (QR valid for 24 hours)
            const age = Date.now() - payload.timestamp;
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours

            if (age > maxAge) {
                return { valid: false, error: 'QR code expired' };
            }

            return { valid: true, data: payload };
        } catch (error) {
            return { valid: false, error: 'Invalid QR code format' };
        }
    }

    /**
     * Sign payload with HMAC
     */
    private signPayload(payload: any): string {
        const data = JSON.stringify(payload);
        return crypto
            .createHmac('sha256', this.secret)
            .update(data)
            .digest('hex');
    }

    /**
     * Generate simple numeric code for manual entry
     */
    generateTicketCode(ticketId: string): string {
        // Generate 8-digit code from ticket ID
        const hash = crypto.createHash('sha256').update(ticketId).digest('hex');
        const code = parseInt(hash.substring(0, 8), 16).toString().substring(0, 8);
        return code.padStart(8, '0');
    }
}

export const qrService = new QRService();
