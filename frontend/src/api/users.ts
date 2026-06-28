// frontend/src/api/users.ts
import type { User } from '../types';
import { apiClient } from './client';

export const usersApi = {
  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>('/users/me');
    return res.data;
  },

  updateMe: async (data: Partial<Pick<User, 'displayName'>>): Promise<User> => {
    const res = await apiClient.patch<User>('/users/me', data);
    return res.data;
  },

  listUsers: async (): Promise<User[]> => {
    const res = await apiClient.get<User[]>('/users');
    return res.data;
  },

  disableUser: async (id: string): Promise<void> => {
    await apiClient.patch(`/users/${id}/disable`);
  },

  resetUserPassword: async (id: string): Promise<{ password: string }> => {
    const res = await apiClient.post<{ password: string }>(
      `/users/${id}/reset-password`,
    );
    return res.data;
  },

  enableUser: async (id: string): Promise<void> => {
    await apiClient.post(`/users/${id}/enable`);
  },

  adminCreateUser: async (data: {
    email: string;
    displayName: string;
  }): Promise<{ id: string; email: string; displayName: string; temporaryPassword: string }> => {
    const res = await apiClient.post('/users/admin/create', data);
    return res.data;
  },

  adminUpdateUser: async (
    id: string,
    data: { displayName?: string; email?: string; department?: string },
  ): Promise<void> => {
    await apiClient.patch(`/users/admin/${id}`, data);
  },
};
