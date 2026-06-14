import { useQuery } from '@tanstack/react-query';
import type { Match } from '../types';
import { matchesApi, type MatchFilters } from '../api/matches';

export function useMatches(tournamentId: string, filters?: MatchFilters) {
  return useQuery<Match[]>({
    queryKey: ['matches', tournamentId, filters],
    queryFn: () => matchesApi.getMatches(tournamentId, filters),
    enabled: !!tournamentId,
  });
}
