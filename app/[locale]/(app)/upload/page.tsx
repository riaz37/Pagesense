'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Dropzone } from '@/components/ui/Dropzone';
import { PillBadge } from '@/components/ui/PillBadge';
import { uploadDocument, fetchUploadStatus, type UploadJob } from '@/lib/api';

const MAX_BYTES = 50 * 1024 * 1024;
const ACCEPT = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png';
const VALID_EXT = new Set(['pdf', 'jpg', 'jpeg', 'png']);

const STAGE_PCT: Record<string, number> = {
  queued: 5,
  ingesting: 15,
  extracting: 40,
  normalizing: 70,
  preparing: 85,
  indexing: 95,
  done: 100,
  error: 0,
};

const STAGE_KEYS = [
  'queued',
  'ingesting',
  'extracting',
  'normalizing',
  'preparing',
  'indexing',
  'done',
  'error',
] as const;

type EntryState = 'uploading' | 'processing' | 'done' | 'error';

interface Entry {
  key: string;
  filename: string;
  state: EntryState;
  jobId?: string;
  progress: number;
  stage?: string;
  error?: string;
  docId?: string;
}

type UploadTranslator = ReturnType<typeof useTranslations<'upload'>>;

function stageLabel(t: UploadTranslator, stage: string | undefined): string {
  if (stage && (STAGE_KEYS as readonly string[]).includes(stage)) {
    return t(`stage.${stage}` as never);
  }
  return t('stage.queued');
}

function toneForState(state: EntryState): 'emerald' | 'amber' | 'red' | 'neutral' {
  if (state === 'done') return 'emerald';
  if (state === 'error') return 'red';
  if (state === 'processing') return 'amber';
  return 'neutral';
}

function statusLabel(t: UploadTranslator, state: EntryState): string {
  if (state === 'done') return t('status.done');
  if (state === 'error') return t('status.failed');
  if (state === 'processing') return t('status.processing');
  return t('status.uploading');
}

