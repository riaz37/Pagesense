"use client";

import { useCallback, useEffect, useState } from "react";
import { imageUrl } from "@/lib/api";

interface DocumentViewerProps {
  docId: string;
  pageImages: string[];
  metadata?: Record<string, unknown>;
  structuredData?: Record<string, unknown>;
  initialPage?: number;
  onClose: () => void;
}

export default function DocumentViewer({
  docId,
  pageImages,
  metadata,
  structuredData,
  initialPage = 0,
  onClose,
}: DocumentViewerProps) {
  const [currentPage, setCurrentPage] = useState(
    Math.min(initialPage, Math.max(0, pageImages.length - 1))
  );
  const [imgLoaded, setImgLoaded] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"meta" | "extractions">("meta");

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && currentPage > 0) setCurrentPage((p) => p - 1);
      if (e.key === "ArrowRight" && currentPage < pageImages.length - 1)
        setCurrentPage((p) => p + 1);
    },
    [onClose, currentPage, pageImages.length]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  useEffect(() => {
    setImgLoaded(false);
  }, [currentPage]);

  const meta = metadata || {};
  const sd = structuredData || {};
  const issuer = (sd.issuer as Record<string, string>) || {};
  const recipient = (sd.recipient as Record<string, string>) || {};
  const financial = (sd.financial_summary as Record<string, unknown>) || {};
  const docType = String(meta.document_type || "");
  const docDate = String(meta.document_date || sd.document_date || "");
  const docNum = String(meta.document_number || sd.document_number || "");

  return (
    <div
      className="fixed inset-0 z-50 flex bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Metadata sidebar */}
      <div className="hidden lg:flex w-80 flex-col bg-[var(--ink-900)] border-r border-white/5 overflow-y-auto">
        <div className="p-5 border-b border-white/5">
          <p className="text-xs uppercase tracking-wider text-[var(--sand-500)] mb-1">
            Document
          </p>
          <h2
            className="text-sm font-semibold text-[var(--sand-200)] break-all"
            dir="auto"
          >
            {docId}
          </h2>
        </div>

        <div className="px-5 pt-4 pb-2">
          <div className="flex gap-1 mb-0">
            <button
              onClick={() => setSidebarTab("meta")}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                sidebarTab === "meta"
                  ? "bg-[var(--ember-500)]/15 text-[var(--ember-500)] font-medium"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              Metadata
            </button>
            <button
              onClick={() => setSidebarTab("extractions")}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                sidebarTab === "extractions"
                  ? "bg-[var(--ember-500)]/15 text-[var(--ember-500)] font-medium"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              Extractions
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4 text-sm">
          {sidebarTab === "meta" && (<>
          {docType && (
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--sand-500)] mb-1">
                Type
              </p>
              <span
                className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium badge-${docType || "other"}`}
              >
                {docType}
              </span>
            </div>
          )}

          {docDate && (
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--sand-500)] mb-1">
                Date
              </p>
              <p className="text-[var(--sand-200)]">{docDate}</p>
            </div>
          )}

          {docNum && (
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--sand-500)] mb-1">
                Document #
              </p>
              <p className="text-[var(--sand-200)]">{docNum}</p>
            </div>
          )}

          {(issuer.name_ar || issuer.name_en) && (
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--sand-500)] mb-1">
                Issuer
              </p>
              {issuer.name_ar && (
                <p className="text-[var(--sand-200)]" dir="rtl">
                  {issuer.name_ar}
                </p>
              )}
              {issuer.name_en && (
                <p className="text-[var(--sand-400)] text-xs mt-0.5">
                  {issuer.name_en}
                </p>
              )}
            </div>
          )}

          {(recipient.name_ar || recipient.name_en) && (
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--sand-500)] mb-1">
                Recipient
              </p>
              {recipient.name_ar && (
                <p className="text-[var(--sand-200)]" dir="rtl">
                  {recipient.name_ar}
                </p>
              )}
              {recipient.name_en && (
                <p className="text-[var(--sand-400)] text-xs mt-0.5">
                  {recipient.name_en}
                </p>
              )}
            </div>
          )}

          {financial.total != null && (
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--sand-500)] mb-1">
                Total
              </p>
              <p className="text-lg font-semibold text-[var(--ember-400)]">
                {Number(financial.total).toLocaleString()}{" "}
                <span className="text-xs text-[var(--sand-400)]">
                  {String(financial.currency || "SAR")}
                </span>
              </p>
            </div>
          )}

          {financial.vat_amount != null && (
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--sand-500)] mb-1">
                VAT
              </p>
              <p className="text-[var(--sand-200)]">
                {Number(financial.vat_amount).toLocaleString()}{" "}
                {financial.vat_rate ? `(${financial.vat_rate}%)` : ""}
              </p>
            </div>
          )}
          </>)}

          {sidebarTab === "extractions" && (
            structuredData ? (
              <div className="space-y-3 text-xs">
                {/* Line Items */}
                {Array.isArray(structuredData.line_items) && structuredData.line_items.length > 0 && (
                  <div>
                    <h4 className="text-[var(--text-muted)] uppercase tracking-wider text-[10px] mb-1.5">
                      Line Items ({(structuredData.line_items as Array<Record<string, unknown>>).length})
                    </h4>
                    <div className="space-y-1.5">
                      {(structuredData.line_items as Array<Record<string, unknown>>).map((item, i) => (
                        <div key={i} className="px-2 py-1.5 rounded bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]" dir="auto">
                          <span className="text-[var(--text-primary)]">
                            {String(item.description_ar || item.description_en || "-")}
                          </span>
                          {item.quantity != null && (
                            <span className="text-[var(--text-muted)] ml-1">x{String(item.quantity)}</span>
                          )}
                          {item.total_price != null && (
                            <span className="text-[var(--ember-600)] ml-1 font-medium">{String(item.total_price)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {!!structuredData.notes && (
                  <div>
                    <h4 className="text-[var(--text-muted)] uppercase tracking-wider text-[10px] mb-1">Notes</h4>
                    <p className="text-[var(--text-secondary)]" dir="auto">{String(structuredData.notes)}</p>
                  </div>
                )}

                {/* Terms */}
                {!!structuredData.terms_and_conditions && (
                  <div>
                    <h4 className="text-[var(--text-muted)] uppercase tracking-wider text-[10px] mb-1">Terms</h4>
                    <p className="text-[var(--text-secondary)]" dir="auto">{String(structuredData.terms_and_conditions)}</p>
                  </div>
                )}

                {/* Summary */}
                {!!structuredData.summary_ar && (
                  <div>
                    <h4 className="text-[var(--text-muted)] uppercase tracking-wider text-[10px] mb-1">Summary</h4>
                    <p className="text-[var(--text-secondary)]" dir="auto">{String(structuredData.summary_ar)}</p>
                    {!!structuredData.summary_en && (
                      <p className="text-[var(--text-muted)] mt-1">{String(structuredData.summary_en)}</p>
                    )}
                  </div>
                )}

                {/* Raw JSON fallback */}
                <details className="mt-2">
                  <summary className="text-[10px] text-[var(--text-tertiary)] cursor-pointer hover:text-[var(--text-muted)]">
                    Raw JSON
                  </summary>
                  <pre className="mt-1 p-2 rounded bg-[var(--bg-surface-subtle)] text-[10px] text-[var(--text-muted)] overflow-auto max-h-60 whitespace-pre-wrap break-words" dir="ltr">
                    {JSON.stringify(structuredData, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">No extraction data available.</p>
            )
          )}
        </div>
      </div>

      {/* Image viewer */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-[var(--ink-900)]/90 border-b border-white/5">
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--sand-400)]" dir="auto">
              {docId}
            </span>
            {pageImages.length > 1 && (
              <span className="text-xs text-[var(--sand-500)] bg-white/5 px-2 py-0.5 rounded">
                Page {currentPage + 1} of {pageImages.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-[var(--sand-400)] hover:text-white transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image area */}
        <div className="flex-1 flex items-center justify-center p-4 relative overflow-auto">
          {pageImages.length > 0 ? (
            <>
              {!imgLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-[var(--ember-400)] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <img
                src={imageUrl(docId, pageImages[currentPage])}
                alt={`${docId} page ${currentPage + 1}`}
                className={`max-h-full max-w-full object-contain rounded shadow-2xl transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setImgLoaded(true)}
              />
            </>
          ) : (
            <p className="text-[var(--sand-500)]">No page images available</p>
          )}
        </div>

        {/* Navigation */}
        {pageImages.length > 1 && (
          <div className="flex items-center justify-center gap-4 py-3 bg-[var(--ink-900)]/90 border-t border-white/5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-[var(--sand-300)] transition-colors"
            >
              Previous
            </button>
            <div className="flex gap-1.5">
              {pageImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentPage
                      ? "bg-[var(--ember-400)] scale-125"
                      : "bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(pageImages.length - 1, p + 1))
              }
              disabled={currentPage === pageImages.length - 1}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-[var(--sand-300)] transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
