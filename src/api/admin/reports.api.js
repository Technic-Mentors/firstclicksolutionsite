import { adminApi } from '../client';

export async function getSalesReport({ dateFrom, dateTo, topLimit, status } = {}) {
  const { data } = await adminApi.get('/reports/sales', { params: { dateFrom, dateTo, topLimit, status } });
  return data.data;
}

/**
 * Downloads the sales CSV.
 *
 * This cannot be a plain <a href> to the export URL: the API lives on another domain and the
 * session is a Bearer token, which a browser-initiated navigation has no way to attach — the
 * request would arrive unauthenticated and come back 401. So the file is fetched through the
 * same axios client as everything else and handed to the browser as a blob.
 */
export async function downloadSalesCsv({ dateFrom, dateTo, status } = {}) {
  const { data, headers } = await adminApi.get('/reports/sales/export', {
    params: { dateFrom, dateTo, status },
    responseType: 'blob',
  });

  const filenameMatch = /filename="?([^";]+)"?/i.exec(headers?.['content-disposition'] || '');
  const filename = filenameMatch?.[1] || `sales-report-${new Date().toISOString().slice(0, 10)}.csv`;

  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
