import { adminApi, unwrap } from '../client';

export function listOrders(params) {
  return adminApi.get('/orders', { params }).then((res) => res.data);
}

export function getOrder(id) {
  return unwrap(adminApi.get(`/orders/${id}`));
}

export function updateOrderStatus(id, payload) {
  return unwrap(adminApi.put(`/orders/${id}/status`, payload));
}

// Counts for the page tiles. Kept apart from the list call, whose meta.total only ever
// describes the current filter and page.
export function getOrderSummary() {
  return unwrap(adminApi.get('/orders/summary'));
}
