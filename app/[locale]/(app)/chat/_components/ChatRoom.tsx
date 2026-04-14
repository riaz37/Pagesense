'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from '@/lib/i18n/navigation';
import {
  chatStream,
  fetchUploadStatus,
  uploadDocument,
  type ChatMessage,
  type SourceDoc,
} from '@/lib/api';
import SourceCard from '@/components/SourceCard';
import DocumentViewer from '@/components/DocumentViewer';
import { useUploadJobs, TERMINAL_STATUSES } from '@/lib/uploadJobsContext';
import { cn } from '@/lib/cn';
import { Message } from './Message';
import { Composer, type ComposerAttachment } from './Composer';
import { EmptyState } from './EmptyState';
import { RetryBanner } from './RetryBanner';
import { ScrollButton } from './ScrollButton';

const ATTACH_MAX_BYTES = 50 * 1024 * 1024;
const ATTACH_VALID_EXT = new Set(['pdf', 'jpg', 'jpeg', 'png']);
const ATTACH_STAGE_PCT: Record<string, number> = {
  queued: 5,
  ingesting: 15,
  extracting: 40,
  normalizing: 70,
  preparing: 85,
  indexing: 95,
  done: 100,
  error: 0,
};

interface ViewerState {
  docId: string;
  pageImages: string[];
  metadata: Record<string, unknown>;
  structuredData?: Record<string, unknown>;
  initialPage?: number;
}

