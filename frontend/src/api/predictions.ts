// frontend/src/api/predictions.ts
import type {
  Prediction,
  CreatePredictionRequest,
  UpdatePredictionRequest,
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
};
