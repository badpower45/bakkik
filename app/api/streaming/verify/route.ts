import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { withErrorHandler } from '@/lib/middleware/error';
import { streamingService } from '@/lib/services/streaming.service';

/**
 * GET /api/streaming/verify
 * Verify stream token (for video player)
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
        return errorResponse('Token required', 400);
    }

    // Verify token
    const decoded = streamingService.verifyStreamToken(token);

    if (!decoded) {
        return errorResponse('Invalid or expired token', 401);
    }

    // Verify PPV access still valid
    const hasAccess = await streamingService.verifyPPVAccess(
        decoded.userId,
        decoded.eventId
    );

    if (!hasAccess) {
        return errorResponse('Access revoked', 403);
    }

    return successResponse({
        valid: true,
        userId: decoded.userId,
        eventId: decoded.eventId,
    });
});