export function ChatRoom() {
  const t = useTranslations('chat');
  const tUpload = useTranslations('upload');
  const searchParams = useSearchParams();
  const scopeDocId = searchParams.get('scope') || undefined;
  const reduceMotion = useReducedMotion();
  const { getJobByDocId } = useUploadJobs();
  const scopedJob = scopeDocId ? getJobByDocId(scopeDocId) : undefined;
  const isScopedJobActive = Boolean(scopedJob && !TERMINAL_STATUSES.has(scopedJob.status));

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewer, setViewer] = useState<ViewerState | null>(null);
  const [disconnected, setDisconnected] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [attachment, setAttachment] = useState<ComposerAttachment | null>(null);
  const lastQueryRef = useRef<{ query: string; history: { role: string; content: string }[] } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const attachPollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hasMessages = messages.length > 0;
  const effectiveScopeDocId =
    scopeDocId || (attachment?.state === 'ready' ? attachment.docId : undefined);

  const stopAttachPolling = useCallback(() => {
    if (attachPollRef.current) {
      clearTimeout(attachPollRef.current);
      attachPollRef.current = null;
    }
  }, []);

  const pollAttachment = useCallback(
    (jobId: string, filename: string) => {
      stopAttachPolling();
      const tick = async () => {
        try {
          const job = await fetchUploadStatus(jobId);
          const pct = job.progress || ATTACH_STAGE_PCT[job.status] || 0;
          if (job.status === 'done') {
            setAttachment({
              filename,
              state: 'ready',
              progress: 100,
              docId: job.doc_id ?? undefined,
            });
            toast.success(t('toast.attachReady', { name: filename }));
            return;
          }
          if (job.status === 'error') {
            setAttachment({
              filename,
              state: 'error',
              progress: 0,
              error: job.error ?? undefined,
            });
            return;
          }
          setAttachment({
            filename,
            state: 'indexing',
            progress: pct,
          });
        } catch {
          // transient — reschedule
        }
        attachPollRef.current = setTimeout(tick, 1500);
      };
      attachPollRef.current = setTimeout(tick, 1500);
    },
    [stopAttachPolling, t],
  );

  const handleAttach = useCallback(
    async (file: File) => {
      stopAttachPolling();
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (!ATTACH_VALID_EXT.has(ext)) {
        setAttachment({ filename: file.name, state: 'error', error: t('attach.errorMime') });
        return;
      }
      if (file.size > ATTACH_MAX_BYTES) {
        setAttachment({ filename: file.name, state: 'error', error: t('attach.errorSize') });
        return;
      }
      setAttachment({ filename: file.name, state: 'uploading', progress: 0 });
      try {
        const result = await uploadDocument(file);
        setAttachment({
          filename: file.name,
          state: 'indexing',
          progress: ATTACH_STAGE_PCT.queued,
        });
        pollAttachment(result.job_id, file.name);
      } catch (err) {
        setAttachment({
          filename: file.name,
          state: 'error',
          error: err instanceof Error ? err.message : t('attach.errorGeneric'),
        });
      }
    },
    [pollAttachment, stopAttachPolling, t],
  );

  const handleRemoveAttachment = useCallback(() => {
    stopAttachPolling();
    setAttachment(null);
  }, [stopAttachPolling]);

  useEffect(() => () => stopAttachPolling(), [stopAttachPolling]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }, []);

  const runStream = useCallback(
    async (query: string, history: { role: string; content: string }[]) => {
      setIsStreaming(true);
      setDisconnected(false);
      setStopped(false);

      const controller = new AbortController();
      abortRef.current = controller;

      const userMsg: ChatMessage = { role: 'user', content: query };
      const assistantMsg: ChatMessage = { role: 'assistant', content: '', sources: [] };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      scrollToBottom();

      try {
        const stream = chatStream(query, history, 5, undefined, effectiveScopeDocId, controller.signal);
        for await (const event of stream) {
          if (event.type === 'sources') {
            setMessages((prev) => patchLastAssistant(prev, (last) => ({ ...last, sources: event.data })));
          } else if (event.type === 'additional') {
            setMessages((prev) => patchLastAssistant(prev, (last) => ({ ...last, additionalSources: event.data })));
          } else if (event.type === 'chunk') {
            setMessages((prev) =>
              patchLastAssistant(prev, (last) => ({ ...last, content: last.content + event.data })),
            );
            scrollToBottom();
          } else if (event.type === 'cited') {
            setMessages((prev) =>
              patchLastAssistant(prev, (last) => {
                if (!last.sources) return { ...last, citedDocIds: event.data };
                const citedSet = new Set(event.data);
                const cited = event.data
                  .map((id) => last.sources!.find((s) => s.doc_id === id))
                  .filter((s): s is SourceDoc => s != null);
                const uncited = last.sources.filter((s) => !citedSet.has(s.doc_id));
                return { ...last, citedDocIds: event.data, sources: [...cited, ...uncited] };
              }),
            );
          } else if (event.type === 'timing') {
            setMessages((prev) => patchLastAssistant(prev, (last) => ({ ...last, timing: event.data })));
          } else if (event.type === 'error') {
            setMessages((prev) =>
              patchLastAssistant(prev, (last) => ({ ...last, content: last.content || `Error: ${event.data}` })),
            );
            setDisconnected(true);
          }
        }
      } catch (err) {
        if (controller.signal.aborted) {
          // User stopped — collapse empty bubble, keep partial otherwise.
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (!last || last.role !== 'assistant') return prev;
            if (last.content.length === 0) return prev.slice(0, -1);
            return prev;
          });
        } else {
          setDisconnected(true);
        }
      } finally {
        abortRef.current = null;
        setIsStreaming(false);
        scrollToBottom();
        inputRef.current?.focus();
      }
    },
    [effectiveScopeDocId, scrollToBottom],
  );

  const handleSubmit = useCallback(() => {
    const query = input.trim();
    if (!query || isStreaming) return;
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    lastQueryRef.current = { query, history };
    setInput('');
    void runStream(query, history);
  }, [input, isStreaming, messages, runStream]);

  const handleStop = useCallback(() => {
    const controller = abortRef.current;
    if (!controller) return;
    controller.abort();
    setStopped(true);
  }, []);

  const handleRetry = useCallback(() => {
    const last = lastQueryRef.current;
    if (!last || isStreaming) return;
    // Drop the empty/failed assistant turn + its user msg so we don't duplicate on retry.
    setMessages((prev) => (prev.length >= 2 ? prev.slice(0, -2) : prev));
    void runStream(last.query, last.history);
  }, [isStreaming, runStream]);

  const openSource = useCallback((source: SourceDoc) => {
    setViewer({
      docId: source.doc_id,
      pageImages: source.page_images,
      metadata: source.metadata,
      structuredData: source.structured_data,
      initialPage: source.matched_page || 0,
    });
  }, []);

  // Focus composer on `/` shortcut (per DESIGN accessibility matrix).
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'TEXTAREA' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Clean up any in-flight controller on unmount.
  useEffect(() => () => abortRef.current?.abort(), []);

  return (
    <div className="flex h-full flex-col bg-[color:var(--bg-page)]" data-testid="chat-room">
      <AnimatePresence initial={false}>
        {isScopedJobActive && scopedJob && (
          <motion.div
            key={`processing-${scopedJob.job_id}`}
            role="status"
            aria-live="polite"
            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-[12px] text-amber-900 dark:text-amber-200"
          >
            <span
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-amber-600 border-t-transparent"
            />
            <p className="flex-1" dir="auto">
              {t('scope.processing', {
                stage: tUpload(`stage.${scopedJob.status}` as 'stage.queued'),
                progress: scopedJob.progress || 0,
              })}
            </p>
          </motion.div>
        )}
        {scopeDocId && (
          <motion.div
            key={scopeDocId}
            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'flex items-center justify-between gap-3 border-b px-4 py-2',
              'border-[color:var(--scope-banner-border)] bg-[color:var(--scope-banner-bg)]',
              'text-[12px] text-[color:var(--text-secondary)]',
            )}
          >
            <p className="truncate" dir="auto">
              {t('scope.banner', { docId: scopeDocId.replace(/_/g, ' ') })}
            </p>
            <Link
              href="/chat"
              className={cn(
                'shrink-0 rounded-[4px] px-2 py-0.5 text-[12px] font-semibold',
                'text-[color:var(--esap-emerald-700)] hover:underline',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
              )}
            >
              {t('scope.exit')}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {hasMessages ? (
          <section
            ref={scrollRef}
            role="log"
            aria-live="polite"
            aria-atomic="false"
            aria-label={t('messageListLabel')}
            className="h-full overflow-y-auto animate-fade-in"
          >
            <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-4 py-8">
              {messages.map((msg, i) => (
                <Message
                  key={i}
                  message={msg}
                  isStreaming={isStreaming && i === messages.length - 1}
                  onOpenSource={openSource}
                />
              ))}
              <AnimatePresence initial={false}>
                {stopped && !isStreaming && !disconnected && (
                  <motion.p
                    key="stopped"
                    role="status"
                    aria-live="polite"
                    initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="text-[12px] text-[color:var(--text-tertiary)]"
                  >
                    {t('stopped')}
                  </motion.p>
                )}
                {disconnected && !isStreaming && (
                  <motion.div
                    key="retry"
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <RetryBanner onRetry={handleRetry} />
                  </motion.div>
                )}
              </AnimatePresence>
              {!isStreaming && <UncitedSources messages={messages} onOpenSource={openSource} />}
              <div ref={messagesEndRef} />
            </div>
          </section>
        ) : (
          <div className="flex h-full items-end justify-center pb-6 animate-fade-in">
            <EmptyState />
          </div>
        )}
        {hasMessages && <ScrollButton containerRef={scrollRef} />}
      </div>
      <div
        className={cn(
          'shrink-0 bg-[color:var(--bg-page)] transition-[border-color] duration-300',
          hasMessages ? 'border-t border-[color:var(--border-subtle)]' : 'border-t border-transparent',
        )}
      >
        <Composer
          ref={inputRef}
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          onStop={handleStop}
          isStreaming={isStreaming}
          attachment={attachment ?? undefined}
          onAttach={handleAttach}
          onRemoveAttachment={handleRemoveAttachment}
        />
      </div>
      <div
        aria-hidden
        style={{
          flexGrow: hasMessages ? 0 : 1,
          flexShrink: 0,
          flexBasis: 0,
          transition: 'flex-grow 500ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />

      {viewer && (
        <DocumentViewer
          docId={viewer.docId}
          pageImages={viewer.pageImages}
          metadata={viewer.metadata}
          structuredData={viewer.structuredData}
          initialPage={viewer.initialPage}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  );
}

function patchLastAssistant(
  prev: ChatMessage[],
  patch: (last: ChatMessage) => ChatMessage,
): ChatMessage[] {
  const last = prev[prev.length - 1];
  if (!last || last.role !== 'assistant') return prev;
  return [...prev.slice(0, -1), patch(last)];
}

function UncitedSources({
  messages,
  onOpenSource,
}: {
  messages: ChatMessage[];
  onOpenSource: (source: SourceDoc) => void;
}) {
  const t = useTranslations('chat.sources');
  const last = messages[messages.length - 1];
  if (!last || last.role !== 'assistant' || !last.sources) return null;
  const citedSet = new Set(last.citedDocIds || []);
  const uncited = last.sources.filter((s) => !citedSet.has(s.doc_id));
  const additional = last.additionalSources || [];
  if (uncited.length === 0 && additional.length === 0) return null;

  return (
    <div className="mt-1 space-y-4">
      {uncited.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--text-tertiary)]">
            {t('other')} ({uncited.length})
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {uncited.map((source, i) => (
              <SourceCard
                key={source.doc_id}
                source={source}
                index={i}
                onClick={() => onOpenSource(source)}
              />
            ))}
          </div>
        </div>
      )}
      {additional.length > 0 && (
        <details>
          <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--text-tertiary)] hover:text-[color:var(--text-secondary)]">
            {t('more')} ({additional.length})
          </summary>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {additional.map((source, i) => (
              <SourceCard
                key={source.doc_id}
                source={source}
                index={i}
                onClick={() => onOpenSource(source)}
              />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
