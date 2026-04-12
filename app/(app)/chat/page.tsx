"use client";

import { Suspense, useCallback, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { chatStream, type ChatMessage, type SourceDoc } from "@/lib/api";
import { renderMarkdown } from "@/lib/markdown";
import SourceCard from "@/components/SourceCard";
import DocumentViewer from "@/components/DocumentViewer";
import { useLatency } from "@/components/LatencyProvider";
import { useTheme } from "@/components/ThemeProvider";

interface ViewerState {
  docId: string;
  pageImages: string[];
  metadata: Record<string, unknown>;
  structuredData?: Record<string, unknown>;
  initialPage?: number;
}

function ChatPageInner() {
  const searchParams = useSearchParams();
  const scopeDocId = searchParams.get("scope") || undefined;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewer, setViewer] = useState<ViewerState | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { showLatency } = useLatency();
  const { theme } = useTheme();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, []);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const query = input.trim();
      if (!query || isStreaming) return;

      setInput("");
      setIsStreaming(true);

      const userMsg: ChatMessage = { role: "user", content: query };
      setMessages((prev) => [...prev, userMsg]);

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: "",
        sources: [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
      scrollToBottom();

      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const stream = chatStream(query, history, 5, undefined, scopeDocId);
        for await (const event of stream) {
          if (event.type === "sources") {
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last.role === "assistant") {
                return [...prev.slice(0, -1), { ...last, sources: event.data }];
              }
              return prev;
            });
          } else if (event.type === "additional") {
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last.role === "assistant") {
                return [...prev.slice(0, -1), { ...last, additionalSources: event.data }];
              }
              return prev;
            });
          } else if (event.type === "chunk") {
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last.role === "assistant") {
                return [...prev.slice(0, -1), { ...last, content: last.content + event.data }];
              }
              return prev;
            });
            scrollToBottom();
          } else if (event.type === "cited") {
            // Reorder sources: cited docs first (by mention order), then uncited by score
            const citedIds: string[] = event.data;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last.role === "assistant" && last.sources) {
                const cited = citedIds
                  .map((id) => last.sources!.find((s) => s.doc_id === id))
                  .filter(Boolean) as SourceDoc[];
                const uncited = last.sources!.filter(
                  (s) => !citedIds.includes(s.doc_id)
                );
                return [
                  ...prev.slice(0, -1),
                  { ...last, sources: [...cited, ...uncited], citedDocIds: citedIds },
                ];
              }
              return prev;
            });
          } else if (event.type === "timing") {
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last.role === "assistant") {
                return [...prev.slice(0, -1), { ...last, timing: event.data }];
              }
              return prev;
            });
          } else if (event.type === "error") {
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last.role === "assistant") {
                return [...prev.slice(0, -1), { ...last, content: `Error: ${event.data}` }];
              }
              return prev;
            });
          }
        }
      } catch {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last.role === "assistant") {
            return [...prev.slice(0, -1), { ...last, content: "Failed to connect to the server. Make sure the backend is running at localhost:8000." }];
          }
          return prev;
        });
      }

      setIsStreaming(false);
      scrollToBottom();
      inputRef.current?.focus();
    },
    [input, isStreaming, messages, scrollToBottom, scopeDocId]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const openViewer = (source: SourceDoc) => {
    setViewer({
      docId: source.doc_id,
      pageImages: source.page_images,
      metadata: source.metadata,
      initialPage: source.matched_page || 0,
    });
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-page)]">
      {/* Scoped chat banner */}
      {scopeDocId && (
        <div className="px-4 py-2 bg-[var(--ember-500)]/10 border-b border-[var(--ember-500)]/20 flex items-center justify-between">
          <p className="text-xs text-[var(--text-secondary)]">
            Chatting about: <span className="font-mono font-medium">{scopeDocId.replace(/_/g, " ")}</span>
          </p>
          <a
            href="/chat"
            className="text-xs text-[var(--ember-500)] hover:underline"
          >
            Exit scoped chat
          </a>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-6">
            <div className="text-center max-w-lg">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[var(--ember-500)]/20 to-[var(--ember-600)]/10 border border-[var(--ember-500)]/20 flex items-center justify-center overflow-hidden">
                <img
                  src={theme === "dark" ? "/esap_logo_white.png" : "/esap_logo_black.png"}
                  alt="ESAP"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                Search your documents
              </h2>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-8">
                Ask questions about your Arabic business documents in Arabic or English.
                The AI will find relevant documents and answer based on their contents.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {[
                  "ما هي الفواتير الخاصة بشركة الطاقات المثمرة؟",
                  "Show me all quotations above 50,000 SAR",
                  "ابحث عن عروض الأسعار للأثاث",
                  "What purchase orders were made in 2023?",
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(q);
                      inputRef.current?.focus();
                    }}
                    className="px-3.5 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] hover:border-[var(--ember-500)]/30 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all text-left shadow-sm"
                    dir="auto"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`animate-fade-in ${
                  msg.role === "user" ? "flex justify-end" : ""
                }`}
              >
                {msg.role === "user" ? (
                  <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-md bg-[var(--ember-500)]/10 border border-[var(--ember-500)]/20 text-[var(--text-primary)] text-sm">
                    <p dir="auto">{msg.content}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-default)] flex items-center justify-center shrink-0 mt-0.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14,2 14,8 20,8" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        {msg.content ? (
                          <div
                            className="markdown-content text-sm text-[var(--text-secondary)] leading-relaxed"
                            dir="auto"
                            dangerouslySetInnerHTML={{
                              __html: renderMarkdown(msg.content),
                            }}
                          />
                        ) : isStreaming && i === messages.length - 1 ? (
                          <div className="flex gap-1.5 py-2">
                            {[0, 1, 2].map((d) => (
                              <div
                                key={d}
                                className="w-2 h-2 rounded-full bg-[var(--ember-400)]"
                                style={{
                                  animation: `pulse-dot 1.4s ease-in-out infinite`,
                                  animationDelay: `${d * 0.2}s`,
                                }}
                              />
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {msg.sources && msg.sources.length > 0 && (() => {
                      const citedSet = new Set(msg.citedDocIds || []);
                      const cited = msg.sources!.filter((s) => citedSet.has(s.doc_id));
                      const uncited = msg.sources!.filter((s) => !citedSet.has(s.doc_id));
                      return (
                        <div className="ml-10 mt-2">
                          {cited.length > 0 ? (
                            <>
                              <p className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-2 font-medium">
                                Cited sources ({cited.length})
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {cited.map((source, si) => (
                                  <SourceCard
                                    key={source.doc_id}
                                    source={source}
                                    index={si}
                                    onClick={() => openViewer(source)}
                                  />
                                ))}
                              </div>
                              {uncited.length > 0 && (
                                <>
                                  <p className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-2 mt-3 font-medium">
                                    Other sources ({uncited.length})
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {uncited.map((source, si) => (
                                      <SourceCard
                                        key={source.doc_id}
                                        source={source}
                                        index={si + cited.length}
                                        onClick={() => openViewer(source)}
                                      />
                                    ))}
                                  </div>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <p className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-2 font-medium">
                                Sources ({msg.sources!.length} documents)
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {msg.sources!.map((source, si) => (
                                  <SourceCard
                                    key={source.doc_id}
                                    source={source}
                                    index={si}
                                    onClick={() => openViewer(source)}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                          {msg.additionalSources && msg.additionalSources.length > 0 && (
                            <details className="mt-3">
                              <summary className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-2 font-medium cursor-pointer hover:text-[var(--text-muted)] transition-colors">
                                More matching documents ({msg.additionalSources.length})
                              </summary>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                {msg.additionalSources.map((source, si) => (
                                  <SourceCard
                                    key={source.doc_id}
                                    source={source}
                                    index={si}
                                    onClick={() => openViewer(source)}
                                  />
                                ))}
                              </div>
                            </details>
                          )}
                        </div>
                      );
                    })()}

                    {showLatency && msg.timing && (
                      <div className="ml-10 mt-2 animate-fade-in">
                        <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-tertiary)] tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          <span title="Query embedding time">
                            <span className="text-[var(--text-muted)]">Embed</span> {msg.timing.retrieval.embed_ms.toFixed(0)}ms
                          </span>
                          <span className="text-[var(--border-default)]">|</span>
                          <span title="Vector search time">
                            <span className="text-[var(--text-muted)]">Search</span> {msg.timing.retrieval.search_ms.toFixed(0)}ms
                          </span>
                          <span className="text-[var(--border-default)]">|</span>
                          <span title="Cross-encoder reranking time">
                            <span className="text-[var(--text-muted)]">Rerank</span> {msg.timing.retrieval.rerank_ms?.toFixed(0) || 0}ms
                          </span>
                          <span className="text-[var(--border-default)]">|</span>
                          <span title="Time to first token">
                            <span className="text-[var(--text-muted)]">TTFT</span> {msg.timing.generation.ttft_ms.toFixed(0)}ms
                          </span>
                          <span className="text-[var(--border-default)]">|</span>
                          <span title="Total generation time">
                            <span className="text-[var(--text-muted)]">Gen</span> {(msg.timing.generation.total_ms / 1000).toFixed(1)}s
                          </span>
                          <span className="text-[var(--border-default)]">|</span>
                          <span title="Total end-to-end server time">
                            <span className="text-[var(--ember-500)]">Total</span> {(msg.timing.total_ms / 1000).toFixed(1)}s
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-[var(--border-default)] bg-[var(--bg-surface)]">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-end gap-3 rounded-xl border border-[var(--border-input)] bg-[var(--bg-input)] focus-within:border-[var(--ember-500)]/40 focus-within:ring-2 focus-within:ring-[var(--ember-500)]/10 transition-all px-4 py-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your documents..."
              dir="auto"
              rows={1}
              className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] resize-none outline-none leading-relaxed max-h-32"
              style={{ fontFamily: "'DM Sans', 'IBM Plex Sans Arabic', sans-serif" }}
              disabled={isStreaming}
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="w-8 h-8 rounded-lg bg-[var(--ember-500)] hover:bg-[var(--ember-600)] disabled:bg-[var(--ink-200)] disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
            >
              {isStreaming ? (
                <div className="w-3.5 h-3.5 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22,2 15,22 11,13 2,9" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-2 text-center">
            AI answers are based only on your indexed documents. Press Enter to send, Shift+Enter for new line.
          </p>
        </form>
      </div>

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

export default function ChatPage() {
  return (
    <Suspense>
      <ChatPageInner />
    </Suspense>
  );
}
