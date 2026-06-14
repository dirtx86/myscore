import type { Tournament } from '../types';
import { apiClient } from './client';

export async function getActiveTournament(): Promise<Tournament> {
  const res = await apiClient.get<Tournament>('/tournaments/active');
  return res.data;
}
