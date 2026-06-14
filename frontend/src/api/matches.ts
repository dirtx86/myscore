// frontend/src/api/matches.ts
import type {
  Match,
  Tournament,
  ScoreRules,
  CreateMatchRequest,
  MatchResultRequest,
  MatchStatus,
} from '../types';
import { apiClient } from './client';

export interface MatchFilters {
  group?: string;
  status?: MatchStatus;
  search?: string;
}

export const matchesApi = {
  getActiveTournament: async (): Promise<Tournament> => {
    const res = await apiClient.get<Tournament>('/tournaments/active');
    return res.data;
  },

  getMatches: async (
    tournamentId: string,
    filters: MatchFilters = {},
  ): Promise<Match[]> => {
    const params: Record<string, string> = {};
    if (filters.group) params.group = filters.group;
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;
    const res = await apiClient.get<Match[]>(
      `/tournaments/${tournamentId}/matches`,
      { params },
    );
    return res.data;
  },

  getTeams: async (tournamentId: string) => {
    const { teamsApi } = await import('./teams');
    return teamsApi.getTeams(tournamentId);
  },

  getScoreRules: async (tournamentId: string): Promise<ScoreRules> => {
    const res = await apiClient.get<ScoreRules>(
      `/tournaments/${tournamentId}/score-rules`,
    );
    return res.data;
  },

  updateScoreRules: async (
    tournamentId: string,
    data: Partial<Pick<ScoreRules, 'totoPts' | 'fullScorePts' | 'goalDiffPts'>>,
  ): Promise<ScoreRules> => {
    const res = await apiClient.patch<ScoreRules>(
      `/tournaments/${tournamentId}/score-rules`,
      data,
    );
    return res.data;
  },

  updateTournamentLockMinutes: async (
    tournamentId: string,
    lockMinutes: number,
  ): Promise<Tournament> => {
    const res = await apiClient.patch<Tournament>(`/tournaments/${tournamentId}`, {
      lockMinutes,
    });
    return res.data;
  },

  updateMatchStatus: async (
    matchId: string,
    status: MatchStatus,
  ): Promise<Match> => {
    const res = await apiClient.patch<Match>(`/matches/${matchId}/status`, {
      status,
    });
    return res.data;
  },

  updateMatchResult: async (
    matchId: string,
    data: MatchResultRequest,
  ): Promise<Match> => {
    const res = await apiClient.patch<Match>(
      `/matches/${matchId}/result`,
      data,
    );
    return res.data;
  },

  createMatch: async (data: CreateMatchRequest): Promise<Match> => {
    const res = await apiClient.post<Match>('/matches', data);
    return res.data;
  },
};
