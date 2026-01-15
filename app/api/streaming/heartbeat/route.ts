import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { withErrorHandler } from '@/lib/middleware/error';
import { streamingService } from '@/lib/services/streaming.service';
import { z } from 'zod';

// Validation schema
const heartbeatSchema = z.object({
    sessionId: z.string().uuid(),
});

/**
 * POST /api/streaming/heartbeat
 * Update stream session heartbeat
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
    await requireAuth(request);
    const body = await request.json();

    const validation = heartbeatSchema.safeParse(body);
    if (!validation.success) {
        return errorResponse('Invalid session ID', 400);
    }

    const { sessionId } = validation.data;

    await streamingService.updateHeartbeat(sessionId);

    return successResponse({ updated: true });
});
