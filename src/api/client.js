import axios from 'axios';
import { DEV_BACKEND_PORT, PROD_API_URL } from '../config/site.js';
import { getTokens, setTokens, clearTokens } from './tokenStore.js';

// The backend's own origin. Calls go to it directly, cross-origin — no proxy in front.
// That is only workable because sessions are carried by a Bearer token rather than a cookie
// (see tokenStore.js for why), so nothing here depends on the two domains matching.
export const API_ORIGIN = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? `http://localhost:${DEV_BACKEND_PORT}` : PROD_API_URL);

export const shopApi = axios.create({ baseURL: `${API_ORIGIN}/api/v1/shop` });
export const adminApi = axios.create({ baseURL: `${API_ORIGIN}/api/v1/admin` });

const REFRESH_PATH = '/auth/refresh';
const LOGOUT_PATH = '/auth/logout';

function attachAuth(client, scope, onAuthFailure) {
  client.interceptors.request.use((config) => {
    const { accessToken, refreshToken } = getTokens(scope);
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    // The refresh token used to ride along in a cookie; now it has to be sent explicitly.
    if (refreshToken && (config.url === REFRESH_PATH || config.url === LOGOUT_PATH)) {
      config.data = { ...(config.data ?? {}), refreshToken };
    }
    return config;
  });

  let refreshPromise = null;

  client.interceptors.response.use(
    (response) => {
      // Login, register and refresh all hand back a fresh pair — store it wherever it appears
      // so the auth stores stay unaware of how sessions are carried.
      setTokens(scope, response.data?.tokens);
      if (response.config?.url === LOGOUT_PATH) clearTokens(scope);
      return response;
    },
    async (error) => {
      const { config, response } = error;
      if (response?.status !== 401 || config?._retried || config?.url === REFRESH_PATH) {
        // A 401 from the refresh endpoint itself means the refresh token is spent or revoked.
        if (config?.url === REFRESH_PATH) clearTokens(scope);
        return Promise.reject(error);
      }

      const { refreshToken } = getTokens(scope);
      if (!refreshToken) return Promise.reject(error);
      config._retried = true;

      try {
        refreshPromise ??= client.post(REFRESH_PATH).finally(() => {
          refreshPromise = null;
        });
        await refreshPromise;
        return client(config);
      } catch {
        clearTokens(scope);
        onAuthFailure?.();
        return Promise.reject(error);
      }
    },
  );
}

attachAuth(shopApi, 'shop');
attachAuth(adminApi, 'admin');

export function unwrap(promise) {
  return promise.then((res) => res.data.data);
}
