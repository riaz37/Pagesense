"use client";

import type { SourceDoc } from "@/lib/api";
import { Card } from "@/components/ui";

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
      type="button"
      onClick={onClick}
      className="w-full text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)] rounded-[12px] animate-slide-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <Card className="p-3.5 transition-colors hover:border-[color:var(--esap-emerald-700)]/30 hover:bg-[color:var(--bg-surface-hover)]">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span
            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider badge-${docType}`}
          >
            {docType.replace(/_/g, " ")}
          </span>
          <span className="text-[10px] text-[color:var(--text-muted)] tabular-nums">
            {(source.score * 100).toFixed(0)}% match
          </span>
        </div>

        <p
          className="text-[11px] font-mono text-[color:var(--text-secondary)] truncate mb-0.5"
          title={source.doc_id}
        >
          {source.doc_id.replace(/_/g, " ")}
        </p>
        {issuer && (
          <p className="text-xs text-[color:var(--text-muted)] truncate mb-1" dir="auto">
            {issuer}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-[color:var(--text-muted)]">
          {date && <span>{date}</span>}
          {total != null && total > 0 && (
            <span className="font-medium text-[color:var(--esap-emerald-700)]">
              {total.toLocaleString()} {currency}
            </span>
          )}
          {source.matched_page != null &&
            source.matched_page > 0 &&
            source.page_images.length > 1 && (
              <span className="ms-auto text-[10px] text-[color:var(--esap-emerald-700)] font-medium">
                page {source.matched_page + 1}/{source.page_images.length}
              </span>
            )}
        </div>
      </Card>
    </button>
  );
}
