import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/response';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/leaderboard/rankings
 * Get fighter rankings sorted by record and points
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();
        const searchParams = request.nextUrl.searchParams;
        const weightClassId = searchParams.get('weightClassId');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Query fighters with their user info and weight class
        let query = supabase
            .from('fighters')
            .select(`
        id,
        nickname,
        record_wins,
        record_losses,
        record_draws,
        titles,
        profile_picture,
        weight_class_id,
        status,
        user_id,
        users!inner (
          id,
          name,
          profile_picture
        ),
        weight_classes!inner (
          id,
          name,
          name_arabic
        )
      `)
            .eq('status', 'approved')
            .order('record_wins', { ascending: false })
            .range(offset, offset + limit - 1);

        if (weightClassId) {
            query = query.eq('weight_class_id', parseInt(weightClassId));
        }

        const { data, error } = await query;

        if (error) throw error;

        // Transform data to leaderboard format with rankings
        const rankings = data.map((fighter: any, index: number) => {
            const totalFights = fighter.record_wins + fighter.record_losses + fighter.record_draws;
            const winRate = totalFights > 0 ? (fighter.record_wins / totalFights) * 100 : 0;

            // Calculate points based on wins and win rate
            const points = (fighter.record_wins * 100) + Math.round(winRate * 10);

            // Check if fighter is champion (has any titles)
            const isChampion = fighter.titles && fighter.titles.length > 0;
            const title = isChampion ? fighter.titles[0] : null;

            return {
                rank: offset + index + 1,
                fighterId: fighter.id,
                name: fighter.users.name,
                nickname: fighter.nickname,
                imageUrl: fighter.profile_picture || fighter.users.profile_picture,
                wins: fighter.record_wins,
                losses: fighter.record_losses,
                draws: fighter.record_draws,
                title: title,
                isChampion: isChampion,
                weightClass: fighter.weight_classes.name,
                points: points,
            };
        });

        return successResponse({
            rankings,
            message: 'Rankings retrieved successfully',
        });
    } catch (error: any) {
        console.error('Get rankings error:', error);
        return errorResponse(error.message, 500);
    }
}
