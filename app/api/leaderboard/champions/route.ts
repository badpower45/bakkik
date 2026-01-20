import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/response';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/leaderboard/champions
 * Get current champions for each weight class
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();

        // Get weight classes with their current champions
        const { data: weightClasses, error: wcError } = await supabase
            .from('weight_classes')
            .select(`
        id,
        name,
        name_arabic,
        current_champion_id,
        fighters!weight_classes_current_champion_id_fkey (
          id,
          nickname,
          record_wins,
          record_losses,
          record_draws,
          titles,
          profile_picture,
          users!inner (
            id,
            name,
            profile_picture
          )
        )
      `)
            .not('current_champion_id', 'is', null)
            .order('id');

        if (wcError) throw wcError;

        // Transform to leaderboard format
        const champions = weightClasses
            .filter((wc: any) => wc.fighters)
            .map((wc: any, index: number) => {
                const fighter = wc.fighters;
                const totalFights = fighter.record_wins + fighter.record_losses + fighter.record_draws;
                const winRate = totalFights > 0 ? (fighter.record_wins / totalFights) * 100 : 0;
                const points = (fighter.record_wins * 100) + Math.round(winRate * 10);

                return {
                    rank: index + 1,
                    fighterId: fighter.id,
                    name: fighter.users.name,
                    nickname: fighter.nickname,
                    imageUrl: fighter.profile_picture || fighter.users.profile_picture,
                    wins: fighter.record_wins,
                    losses: fighter.record_losses,
                    draws: fighter.record_draws,
                    title: `EVO ${wc.name} Champion`,
                    isChampion: true,
                    weightClass: wc.name,
                    points: points,
                };
            });

        return successResponse({
            champions,
            message: 'Champions retrieved successfully',
        });
    } catch (error: any) {
        console.error('Get champions error:', error);
        return errorResponse(error.message, 500);
    }
}
