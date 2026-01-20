import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { supabaseAdmin } from '@/lib/supabase/client';

/**
 * GET /api/manager/assigned-events
 * Get all events assigned to the authenticated manager
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

    // Get assigned events with details
    const { data: assignments, error: assignError } = await supabaseAdmin
      .from('event_manager_assignments')
      .select(`
        event_id,
        assigned_at,
        events:event_id (
          id,
          name,
          description,
          event_date,
          location,
          poster_image
        )
      `)
      .eq('manager_id', userId)
      .order('assigned_at', { ascending: false });

    if (assignError) {
      console.error('Error fetching assignments:', assignError);
      return NextResponse.json(
        { error: 'Failed to fetch assigned events' },
        { status: 500 }
      );
    }

    // Get ticket stats for each event
    const eventsWithStats = await Promise.all(
      (assignments || []).map(async (assignment: any) => {
        const eventId = assignment.events.id;

        // Get total tickets
        const { count: totalTickets } = await supabaseAdmin
          .from('tickets')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', eventId);

        // Get checked-in tickets
        const { count: checkedIn } = await supabaseAdmin
          .from('tickets')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', eventId)
          .eq('checked_in', true);

        return {
          ...assignment.events,
          stats: {
            total_tickets: totalTickets || 0,
            checked_in: checkedIn || 0,
            pending: (totalTickets || 0) - (checkedIn || 0),
          },
          assigned_at: assignment.assigned_at,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        events: eventsWithStats,
        total: eventsWithStats.length,
      },
    });
  } catch (error) {
    console.error('Get assigned events error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
