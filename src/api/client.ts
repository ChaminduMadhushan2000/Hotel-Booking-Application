import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '../store/auth.store';

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshTokenResponse {
  accessToken: string;
}

function _isRefreshTokenResponse(data: unknown): data is RefreshTokenResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'accessToken' in data &&
    typeof (data as { accessToken: unknown }).accessToken === 'string'
  );
}

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config: RetryRequestConfig): RetryRequestConfig => {
    const token = useAuthStore.getState().accessToken;
    if (token !== null) {
      if (config.headers === undefined) {
        config.headers = new AxiosHeaders();
      }
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error: AxiosError): Promise<never> => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError): Promise<AxiosResponse> => {
    const requestConfig = error.config as RetryRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      requestConfig !== undefined &&
      !requestConfig._retry
    ) {
      requestConfig._retry = true;

      try {
        const refreshResponse = await apiClient.post<RefreshTokenResponse>(
          '/api/v1/auth/refresh',
        );

        if (_isRefreshTokenResponse(refreshResponse.data)) {
          const refreshedToken = refreshResponse.data.accessToken;
          useAuthStore.getState().setToken(refreshedToken);

          if (requestConfig.headers === undefined) {
            requestConfig.headers = new AxiosHeaders();
          }
          requestConfig.headers.set('Authorization', `Bearer ${refreshedToken}`);

          return apiClient.request(requestConfig);
        }

        useAuthStore.getState().clearAuth();
        window.location.assign('/login');
        return Promise.reject(error);
      } catch (_refreshError: unknown) {
        useAuthStore.getState().clearAuth();
        window.location.assign('/login');
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
