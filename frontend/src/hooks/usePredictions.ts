import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Prediction } from '../types';
import { predictionsApi } from '../api/predictions';

export function usePredictions() {
  return useQuery<Prediction[]>({
    queryKey: ['predictions', 'me'],
    queryFn: () => predictionsApi.getMyPredictions(),
  });
}

export interface SavePredictionArgs {
  matchId: string;
  homeScore: number;
  awayScore: number;
  existingPredictionId?: string;
}

export function useSavePrediction() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, homeScore, awayScore, existingPredictionId }: SavePredictionArgs) => {
      if (existingPredictionId) {
        return predictionsApi.updatePrediction(existingPredictionId, { homeScore, awayScore });
      }
      return predictionsApi.createPrediction({ matchId, homeScore, awayScore });
    },

    onMutate: async (args) => {
      await qc.cancelQueries({ queryKey: ['predictions', 'me'] });
      const previous = qc.getQueryData<Prediction[]>(['predictions', 'me']);

      qc.setQueryData<Prediction[]>(['predictions', 'me'], (old = []) => {
        const existing = old.find((p) => p.matchId === args.matchId);
        if (existing) {
          return old.map((p) => p.matchId === args.matchId ? { ...p, homeScore: args.homeScore, awayScore: args.awayScore } : p);
        }
        const optimistic: Prediction = {
          id: `optimistic-${Date.now()}`,
          userId: '', matchId: args.matchId,
          homeScore: args.homeScore, awayScore: args.awayScore,
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        };
        return [...old, optimistic];
      });

      return { previous };
    },

    onError: (_err, _args, context) => {
      if (context?.previous) {
        qc.setQueryData(['predictions', 'me'], context.previous);
      }
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['predictions', 'me'] });
      qc.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}
