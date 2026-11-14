import { adminApi, unwrap } from '../client';

export function getShipping() {
  return unwrap(adminApi.get('/shipping'));
}

export function updateShipping(payload) {
  return unwrap(adminApi.put('/shipping', payload));
}

export function createShippingZone(payload) {
  return unwrap(adminApi.post('/shipping/zones', payload));
}

export function updateShippingZone(id, payload) {
  return unwrap(adminApi.put(`/shipping/zones/${id}`, payload));
}

export function deleteShippingZone(id) {
  return unwrap(adminApi.delete(`/shipping/zones/${id}`));
}

// Counts for the page tiles. Kept apart from the list call, whose meta.total only ever
// describes the current filter and page.
export function getShippingSummary() {
  return unwrap(adminApi.get('/shipping/summary'));
}
