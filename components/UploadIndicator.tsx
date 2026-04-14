'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { IconCheck, IconMessages, IconX } from '@tabler/icons-react';
import { Link } from '@/lib/i18n/navigation';
import { useUploadJobs, TERMINAL_STATUSES } from '@/lib/uploadJobsContext';
import type { UploadJob } from '@/lib/api';

interface UploadIndicatorProps {
  collapsed?: boolean;
}

const MAX_VISIBLE = 3;

function middleTruncate(name: string, max = 26): string {
  if (name.length <= max) return name;
  const head = Math.ceil((max - 1) / 2);
  const tail = Math.floor((max - 1) / 2);
  return `${name.slice(0, head)}…${name.slice(-tail)}`;
}

export default function UploadIndicator({ collapsed = false }: UploadIndicatorProps) {
  const t = useTranslations('upload');
  const { activeJobs, jobs, removeJob } = useUploadJobs();
  const [expanded, setExpanded] = useState(false);

  // Active jobs first, then most-recent done. Cap to MAX_VISIBLE.
  const visible = useMemo(() => {
    const active = jobs.filter((j) => !TERMINAL_STATUSES.has(j.status));
    const done = jobs.filter((j) => TERMINAL_STATUSES.has(j.status));
    return [...active, ...done].slice(0, MAX_VISIBLE);
  }, [jobs]);
  const overflow = Math.max(0, jobs.length - visible.length);

  if (activeJobs.length === 0) return null;

  const label = t('indicator.processing', { count: activeJobs.length });

  if (collapsed) {
    return (
      <div className="px-2 pb-2">
        <Link
          href="/upload"
          title={label}
          aria-label={label}
          className="relative flex h-9 w-full items-center justify-center rounded-md text-[color:var(--sidebar-text-dim)] hover:bg-[color:var(--sidebar-hover)] hover:text-[color:var(--sidebar-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]"
        >
          <span className="relative inline-flex h-4 w-4 items-center justify-center">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[color:var(--esap-emerald-500)] border-t-transparent" />
            <span className="absolute -end-1 -top-1 inline-flex h-3 min-w-[12px] items-center justify-center rounded-full bg-[color:var(--esap-emerald-700)] px-1 text-[9px] font-semibold leading-none text-white">
              {activeJobs.length}
            </span>
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-3 pb-2">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 rounded-lg border border-[color:var(--sidebar-divider)] bg-[color:var(--sidebar-hover)] px-3 py-2 text-[13px] font-medium text-[color:var(--sidebar-text)] transition-colors hover:bg-[color:var(--sidebar-active-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]"
      >
        <span
          aria-hidden
          className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-[color:var(--esap-emerald-500)] border-t-transparent"
        />
        <span className="flex-1 text-start truncate" dir="auto">
          {label}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          aria-hidden
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-2 space-y-1">
          {visible.map((job) =>
            TERMINAL_STATUSES.has(job.status) ? (
              <DoneRow key={job.job_id} job={job} onRemove={removeJob} t={t} />
            ) : (
              <ActiveCard key={job.job_id} job={job} t={t} />
            ),
          )}

          {overflow > 0 && (
            <Link
              href="/upload"
              className="block py-1 text-center text-[10px] text-[color:var(--sidebar-text-muted)] hover:text-[color:var(--sidebar-text)]"
            >
              {t('indicator.viewAll')} (+{overflow}) →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

interface CardProps {
  job: UploadJob;
  t: ReturnType<typeof useTranslations<'upload'>>;
}

function ActiveCard({ job, t }: CardProps) {
  const pct = Math.max(0, Math.min(100, Math.round(job.progress || 0)));
  return (
    <div className="rounded-md bg-[color:var(--sidebar-hover)] px-2.5 py-2 text-xs">
      <p
        className="mb-1.5 truncate text-[12px] text-[color:var(--sidebar-text)]"
        title={job.filename}
        dir="auto"
      >
        {middleTruncate(job.filename)}
      </p>
      <div className="mb-1 h-1 overflow-hidden rounded-full bg-[color:var(--ink-100)]">
        <div
          className="h-full bg-gradient-to-r from-[color:var(--esap-emerald-500)] to-[color:var(--esap-emerald-400)] transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between gap-2 text-[10px] text-[color:var(--sidebar-text-muted)]">
        <span className="truncate" dir="auto">
          {t(`stage.${job.status}` as 'stage.queued')}
        </span>
        <span className="tabular-nums shrink-0">{pct}%</span>
      </div>
    </div>
  );
}

interface DoneRowProps extends CardProps {
  onRemove: (id: string) => void;
}

function DoneRow({ job, onRemove, t }: DoneRowProps) {
  const isError = job.status === 'error';
  return (
    <div className="group flex items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-[color:var(--sidebar-hover)]">
      <span
        aria-hidden
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
          isError
            ? 'bg-red-500/15 text-red-500'
            : 'bg-[color:var(--esap-emerald-500)]/15 text-[color:var(--esap-emerald-700)]'
        }`}
      >
        {isError ? (
          <IconX size={11} stroke={3} />
        ) : (
          <IconCheck size={11} stroke={3} />
        )}
      </span>
      <span
        className="flex-1 truncate text-[12px] text-[color:var(--sidebar-text)]"
        title={isError ? (job.error ?? job.filename) : job.filename}
        dir="auto"
      >
        {middleTruncate(job.filename)}
      </span>
      {!isError && job.doc_id && (
        <Link
          href={`/chat?scope=${encodeURIComponent(job.doc_id)}`}
          aria-label={t('indicator.chatAboutDoc')}
          title={t('indicator.chatAboutDoc')}
          className="shrink-0 text-[color:var(--sidebar-text-muted)] hover:text-[color:var(--esap-emerald-700)]"
        >
          <IconMessages size={13} stroke={1.8} />
        </Link>
      )}
      <button
        type="button"
        onClick={() => onRemove(job.job_id)}
        aria-label={t('indicator.dismiss')}
        title={t('indicator.dismiss')}
        className="shrink-0 text-[color:var(--sidebar-text-muted)] opacity-0 transition-opacity hover:text-[color:var(--sidebar-text)] focus-visible:opacity-100 group-hover:opacity-100"
      >
        <IconX size={12} stroke={2.5} />
      </button>
    </div>
  );
}
