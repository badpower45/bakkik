import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../supabase/client';
import crypto from 'crypto';

export interface StreamAuthData {
    userId: string;
    eventId: string;
    ppvPurchaseId?: string;
}

export class StreamingService {
    private jwtSecret: string;

    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    }

    /**
     * Verify user has PPV access to event
     */
    async verifyPPVAccess(userId: string, eventId: string): Promise<boolean> {
        const { data: purchase, error } = await supabaseAdmin
            .from('ppv_purchases')
            .select('id')
            .eq('user_id', userId)
            .eq('event_id', eventId)
            .eq('payment_status', 'completed')
            .single();

        return !error && !!purchase;
    }

    /**
     * Check concurrent stream limit
     */
    async checkConcurrentLimit(userId: string, eventId: string): Promise<boolean> {
        const { data, error } = await supabaseAdmin
            .rpc('check_concurrent_streams', {
                p_user_id: userId,
                p_event_id: eventId,
            });

        if (error) {
            console.error('Error checking concurrent streams:', error);
            return true; // Allow if check fails
        }

        return data === true;
    }

    /**
     * Create stream session
     */
    async createStreamSession(data: StreamAuthData, ipAddress?: string, userAgent?: string) {
        // Generate access token
        const accessToken = this.generateStreamToken(data);

        // Set expiration (12 hours or event end time)
        const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);

        // Create session
        const { data: session, error } = await supabaseAdmin
            .from('stream_sessions')
            .insert({
                user_id: data.userId,
                event_id: data.eventId,
                ppv_purchase_id: data.ppvPurchaseId,
                access_token: accessToken,
                ip_address: ipAddress,
                user_agent: userAgent,
                expires_at: expiresAt.toISOString(),
                last_heartbeat: new Date().toISOString(),
            })
            .select()
            .single();

        if (error || !session) {
            throw new Error('Failed to create stream session');
        }

        return {
            ...session,
            streamToken: accessToken,
        };
    }

    /**
     * Generate stream access token (JWT)
     */
    private generateStreamToken(data: StreamAuthData): string {
        const payload = {
            userId: data.userId,
            eventId: data.eventId,
            ppvPurchaseId: data.ppvPurchaseId,
            type: 'stream_access',
            iat: Date.now(),
        };

        return jwt.sign(payload, this.jwtSecret, {
            expiresIn: '12h',
        });
    }

    /**
     * Verify stream token
     */
    verifyStreamToken(token: string): StreamAuthData | null {
        try {
            const decoded = jwt.verify(token, this.jwtSecret) as any;

            if (decoded.type !== 'stream_access') {
                return null;
            }

            return {
                userId: decoded.userId,
                eventId: decoded.eventId,
                ppvPurchaseId: decoded.ppvPurchaseId,
            };
        } catch {
            return null;
        }
    }

    /**
     * Update session heartbeat
     */
    async updateHeartbeat(sessionId: string) {
        await supabaseAdmin
            .from('stream_sessions')
            .update({
                last_heartbeat: new Date().toISOString(),
            })
            .eq('id', sessionId);
    }

    /**
     * Terminate session
     */
    async terminateSession(sessionId: string) {
        await supabaseAdmin
            .from('stream_sessions')
            .update({ is_active: false })
            .eq('id', sessionId);
    }

    /**
     * Get active sessions for user
     */
    async getUserActiveSessions(userId: string) {
        const { data: sessions } = await supabaseAdmin
            .from('stream_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .gt('expires_at', new Date().toISOString());

        return sessions || [];
    }

    /**
     * Track analytics
     */
    async trackAnalytics(sessionId: string, data: {
        watchDuration?: number;
        qualityChanges?: number;
        bufferingEvents?: number;
        deviceType?: string;
    }) {
        const { error } = await supabaseAdmin
            .from('stream_analytics')
            .upsert({
                session_id: sessionId,
                ...data,
            }, {
                onConflict: 'session_id',
            });

        if (error) {
            console.error('Analytics tracking error:', error);
        }
    }
}

// Export singleton instance
export const streamingService = new StreamingService();
