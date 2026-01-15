import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { withErrorHandler, ValidationError } from '@/lib/middleware/error';
import { streamingService } from '@/lib/services/streaming.service';
import { supabase } from '@/lib/supabase/client';
import { z } from 'zod';

// Validation schema
const streamAuthSchema = z.object({
    eventId: z.string(),
});

/**
 * POST /api/streaming/auth
 * Authenticate user for streaming
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
    const user = await requireAuth(request);
    const body = await request.json();

    // Validate input
    const validation = streamAuthSchema.safeParse(body);
    if (!validation.success) {
        throw new ValidationError(JSON.stringify(validation.error.flatten().fieldErrors));
    }

    const { eventId } = validation.data;

    // Get user ID
    const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

    if (!userData) {
        return errorResponse('User not found', 404);
    }

    // Check PPV access
    const hasAccess = await streamingService.verifyPPVAccess(userData.id, eventId);

    if (!hasAccess) {
        return errorResponse('No PPV access. Please purchase first.', 403);
    }

    // Check concurrent stream limit
    const canStream = await streamingService.checkConcurrentLimit(userData.id, eventId);

    if (!canStream) {
        return errorResponse('Maximum concurrent streams reached', 429);
    }

    // Get event details
    const { data: event } = await supabase
        .from('events')
        .select('name, stream_url')
        .eq('id', eventId)
        .single();

    // Get PPV purchase
    const { data: ppvPurchase } = await supabase
        .from('ppv_purchases')
        .select('id')
        .eq('user_id', userData.id)
        .eq('event_id', eventId)
        .eq('payment_status', 'completed')
        .single();

    // Create stream session
    const ipAddress = request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    const session = await streamingService.createStreamSession(
        {
            userId: userData.id,
            eventId,
            ppvPurchaseId: ppvPurchase?.id,
        },
        ipAddress,
        userAgent
    );

    return successResponse({
        streamUrl: event?.stream_url || `https://stream.example.com/live/${eventId}`,
        accessToken: session.streamToken,
        sessionId: session.id,
        expiresAt: session.expires_at,
        eventName: event?.name,
    });
});
