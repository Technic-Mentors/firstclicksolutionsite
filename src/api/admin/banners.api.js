import { adminApi, unwrap } from '../client';

export function listBanners(params) {
  return adminApi.get('/banners', { params }).then((res) => res.data);
}

export function createBanner(payload) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    formData.append(key, value);
  });
  return unwrap(adminApi.post('/banners', formData));
}

export function updateBanner(id, payload) {
  return unwrap(adminApi.put(`/banners/${id}`, payload));
}

export function deleteBanner(id) {
  return unwrap(adminApi.delete(`/banners/${id}`));
}

// Counts for the page tiles. Kept apart from the list call, whose meta.total only ever
// describes the current filter and page.
export function getBannerSummary() {
  return unwrap(adminApi.get('/banners/summary'));
}