export default function UploadPage() {
  const t = useTranslations('upload');
  const [entries, setEntries] = useState<Entry[]>([]);
  const pollTimers = useRef(new Map<string, ReturnType<typeof setInterval>>());

  useEffect(() => {
    const timers = pollTimers.current;
    return () => {
      timers.forEach((timer) => clearInterval(timer));
      timers.clear();
    };
  }, []);

  const updateEntry = useCallback((key: string, patch: Partial<Entry>) => {
    setEntries((prev) => prev.map((e) => (e.key === key ? { ...e, ...patch } : e)));
  }, []);

  const stopPolling = useCallback((key: string) => {
    const timer = pollTimers.current.get(key);
    if (timer) {
      clearInterval(timer);
      pollTimers.current.delete(key);
    }
  }, []);

  const startPolling = useCallback(
    (key: string, jobId: string) => {
      stopPolling(key);
      const timer = setInterval(async () => {
        try {
          const job: UploadJob = await fetchUploadStatus(jobId);
          const pct = job.progress || STAGE_PCT[job.status] || 0;
          const nextState: EntryState =
            job.status === 'done' ? 'done' : job.status === 'error' ? 'error' : 'processing';
          setEntries((prev) =>
            prev.map((entry) =>
              entry.key === key
                ? {
                    ...entry,
                    state: nextState,
                    stage: job.status,
                    progress: pct,
                    docId: job.doc_id ?? entry.docId,
                    error: job.error ?? undefined,
                  }
                : entry,
            ),
          );
          if (nextState === 'done' || nextState === 'error') stopPolling(key);
        } catch {
          // transient fetch error — next tick will retry
        }
      }, 1500);
      pollTimers.current.set(key, timer);
    },
    [stopPolling],
  );

  const handleFiles = useCallback(
    async (files: File[]) => {
      const additions: Entry[] = [];
      const pending: { entry: Entry; file: File }[] = [];
      for (const file of files) {
        const key = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
        if (!VALID_EXT.has(ext)) {
          additions.push({
            key,
            filename: file.name,
            state: 'error',
            progress: 0,
            error: t('errors.mime'),
          });
          continue;
        }
        if (file.size > MAX_BYTES) {
          additions.push({
            key,
            filename: file.name,
            state: 'error',
            progress: 0,
            error: t('errors.size'),
          });
          continue;
        }
        const entry: Entry = {
          key,
          filename: file.name,
          state: 'uploading',
          progress: 0,
        };
        additions.push(entry);
        pending.push({ entry, file });
      }
      if (additions.length > 0) {
        setEntries((prev) => [...prev, ...additions]);
      }

      await Promise.all(
        pending.map(async ({ entry, file }) => {
          try {
            const result = await uploadDocument(file);
            updateEntry(entry.key, {
              state: 'processing',
              progress: STAGE_PCT.queued,
              stage: 'queued',
              jobId: result.job_id,
            });
            startPolling(entry.key, result.job_id);
          } catch (err) {
            updateEntry(entry.key, {
              state: 'error',
              progress: 0,
              error: err instanceof Error ? err.message : t('errors.generic'),
            });
          }
        }),
      );
    },
    [startPolling, t, updateEntry],
  );

  const reset = useCallback(() => {
    pollTimers.current.forEach((timer) => clearInterval(timer));
    pollTimers.current.clear();
    setEntries([]);
  }, []);

  const firstDone = entries.find((e) => e.state === 'done' && e.docId);
  const anyDone = entries.some((e) => e.state === 'done');
  const allResolved = entries.length > 0 && entries.every((e) => e.state === 'done' || e.state === 'error');

  return (
    <div className="h-full overflow-y-auto bg-[color:var(--bg-page)]">
      <div className="mx-auto w-full max-w-2xl px-6 py-10 sm:py-14">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-[color:var(--text-primary)]">{t('title')}</h1>
          <p
            className="mt-2 text-sm text-[color:var(--text-secondary)]"
            dir="auto"
          >
            {t('subtitle')}
          </p>
        </header>

        <Dropzone
          accept={ACCEPT}
          onFiles={handleFiles}
          label={t('dropzone.idle')}
          description={t('dropzone.hint')}
        />

        {entries.length > 0 && (
          <section className="mt-6 space-y-3" aria-label={t('title')}>
            <output aria-live="polite" aria-atomic="false" className="sr-only">
              {entries
                .map((e) => t('progressLive', { name: e.filename, percent: e.progress }))
                .join('. ')}
            </output>
            {entries.map((entry) => (
              <Card key={entry.key}>
                <CardBody className="px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p
                      className="flex-1 truncate text-sm font-medium text-[color:var(--text-primary)]"
                      dir="auto"
                      title={entry.filename}
                    >
                      {entry.filename}
                    </p>
                    <PillBadge tone={toneForState(entry.state)} data-state={entry.state}>
                      {entry.state === 'processing' && (
                        <span
                          className="inline-block h-1.5 w-1.5 animate-[pulse_1.5s_ease-in-out_infinite] rounded-full bg-current opacity-70"
                          aria-hidden
                        />
                      )}
                      {statusLabel(t, entry.state)}
                    </PillBadge>
                  </div>

                  {entry.state !== 'error' && (
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-[color:var(--esap-emerald-700)] transition-[width] duration-500 ease-out"
                        style={{ width: `${entry.progress}%` }}
                      />
                    </div>
                  )}

                  {entry.state === 'processing' && entry.stage && (
                    <p className="mt-2 text-xs text-[color:var(--text-secondary)]" dir="auto">
                      {stageLabel(t, entry.stage)}
                    </p>
                  )}

                  {entry.state === 'error' && entry.error && (
                    <p
                      className="mt-2 text-xs text-red-600 dark:text-red-400"
                      role="alert"
                      dir="auto"
                    >
                      {entry.error}
                    </p>
                  )}
                </CardBody>
              </Card>
            ))}
          </section>
        )}

        {anyDone && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {firstDone?.docId && (
              <Button asChild>
                <Link href={`/chat?scope=${encodeURIComponent(firstDone.docId)}`}>
                  {t('success.chat')}
                </Link>
              </Button>
            )}
            <Button asChild variant="secondary">
              <Link href="/documents">{t('success.viewDocuments')}</Link>
            </Button>
            {allResolved && (
              <Button variant="ghost" onClick={reset}>
                {t('success.uploadAnother')}
              </Button>
            )}
          </div>
        )}

        <PipelineLegend />
      </div>
    </div>
  );
}

function PipelineLegend() {
  const t = useTranslations('upload.pipeline');
  const steps = [t('render'), t('extract'), t('validate'), t('index')];
  return (
    <div className="mt-10">
      <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.14em] text-[color:var(--text-tertiary)]">
        {t('title')}
      </p>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-2">
        {steps.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md border border-[color:var(--border-default)] bg-[color:var(--bg-surface-subtle)] text-[10px] tabular-nums text-[color:var(--text-muted)]">
              {i + 1}
            </span>
            <span className="text-[11px] text-[color:var(--text-muted)]">{label}</span>
            {i < steps.length - 1 && (
              <span
                className="text-[color:var(--text-tertiary)] rtl:-scale-x-100"
                aria-hidden
              >
                ›
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
