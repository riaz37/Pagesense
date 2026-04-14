'use client';

import { useCallback, useState } from 'react';
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

  return (
    <motion.div
      className="group"
      data-role="assistant"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
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
