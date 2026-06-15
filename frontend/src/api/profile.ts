import type { UserProfile } from '../types';
import { apiClient } from './client';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export function resolveAvatarUrl(avatarUrl: string | null): string | null {
  if (!avatarUrl) return null;
  return `${API_URL}${avatarUrl}`;
}

export const profileApi = {
  getMe: async (): Promise<UserProfile> => {
    const res = await apiClient.get<UserProfile>('/users/me');
    return {
      ...res.data,
      avatarUrl: resolveAvatarUrl(res.data.avatarUrl),
    };
  },

  updateProfile: async (data: {
    nickname?: string;
    bio?: string;
    department?: string;
    favouriteTeamId?: string | null;
  }): Promise<UserProfile> => {
    const res = await apiClient.patch<UserProfile>('/users/me/profile', data);
    return {
      ...res.data,
      avatarUrl: resolveAvatarUrl(res.data.avatarUrl),
    };
  },

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string | null }> => {
    const form = new FormData();
    form.append('avatar', file);
    const res = await apiClient.post<UserProfile>('/users/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { avatarUrl: resolveAvatarUrl(res.data.avatarUrl) };
  },
};
