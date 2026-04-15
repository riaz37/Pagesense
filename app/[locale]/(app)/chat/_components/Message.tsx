'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { MarkdownContent } from '@/lib/markdown';
import type { ChatMessage, SourceDoc } from '@/lib/api';
import { cn } from '@/lib/cn';
import SourcesGrid from '@/components/SourcesGrid';
import { useLatency } from '@/components/LatencyProvider';

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
  const { showLatency } = useLatency();
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

  const hasContent = message.content.length > 0;
  const hasSources = (message.sources?.length ?? 0) > 0;
  const timingTotalSec = message.timing ? (message.timing.total_ms / 1000).toFixed(1) : null;

  return (
    <motion.div
      className="group"
      data-role="assistant"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <SourcesGrid
        sources={message.sources}
        additional={message.additionalSources}
        citedIds={message.citedDocIds}
        isStreaming={isStreaming && !hasContent}
        onOpenSource={onOpenSource}
      />

      {(hasContent || (isStreaming && hasSources)) && (
        <>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--text-tertiary)]">
            {t('answerLabel')}
          </p>
          {hasContent ? (
            <div
              className="markdown-content text-[16px] leading-[1.65] text-[color:var(--text-primary)]"
              dir="auto"
            >
              <MarkdownContent content={message.content} />
              {isStreaming && (
                <span
                  className="inline-block h-4 w-[2px] translate-y-0.5 animate-[caret-pulse_1s_ease-in-out_infinite] bg-[color:var(--esap-emerald-700)]"
                  aria-hidden
                />
              )}
            </div>
          ) : (
            <StreamingCaret label={t('streaming')} reduceMotion={reduceMotion ?? false} />
          )}
        </>
      )}

      {!hasContent && !hasSources && isStreaming && (
        <StreamingCaret label={t('streaming')} reduceMotion={reduceMotion ?? false} />
      )}

      {hasContent && !isStreaming && (
        <div className="mt-3 flex items-center gap-3 text-[11px] text-[color:var(--text-muted)]">
          {showLatency && timingTotalSec && (
            <span
              className="tabular-nums"
              title={
                message.timing
                  ? `retrieval ${message.timing.retrieval.total_ms.toFixed(0)}ms · generation ${message.timing.generation.total_ms.toFixed(0)}ms`
                  : undefined
              }
            >
              ⏱ {timingTotalSec}s
            </span>
          )}
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
