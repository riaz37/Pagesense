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
      className="fixed inset-0 z-50 flex bg-[color:var(--scrim)] backdrop-blur-sm animate-fade-in"
      style={{ ["--scrim" as string]: "rgba(0,0,0,0.6)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Metadata sidebar */}
      <div
        className="hidden lg:flex w-80 flex-col overflow-y-auto"
        style={{
          background: "var(--bg-surface)",
          borderInlineEnd: "1px solid var(--border-default)",
        }}
      >
        <div
          className="p-5"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <p
            className="text-xs uppercase tracking-wider mb-1"
            style={{ color: "var(--text-tertiary)" }}
          >
            Document
          </p>
          <h2
            className="text-sm font-semibold break-all"
            style={{ color: "var(--text-primary)" }}
            dir="auto"
          >
            {docId}
          </h2>
        </div>

        <div className="px-5 pt-4 pb-2">
          <div className="flex gap-1 mb-0">
            <button
              onClick={() => setSidebarTab("meta")}
              className="px-3 py-1 text-xs rounded-md transition-colors"
              style={
                sidebarTab === "meta"
                  ? {
                      background: "var(--badge-emerald-bg)",
                      color: "var(--esap-emerald-700)",
                      fontWeight: 500,
                    }
                  : { color: "var(--text-muted)" }
              }
            >
              Metadata
            </button>
            <button
              onClick={() => setSidebarTab("extractions")}
              className="px-3 py-1 text-xs rounded-md transition-colors"
              style={
                sidebarTab === "extractions"
                  ? {
                      background: "var(--badge-emerald-bg)",
                      color: "var(--esap-emerald-700)",
                      fontWeight: 500,
                    }
                  : { color: "var(--text-muted)" }
              }
            >
              Extractions
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4 text-sm">
          {sidebarTab === "meta" && (<>
          {docType && (
            <div>
              <p
                className="text-xs uppercase tracking-wider mb-1"
                style={{ color: "var(--text-tertiary)" }}
              >
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
              <p
                className="text-xs uppercase tracking-wider mb-1"
                style={{ color: "var(--text-tertiary)" }}
              >
                Date
              </p>
              <p style={{ color: "var(--text-primary)" }}>{docDate}</p>
            </div>
          )}

          {docNum && (
            <div>
              <p
                className="text-xs uppercase tracking-wider mb-1"
                style={{ color: "var(--text-tertiary)" }}
              >
                Document #
              </p>
              <p style={{ color: "var(--text-primary)" }}>{docNum}</p>
            </div>
          )}

          {(issuer.name_ar || issuer.name_en) && (
            <div>
              <p
                className="text-xs uppercase tracking-wider mb-1"
                style={{ color: "var(--text-tertiary)" }}
              >
                Issuer
              </p>
              {issuer.name_ar && (
                <p style={{ color: "var(--text-primary)" }} dir="rtl">
                  {issuer.name_ar}
                </p>
              )}
              {issuer.name_en && (
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {issuer.name_en}
                </p>
              )}
            </div>
          )}

          {(recipient.name_ar || recipient.name_en) && (
            <div>
              <p
                className="text-xs uppercase tracking-wider mb-1"
                style={{ color: "var(--text-tertiary)" }}
              >
                Recipient
              </p>
              {recipient.name_ar && (
                <p style={{ color: "var(--text-primary)" }} dir="rtl">
                  {recipient.name_ar}
                </p>
              )}
              {recipient.name_en && (
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {recipient.name_en}
                </p>
              )}
            </div>
          )}

          {financial.total != null && (
            <div>
              <p
                className="text-xs uppercase tracking-wider mb-1"
                style={{ color: "var(--text-tertiary)" }}
              >
                Total
              </p>
              <p
                className="text-lg font-semibold"
                style={{ color: "var(--esap-emerald-700)" }}
              >
                {Number(financial.total).toLocaleString()}{" "}
                <span
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {String(financial.currency || "SAR")}
                </span>
              </p>
            </div>
          )}

          {financial.vat_amount != null && (
            <div>
              <p
                className="text-xs uppercase tracking-wider mb-1"
                style={{ color: "var(--text-tertiary)" }}
              >
                VAT
              </p>
              <p style={{ color: "var(--text-primary)" }}>
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
                    <h4
                      className="uppercase tracking-wider text-[10px] mb-1.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Line Items ({(structuredData.line_items as Array<Record<string, unknown>>).length})
                    </h4>
                    <div className="space-y-1.5">
                      {(structuredData.line_items as Array<Record<string, unknown>>).map((item, i) => (
                        <div
                          key={i}
                          className="px-2 py-1.5 rounded"
                          style={{
                            background: "var(--bg-surface-subtle)",
                            border: "1px solid var(--border-subtle)",
                          }}
                          dir="auto"
                        >
                          <span style={{ color: "var(--text-primary)" }}>
                            {String(item.description_ar || item.description_en || "-")}
                          </span>
                          {item.quantity != null && (
                            <span
                              className="ml-1"
                              style={{ color: "var(--text-muted)" }}
                            >
                              x{String(item.quantity)}
                            </span>
                          )}
                          {item.total_price != null && (
                            <span
                              className="ml-1 font-medium"
                              style={{ color: "var(--esap-emerald-700)" }}
                            >
                              {String(item.total_price)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {!!structuredData.notes && (
                  <div>
                    <h4
                      className="uppercase tracking-wider text-[10px] mb-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Notes
                    </h4>
                    <p style={{ color: "var(--text-secondary)" }} dir="auto">
                      {String(structuredData.notes)}
                    </p>
                  </div>
                )}

                {/* Terms */}
                {!!structuredData.terms_and_conditions && (
                  <div>
                    <h4
                      className="uppercase tracking-wider text-[10px] mb-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Terms
                    </h4>
                    <p style={{ color: "var(--text-secondary)" }} dir="auto">
                      {String(structuredData.terms_and_conditions)}
                    </p>
                  </div>
                )}

                {/* Summary */}
                {!!structuredData.summary_ar && (
                  <div>
                    <h4
                      className="uppercase tracking-wider text-[10px] mb-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Summary
                    </h4>
                    <p style={{ color: "var(--text-secondary)" }} dir="auto">
                      {String(structuredData.summary_ar)}
                    </p>
                    {!!structuredData.summary_en && (
                      <p
                        className="mt-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {String(structuredData.summary_en)}
                      </p>
                    )}
                  </div>
                )}

                {/* Raw JSON fallback */}
                <details className="mt-2">
                  <summary
                    className="text-[10px] cursor-pointer"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Raw JSON
                  </summary>
                  <pre
                    className="mt-1 p-2 rounded text-[10px] overflow-auto max-h-60 whitespace-pre-wrap break-words"
                    style={{
                      background: "var(--bg-surface-subtle)",
                      color: "var(--text-muted)",
                    }}
                    dir="ltr"
                  >
                    {JSON.stringify(structuredData, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)" }} className="text-xs">
                No extraction data available.
              </p>
            )
          )}
        </div>
      </div>

      {/* Image viewer */}
      <div
        className="flex-1 flex flex-col"
        style={{ background: "var(--bg-page)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{
            background: "var(--bg-surface)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
              dir="auto"
            >
              {docId}
            </span>
            {pageImages.length > 1 && (
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  color: "var(--text-tertiary)",
                  background: "var(--bg-surface-subtle)",
                }}
              >
                Page {currentPage + 1} of {pageImages.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[color:var(--bg-surface-hover)]"
            style={{ color: "var(--text-secondary)" }}
            aria-label="Close"
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
                  <div
                    className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: "var(--esap-emerald-700)", borderTopColor: "transparent" }}
                  />
                </div>
              )}
              <img
                src={imageUrl(docId, pageImages[currentPage])}
                alt={`${docId} page ${currentPage + 1}`}
                className={`max-h-full max-w-full object-contain rounded transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                style={{ boxShadow: "var(--shadow-card)" }}
                onLoad={() => setImgLoaded(true)}
              />
            </>
          ) : (
            <p style={{ color: "var(--text-muted)" }}>No page images available</p>
          )}
        </div>

        {/* Navigation */}
        {pageImages.length > 1 && (
          <div
            className="flex items-center justify-center gap-4 py-3"
            style={{
              background: "var(--bg-surface)",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:bg-[color:var(--bg-surface-hover)]"
              style={{
                background: "var(--bg-surface-subtle)",
                color: "var(--text-primary)",
              }}
            >
              Previous
            </button>
            <div className="flex gap-1.5">
              {pageImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  aria-label={`Go to page ${i + 1}`}
                  className="w-2 h-2 rounded-full transition-all"
                  style={
                    i === currentPage
                      ? {
                          background: "var(--esap-emerald-700)",
                          transform: "scale(1.25)",
                        }
                      : { background: "var(--border-default)" }
                  }
                />
              ))}
            </div>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(pageImages.length - 1, p + 1))
              }
              disabled={currentPage === pageImages.length - 1}
              className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:bg-[color:var(--bg-surface-hover)]"
              style={{
                background: "var(--bg-surface-subtle)",
                color: "var(--text-primary)",
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
