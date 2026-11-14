import { adminApi, unwrap } from '../client';

export function getDashboard(params) {
  return unwrap(adminApi.get('/dashboard', { params }));
}

// Just the four "needs attention" counts for the sidebar badges — a much cheaper call than
// getDashboard(), which the sidebar would otherwise fire on every admin page.
export function getBadgeCounts() {
  return unwrap(adminApi.get('/dashboard/badges'));
}
