// frontend/src/api/leaderboard.ts
import type { LeaderboardEntry } from '../types';
import { apiClient } from './client';

export const leaderboardApi = {
  getLeaderboard: async (tournamentId: string): Promise<LeaderboardEntry[]> => {
    const res = await apiClient.get<LeaderboardEntry[]>('/leaderboard', {
      params: { tournamentId },
    });
    return res.data;
  },
};
