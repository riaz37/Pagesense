'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { DocumentMeta } from '@/lib/api';
import { StatusPill } from '@/components/ui';
import { asDocType } from '@/components/ui/DocTypeIcon';
import {
  type FilterAction,
  type FilterState,
  type SortColumn,
  deriveStatus,
  isFilterActive,
} from '../_state/filters';
import { formatDocName } from '@/lib/format';
interface DocumentTableProps {
  documents: DocumentMeta[];
  state: FilterState;
  dispatch: React.Dispatch<FilterAction>;
  onOpen: (doc: DocumentMeta) => void;
}

const COLUMNS: { key: SortColumn | 'type'; sortable: boolean; widthClass: string; align?: string }[] =
  [
    { key: 'type', sortable: false, widthClass: 'w-[120px]' },
    { key: 'document', sortable: true, widthClass: '' },
    { key: 'issuer', sortable: true, widthClass: 'w-[240px]' },
    { key: 'date', sortable: true, widthClass: 'w-[120px]' },
    { key: 'amount', sortable: true, widthClass: 'w-[150px]', align: 'text-end' },
    { key: 'pages', sortable: true, widthClass: 'w-[80px]', align: 'text-end' },
  ];

function SortIndicator({ direction }: { direction: 'asc' | 'desc' }) {
  return (
    <span aria-hidden className="inline-block ms-1 text-[color:var(--esap-emerald-700)]">
      {direction === 'asc' ? '▲' : '▼'}
    </span>
  );
}

export function DocumentTable({
  documents,
  state,
  dispatch,
  onOpen,
}: DocumentTableProps) {
  const t = useTranslations('documents');
  const locale = useLocale();
  const captionKey = isFilterActive(state) ? 'table.captionFiltered' : 'table.caption';
  const rtl = locale === 'ar';
  const numFmt = React.useMemo(
    () => new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US'),
    [locale],
  );

  return (
    <table className="w-full text-sm border-collapse" role="table">
      <caption className="sr-only">{t(captionKey)}</caption>
      <thead className="sticky top-0 z-10 bg-[color:var(--bg-surface-subtle)]">
        <tr className="text-[13px] font-semibold uppercase tracking-wider text-[color:var(--text-tertiary)]">
          {COLUMNS.map((col) => {
            const labelKey = ('table.' + col.key) as 'table.type';
            const label = t(labelKey);
            const isActive = col.sortable && state.sortBy === col.key;
            const ariaSort = isActive ? (state.sortDir === 'asc' ? 'ascending' : 'descending') : 'none';
            return (
              <th
                key={col.key}
                scope="col"
                aria-sort={col.sortable ? ariaSort : undefined}
                className={
                  'px-6 py-3 border-b border-[color:var(--border-default)] text-start ' +
                  (col.widthClass ?? '') +
                  ' ' +
                  (col.align ?? '')
                }
              >
                {col.sortable ? (
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'toggleSort', column: col.key as SortColumn })}
                    aria-label={t('table.sortBy', { column: label })}
                    className="inline-flex items-center gap-1 hover:text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:underline"
                  >
                    {label}
                    {isActive && <SortIndicator direction={state.sortDir} />}
                  </button>
                ) : (
                  label
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {documents.map((doc, idx) => {
          const docType = asDocType(doc.document_type);
          const status = deriveStatus(doc);
          const title = formatDocName(doc.doc_id, doc.document_number);
          const originalName = doc.document_number || doc.doc_id;
          return (
            <tr
              key={doc.doc_id}
              onClick={() => onOpen(doc)}
              className={
                'cursor-pointer border-b border-[color:var(--border-subtle)] transition-colors ' +
                'hover:bg-[color:var(--bg-surface-hover)] focus-within:bg-[color:var(--bg-surface-hover)] ' +
                (idx % 2 === 1 ? 'bg-[color:var(--bg-surface-subtle)]' : '')
              }
            >
              <td className="px-6 py-4 align-middle">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider badge-${docType}`}
                >
                  {t(`type.${docType}` as 'type.invoice')}
                </span>
              </td>
              <td className="px-6 py-4 align-middle min-w-[200px]">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpen(doc);
                    }}
                    className="block w-full truncate text-start text-[color:var(--text-primary)] font-semibold hover:underline focus-visible:outline-none focus-visible:underline"
                    title={originalName}
                    dir="auto"
                  >
                    {title}
                  </button>
                  <div className="flex items-center">
                    <StatusPill status={status} locale={locale === 'ar' ? 'ar' : 'en'} />
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 align-middle">
                <span
                  className="block truncate text-[color:var(--text-primary)] font-medium"
                  dir={rtl ? 'rtl' : 'ltr'}
                  title={doc.issuer_name ?? ''}
                >
                  {doc.issuer_name || '—'}
                </span>
              </td>
              <td className="px-6 py-4 align-middle whitespace-nowrap text-[color:var(--text-secondary)] tabular-nums">
                {doc.document_date || '—'}
              </td>
              <td className="px-6 py-4 align-middle text-end whitespace-nowrap">
                {doc.total_amount != null && doc.total_amount > 0 ? (
                  <span className="font-medium text-[color:var(--text-primary)] tabular-nums">
                    {numFmt.format(doc.total_amount)}{' '}
                    <span className="text-[11px] text-[color:var(--text-tertiary)] font-normal">
                      {doc.currency || 'SAR'}
                    </span>
                  </span>
                ) : (
                  <span className="text-[color:var(--text-tertiary)]">—</span>
                )}
              </td>
              <td className="px-6 py-4 align-middle text-end text-[color:var(--text-tertiary)] tabular-nums font-medium">
                {doc.page_count ?? 1}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
