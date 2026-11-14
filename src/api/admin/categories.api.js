import { adminApi, unwrap } from '../client';

export function listCategories() {
  return unwrap(adminApi.get('/categories'));
}

// Counts for the page tiles — listCategories() is shared with dropdowns elsewhere and
// should not grow aggregate work for them.
export function getCategorySummary() {
  return unwrap(adminApi.get('/categories/summary'));
}

// Targeted PATCH: updateCategory() rewrites every column from its payload, so a single
// toggle must not go through it.
export function setCategoryVisibility(id, isActive) {
  return unwrap(adminApi.patch(`/categories/${id}/visibility`, { isActive }));
}

export function getCategory(id) {
  return unwrap(adminApi.get(`/categories/${id}`));
}

export function createCategory(payload) {
  return unwrap(adminApi.post('/categories', payload));
}

export function updateCategory(id, payload) {
  return unwrap(adminApi.put(`/categories/${id}`, payload));
}

export function deleteCategory(id) {
  return unwrap(adminApi.delete(`/categories/${id}`));
}

export function uploadCategoryBanner(id, file) {
  const formData = new FormData();
  formData.append('image', file);
  return unwrap(adminApi.post(`/categories/${id}/banner`, formData));
}
