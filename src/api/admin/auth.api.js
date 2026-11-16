import { adminApi } from '../client';

/**
 * Password recovery for admins.
 *
 * Kept out of useAdminAuthStore because neither call touches the signed-in admin — they run
 * for someone who is locked out, and putting them in the session store would imply they do.
 */
export function requestPasswordReset(email) {
  return adminApi.post('/auth/forgot-password', { email }).then((res) => res.data);
}

export function resetPassword(token, password) {
  return adminApi.post('/auth/reset-password', { token, password }).then((res) => res.data);
}
