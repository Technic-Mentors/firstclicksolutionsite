import { adminApi, unwrap } from '../client';

export function listProducts(params) {
  return adminApi.get('/products', { params }).then((res) => res.data);
}

// Counts for the page's headline tiles. Separate from listProducts() because the list is
// filtered and paged — its meta.total only ever describes the current filter.
export function getProductSummary() {
  return unwrap(adminApi.get('/products/summary'));
}

export function getLowStock() {
  return unwrap(adminApi.get('/products/low-stock'));
}

export function getProduct(id) {
  return unwrap(adminApi.get(`/products/${id}`));
}

export function createProduct(payload) {
  return unwrap(adminApi.post('/products', payload));
}

export function updateProduct(id, payload) {
  return unwrap(adminApi.put(`/products/${id}`, payload));
}

// A targeted PATCH rather than updateProduct(): that one replaces every field, so using it
// for a single toggle would push the whole (possibly stale) product back to the server.
export function setProductFeatured(id, isFeatured) {
  return unwrap(adminApi.patch(`/products/${id}/featured`, { isFeatured }));
}

export function deleteProduct(id) {
  return unwrap(adminApi.delete(`/products/${id}`));
}

export function addVariant(productId, payload) {
  return unwrap(adminApi.post(`/products/${productId}/variants`, payload));
}

export function updateVariant(productId, variantId, payload) {
  return unwrap(adminApi.put(`/products/${productId}/variants/${variantId}`, payload));
}

export function deleteVariant(productId, variantId) {
  return unwrap(adminApi.delete(`/products/${productId}/variants/${variantId}`));
}

export function addProductImage(productId, file, { variantId, isPrimary } = {}) {
  const formData = new FormData();
  formData.append('image', file);
  if (variantId !== undefined && variantId !== null && variantId !== '') {
    formData.append('variantId', variantId);
  }
  if (isPrimary !== undefined) {
    formData.append('isPrimary', isPrimary ? 'true' : 'false');
  }
  return unwrap(adminApi.post(`/products/${productId}/images`, formData));
}

export function deleteProductImage(productId, imageId) {
  return unwrap(adminApi.delete(`/products/${productId}/images/${imageId}`));
}

export function setPrimaryImage(productId, imageId) {
  return unwrap(adminApi.put(`/products/${productId}/images/${imageId}/primary`));
}

// Variant-level stock counts for the inventory page.
export function getInventorySummary() {
  return unwrap(adminApi.get('/products/inventory-summary'));
}
