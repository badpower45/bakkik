import { successResponse } from '@/lib/response';

/**
 * GET /api/health
 * Health check endpoint
 */
export async function GET() {
  return successResponse({
    status: 'ok',
    message: 'Evolution Championship API is running',
    timestamp: new Date().toISOString(),
  });
}
