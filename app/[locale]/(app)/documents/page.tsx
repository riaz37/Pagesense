'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  fetchDocument,
  fetchDocuments,
  type DocumentDetail,
  type DocumentMeta,
} from '@/lib/api';
import DocumentViewer from '@/components/DocumentViewer';
import {
  applyFilters,
  filterReducer,
  initialFilterState,
  isFilterActive,
  parseFilters,
  serializeFilters,
  uniqueCurrencies,
  uniqueTypes,
} from './_state/filters';
import { useDocumentsView } from './_state/useDocumentsView';
import { useGridNavigation } from './_state/useGridNavigation';
import { Toolbar } from './_components/Toolbar';
import { DocumentCard } from './_components/DocumentCard';
import { DocumentTable } from './_components/DocumentTable';
import {
  EmptyState,
  ErrorState,
  GridSkeleton,
  TableSkeleton,
} from './_components/EmptyState';

const PAGE_SIZE = 24;

function getColumns(width: number): number {
  if (width >= 1080) return 3;
  if (width >= 600) return 2;
  return 1;
}

export default function DocumentsPage() {
  return (
    <React.Suspense fallback={null}>
      <DocumentsPageInner />
    </React.Suspense>
  );
}

function DocumentsPageInner() {
  const t = useTranslations('documents');
  const locale = useLocale();
  const rtl = locale === 'ar';
  const router = useRouter();
  const searchParams = useSearchParams();

  const [docs, setDocs] = React.useState<DocumentMeta[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pageCount, setPageCount] = React.useState(1);
  const [retryToken, setRetryToken] = React.useState(0);

  const [state, dispatch] = React.useReducer(filterReducer, initialFilterState, (seed) => {
    if (typeof window === 'undefined') return seed;
    return parseFilters(new URLSearchParams(window.location.search));
  });

  const { view, setView } = useDocumentsView('table');
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);
  const [columns, setColumns] = React.useState(3);
  const [announcement, setAnnouncement] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchDocuments()
      .then((items) => {
        if (cancelled) return;
        setDocs(items);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message || 'Failed to load');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [retryToken]);

  React.useEffect(() => {
    const next = serializeFilters(state).toString();
    const current = searchParams.toString();
    if (next === current) return;
    const url = next ? `?${next}` : window.location.pathname;
    router.replace(url, { scroll: false });
  }, [state, router, searchParams]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const compute = () => setColumns(getColumns(window.innerWidth));
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== '/') return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) return;
      e.preventDefault();
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const filteredAll = React.useMemo(() => applyFilters(docs, state), [docs, state]);
  const visible = React.useMemo(
    () => filteredAll.slice(0, pageCount * PAGE_SIZE),
    [filteredAll, pageCount],
  );
  const hasMore = visible.length < filteredAll.length;

  React.useEffect(() => {
    setPageCount(1);
  }, [state]);

  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!hasMore || view === 'table') return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setPageCount((p) => p + 1);
            const next = Math.min(filteredAll.length - visible.length, PAGE_SIZE);
            setAnnouncement(t('pagination.loadedMore', { count: next }));
          }
        }
      },
      { rootMargin: '0px 0px 600px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, view, filteredAll.length, visible.length, t]);

  const [viewer, setViewer] = React.useState<{
    docId: string;
    pageImages: string[];
    metadata: Record<string, unknown>;
    structuredData?: Record<string, unknown>;
  } | null>(null);

  const handleOpen = React.useCallback(async (doc: DocumentMeta) => {
    try {
      const detail: DocumentDetail = await fetchDocument(doc.doc_id);
      setViewer({
        docId: doc.doc_id,
        pageImages: detail.page_images,
        metadata: detail.metadata,
        structuredData: detail.structured_data,
      });
    } catch {
      const imgCount = doc.page_count || 1;
      const pageImages = Array.from({ length: imgCount }, (_, i) =>
        `page_${String(i + 1).padStart(3, '0')}.jpg`,
      );
      setViewer({
        docId: doc.doc_id,
        pageImages,
        metadata: doc as unknown as Record<string, unknown>,
      });
    }
  }, []);

  const handleCopyId = React.useCallback((docId: string) => {
    if (typeof navigator === 'undefined') return;
    navigator.clipboard?.writeText(docId).catch(() => {
      // Clipboard may be unavailable in insecure contexts; silent fail acceptable.
    });
  }, []);

  const totalItems = visible.length;
  const rowCount = Math.ceil(totalItems / Math.max(1, columns));
  const { focused, handleKeyDown, registerRef, onItemFocus } = useGridNavigation({
    totalItems,
    columns,
    rtl,
  });

  const types = React.useMemo(() => {
    const known = uniqueTypes(docs);
    const fallback = ['invoice', 'quotation', 'purchase_order', 'delivery_note', 'form', 'approval', 'quantity_survey', 'contract', 'other'];
    const merged = Array.from(new Set([...known, ...fallback]));
    return merged.sort();
  }, [docs]);
  const currencies = React.useMemo(() => uniqueCurrencies(docs), [docs]);
  const filterActive = isFilterActive(state);

  return (
    <main aria-labelledby="documents-heading" className="h-full flex flex-col bg-[color:var(--bg-page)]">
      <h1 id="documents-heading" className="sr-only">
        {t('title')}
      </h1>

      <header className="px-6 py-4">
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">{t('title')}</h2>
            <p className="text-xs text-[color:var(--text-tertiary)] mt-0.5">
              {t('subtitle', { count: docs.length })}
            </p>
          </div>
        </div>
        <search role="search" aria-label={t('title')}>
          <Toolbar
            state={state}
            dispatch={dispatch}
            view={view}
            onViewChange={setView}
            availableTypes={types}
            availableCurrencies={currencies}
            searchInputRef={searchInputRef}
            isCompact={false}
          />
        </search>
      </header>

      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>

      {error && <ErrorState onRetry={() => setRetryToken((n) => n + 1)} />}

      <section
        aria-label={view === 'grid' ? t('view.grid') : t('view.table')}
        className="flex-1 overflow-auto"
      >
        {loading ? (
          view === 'grid' ? (
            <div className="px-6 py-4">
              <GridSkeleton count={12} />
            </div>
          ) : (
            <TableSkeleton count={8} />
          )
        ) : visible.length === 0 ? (
          filterActive ? (
            <EmptyState variant="filtered" onClearFilters={() => dispatch({ type: 'clearAll' })} />
          ) : (
            <EmptyState variant="no-docs" />
          )
        ) : view === 'grid' ? (
          <div className="px-6 py-4 space-y-4">
            <div
              role="grid"
              aria-rowcount={rowCount}
              aria-colcount={columns}
              onKeyDown={handleKeyDown}
              className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            >
              {visible.map((doc, idx) => {
                const rowIndex = Math.floor(idx / columns);
                const colIndex = idx % columns;
                return (
                  <DocumentCard
                    key={doc.doc_id}
                    doc={doc}
                    onOpen={handleOpen}
                    onCopyId={handleCopyId}
                    rowIndex={rowIndex}
                    colIndex={colIndex}
                    focused={idx === focused}
                    onFocus={onItemFocus}
                    registerRef={registerRef}
                  />
                );
              })}
            </div>
            {hasMore && (
              <>
                <GridSkeleton count={6} />
                <div ref={sentinelRef} aria-hidden className="h-1 w-full" />
              </>
            )}
            {!hasMore && visible.length > PAGE_SIZE && (
              <p className="text-center text-xs text-[color:var(--text-tertiary)] py-4">
                {t('pagination.endOfList')}
              </p>
            )}
          </div>
        ) : (
          <div className="mx-6 my-4 rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--bg-surface)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
              <DocumentTable
                documents={visible}
                state={state}
                dispatch={dispatch}
                onOpen={handleOpen}
              />
            </div>
            {hasMore && (
              <div className="flex justify-center py-3">
                <button
                  type="button"
                  onClick={() => setPageCount((p) => p + 1)}
                  className="inline-flex h-9 items-center gap-2 px-5 rounded-full border border-[color:var(--border-default)] bg-[color:var(--bg-surface)] text-xs font-medium text-[color:var(--text-primary)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-[color:var(--bg-surface-hover)] hover:border-[color:var(--esap-emerald-700)]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)] transition-colors"
                >
                  {t('pagination.loadMore')}
                </button>
              </div>
            )}
            {!hasMore && visible.length > PAGE_SIZE && (
              <p className="text-center text-xs text-[color:var(--text-tertiary)] py-3">
                {t('pagination.endOfList')}
              </p>
            )}
          </div>
        )}
      </section>

      {viewer && (
        <DocumentViewer
          docId={viewer.docId}
          pageImages={viewer.pageImages}
          metadata={viewer.metadata}
          structuredData={viewer.structuredData}
          onClose={() => setViewer(null)}
        />
      )}
    </main>
  );
}
