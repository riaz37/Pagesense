"use client";

import { useEffect, useState } from "react";
import {
  fetchDocuments,
  fetchDocument,
  type DocumentMeta,
  type DocumentDetail,
} from "@/lib/api";
import DocumentViewer from "@/components/DocumentViewer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

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

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-72">
            <svg
              className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              style={{ insetInlineStart: "12px" }}
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
              placeholder="Search documents…"
              dir="auto"
              className="w-full ps-9 pe-3 py-1.5 h-9 rounded-md bg-[var(--bg-input)] border border-[var(--border-input)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--focus-emerald)] focus:ring-2 focus:ring-[var(--focus-emerald)]/15 transition-colors"
            />
          </div>

          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-9 w-40 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOC_TYPES.map((t) => (
                <SelectItem key={t} value={t} className="text-sm capitalize">
                  {t === "all" ? "All types" : t.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={year || "all"} onValueChange={(v) => setYear(v === "all" ? "" : v)}>
            <SelectTrigger className="h-9 w-32 text-sm">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-sm">All years</SelectItem>
              {Array.from({ length: 14 }, (_, i) => 2025 - i).map((y) => (
                <SelectItem key={y} value={String(y)} className="text-sm">
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="inline-flex items-stretch h-9 rounded-md border border-[var(--border-input)] bg-[var(--bg-input)] overflow-hidden">
            <span className="inline-flex items-center px-2 text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] border-e border-[var(--border-subtle)]">
              SAR
            </span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="Min"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="w-20 px-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] bg-transparent outline-none border-e border-[var(--border-subtle)]"
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder="Max"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="w-20 px-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] bg-transparent outline-none"
            />
          </div>

          {(search || filter !== "all" || year || minAmount || maxAmount) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilter("all");
                setYear("");
                setMinAmount("");
                setMaxAmount("");
              }}
              className="h-9 px-3 rounded-md text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Document table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="p-6 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-10 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[var(--text-muted)]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-3 opacity-50">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
            <p className="text-sm">No documents match your filters</p>
          </div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10 bg-[var(--bg-page)]">
              <tr className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                <th scope="col" className="text-start px-6 py-2.5 border-b border-[var(--border-default)] w-32">Type</th>
                <th scope="col" className="text-start px-3 py-2.5 border-b border-[var(--border-default)]">Document</th>
                <th scope="col" className="text-start px-3 py-2.5 border-b border-[var(--border-default)]">Issuer</th>
                <th scope="col" className="text-start px-3 py-2.5 border-b border-[var(--border-default)]">Recipient</th>
                <th scope="col" className="text-start px-3 py-2.5 border-b border-[var(--border-default)] w-28">Date</th>
                <th scope="col" className="text-end px-3 py-2.5 border-b border-[var(--border-default)] w-36">Amount</th>
                <th scope="col" className="text-end px-6 py-2.5 border-b border-[var(--border-default)] w-16">Pages</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => (
                <tr
                  key={doc.doc_id}
                  onClick={() => openDoc(doc)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openDoc(doc);
                    }
                  }}
                  className="cursor-pointer border-b border-[var(--border-subtle)] hover:bg-[var(--bg-surface-hover)] focus:bg-[var(--bg-surface-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-emerald)]/40 transition-colors"
                >
                  <td className="px-6 py-3 align-middle">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider badge-${doc.document_type || "other"}`}
                    >
                      {(doc.document_type || "other").replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-middle max-w-xs">
                    <div
                      className="text-[var(--text-primary)] font-medium truncate"
                      title={doc.doc_id}
                    >
                      {doc.document_number || doc.doc_id.replace(/_/g, " ")}
                    </div>
                    {doc.source_file && (
                      <div
                        className="text-[11px] text-[var(--text-tertiary)] truncate font-mono"
                        title={doc.source_file}
                      >
                        {doc.source_file}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 align-middle max-w-[220px]">
                    <span
                      className="block truncate text-[var(--text-primary)]"
                      dir="auto"
                      title={doc.issuer_name || ""}
                    >
                      {doc.issuer_name || "—"}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-middle max-w-[220px]">
                    <span
                      className="block truncate text-[var(--text-secondary)]"
                      dir="auto"
                      title={doc.recipient_name || ""}
                    >
                      {doc.recipient_name || "—"}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-middle whitespace-nowrap text-[var(--text-secondary)]">
                    {doc.document_date || "—"}
                  </td>
                  <td className="px-3 py-3 align-middle text-end whitespace-nowrap">
                    {doc.total_amount != null && doc.total_amount > 0 ? (
                      <span className="font-medium text-[var(--text-primary)]">
                        {doc.total_amount.toLocaleString()}{" "}
                        <span className="text-[11px] text-[var(--text-tertiary)] font-normal">
                          {doc.currency || "SAR"}
                        </span>
                      </span>
                    ) : (
                      <span className="text-[var(--text-tertiary)]">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3 align-middle text-end text-[var(--text-tertiary)] tabular-nums">
                    {doc.page_count || 1}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
