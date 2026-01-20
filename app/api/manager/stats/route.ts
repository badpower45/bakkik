import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { supabaseAdmin } from '@/lib/supabase/client';

/**
 * GET /api/manager/stats
 * Get manager statistics (total events, check-ins, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify auth
    const authUser = await requireAuth(request);

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, user_type')
      .eq('auth_id', authUser.id)
      .single();

    if (userError || user?.user_type !== 'manager') {
      return NextResponse.json(
        { error: 'Access denied: Manager role required' },
        { status: 403 }
      );
    }

    const userId = user.id;

    // Get total assigned events
    const { count: totalEvents } = await supabaseAdmin
      .from('event_manager_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('manager_id', userId);

    // Get event IDs
    const { data: assignments } = await supabaseAdmin
      .from('event_manager_assignments')
      .select('event_id')
      .eq('manager_id', userId);

    const eventIds = (assignments || []).map((a: any) => a.event_id);

    // Get total tickets and checked-in tickets
    let totalTickets = 0;
    let totalCheckedIn = 0;

    if (eventIds.length > 0) {
      const { count: ticketCount } = await supabaseAdmin
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .in('event_id', eventIds);

      const { count: checkedInCount } = await supabaseAdmin
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .in('event_id', eventIds)
        .eq('checked_in', true);

      totalTickets = ticketCount || 0;
      totalCheckedIn = checkedInCount || 0;
    }

    // Get today's check-ins by this manager
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: todayCheckIns } = await supabaseAdmin
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('checked_in_by', userId)
      .gte('checked_in_at', today.toISOString());

    return NextResponse.json({
      success: true,
      data: {
        total_events: totalEvents || 0,
        total_tickets: totalTickets,
        total_checked_in: totalCheckedIn,
        today_check_ins: todayCheckIns || 0,
        pending: totalTickets - totalCheckedIn,
      },
    });
  } catch (error) {
    console.error('Get manager stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
