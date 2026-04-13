'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui';

interface EmptyStateProps {
  variant: 'no-docs' | 'filtered';
  onClearFilters?: () => void;
}

export function EmptyState({ variant, onClearFilters }: EmptyStateProps) {
  const t = useTranslations('documents');

  if (variant === 'filtered') {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-6 gap-3">
        <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">
          {t('empty.filteredTitle')}
        </h2>
        <p className="text-sm text-[color:var(--text-secondary)] max-w-sm">
          {t('empty.filteredHint')}
        </p>
        {onClearFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="mt-2">
            {t('empty.filteredCta')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 gap-3">
      <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">{t('empty.title')}</h2>
      <p className="text-sm text-[color:var(--text-secondary)] max-w-sm">{t('empty.hint')}</p>
      <Button asChild className="mt-3">
        <Link href="/upload">{t('empty.cta')}</Link>
      </Button>
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations('documents');
  return (
    <div
      role="alert"
      className="mx-6 mt-4 mb-2 flex items-start gap-3 rounded-md border border-current/30 bg-[color:var(--warning-bg)] px-4 py-3 text-sm text-[color:var(--warning-text)]"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className="mt-0.5 shrink-0">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <div className="flex-1">
        <p className="font-medium">{t('errors.load')}</p>
        <p className="text-xs opacity-80 mt-0.5">{t('errors.loadHint')}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={onRetry} className="shrink-0">
        {t('errors.retry')}
      </Button>
    </div>
  );
}

export function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-[140px] rounded-xl border border-[color:var(--border-subtle)]"
          aria-hidden
        />
      ))}
    </div>
  );
}

export function TableSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="mx-6 my-4 rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--bg-surface)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden"
      role="status"
      aria-live="polite"
      aria-label="Loading documents"
    >
      <span className="sr-only">Loading documents…</span>
      <div className="overflow-x-auto" aria-hidden>
        <table className="w-full text-sm border-collapse">
          <thead className="bg-[color:var(--bg-surface-subtle)]">
            <tr>
              <th className="px-4 py-2.5 border-b border-[color:var(--border-default)] w-32 text-start">
                <div className="skeleton h-3 w-10 rounded" />
              </th>
              <th className="px-4 py-2.5 border-b border-[color:var(--border-default)] text-start">
                <div className="skeleton h-3 w-24 rounded" />
              </th>
              <th className="px-4 py-2.5 border-b border-[color:var(--border-default)] text-start">
                <div className="skeleton h-3 w-16 rounded" />
              </th>
              <th className="px-4 py-2.5 border-b border-[color:var(--border-default)] w-32 text-start">
                <div className="skeleton h-3 w-12 rounded" />
              </th>
              <th className="px-4 py-2.5 border-b border-[color:var(--border-default)] w-36 text-end">
                <div className="skeleton h-3 w-16 rounded ms-auto" />
              </th>
              <th className="px-4 py-2.5 border-b border-[color:var(--border-default)] w-20 text-end">
                <div className="skeleton h-3 w-10 rounded ms-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: count }).map((_, i) => (
              <tr
                key={i}
                className={
                  'border-b border-[color:var(--border-subtle)] ' +
                  (i % 2 === 1 ? 'bg-[color:var(--bg-surface-subtle)]' : '')
                }
              >
                <td className="px-4 py-3 align-middle">
                  <div className="skeleton h-5 w-20 rounded" />
                </td>
                <td className="px-4 py-3 align-middle">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div
                        className="skeleton h-3.5 rounded"
                        style={{ width: `${45 + ((i * 13) % 40)}%` }}
                      />
                      <div
                        className="skeleton h-2.5 rounded opacity-70"
                        style={{ width: `${30 + ((i * 7) % 35)}%` }}
                      />
                    </div>
                    <div className="skeleton h-5 w-16 rounded-full shrink-0" />
                  </div>
                </td>
                <td className="px-4 py-3 align-middle">
                  <div
                    className="skeleton h-3.5 rounded"
                    style={{ width: `${50 + ((i * 11) % 35)}%` }}
                  />
                </td>
                <td className="px-4 py-3 align-middle">
                  <div className="skeleton h-3.5 w-20 rounded" />
                </td>
                <td className="px-4 py-3 align-middle text-end">
                  <div className="skeleton h-3.5 w-20 rounded ms-auto" />
                </td>
                <td className="px-4 py-3 align-middle text-end">
                  <div className="skeleton h-3.5 w-8 rounded ms-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
