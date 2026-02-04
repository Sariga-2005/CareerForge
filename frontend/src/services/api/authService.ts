import api from './index';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
  batch?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'student' | 'admin' | 'alumni';
    avatar?: string;
    department?: string;
    batch?: string;
    company?: string;
    position?: string;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
  refreshToken: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    // Backend returns { success, data: { user, accessToken, refreshToken } }
    const { user, accessToken, refreshToken } = response.data.data;
    return { user, token: accessToken, refreshToken };
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    // Backend returns { success, data: { user, accessToken, refreshToken } }
    const { user, accessToken, refreshToken } = response.data.data;
    return { user, token: accessToken, refreshToken };
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    // Backend returns { success, data: { user } }
    return response.data.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    // Backend returns { success, data: { accessToken, refreshToken } }
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
    return { token: accessToken, refreshToken: newRefreshToken };
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, password });
  },

  verifyEmail: async (token: string): Promise<void> => {
    await api.post('/auth/verify-email', { token });
  },

  updateProfile: async (data: Partial<RegisterData>) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.put('/auth/change-password', { currentPassword, newPassword });
  },
};
