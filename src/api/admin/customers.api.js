import { adminApi, unwrap } from '../client';

export function listCustomers(params) {
  return adminApi.get('/customers', { params }).then((res) => res.data);
}

export function getCustomer(id) {
  return unwrap(adminApi.get(`/customers/${id}`));
}

export function blockCustomer(id, isBlocked) {
  return unwrap(adminApi.put(`/customers/${id}/block`, { isBlocked }));
}

// Counts for the page tiles. Kept apart from the list call, whose meta.total only ever
// describes the current filter and page.
export function getCustomerSummary() {
  return unwrap(adminApi.get('/customers/summary'));
}
