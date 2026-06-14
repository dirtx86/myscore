// frontend/src/api/teams.ts
import type { Team, CreateTeamRequest } from '../types';
import { apiClient } from './client';

export const teamsApi = {
  getTeams: async (tournamentId: string): Promise<Team[]> => {
    const res = await apiClient.get<Team[]>(
      `/tournaments/${tournamentId}/teams`,
    );
    return res.data;
  },

  createTeam: async (data: CreateTeamRequest): Promise<Team> => {
    const res = await apiClient.post<Team>('/teams', data);
    return res.data;
  },

  updateTeam: async (
    id: string,
    data: Partial<Omit<CreateTeamRequest, 'tournamentId'>>,
  ): Promise<Team> => {
    const res = await apiClient.patch<Team>(`/teams/${id}`, data);
    return res.data;
  },

  deleteTeam: async (id: string): Promise<void> => {
    await apiClient.delete(`/teams/${id}`);
  },
};
