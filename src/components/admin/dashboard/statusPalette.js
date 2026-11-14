// Order-status colours for the dashboard.
//
// The seven order statuses collapse into five buckets here — a stacked bar with seven
// segments is unreadable, and several statuses mean the same thing to someone scanning the
// dashboard. Each bucket's label names exactly what it contains, so nothing is hidden.
//
// The hues were chosen by running the palette validator (colourblind separation, chroma,
// lightness band) rather than by eye; this exact set passes every check against a white card
// for normal vision and for protan/deutan/tritan. Changing one value means re-running it.
// Brand orange is deliberately absent: it means "action" everywhere else in the admin, and a
// status must not compete with a button for that meaning.
export const ORDER_STATUS_BUCKETS = [
  { key: 'delivered', label: 'Delivered', color: '#15803d', statuses: ['delivered'] },
  { key: 'processing', label: 'Processing', color: '#0891b2', statuses: ['confirmed', 'packed'] },
  { key: 'shipped', label: 'Shipped', color: '#7c3aed', statuses: ['shipped'] },
  { key: 'pending', label: 'Pending confirmation', color: '#ca8a04', statuses: ['placed'] },
  { key: 'cancelled', label: 'Cancelled / returned', color: '#dc2626', statuses: ['cancelled', 'returned'] },
];

/** Rolls the raw `{ status: count }` map into the five buckets above, dropping empty ones. */
export function bucketOrderStatuses(counts = {}) {
  const buckets = ORDER_STATUS_BUCKETS.map((bucket) => ({
    ...bucket,
    count: bucket.statuses.reduce((sum, status) => sum + (counts[status] || 0), 0),
  }));
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);
  return { buckets: buckets.filter((b) => b.count > 0), total };
}
