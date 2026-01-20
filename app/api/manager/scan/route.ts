import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { withErrorHandler, ValidationError } from '@/lib/middleware/error';
import { supabaseAdmin } from '@/lib/supabase/client';
import { qrService } from '@/lib/services/qr.service';
import { z } from 'zod';

const scanSchema = z.object({
    qrData: z.string(),
});

/**
 * POST /api/manager/scan
 * Validate QR code and return ticket details
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
    // Verify auth
    const authUser = await requireAuth(request);

    const { data: user } = await supabaseAdmin
        .from('users')
        .select('id, user_type')
        .eq('auth_id', authUser.id)
        .single();

    if (!user || !['manager', 'admin'].includes(user.user_type)) {
        throw new Error('Access denied: Manager or Admin role required');
    }

    const userId = user.id;

    const body = await request.json();
    const validation = scanSchema.safeParse(body);

    if (!validation.success) {
        throw new ValidationError('Invalid request');
    }

    const { qrData } = validation.data;

    // Validate QR code
    const qrValidation = qrService.validateTicketQR(qrData);

    if (!qrValidation.valid) {
        // Log failed scan
        return errorResponse(qrValidation.error || 'Invalid QR code', 400);
    }

    const ticketData = qrValidation.data!;

    // Get ticket from database
    const { data: ticket, error } = await supabaseAdmin
        .from('tickets')
        .select(`
      *,
      event:events(id, name, event_date, location),
      ticket_type:ticket_types(id, name, price),
      user:users(id, name, email)
    `)
        .eq('id', ticketData.ticketId)
        .single();

    if (error || !ticket) {
        return errorResponse('Ticket not found', 404);
    }

    // Check payment status
    if (ticket.payment_status !== 'completed') {
        return successResponse({
            valid: false,
            status: 'unpaid',
            message: 'Ticket payment not completed',
            ticket,
        });
    }

    // Check if already checked in
    if (ticket.checked_in) {
        return successResponse({
            valid: false,
            status: 'already_used',
            message: 'Ticket already checked in',
            ticket,
            checked_in_at: ticket.checked_in_at,
        });
    }

    // Log scan
    await supabaseAdmin
        .from('ticket_scans')
        .insert({
            ticket_id: ticket.id,
            scanned_by: userId,
            scan_type: 'verification',
            status: 'valid',
        });

    return successResponse({
        valid: true,
        status: 'valid',
        message: 'Ticket is valid',
        ticket,
    });
});
