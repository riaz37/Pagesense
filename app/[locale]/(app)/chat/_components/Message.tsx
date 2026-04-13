'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { renderMarkdown } from '@/lib/markdown';
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
  return (
    <div className="flex justify-end">
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
    </div>
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
    <div className="group" data-role="assistant">
      {hasContent ? (
        <div
          className="markdown-content text-[15px] leading-[1.6] text-[color:var(--text-primary)]"
          dir="auto"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
        />
      ) : isStreaming ? (
        <StreamingCaret label={t('streaming')} />
      ) : null}

      {hasContent && isStreaming && (
        <span className="inline-block h-4 w-[2px] translate-y-0.5 animate-[caret-pulse_1s_ease-in-out_infinite] bg-[color:var(--esap-emerald-700)]" aria-hidden />
      )}

      {citedSources.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5" aria-label={t('citation')}>
          {citedSources.map((source, i) => (
            <CitationChip
              key={source.doc_id}
              docId={source.doc_id}
              page={(source.matched_page ?? 0) + 1}
              label={citationLabel(source, i + 1)}
              onClick={() => onOpenSource(source)}
            />
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
    </div>
  );
}

function StreamingCaret({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5 py-1" aria-label={label} role="status">
      {[0, 1, 2].map((d) => (
        <span
          key={d}
          className="inline-block h-2 w-2 rounded-full bg-[color:var(--esap-emerald-700)]"
          style={{ animation: 'pulse-dot 1.4s ease-in-out infinite', animationDelay: `${d * 0.2}s` }}
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
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'inline-flex h-7 items-center gap-1 rounded-[6px] px-2 text-[12px]',
        'text-[color:var(--text-muted)] hover:bg-black/5 hover:text-[color:var(--text-primary)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
        'dark:hover:bg-white/5',
      )}
    >
      {children}
      <span>{label}</span>
    </button>
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
  // Fallback: humanised doc_id or ordinal
  const trimmed = source.doc_id?.replace(/_/g, ' ').slice(0, 20);
  return trimmed || String(ordinal);
}
