"use client";

import { useEffect, useState } from "react";
import {
  fetchDocuments,
  fetchDocument,
  type DocumentMeta,
  type DocumentDetail,
} from "@/lib/api";
import DocumentViewer from "@/components/DocumentViewer";

const DOC_TYPES = [
  "all",
  "quotation",
  "invoice",
  "purchase_order",
  "form",
  "approval",
  "delivery_note",
  "quantity_survey",
  "other",
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [year, setYear] = useState("");
  const [viewer, setViewer] = useState<{
    docId: string;
    pageImages: string[];
    metadata: Record<string, unknown>;
    structuredData?: Record<string, unknown>;
  } | null>(null);

  useEffect(() => {
    fetchDocuments()
      .then(setDocuments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = documents.filter((d) => {
    if (filter !== "all" && d.document_type !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matches =
        (d.doc_id || "").toLowerCase().includes(q) ||
        (d.issuer_name || "").includes(q) ||
        (d.recipient_name || "").includes(q) ||
        (d.source_file || "").includes(q);
      if (!matches) return false;
    }
    if (minAmount && (d.total_amount == null || d.total_amount < parseFloat(minAmount))) return false;
    if (maxAmount && (d.total_amount == null || d.total_amount > parseFloat(maxAmount))) return false;
    if (year && (!d.document_date || !d.document_date.startsWith(year))) return false;
    return true;
  });

  const openDoc = async (doc: DocumentMeta) => {
    try {
      const detail: DocumentDetail = await fetchDocument(doc.doc_id);
      setViewer({
        docId: doc.doc_id,
        pageImages: detail.page_images,
        metadata: detail.metadata,
        structuredData: detail.structured_data,
      });
    } catch {
      // Fallback: open with metadata only
      const imgCount = doc.page_count || 1;
      const pageImages = Array.from({ length: imgCount }, (_, i) =>
        `page_${String(i + 1).padStart(3, "0")}.jpg`
      );
      setViewer({
        docId: doc.doc_id,
        pageImages,
        metadata: doc as unknown as Record<string, unknown>,
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-page)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">
              Documents
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {documents.length} documents indexed
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-sm">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search documents..."
                dir="auto"
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-input)] text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--ember-500)]/40 focus:ring-2 focus:ring-[var(--ember-500)]/10 transition-all"
              />
            </div>
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-input)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--ember-500)]/40 focus:ring-2 focus:ring-[var(--ember-500)]/10 transition-all"
          >
            {DOC_TYPES.map((t) => (
              <option key={t} value={t} className="bg-[var(--bg-surface)]">
                {t === "all" ? "All types" : t.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Min SAR"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            className="w-28 px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--ember-500)]/40"
          />
          <input
            type="number"
            placeholder="Max SAR"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            className="w-28 px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--ember-500)]/40"
          />

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--ember-500)]/40"
          >
            <option value="">All years</option>
            {Array.from({ length: 14 }, (_, i) => 2025 - i).map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Document grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-[var(--border-subtle)] p-4 space-y-3">
                <div className="skeleton h-5 w-20" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-3 w-24" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[var(--text-muted)]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-3 opacity-50">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
            <p className="text-sm">No documents found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((doc, i) => (
              <button
                key={doc.doc_id}
                onClick={() => openDoc(doc)}
                className="group text-left rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] hover:border-[var(--ember-500)]/25 hover:shadow-md p-4 transition-all duration-200 animate-fade-in shadow-sm"
                style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
              >
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider badge-${doc.document_type || "other"}`}
                  >
                    {(doc.document_type || "other").replace(/_/g, " ")}
                  </span>
                  {doc.page_count && doc.page_count > 1 && (
                    <span className="text-[10px] text-[var(--text-tertiary)]">
                      {doc.page_count} pages
                    </span>
                  )}
                </div>

                <p
                  className="text-[11px] font-mono text-[var(--text-secondary)] truncate mb-0.5"
                  title={doc.doc_id}
                >
                  {doc.doc_id.replace(/_/g, " ")}
                </p>
                {doc.issuer_name && (
                  <p
                    className="text-sm font-medium text-[var(--text-primary)] truncate mb-1"
                    dir="auto"
                  >
                    {doc.issuer_name}
                  </p>
                )}

                {doc.recipient_name && (
                  <p
                    className="text-xs text-[var(--text-muted)] truncate mb-2"
                    dir="auto"
                  >
                    → {doc.recipient_name}
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                  {doc.document_date && <span>{doc.document_date}</span>}
                  {doc.total_amount != null && doc.total_amount > 0 && (
                    <span className="font-medium text-[var(--ember-600)]">
                      {doc.total_amount.toLocaleString()} {doc.currency || "SAR"}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-1 text-[10px] text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                  View document
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {viewer && (
        <DocumentViewer
          docId={viewer.docId}
          pageImages={viewer.pageImages}
          metadata={viewer.metadata}
          structuredData={viewer.structuredData}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  );
}
