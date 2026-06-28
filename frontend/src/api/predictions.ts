// frontend/src/api/predictions.ts
import type {
  Prediction,
  CreatePredictionRequest,
  UpdatePredictionRequest,
  ExactWinnersMatch,
} from '../types';
import { apiClient } from './client';

export const predictionsApi = {
  getMyPredictions: async (): Promise<Prediction[]> => {
    const res = await apiClient.get<Prediction[]>('/predictions/me');
    return res.data;
  },

  createPrediction: async (
    data: CreatePredictionRequest,
  ): Promise<Prediction> => {
    const res = await apiClient.post<Prediction>('/predictions', data);
    return res.data;
  },

  updatePrediction: async (
    id: string,
    data: UpdatePredictionRequest,
  ): Promise<Prediction> => {
    const res = await apiClient.patch<Prediction>(`/predictions/${id}`, data);
    return res.data;
  },

  adminGetForUser: async (userId: string, tournamentId: string): Promise<Prediction[]> => {
    const res = await apiClient.get<Prediction[]>('/predictions/admin/user', {
      params: { userId, tournamentId },
    });
    return res.data;
  },

  adminBackfill: async (data: {
    userId: string;
    matchId: string;
    homeScore: number;
    awayScore: number;
  }): Promise<Prediction> => {
    const res = await apiClient.post<Prediction>('/predictions/admin/backfill', data);
    return res.data;
  },

  adminGetExactWinners: async (tournamentId: string): Promise<ExactWinnersMatch[]> => {
    const res = await apiClient.get<ExactWinnersMatch[]>(
      '/predictions/admin/exact-winners',
      { params: { tournamentId } },
    );
    return res.data;
  },
};
