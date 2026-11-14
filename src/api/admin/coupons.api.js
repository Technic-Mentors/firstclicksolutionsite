import { adminApi, unwrap } from '../client';

export function listCoupons(params) {
  return adminApi.get('/coupons', { params }).then((res) => res.data);
}

export function getCoupon(id) {
  return unwrap(adminApi.get(`/coupons/${id}`));
}

export function createCoupon(payload) {
  return unwrap(adminApi.post('/coupons', payload));
}

export function updateCoupon(id, payload) {
  return unwrap(adminApi.put(`/coupons/${id}`, payload));
}

export function deleteCoupon(id) {
  return unwrap(adminApi.delete(`/coupons/${id}`));
}

// Counts for the page tiles. Kept apart from the list call, whose meta.total only ever
// describes the current filter and page.
export function getCouponSummary() {
  return unwrap(adminApi.get('/coupons/summary'));
}
