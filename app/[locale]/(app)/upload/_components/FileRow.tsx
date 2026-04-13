'use client';

import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { IconX, IconAlertCircle, IconFileText } from '@tabler/icons-react';
import { cn } from '@/lib/cn';
import { easeOutQuick, springSoft } from '@/lib/motion';

export type EntryState =
  | 'staged'
  | 'uploading'
  | 'processing'
  | 'done'
  | 'error';

export interface Entry {
  key: string;
  filename: string;
  size: number;
  state: EntryState;
  jobId?: string;
  progress: number;
  stage?: string;
  error?: string;
  docId?: string;
  duplicateOf?: string;
  skip?: boolean;
}

type UploadTranslator = ReturnType<typeof useTranslations<'upload'>>;

function formatSize(t: UploadTranslator, bytes: number): string {
  if (bytes < 1024) return t('row.size.b', { n: String(bytes) });
  if (bytes < 1024 * 1024)
    return t('row.size.kb', { n: (bytes / 1024).toFixed(0) });
  return t('row.size.mb', { n: (bytes / (1024 * 1024)).toFixed(1) });
}

function stageLabel(t: UploadTranslator, stage: string | undefined): string {
  const keys = [
    'queued',
    'ingesting',
    'extracting',
    'normalizing',
    'preparing',
    'indexing',
    'done',
    'error',
  ];
  if (stage && keys.includes(stage)) return t(`stage.${stage}` as never);
  return t('stage.queued');
}

function statusLabel(t: UploadTranslator, state: EntryState): string {
  if (state === 'done') return t('status.done');
  if (state === 'error') return t('status.failed');
  if (state === 'processing') return t('status.processing');
  if (state === 'uploading') return t('status.uploading');
  return t('status.staged');
}

interface FileRowProps {
  entry: Entry;
  onRemove?: (key: string) => void;
  onRetry?: (key: string) => void;
  onToggleSkip?: (key: string) => void;
}

export function FileRow({
  entry,
  onRemove,
  onRetry,
  onToggleSkip,
}: FileRowProps) {
  const t = useTranslations('upload');
  const reduce = useReducedMotion();
  const isProcessing =
    entry.state === 'uploading' || entry.state === 'processing';
  const progress = Math.max(0, Math.min(100, entry.progress));
  const isDuplicate = typeof entry.duplicateOf === 'string';
  const isSkipped = Boolean(entry.skip);

  return (
    <m.article
      layout="position"
      initial={{ opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: isSkipped ? 0.55 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -12, scale: 0.98 }}
      transition={springSoft}
      aria-busy={isProcessing || undefined}
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-[color:var(--bg-surface)]',
        'border-[color:var(--border-default)]',
        'shadow-[0_1px_0_rgba(0,0,0,0.02)]',
        entry.state === 'done' &&
          'border-[color:var(--esap-emerald-400)]/60',
        entry.state === 'error' &&
          'border-red-300/70 dark:border-red-500/40',
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <LeadIcon state={entry.state} reduce={!!reduce} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                'min-w-0 flex-1 truncate text-[14px] font-semibold text-[color:var(--text-primary)]',
                isSkipped && 'line-through',
              )}
              dir="auto"
              title={entry.filename}
            >
              {entry.filename}
            </p>
            <span className="shrink-0 text-[11px] text-[color:var(--text-tertiary)] tabular-nums">
              {formatSize(t, entry.size)}
            </span>
          </div>

          <div className="mt-0.5 flex h-4 items-center">
            <AnimatePresence mode="wait" initial={false}>
              <m.span
                key={`${entry.state}-${entry.stage ?? 'init'}`}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -2 }}
                transition={easeOutQuick}
                className={cn(
                  'text-[11px]',
                  entry.state === 'error'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-[color:var(--text-secondary)]',
                )}
                dir="auto"
              >
                {entry.state === 'error'
                  ? (entry.error ?? t('errors.generic'))
                  : entry.state === 'processing'
                    ? stageLabel(t, entry.stage)
                    : statusLabel(t, entry.state)}
              </m.span>
            </AnimatePresence>
          </div>

          {isProcessing && (
            <div
              className="relative mt-2 h-1 w-full overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
            >
              <m.div
                className="absolute inset-y-0 start-0 rounded-full bg-gradient-to-r from-[color:var(--esap-emerald-500)] to-[color:var(--esap-emerald-700)]"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
                }
              />
              {!reduce && progress > 0 && progress < 100 && (
                <m.div
                  aria-hidden
                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/55 to-transparent mix-blend-overlay"
                  initial={{ x: '-100%' }}
                  animate={{ x: '300%' }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {isDuplicate && entry.state === 'staged' && onToggleSkip && (
            <button
              type="button"
              onClick={() => onToggleSkip(entry.key)}
              title={t('staging.duplicateTitle')}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold',
                'transition-colors duration-150',
                isSkipped
                  ? 'bg-[color:var(--badge-emerald-bg)] text-[color:var(--esap-emerald-700)]'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg-page)]',
              )}
            >
              {t('staging.duplicate')}
            </button>
          )}

          {entry.state === 'error' && onRetry && (
            <button
              type="button"
              onClick={() => onRetry(entry.key)}
              className={cn(
                'inline-flex items-center gap-1 rounded-[4px] px-2 py-1 text-[11px] font-semibold',
                'border border-[color:var(--border-default)] bg-[color:var(--bg-surface)]',
                'text-[color:var(--text-primary)] hover:bg-[color:var(--bg-surface-subtle)]',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg-page)]',
              )}
            >
              {t('row.retry')}
            </button>
          )}

          {(entry.state === 'staged' || entry.state === 'error') && onRemove && (
            <button
              type="button"
              onClick={() => onRemove(entry.key)}
              aria-label={t('staging.remove')}
              title={t('staging.remove')}
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded-full',
                'text-[color:var(--text-tertiary)] hover:bg-[color:var(--bg-surface-subtle)] hover:text-[color:var(--text-primary)]',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
              )}
            >
              <IconX size={14} stroke={2} className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </m.article>
  );
}

function LeadIcon({
  state,
  reduce,
}: {
  state: EntryState;
  reduce: boolean;
}) {
  if (state === 'done') {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--badge-emerald-bg)] text-[color:var(--esap-emerald-700)]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          className="h-4 w-4"
        >
          <m.path
            d="M5 12.5l4.5 4.5L19 7"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={
              reduce ? { duration: 0 } : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
            }
          />
        </svg>
      </div>
    );
  }
  if (state === 'error') {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
        <IconAlertCircle size={16} stroke={2} className="h-4 w-4" />
      </div>
    );
  }
  // staged / uploading / processing — document glyph
  return (
    <div
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
        'border-[color:var(--border-default)] bg-[color:var(--bg-surface-subtle)]',
        'text-[color:var(--text-secondary)]',
      )}
    >
      <IconFileText size={16} stroke={1.6} className="h-4 w-4" />
    </div>
  );
}
