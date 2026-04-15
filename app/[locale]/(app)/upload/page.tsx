'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
} from 'framer-motion';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { IconCloudUpload, IconMessages } from '@tabler/icons-react';
import { Link } from '@/lib/i18n/navigation';
import { cn } from '@/lib/cn';
import { easeOut, springSnappy, springSoft } from '@/lib/motion';
import { Button } from '@/components/ui';
import { useUploadJobs } from '@/lib/uploadJobsContext';
import { FileRow, type Entry, type EntryState } from './_components/FileRow';

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

type UploadTranslator = ReturnType<typeof useTranslations<'upload'>>;

function makeKey(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function UploadPage() {
  const t = useTranslations('upload');
  const { jobs, startUpload: contextStartUpload } = useUploadJobs();
  const [entries, setEntries] = useState<Entry[]>([]);
  const fileRefs = useRef(new Map<string, File>());
  const notifiedRef = useRef(new Set<string>());

  useEffect(() => {
    const files = fileRefs.current;
    const notified = notifiedRef.current;
    return () => {
      files.clear();
      notified.clear();
    };
  }, []);

  const updateEntry = useCallback((key: string, patch: Partial<Entry>) => {
    setEntries((prev) => prev.map((e) => (e.key === key ? { ...e, ...patch } : e)));
  }, []);

  // Derive display state by overlaying context job data onto local entries.
  // Context owns polling + persistence; entries own client-only fields
  // (key, filename, size, duplicateOf, skip, staged/uploading pre-job state).
  const jobById = useMemo(() => new Map(jobs.map((j) => [j.job_id, j])), [jobs]);
  const displayEntries = useMemo<Entry[]>(
    () =>
      entries.map((entry) => {
        if (!entry.jobId) return entry;
        const job = jobById.get(entry.jobId);
        if (!job) return entry;
        const pct = job.progress || STAGE_PCT[job.status] || entry.progress;
        const nextState: EntryState =
          job.status === 'done' ? 'done' : job.status === 'error' ? 'error' : 'processing';
        return {
          ...entry,
          state: nextState,
          stage: job.status,
          progress: pct,
          docId: job.doc_id ?? entry.docId,
          error: job.error ?? entry.error,
        };
      }),
    [entries, jobById],
  );

  // Terminal-state toasts (fire once per entry)
  useEffect(() => {
    for (const entry of displayEntries) {
      if (
        (entry.state === 'done' || entry.state === 'error') &&
        !notifiedRef.current.has(entry.key)
      ) {
        notifiedRef.current.add(entry.key);
        if (entry.state === 'done') {
          toast.success(t('toast.indexed', { name: entry.filename }));
        } else {
          toast.error(t('toast.failed', { name: entry.filename }));
        }
      }
    }
  }, [displayEntries, t]);

  const startUpload = useCallback(
    async (key: string, file: File) => {
      notifiedRef.current.delete(key);
      updateEntry(key, { state: 'uploading', progress: 0, error: undefined });
      const jobId = await contextStartUpload(file);
      if (jobId) {
        updateEntry(key, {
          state: 'processing',
          progress: STAGE_PCT.queued,
          stage: 'queued',
          jobId,
        });
      } else {
        updateEntry(key, {
          state: 'error',
          progress: 0,
          error: t('errors.generic'),
        });
      }
    },
    [contextStartUpload, t, updateEntry],
  );

  const handleFiles = useCallback(
    (files: File[]) => {
      const hasExistingStaged = entries.some((e) => e.state === 'staged');
      const existingSig = new Set(
        entries
          .filter((e) => e.state !== 'error')
          .map((e) => `${e.filename}::${e.size}`),
      );
      const additions: Entry[] = [];
      const validPending: { key: string; file: File }[] = [];

      for (const file of files) {
        const key = makeKey();
        const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
        if (!VALID_EXT.has(ext)) {
          additions.push({
            key,
            filename: file.name,
            size: file.size,
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
            size: file.size,
            state: 'error',
            progress: 0,
            error: t('errors.size'),
          });
          continue;
        }
        fileRefs.current.set(key, file);
        const sig = `${file.name}::${file.size}`;
        const dup = existingSig.has(sig) ? sig : undefined;
        existingSig.add(sig);
        additions.push({
          key,
          filename: file.name,
          size: file.size,
          state: 'staged',
          progress: 0,
          duplicateOf: dup,
          skip: Boolean(dup),
        });
        validPending.push({ key, file });
      }

      const autoStart = validPending.length === 1 && !hasExistingStaged;

      setEntries((prev) => {
        const next = [...prev, ...additions];
        if (autoStart) {
          const only = validPending[0];
          return next.map((e) =>
            e.key === only.key ? { ...e, state: 'uploading' as const, skip: false } : e,
          );
        }
        return next;
      });

      if (autoStart) {
        const only = validPending[0];
        void startUpload(only.key, only.file);
      }
    },
    [entries, startUpload, t],
  );

  const confirmStaged = useCallback(() => {
    const staged = entries.filter((e) => e.state === 'staged' && !e.skip);
    if (staged.length === 0) return;
    staged.forEach((entry) => {
      const file = fileRefs.current.get(entry.key);
      if (!file) return;
      void startUpload(entry.key, file);
    });
  }, [entries, startUpload]);

  const removeEntry = useCallback((key: string) => {
    fileRefs.current.delete(key);
    setEntries((prev) => prev.filter((e) => e.key !== key));
  }, []);

  const toggleSkip = useCallback((key: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.key === key ? { ...e, skip: !e.skip } : e)),
    );
  }, []);

  const retryEntry = useCallback(
    (key: string) => {
      const file = fileRefs.current.get(key);
      if (!file) {
        removeEntry(key);
        return;
      }
      void startUpload(key, file);
    },
    [removeEntry, startUpload],
  );

  const clearStaged = useCallback(() => {
    setEntries((prev) => {
      const dropped = prev.filter((e) => e.state === 'staged');
      dropped.forEach((e) => fileRefs.current.delete(e.key));
      return prev.filter((e) => e.state !== 'staged');
    });
  }, []);

  const reset = useCallback(() => {
    fileRefs.current.clear();
    notifiedRef.current.clear();
    setEntries([]);
  }, []);

  const stagedEntries = displayEntries.filter((e) => e.state === 'staged');
  const stagedActiveCount = stagedEntries.filter((e) => !e.skip).length;
  const visibleEntries = displayEntries.filter((e) => e.state !== 'staged');
  const firstDone = displayEntries.find((e) => e.state === 'done' && e.docId);
  const doneCount = displayEntries.filter((e) => e.state === 'done').length;
  const anyDone = doneCount > 0;
  const nonStaged = displayEntries.filter((e) => e.state !== 'staged');
  const allFailed =
    nonStaged.length > 0 &&
    nonStaged.every((e) => e.state === 'error') &&
    stagedEntries.length === 0;

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="h-full overflow-y-auto bg-[color:var(--bg-page)]">
        <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
          <Header t={t} />
          <HeroDropzone accept={ACCEPT} onFiles={handleFiles} t={t} />

          <output aria-live="polite" aria-atomic="false" className="sr-only">
            {displayEntries
              .filter((e) => e.state !== 'staged')
              .map((e) =>
                t('progressLive', { name: e.filename, percent: Math.round(e.progress) }),
              )
              .join('. ')}
          </output>

          <AnimatePresence initial={false}>
            {stagedEntries.length > 0 && (
              <m.section
                key="staging"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={easeOut}
                className="mt-8"
                aria-label={t('staging.heading')}
              >
                <div className="mb-3 flex items-baseline justify-between gap-4">
                  <h2
                    className="text-[15px] font-semibold tracking-[-0.2px] text-[color:var(--text-primary)]"
                    dir="auto"
                  >
                    {t('staging.heading')}
                  </h2>
                  <p className="text-[12px] text-[color:var(--text-tertiary)]" dir="auto">
                    {t('staging.count', { count: stagedEntries.length })}
                  </p>
                </div>
                <div className="space-y-2">
                  <AnimatePresence initial={false} mode="popLayout">
                    {stagedEntries.map((entry) => (
                      <FileRow
                        key={entry.key}
                        entry={entry}
                        onRemove={removeEntry}
                        onToggleSkip={toggleSkip}
                      />
                    ))}
                  </AnimatePresence>
                </div>
                <div className="sticky bottom-0 z-10 -mx-6 mt-4 flex flex-wrap items-center gap-2 border-t border-[color:var(--border-default)] bg-[color:var(--bg-page)]/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--bg-page)]/80">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={confirmStaged}
                    disabled={stagedActiveCount === 0}
                  >
                    {t('staging.upload', { count: stagedActiveCount })}
                  </Button>
                  <Button type="button" variant="ghost" onClick={clearStaged}>
                    {t('staging.clear')}
                  </Button>
                </div>
              </m.section>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {visibleEntries.length > 0 && (
              <m.section
                key="rows"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={easeOut}
                className="mt-6 space-y-2"
                aria-label={t('title')}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {visibleEntries.map((entry) => (
                    <FileRow
                      key={entry.key}
                      entry={entry}
                      onRemove={entry.state === 'error' ? removeEntry : undefined}
                      onRetry={entry.state === 'error' ? retryEntry : undefined}
                    />
                  ))}
                </AnimatePresence>
              </m.section>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {anyDone && (
              <SuccessActions t={t} firstDoneId={firstDone?.docId} doneCount={doneCount} />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {allFailed && !anyDone && (
              <m.div
                key="all-failed"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={easeOut}
                className="mt-8 flex flex-wrap items-center gap-3"
                role="group"
              >
                <span
                  className="text-[13px] font-medium text-[color:var(--text-primary)]"
                  dir="auto"
                >
                  {t('empty.allFailed')}
                </span>
                <Button type="button" variant="secondary" size="sm" onClick={reset}>
                  {t('empty.clearAll')}
                </Button>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </LazyMotion>
  );
}

/* -------------------------------------------------------------------------- */
/* Header                                                                     */
/* -------------------------------------------------------------------------- */

function Header({ t }: { t: UploadTranslator }) {
  return (
    <m.header
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={easeOut}
      className="mb-10"
    >
      <h1 className="text-3xl font-bold tracking-[-0.5px] text-[color:var(--text-primary)] sm:text-[34px]">
        {t('title')}
      </h1>
      <p
        className="mt-3 max-w-xl text-[15px] leading-relaxed text-[color:var(--text-secondary)]"
        dir="auto"
      >
        {t('subtitle')}
      </p>
    </m.header>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero dropzone                                                              */
/* -------------------------------------------------------------------------- */

interface HeroDropzoneProps {
  accept: string;
  onFiles: (files: File[]) => void;
  t: UploadTranslator;
}

function HeroDropzone({ accept, onFiles, t }: HeroDropzoneProps) {
  const [active, setActive] = useState(false);
  const [rejectTick, setRejectTick] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();

  const filesFromList = (list: FileList | null): File[] => (list ? Array.from(list) : []);

  const validate = (files: File[]) => {
    const accepted: File[] = [];
    let rejected = false;
    for (const f of files) {
      const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
      if (VALID_EXT.has(ext)) accepted.push(f);
      else rejected = true;
    }
    if (rejected && accepted.length === 0) setRejectTick((n) => n + 1);
    if (accepted.length > 0) onFiles(accepted);
  };

  const openPicker = () => inputRef.current?.click();

  return (
    <m.div
      role="button"
      tabIndex={0}
      aria-label={t('dropzone.idle')}
      data-active={active ? 'true' : undefined}
      onClick={openPicker}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openPicker();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setActive(true);
      }}
      onDragLeave={() => setActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setActive(false);
        validate(filesFromList(e.dataTransfer.files));
      }}
      animate={
        reduce
          ? undefined
          : rejectTick > 0
            ? { x: [0, -6, 6, -4, 4, 0] }
            : active
              ? { y: -2, scale: 1.005 }
              : { y: 0, scale: 1 }
      }
      transition={rejectTick > 0 ? { duration: 0.35 } : springSoft}
      key={rejectTick}
      className={cn(
        'group relative isolate cursor-pointer overflow-hidden rounded-[28px]',
        'border border-[color:var(--border-default)] bg-[color:var(--bg-surface-subtle)]',
        'px-6 py-14 text-center sm:py-16',
        'shadow-[0_1px_0_rgba(0,0,0,0.02),0_8px_24px_-12px_rgba(0,0,0,0.08)]',
        'transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg-page)]',
        'data-[active=true]:border-[color:var(--esap-emerald-700)] data-[active=true]:bg-[color:var(--badge-emerald-bg)]',
      )}
    >
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 -z-10 opacity-60',
          'bg-[radial-gradient(ellipse_at_top,rgba(4,120,87,0.08),transparent_55%)]',
          'group-data-[active=true]:opacity-100',
          'transition-opacity duration-500',
        )}
      />
      <AnimatePresence>
        {active && !reduce && (
          <m.div
            key="ring"
            initial={{ opacity: 0.0, scale: 0.98 }}
            animate={{ opacity: [0, 0.6, 0], scale: [0.98, 1.02, 1.04] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
            aria-hidden
            className="pointer-events-none absolute inset-3 -z-10 rounded-[22px] border border-[color:var(--esap-emerald-400)]"
          />
        )}
      </AnimatePresence>

      <DropzoneIcon active={active} reduce={!!reduce} />

      <p className="mt-6 text-[17px] font-semibold text-[color:var(--text-primary)]">
        {active ? t('dropzone.active') : t('dropzone.idle')}
      </p>
      <p className="mt-1.5 text-sm text-[color:var(--text-secondary)]">{t('dropzone.hint')}</p>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="sr-only"
        onChange={(e) => {
          validate(filesFromList(e.target.files));
          e.target.value = '';
        }}
      />
    </m.div>
  );
}

function DropzoneIcon({ active, reduce }: { active: boolean; reduce: boolean }) {
  return (
    <div className="relative mx-auto flex h-[68px] w-[68px] items-center justify-center">
      {!reduce && (
        <m.div
          aria-hidden
          className="absolute inset-0 rounded-full bg-[color:var(--esap-emerald-500)]/10"
          animate={active ? { scale: [1, 1.12, 1] } : { scale: [1, 1.05, 1] }}
          transition={{
            duration: active ? 1.2 : 3.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
      <m.div
        aria-hidden
        className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--bg-surface)] text-[color:var(--esap-emerald-700)] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)]"
        animate={active ? { rotate: [-2, 2, 0], y: -1 } : undefined}
        transition={springSnappy}
      >
        <IconCloudUpload size={24} stroke={1.6} className="h-6 w-6" />
      </m.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Success actions                                                            */
/* -------------------------------------------------------------------------- */

interface SuccessActionsProps {
  t: UploadTranslator;
  firstDoneId: string | undefined;
  doneCount: number;
}

function SuccessActions({ t, firstDoneId, doneCount }: SuccessActionsProps) {
  const reduce = useReducedMotion();
  const item = useMemo(
    () =>
      reduce
        ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
        : {
            hidden: { opacity: 0, y: 6 },
            show: { opacity: 1, y: 0, transition: easeOut },
          },
    [reduce],
  );

  const isSingle = doneCount === 1 && Boolean(firstDoneId);
  if (!isSingle) return null;

  return (
    <m.div
      key="success-cta"
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: 4 }}
      className="mt-8 flex flex-wrap items-center gap-2"
      role="group"
      aria-label={t('success.title')}
    >
      <m.div variants={item} initial="hidden" animate="show">
        <Button asChild variant="primary">
          <Link href={`/chat?scope=${encodeURIComponent(firstDoneId!)}`}>
            <IconMessages size={16} stroke={1.8} className="h-4 w-4" />
            {t('success.chat')}
          </Link>
        </Button>
      </m.div>
    </m.div>
  );
}
