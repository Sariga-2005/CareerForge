import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Lazy import to avoid circular dependency
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let storeModule: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let authSliceModule: any = null;

const getStore = () => {
  if (!storeModule) {
    storeModule = require('../../store');
  }
  return storeModule.store;
};

const getAuthActions = () => {
  if (!authSliceModule) {
    authSliceModule = require('../../store/slices/authSlice');
  }
  return authSliceModule;
};

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage first (most reliable)
    let token = localStorage.getItem('token');
    
    // Fallback to store if localStorage is empty
    if (!token) {
      const store = getStore();
      const state = store.getState();
      token = state.auth.token;
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Don't retry on refresh endpoint or if already retried
    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh');
    const isLoginRequest = originalRequest?.url?.includes('/auth/login');
    const isLogoutRequest = originalRequest?.url?.includes('/auth/logout');
    
    // Handle 401 Unauthorized - only retry once and not on auth endpoints
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !isRefreshRequest && 
      !isLoginRequest &&
      !isLogoutRequest
    ) {
      originalRequest._retry = true;

      try {
        const store = getStore();
        const authActions = getAuthActions();
        
        // Check if we have a refresh token before attempting refresh
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Attempt to refresh token
        await store.dispatch(authActions.refreshTokenAction()).unwrap();
        
        // Retry original request with new token
        const state = store.getState();
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${state.auth.token}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user and redirect
        const store = getStore();
        const authActions = getAuthActions();
        store.dispatch(authActions.logout());
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    // On 401 for auth endpoints, just reject without retry loop
    if (error.response?.status === 401 && (isRefreshRequest || isLoginRequest)) {
      return Promise.reject(error);
    }

    // Handle other errors
    const errorMessage =
      (error.response?.data as any)?.message || error.message || 'An error occurred';

    return Promise.reject({
      ...error,
      message: errorMessage,
    });
  }
);

export default api;

// Helper for file uploads with progress
export const uploadWithProgress = async (
  url: string,
  file: File,
  onProgress?: (progress: number) => void,
  fieldName: string = 'resume' // Backend expects 'resume' for resume uploads
) => {
  const formData = new FormData();
  formData.append(fieldName, file);

  // Get token from localStorage first, then fallback to store
  let token = localStorage.getItem('token');
  if (!token) {
    const store = getStore();
    const state = store.getState();
    token = state.auth.token;
  }

  if (!token) {
    throw new Error('No authentication token available');
  }

  return axios.post(`${API_BASE_URL}${url}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
};
