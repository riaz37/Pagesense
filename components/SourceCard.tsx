"use client";

import type { SourceDoc } from "@/lib/api";
import { Card } from "@/components/ui";
import { formatDocName } from "@/lib/format";

interface SourceCardProps {
  source: SourceDoc;
  onClick: () => void;
  index: number;
  cited?: boolean;
}

export default function SourceCard({ source, onClick, index, cited = false }: SourceCardProps) {
  const meta = source.metadata;
  const docType = String(meta.document_type || "other");
  const issuer = String(meta.issuer_name || "").trim();
  const docNumber = String(meta.document_number || "").trim();
  const title = formatDocName(source.doc_id, docNumber);
  const snippet = (source.snippet || "").trim();
  const totalPages = source.page_images?.length ?? 0;
  const matchedPage = source.matched_page ?? 0;
  const showPage = matchedPage > 0 && totalPages > 1;
  const animationDelay = `${Math.min(index, 4) * 60}ms`;
  const tooltip = `${source.doc_id} · ${(source.score * 100).toFixed(0)}% match`;

  return (
    <button
      type="button"
      onClick={onClick}
      title={tooltip}
      className="w-full h-full text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)] rounded-[12px] animate-slide-up"
      style={{ animationDelay }}
    >
      <Card
        className={
          cited
            ? "h-full p-3 border-2 border-[color:var(--esap-emerald-700)] bg-[color:var(--badge-emerald-bg)] transition-colors hover:bg-[color:var(--badge-emerald-bg-hover)]"
            : "h-full p-3 transition-colors hover:border-[color:var(--esap-emerald-700)]/30 hover:bg-[color:var(--bg-surface-hover)]"
        }
      >
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider badge-${docType}`}
          >
            {docType.replace(/_/g, " ")}
          </span>
          {docNumber && (
            <span className="text-[11px] font-mono text-[color:var(--text-muted)] truncate">
              #{docNumber}
            </span>
          )}
          {showPage && (
            <span className="ms-auto text-[10px] text-[color:var(--text-muted)] tabular-nums">
              p.{matchedPage + 1}/{totalPages}
            </span>
          )}
        </div>

        <p
          className="text-sm font-semibold text-[color:var(--text-primary)] truncate"
          dir="auto"
        >
          {title}
        </p>
        {issuer && (
          <p
            className="mt-0.5 text-[11px] text-[color:var(--text-muted)] truncate"
            dir="auto"
          >
            {issuer}
          </p>
        )}
        {snippet && (
          <p
            className="mt-1 text-xs text-[color:var(--text-secondary)] line-clamp-2"
            dir="auto"
          >
            {snippet}
          </p>
        )}
      </Card>
    </button>
  );
}
