'use client';

import { useCallback, useMemo, useState } from 'react';

const STRIP_VISIBLE_CAP = 6;
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { MarkdownContent } from '@/lib/markdown';
import { CitationChip } from '@/components/ui/CitationChip';
import type { ChatMessage, SourceDoc } from '@/lib/api';
import { cn } from '@/lib/cn';

interface MessageProps {
  message: ChatMessage;
  isStreaming?: boolean;
  onOpenSource: (source: SourceDoc) => void;
}

export function Message({ message, isStreaming, onOpenSource }: MessageProps) {
  if (message.role === 'user') return <UserMessage message={message} />;
  return <AssistantMessage message={message} isStreaming={isStreaming} onOpenSource={onOpenSource} />;
}

function UserMessage({ message }: { message: ChatMessage }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="flex justify-end"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-[12px] px-4 py-2.5',
          'bg-[color:var(--bg-surface-subtle)] border border-[color:var(--border-subtle)]',
          'text-[15px] leading-[1.5] text-[color:var(--text-primary)]',
        )}
        dir="auto"
      >
        {message.content.split(/\n\n+/).map((para, i) => (
          <p key={i} dir="auto" className={i > 0 ? 'mt-2' : undefined}>
            {para}
          </p>
        ))}
      </div>
    </motion.div>
  );
}

function AssistantMessage({
  message,
  isStreaming,
  onOpenSource,
}: {
  message: ChatMessage;
  isStreaming?: boolean;
  onOpenSource: (source: SourceDoc) => void;
}) {
  const t = useTranslations('chat');
  const reduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  }, [message.content]);

  const citedSources = citedFrom(message);
  const hasContent = message.content.length > 0;
  const hasRetrieved = (message.sources?.length ?? 0) > 0;

  return (
    <motion.div
      className="group"
      data-role="assistant"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {hasRetrieved && (
        <RetrievedStrip
          sources={message.sources!}
          citedIds={message.citedDocIds}
          onOpenSource={onOpenSource}
          reduceMotion={reduceMotion ?? false}
        />
      )}

      {hasContent ? (
        <div
          className="markdown-content text-[15px] leading-[1.6] text-[color:var(--text-primary)]"
          dir="auto"
        >
          <MarkdownContent content={message.content} />
        </div>
      ) : isStreaming ? (
        <StreamingCaret label={t('streaming')} reduceMotion={reduceMotion ?? false} />
      ) : null}

      {hasContent && isStreaming && (
        <span className="inline-block h-4 w-[2px] translate-y-0.5 animate-[caret-pulse_1s_ease-in-out_infinite] bg-[color:var(--esap-emerald-700)]" aria-hidden />
      )}

      {citedSources.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5" aria-label={t('citation')}>
          {citedSources.map((source, i) => (
            <motion.span
              key={source.doc_id}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.2,
                delay: reduceMotion ? 0 : i * 0.04,
                ease: 'easeOut',
              }}
              className="inline-flex"
            >
              <CitationChip
                docId={source.doc_id}
                page={(source.matched_page ?? 0) + 1}
                label={citationLabel(source, i + 1)}
                onClick={() => onOpenSource(source)}
              />
            </motion.span>
          ))}
        </div>
      )}

      {hasContent && !isStreaming && (
        <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <HoverButton label={copied ? t('copied') : t('copy')} onClick={copy}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5 15V5a2 2 0 012-2h10" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </HoverButton>
        </div>
      )}
    </motion.div>
  );
}

function StreamingCaret({ label, reduceMotion }: { label: string; reduceMotion: boolean }) {
  return (
    <div className="flex items-center gap-1.5 py-1" aria-label={label} role="status">
      {[0, 1, 2].map((d) => (
        <motion.span
          key={d}
          className="inline-block h-2 w-2 rounded-full bg-[color:var(--esap-emerald-700)]"
          initial={{ opacity: 0.3 }}
          animate={reduceMotion ? { opacity: 0.6 } : { opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1.4,
            repeat: reduceMotion ? 0 : Infinity,
            ease: 'easeInOut',
            delay: d * 0.2,
          }}
        />
      ))}
    </div>
  );
}

interface HoverButtonProps {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}

