'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  IconAlertTriangle,
  IconCheck,
  IconMessages,
  IconRotateClockwise,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { Link } from '@/lib/i18n/navigation';
import { useUploadJobs, TERMINAL_STATUSES } from '@/lib/uploadJobsContext';
import type { UploadJob } from '@/lib/api';
import { cn } from '@/lib/cn';

type Filter = 'all' | 'active' | 'done' | 'failed';

const STAGE_PCT_FALLBACK: Record<string, number> = {
  queued: 5,
  ingesting: 15,
  extracting: 40,
  normalizing: 70,
  preparing: 85,
  indexing: 95,
};

type PanelTranslator = ReturnType<typeof useTranslations<'upload'>>;

const isActive = (j: UploadJob) => !TERMINAL_STATUSES.has(j.status);
const isDone = (j: UploadJob) => j.status === 'done';
const isFailed = (j: UploadJob) => j.status === 'error';

interface UploadPanelProps {
  onClose?: () => void;
  onRetry?: (job: UploadJob) => void;
}

export default function UploadPanel({ onClose, onRetry }: UploadPanelProps) {
  const t = useTranslations('upload');
  const { jobs, removeJob, clearCompleted } = useUploadJobs();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const counts = useMemo(
    () => ({
      all: jobs.length,
      active: jobs.filter(isActive).length,
      done: jobs.filter(isDone).length,
      failed: jobs.filter(isFailed).length,
    }),
    [jobs],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((j) => {
      if (filter === 'active' && !isActive(j)) return false;
      if (filter === 'done' && !isDone(j)) return false;
      if (filter === 'failed' && !isFailed(j)) return false;
      if (q && !j.filename.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [jobs, filter, query]);

  const groups = useMemo(
    () => ({
      active: filtered.filter(isActive),
      done: filtered.filter(isDone),
      failed: filtered.filter(isFailed),
    }),
    [filtered],
  );

  const showSearch = jobs.length > 6;
  const hasCompleted = counts.done + counts.failed > 0;

  return (
    <div className="flex h-full max-h-[min(70vh,560px)] w-full flex-col">
      <header className="flex items-start justify-between gap-3 border-b border-[color:var(--border-default)] pb-3">
        <div className="min-w-0">
          <h2
            className="text-[14px] font-semibold tracking-[-0.1px] text-[color:var(--text-primary)]"
            dir="auto"
          >
            {t('panel.title')}
          </h2>
          <p className="mt-0.5 text-[11px] text-[color:var(--text-tertiary)]" dir="auto">
            {t('panel.subtitle', { total: counts.all })}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={t('panel.close')}
            className="-me-1 -mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[color:var(--text-tertiary)] transition-colors hover:bg-[color:var(--bg-surface-subtle)] hover:text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]"
          >
            <IconX size={14} stroke={2} />
          </button>
        )}
      </header>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <FilterChip
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          label={t('panel.filterAll')}
          count={counts.all}
        />
        <FilterChip
          active={filter === 'active'}
          onClick={() => setFilter('active')}
          label={t('panel.filterActive')}
          count={counts.active}
          tone="emerald"
        />
        <FilterChip
          active={filter === 'done'}
          onClick={() => setFilter('done')}
          label={t('panel.filterDone')}
          count={counts.done}
        />
        <FilterChip
          active={filter === 'failed'}
          onClick={() => setFilter('failed')}
          label={t('panel.filterFailed')}
          count={counts.failed}
          tone="red"
        />
      </div>

      {showSearch && (
        <div className="relative mt-2">
          <IconSearch
            size={13}
            stroke={2}
            className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-[color:var(--text-tertiary)]"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('panel.search')}
            aria-label={t('panel.search')}
            className="w-full rounded-md border border-[color:var(--border-default)] bg-[color:var(--bg-surface-subtle)] py-1.5 ps-7 pe-2.5 text-[12px] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-tertiary)] focus:border-[color:var(--esap-emerald-500)] focus:outline-none focus:ring-1 focus:ring-[color:var(--esap-emerald-500)]"
          />
        </div>
      )}

      <div className="-me-1 mt-3 flex-1 space-y-3 overflow-y-auto pe-1">
        {filtered.length === 0 ? (
          <p
            className="py-10 text-center text-[12px] text-[color:var(--text-tertiary)]"
            dir="auto"
          >
            {jobs.length === 0 ? t('panel.empty') : t('panel.emptyFilter')}
          </p>
        ) : (
          <>
            {groups.active.length > 0 && (
              <Section title={t('panel.groupActive')} count={groups.active.length}>
                {groups.active.map((j) => (
                  <ActiveRow key={j.job_id} job={j} t={t} onDismiss={removeJob} />
                ))}
              </Section>
            )}
            {groups.done.length > 0 && (
              <Section title={t('panel.groupDone')} count={groups.done.length}>
                {groups.done.map((j) => (
                  <DoneRow key={j.job_id} job={j} t={t} onDismiss={removeJob} />
                ))}
              </Section>
            )}
            {groups.failed.length > 0 && (
              <Section title={t('panel.groupFailed')} count={groups.failed.length}>
                {groups.failed.map((j) => (
                  <FailedRow
                    key={j.job_id}
                    job={j}
                    t={t}
                    onDismiss={removeJob}
                    onRetry={onRetry}
                  />
                ))}
              </Section>
            )}
          </>
        )}
      </div>

      {hasCompleted && (
        <footer className="mt-3 flex items-center justify-end border-t border-[color:var(--border-default)] pt-3 text-[12px]">
          <button
            type="button"
            onClick={clearCompleted}
            className="inline-flex items-center rounded-md px-2 py-1 text-[color:var(--text-secondary)] transition-colors hover:bg-[color:var(--bg-surface-subtle)] hover:text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]"
          >
            {t('panel.clearCompleted')}
          </button>
        </footer>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  tone?: 'emerald' | 'red';
}

function FilterChip({ active, onClick, label, count, tone }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
        active
          ? 'border-[color:var(--esap-emerald-500)] bg-[color:var(--badge-emerald-bg)] text-[color:var(--esap-emerald-700)]'
          : 'border-[color:var(--border-default)] bg-transparent text-[color:var(--text-secondary)] hover:border-[color:var(--border-strong,var(--border-default))] hover:text-[color:var(--text-primary)]',
      )}
    >
      <span dir="auto">{label}</span>
      {count > 0 && (
        <span
          className={cn(
            'inline-flex min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none',
            tone === 'emerald' && 'bg-[color:var(--esap-emerald-500)]/15 text-[color:var(--esap-emerald-700)]',
            tone === 'red' && 'bg-red-500/15 text-red-500 dark:text-red-400',
            !tone && 'bg-[color:var(--bg-surface-subtle)] text-[color:var(--text-secondary)]',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

interface SectionProps {
  title: string;
  count: number;
  children: React.ReactNode;
}

function Section({ title, count, children }: SectionProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-[color:var(--text-tertiary)]">
        <span dir="auto">{title}</span>
        <span className="tabular-nums">{count}</span>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

interface RowProps {
  job: UploadJob;
  t: PanelTranslator;
  onDismiss: (id: string) => void;
}

function ActiveRow({ job, t, onDismiss }: RowProps) {
  const pct = Math.max(
    0,
    Math.min(100, Math.round(job.progress || STAGE_PCT_FALLBACK[job.status] || 0)),
  );
  return (
    <div className="group rounded-md bg-[color:var(--bg-surface-subtle)] px-2.5 py-2">
      <div className="flex items-start gap-2">
        <span
          aria-hidden
          className="mt-0.5 inline-flex h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-[color:var(--esap-emerald-500)] border-t-transparent"
        />
        <p
          className="min-w-0 flex-1 truncate text-[12px] text-[color:var(--text-primary)]"
          title={job.filename}
          dir="auto"
        >
          {job.filename}
        </p>
        <button
          type="button"
          onClick={() => onDismiss(job.job_id)}
          aria-label={t('indicator.dismiss')}
          title={t('indicator.dismiss')}
          className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 -me-1 inline-flex h-5 w-5 items-center justify-center rounded text-[color:var(--text-tertiary)] hover:bg-[color:var(--bg-surface)] hover:text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]"
        >
          <IconX size={11} stroke={2.5} />
        </button>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[color:var(--ink-100)]">
        <div
          className="h-full bg-gradient-to-r from-[color:var(--esap-emerald-500)] to-[color:var(--esap-emerald-400)] transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-[color:var(--text-tertiary)]">
        <span className="truncate" dir="auto">
          {t(`stage.${job.status}` as 'stage.queued')}
        </span>
        <span className="tabular-nums shrink-0">{pct}%</span>
      </div>
    </div>
  );
}

function DoneRow({ job, t, onDismiss }: RowProps) {
  const totalSec = job.stage_timings?.total_ms != null
    ? (job.stage_timings.total_ms / 1000).toFixed(1)
    : null;
  return (
    <div className="group flex items-start gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-[color:var(--bg-surface-subtle)]">
      <span
        aria-hidden
        className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[color:var(--esap-emerald-500)]/15 text-[color:var(--esap-emerald-700)]"
      >
        <IconCheck size={11} stroke={3} />
      </span>
      <div className="min-w-0 flex-1">
        <span
          className="block truncate text-[12px] text-[color:var(--text-primary)]"
          title={job.filename}
          dir="auto"
        >
          {job.filename}
        </span>
        {totalSec && (
          <span className="tabular-nums text-[10px] text-[color:var(--text-tertiary)]">
            {totalSec}s
          </span>
        )}
      </div>
      {job.doc_id && (
        <Link
          href={`/chat?scope=${encodeURIComponent(job.doc_id)}`}
          aria-label={t('indicator.chatAboutDoc')}
          title={t('indicator.chatAboutDoc')}
          className="shrink-0 text-[color:var(--text-tertiary)] hover:text-[color:var(--esap-emerald-700)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)] rounded"
        >
          <IconMessages size={13} stroke={1.8} />
        </Link>
      )}
      <button
        type="button"
        onClick={() => onDismiss(job.job_id)}
        aria-label={t('indicator.dismiss')}
        title={t('indicator.dismiss')}
        className="shrink-0 rounded text-[color:var(--text-tertiary)] opacity-0 transition-opacity hover:text-[color:var(--text-primary)] focus-visible:opacity-100 group-hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]"
      >
        <IconX size={12} stroke={2.5} />
      </button>
    </div>
  );
}

interface FailedRowProps extends RowProps {
  onRetry?: (job: UploadJob) => void;
}

function FailedRow({ job, t, onDismiss, onRetry }: FailedRowProps) {
  const errorMsg = job.error ?? '';
  return (
    <div className="group rounded-md border border-red-500/20 bg-red-500/5 px-2.5 py-2">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-500"
        >
          <IconAlertTriangle size={11} stroke={2.5} />
        </span>
        <span
          className="flex-1 truncate text-[12px] font-medium text-[color:var(--text-primary)]"
          title={job.filename}
          dir="auto"
        >
          {job.filename}
        </span>
        {onRetry && (
          <button
            type="button"
            onClick={() => onRetry(job)}
            aria-label={t('panel.retry')}
            title={t('panel.retry')}
            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-[color:var(--text-tertiary)] hover:bg-[color:var(--bg-surface)] hover:text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]"
          >
            <IconRotateClockwise size={12} stroke={2} />
          </button>
        )}
        <button
          type="button"
          onClick={() => onDismiss(job.job_id)}
          aria-label={t('indicator.dismiss')}
          title={t('indicator.dismiss')}
          className="-me-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-[color:var(--text-tertiary)] hover:bg-[color:var(--bg-surface)] hover:text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]"
        >
          <IconX size={12} stroke={2.5} />
        </button>
      </div>
      {errorMsg && (
        <p
          className="mt-1 line-clamp-2 ps-6 text-[10.5px] leading-relaxed text-red-500/90 dark:text-red-300/80"
          title={errorMsg}
          dir="auto"
        >
          {errorMsg}
        </p>
      )}
    </div>
  );
}
