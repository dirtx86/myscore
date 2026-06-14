import { useQuery } from '@tanstack/react-query';
import type { LeaderboardEntry } from '../types';
import { leaderboardApi } from '../api/leaderboard';

export function useLeaderboard(tournamentId: string) {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', tournamentId],
    queryFn: () => leaderboardApi.getLeaderboard(tournamentId),
    enabled: !!tournamentId,
  });
}
