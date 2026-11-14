import { adminApi, unwrap } from '../client';

export function listBlogCategories() {
  return unwrap(adminApi.get('/blog/categories'));
}

export function createBlogCategory(payload) {
  return unwrap(adminApi.post('/blog/categories', payload));
}

export function listBlogPosts(params) {
  return adminApi.get('/blog/posts', { params }).then((res) => res.data);
}

export function getBlogPost(id) {
  return unwrap(adminApi.get(`/blog/posts/${id}`));
}

export function createBlogPost(payload) {
  return unwrap(adminApi.post('/blog/posts', payload));
}

export function updateBlogPost(id, payload) {
  return unwrap(adminApi.put(`/blog/posts/${id}`, payload));
}

export function deleteBlogPost(id) {
  return unwrap(adminApi.delete(`/blog/posts/${id}`));
}

export function uploadBlogPostImage(id, file) {
  const formData = new FormData();
  formData.append('image', file);
  return unwrap(adminApi.post(`/blog/posts/${id}/image`, formData));
}

// Counts for the page tiles. Kept apart from the list call, whose meta.total only ever
// describes the current filter and page.
export function getBlogSummary() {
  return unwrap(adminApi.get('/blog/posts/summary'));
}
