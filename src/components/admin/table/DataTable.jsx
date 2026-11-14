import Spinner from '../../ui/Spinner';
import EmptyState from '../../ui/EmptyState';
import Pagination from '../../ui/Pagination';
import { cn } from '../../../utils/cn';

/**
 * One table, two shapes.
 *
 * On a phone a wide table can only be sidescrolled, which hides most of every row and makes
 * the columns impossible to compare — so below `md` each row is re-laid out as a card: the
 * column marked `primary` becomes the heading, the one marked `actions` sits top-right, and
 * everything else becomes labelled rows. The desktop table is unchanged.
 *
 * Columns accept:
 *   primary  — the identifying field; the card heading (defaults to the first column)
 *   actions  — the row's controls; pinned top-right on the card, never given a label
 *   hideOnMobile — detail that is not worth the vertical space on a phone
 */
export default function DataTable({
  columns,
  rows,
  loading = false,
  emptyArt,
  emptyTitle = 'No records found',
  emptyMessage = 'Nothing to show yet.',
  emptyAction,
  pagination,
  onRowClick,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-stone-200 bg-white py-20">
        <Spinner />
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-xl border border-stone-300 bg-white md:border-stone-200">
        <EmptyState art={emptyArt} title={emptyTitle} description={emptyMessage} action={emptyAction} />
      </div>
    );
  }

  const actionsColumn = columns.find((col) => col.actions);
  const primaryColumn = columns.find((col) => col.primary) ?? columns.find((col) => !col.actions);
  const detailColumns = columns.filter(
    (col) => col !== actionsColumn && col !== primaryColumn && !col.hideOnMobile,
  );

  const cell = (col, row) => (col.render ? col.render(row) : row[col.key]);

  // A page that declares any column width is asking for a fixed layout, where the widths it
  // gave are honoured and everything else shares what is left. Without one, the browser
  // sizes columns to content as before — just no longer allowed to overflow the panel.
  const hasWidths = columns.some((col) => col.width);

  return (
    // The frame belongs to the desktop table only. On a phone each row is its own card, so a
    // wrapper border here would just draw a second box around them.
    <div className="md:overflow-hidden md:rounded-lg md:border md:border-stone-200 md:bg-white">
      {/* Phone: one card per row, separated by real gaps rather than hairlines — a stack of
          faint dividers reads as one long list, which is exactly what makes a product row
          hard to pick out. */}
      <ul className="flex flex-col gap-3 md:hidden">
        {rows.map((row, idx) => (
          <li
            key={row.id ?? idx}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={cn(
              'rounded-xl border border-stone-300 bg-white p-4 shadow-sm',
              onRowClick && 'cursor-pointer active:border-gold-400 active:bg-gold-50/40',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 text-[15px] font-semibold text-charcoal">
                {cell(primaryColumn, row)}
              </div>
              {actionsColumn && <div className="-mr-1 -mt-1 shrink-0">{cell(actionsColumn, row)}</div>}
            </div>

            {detailColumns.length > 0 && (
              <dl className="mt-3 flex flex-col gap-1.5 border-t border-stone-100 pt-3">
                {detailColumns.map((col) => (
                  <div key={col.key} className="flex items-baseline justify-between gap-3 text-sm">
                    <dt className="shrink-0 text-xs text-charcoal-light">{col.label}</dt>
                    <dd className="min-w-0 truncate text-right text-charcoal">{cell(col, row)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </li>
        ))}
      </ul>

      {/* Tablet and up: the real table */}
      <div className="hidden overflow-x-auto md:block">
        <table
          className={cn(
            // `min-w-max` used to live here, which is what forced every wide table to
            // sidescroll: it sized the table to its content and let it overflow. The table
            // now sizes to the panel instead, and columns that can be long are truncated.
            'w-full text-left text-sm',
            hasWidths && 'table-fixed',
          )}
        >
          {hasWidths && (
            <colgroup>
              {columns.map((col) => (
                <col key={col.key} style={col.width ? { width: col.width } : undefined} />
              ))}
            </colgroup>
          )}
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-charcoal-light',
                    col.actions && 'text-right',
                    col.align === 'right' && 'text-right',
                  )}
                >
                  {col.actions ? <span className="sr-only">{col.label}</span> : col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.id ?? idx}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-b border-stone-100 last:border-0',
                  onRowClick && 'cursor-pointer hover:bg-gold-50/40',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-3 py-2.5 align-middle text-charcoal',
                      // Only columns that opt out of truncation keep their full width; the
                      // rest give way so the row as a whole fits the panel.
                      col.wrap ? 'whitespace-normal' : 'truncate whitespace-nowrap',
                      col.actions && 'text-right',
                      col.align === 'right' && 'text-right',
                    )}
                  >
                    {cell(col, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        // On a phone the wrapper has no frame of its own, so the pager needs one; from md up
        // it sits inside the table's box and must not draw a second border.
        <div className="mt-3 rounded-xl border border-stone-300 bg-white md:mt-0 md:rounded-none md:border-0">
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  );
}
