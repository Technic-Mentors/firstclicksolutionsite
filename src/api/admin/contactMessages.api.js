import { adminApi, unwrap } from '../client';

export function listContactMessages(params) {
  return adminApi.get('/contact-messages', { params }).then((res) => res.data);
}

export function markContactMessageRead(id) {
  return adminApi.put(`/contact-messages/${id}/read`).then((res) => res.data);
}

// Counts for the page tiles. Kept apart from the list call, whose meta.total only ever
// describes the current filter and page.
export function getContactSummary() {
  return unwrap(adminApi.get('/contact-messages/summary'));
}
