'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { chatStream, type ChatMessage, type SourceDoc } from '@/lib/api';
import SourceCard from '@/components/SourceCard';
import DocumentViewer from '@/components/DocumentViewer';
import { cn } from '@/lib/cn';
import { Message } from './Message';
import { Composer } from './Composer';
import { EmptyState } from './EmptyState';
import { RetryBanner } from './RetryBanner';

interface ViewerState {
  docId: string;
  pageImages: string[];
  metadata: Record<string, unknown>;
  structuredData?: Record<string, unknown>;
  initialPage?: number;
}

export function ChatRoom() {
  const t = useTranslations('chat');
  const searchParams = useSearchParams();
  const scopeDocId = searchParams.get('scope') || undefined;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewer, setViewer] = useState<ViewerState | null>(null);
  const [disconnected, setDisconnected] = useState(false);
  const lastQueryRef = useRef<{ query: string; history: { role: string; content: string }[] } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hasMessages = messages.length > 0;

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }, []);

  const runStream = useCallback(
    async (query: string, history: { role: string; content: string }[]) => {
      setIsStreaming(true);
      setDisconnected(false);

      const userMsg: ChatMessage = { role: 'user', content: query };
      const assistantMsg: ChatMessage = { role: 'assistant', content: '', sources: [] };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      scrollToBottom();

      try {
        const stream = chatStream(query, history, 5, undefined, scopeDocId);
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
      } catch {
        setDisconnected(true);
      } finally {
        setIsStreaming(false);
        scrollToBottom();
        inputRef.current?.focus();
      }
    },
    [scopeDocId, scrollToBottom],
  );

  const handleSubmit = useCallback(() => {
    const query = input.trim();
    if (!query || isStreaming) return;
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    lastQueryRef.current = { query, history };
    setInput('');
    void runStream(query, history);
  }, [input, isStreaming, messages, runStream]);

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

  return (
    <div className="flex h-full flex-col bg-[color:var(--bg-page)]" data-testid="chat-room">
      {scopeDocId && (
        <div
          className={cn(
            'flex items-center justify-between gap-3 border-b px-4 py-2',
            'border-[color:var(--esap-emerald-700)]/15 bg-[color:var(--esap-emerald-50)]/50',
            'text-[12px] text-[color:var(--text-secondary)] dark:bg-[color:var(--esap-emerald-900)]/10',
          )}
        >
          <p className="truncate" dir="auto">
            {t('scope.banner', { docId: scopeDocId.replace(/_/g, ' ') })}
          </p>
          <Link
            href="/chat"
            className="shrink-0 rounded-[4px] px-2 py-0.5 text-[12px] font-semibold text-[color:var(--esap-emerald-700)] hover:underline"
          >
            {t('scope.exit')}
          </Link>
        </div>
      )}

      {hasMessages ? (
        <>
          <section
            role="log"
            aria-live="polite"
            aria-atomic="false"
            aria-label={t('messageListLabel')}
            className="flex-1 overflow-y-auto"
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
              {disconnected && !isStreaming && <RetryBanner onRetry={handleRetry} />}
              <UncitedSources messages={messages} onOpenSource={openSource} />
              <div ref={messagesEndRef} />
            </div>
          </section>
          <div className="border-t border-[color:var(--border-subtle)] bg-[color:var(--bg-page)]">
            <Composer
              ref={inputRef}
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              disabled={isStreaming}
              isStreaming={isStreaming}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col items-center justify-center">
            <EmptyState />
            <div className="mt-8 w-full">
              <Composer
                ref={inputRef}
                value={input}
                onChange={setInput}
                onSubmit={handleSubmit}
                disabled={isStreaming}
                isStreaming={isStreaming}
                centered
              />
            </div>
          </div>
        </div>
      )}

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
