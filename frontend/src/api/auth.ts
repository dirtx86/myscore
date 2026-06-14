// frontend/src/api/auth.ts
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  ChangePasswordRequest,
  GeneratePasswordRequest,
  GeneratePasswordResponse,
} from '../types';
import { apiClient } from './client';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await apiClient.post<LoginResponse>('/auth/login', data);
    return res.data;
  },

  register: async (data: RegisterRequest): Promise<User> => {
    const res = await apiClient.post<User>('/auth/register', data);
    return res.data;
  },

  generatePassword: async (
    data: GeneratePasswordRequest,
  ): Promise<GeneratePasswordResponse> => {
    const res = await apiClient.post<GeneratePasswordResponse>(
      '/auth/generate-password',
      data,
    );
    return res.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post('/auth/change-password', data);
  },
};
