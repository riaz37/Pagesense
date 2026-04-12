"use client";

import type { SourceDoc } from "@/lib/api";

interface SourceCardProps {
  source: SourceDoc;
  onClick: () => void;
  index: number;
}

export default function SourceCard({ source, onClick, index }: SourceCardProps) {
  const meta = source.metadata;
  const docType = String(meta.document_type || "other");
  const issuer = String(meta.issuer_name || "");
  const date = String(meta.document_date || "");
  const total = meta.total_amount as number | undefined;
  const currency = String(meta.currency || "SAR");

  return (
    <button
      onClick={onClick}
      className="group text-left w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] hover:border-[var(--ember-500)]/30 hover:shadow-md p-3.5 transition-all duration-200 animate-slide-up shadow-sm"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider badge-${docType}`}
        >
          {docType.replace(/_/g, " ")}
        </span>
        <span className="text-[10px] text-[var(--text-muted)] tabular-nums">
          {(source.score * 100).toFixed(0)}% match
        </span>
      </div>

      <p
        className="text-[11px] font-mono text-[var(--text-secondary)] truncate mb-0.5"
        title={source.doc_id}
      >
        {source.doc_id.replace(/_/g, " ")}
      </p>
      {issuer && (
        <p
          className="text-xs text-[var(--text-muted)] truncate mb-1"
          dir="auto"
        >
          {issuer}
        </p>
      )}
      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
        {date && <span>{date}</span>}
        {total != null && total > 0 && (
          <span className="font-medium text-[var(--ember-600)]">
            {total.toLocaleString()} {currency}
          </span>
        )}
        {source.matched_page != null && source.matched_page > 0 && source.page_images.length > 1 && (
          <span className="ml-auto text-[10px] text-[var(--ember-500)] font-medium">
            page {source.matched_page + 1}/{source.page_images.length}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center gap-1 text-[10px] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </svg>
        View original document
      </div>
    </button>
  );
}
