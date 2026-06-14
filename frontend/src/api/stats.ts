// frontend/src/api/stats.ts
import type { Stats } from '../types';
import { apiClient } from './client';

export const statsApi = {
  getStats: async (): Promise<Stats> => {
    const res = await apiClient.get<Stats>('/stats');
    return res.data;
  },
};
