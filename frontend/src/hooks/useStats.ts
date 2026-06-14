import { useQuery } from '@tanstack/react-query';
import type { Stats } from '../types';
import { statsApi } from '../api/stats';

export function useStats() {
  return useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: () => statsApi.getStats(),
  });
}