function HoverButton({ label, onClick, children }: HoverButtonProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      whileHover={reduceMotion ? undefined : { scale: 1.04 }}
      whileTap={reduceMotion ? undefined : { scale: 0.96 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
      className={cn(
        'inline-flex h-7 items-center gap-1 rounded-[6px] px-2 text-[12px]',
        'text-[color:var(--text-muted)]',
        'hover:bg-[color:var(--bg-control)] hover:text-[color:var(--text-primary)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
        'transition-colors',
      )}
    >
      {children}
      <span>{label}</span>
    </motion.button>
  );
}

function RetrievedStrip({
  sources,
  citedIds,
  onOpenSource,
  reduceMotion,
}: {
  sources: SourceDoc[];
  citedIds?: string[];
  onOpenSource: (source: SourceDoc) => void;
  reduceMotion: boolean;
}) {
  const t = useTranslations('chat.sources');
  const [expanded, setExpanded] = useState(false);
  const haveCited = citedIds != null && citedIds.length > 0;
  const citedSet = useMemo(() => new Set(citedIds || []), [citedIds]);
  const ordered = useMemo(() => {
    return [...sources].sort((a, b) => {
      const ac = citedSet.has(a.doc_id) ? 1 : 0;
      const bc = citedSet.has(b.doc_id) ? 1 : 0;
      if (ac !== bc) return bc - ac;
      return (b.score ?? 0) - (a.score ?? 0);
    });
  }, [sources, citedSet]);

  const overflow = ordered.length - STRIP_VISIBLE_CAP;
  const visible = expanded || overflow <= 0 ? ordered : ordered.slice(0, STRIP_VISIBLE_CAP);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="mb-3"
    >
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--text-tertiary)]">
        {t('retrieved')} ({sources.length})
      </p>
      <div className="flex flex-wrap gap-1.5">
        {visible.map((s) => {
          const isCited = citedSet.has(s.doc_id);
          const dim = haveCited && !isCited;
          return (
            <button
              key={s.doc_id}
              type="button"
              onClick={() => onOpenSource(s)}
              title={s.doc_id.replace(/_/g, ' ')}
              dir="auto"
              className={cn(
                'inline-flex max-w-[220px] items-center gap-1 rounded-[4px] border px-1.5 py-0.5',
                'text-[11px] font-medium transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
                isCited
                  ? 'border-[color:var(--citation-border)] bg-[color:var(--badge-emerald-bg)] text-[color:var(--badge-emerald-text-dark)] hover:bg-[color:var(--badge-emerald-bg-hover)]'
                  : dim
                    ? 'border-[color:var(--border-subtle)] bg-transparent text-[color:var(--text-muted)] opacity-60 hover:opacity-100'
                    : 'border-[color:var(--border-subtle)] bg-[color:var(--bg-surface-subtle)] text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-surface-hover)]',
              )}
            >
              <span className="truncate">{s.doc_id.replace(/_/g, ' ')}</span>
              {s.matched_page != null && s.matched_page > 0 && (
                <span className="shrink-0 tabular-nums text-[color:var(--text-muted)]" aria-hidden>
                  · p.{s.matched_page + 1}
                </span>
              )}
            </button>
          );
        })}
        {overflow > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className={cn(
              'inline-flex items-center gap-1 rounded-[4px] border px-1.5 py-0.5',
              'border-dashed border-[color:var(--border-subtle)] bg-transparent',
              'text-[11px] font-semibold text-[color:var(--text-secondary)]',
              'transition-colors hover:bg-[color:var(--bg-surface-hover)] hover:text-[color:var(--text-primary)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
            )}
          >
            {expanded ? t('showLess') : t('showMore', { count: overflow })}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function citedFrom(message: ChatMessage): SourceDoc[] {
  if (!message.sources) return [];
  const ids = message.citedDocIds;
  if (!ids || ids.length === 0) return [];
  const bySource = new Map(message.sources.map((s) => [s.doc_id, s]));
  return ids.map((id) => bySource.get(id)).filter((s): s is SourceDoc => s != null);
}

function citationLabel(source: SourceDoc, ordinal: number): string {
  const meta = source.metadata || {};
  const docNum = meta.document_number as string | undefined;
  if (docNum) return String(docNum);
  const trimmed = source.doc_id?.replace(/_/g, ' ').slice(0, 20);
  return trimmed || String(ordinal);
}
