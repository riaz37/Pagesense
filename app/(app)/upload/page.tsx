"use client";

import { useCallback, useRef, useState } from "react";
import { uploadDocument, fetchUploadStatus, type UploadJob } from "@/lib/api";
import { useLatency } from "@/components/LatencyProvider";

const STAGES: Record<string, { label: string; labelAr: string; pct: number }> = {
  queued: { label: "Queued", labelAr: "في الانتظار", pct: 5 },
  ingesting: { label: "Rendering pages", labelAr: "تحويل الصفحات", pct: 15 },
  extracting: { label: "Extracting data", labelAr: "استخراج البيانات", pct: 40 },
  normalizing: { label: "Validating", labelAr: "التحقق", pct: 70 },
  preparing: { label: "Preparing for search", labelAr: "التحضير للبحث", pct: 85 },
  indexing: { label: "Indexing", labelAr: "الفهرسة", pct: 95 },
  done: { label: "Complete", labelAr: "مكتمل", pct: 100 },
  error: { label: "Failed", labelAr: "فشل", pct: 0 },
};

const ACCEPTED = ".pdf,.jpg,.jpeg,.png";

export default function UploadPage() {
  const [dragOver, setDragOver] = useState(false);
  const [job, setJob] = useState<UploadJob | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showLatency } = useLatency();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPolling = useCallback((jobId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const status = await fetchUploadStatus(jobId);
        setJob(status);
        if (status.status === "done" || status.status === "error") {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
        }
      } catch {
        // keep polling
      }
    }, 1500);
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setJob(null);

      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !["pdf", "jpg", "jpeg", "png"].includes(ext)) {
        setError("Unsupported file type. Please upload PDF, JPG, or PNG.");
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        setError("File too large. Maximum size is 50MB.");
        return;
      }

      setUploading(true);
      try {
        const result = await uploadDocument(file);
        setJob({
          job_id: result.job_id,
          filename: file.name,
          status: "queued",
          progress: 0,
        });
        startPolling(result.job_id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
      setUploading(false);
    },
    [startPolling]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const stage = job ? STAGES[job.status] || STAGES.queued : null;

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 bg-[var(--bg-page)]">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            Upload Document
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Upload Arabic business documents for AI extraction and indexing.
            Supports PDF, JPG, and PNG files up to 50MB.
          </p>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200 ${
            dragOver
              ? "border-[var(--ember-500)] bg-[var(--ember-400)]/5"
              : "border-[var(--ink-300)] bg-[var(--bg-surface)] hover:border-[var(--ink-400)] hover:bg-[var(--bg-surface-hover)]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />

          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-default)] flex items-center justify-center">
            {uploading ? (
              <div className="w-6 h-6 border-2 border-[var(--ember-500)] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17,8 12,3 7,8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            )}
          </div>

          <p className="text-sm text-[var(--text-secondary)] mb-1">
            {uploading
              ? "Uploading..."
              : "Drop your document here or click to browse"}
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            PDF, JPG, PNG &mdash; Max 50MB
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 animate-fade-in">
            {error}
          </div>
        )}

        {/* Progress */}
        {job && (
          <div className="mt-6 animate-slide-up">
            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p
                  className="text-sm font-medium text-[var(--text-primary)] truncate"
                  dir="auto"
                >
                  {job.filename}
                </p>
                {job.status === "done" && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
                    Done
                  </span>
                )}
                {job.status === "error" && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                    Failed
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {job.status !== "error" && (
                <div className="mb-3">
                  <div className="h-1.5 rounded-full bg-[var(--ink-100)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--ember-500)] to-[var(--ember-400)] transition-all duration-500 ease-out"
                      style={{ width: `${job.progress || stage?.pct || 0}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Stage info */}
              {stage && job.status !== "done" && job.status !== "error" && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[var(--ember-500)] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-[var(--text-secondary)]">
                    {stage.label}{" "}
                    <span className="text-[var(--text-tertiary)]">
                      ({stage.labelAr})
                    </span>
                  </p>
                </div>
              )}

              {/* Stage timings */}
              {showLatency && job.stage_timings && Object.keys(job.stage_timings).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] tabular-nums text-[var(--text-tertiary)]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {job.stage_timings.ingest_ms != null && (
                    <span><span className="text-[var(--text-muted)]">Render</span> {(job.stage_timings.ingest_ms / 1000).toFixed(1)}s</span>
                  )}
                  {job.stage_timings.extract_ms != null && (
                    <span><span className="text-[var(--text-muted)]">Extract</span> {(job.stage_timings.extract_ms / 1000).toFixed(1)}s</span>
                  )}
                  {job.stage_timings.normalize_ms != null && (
                    <span><span className="text-[var(--text-muted)]">Validate</span> {(job.stage_timings.normalize_ms / 1000).toFixed(1)}s</span>
                  )}
                  {job.stage_timings.prepare_ms != null && (
                    <span><span className="text-[var(--text-muted)]">Prepare</span> {(job.stage_timings.prepare_ms / 1000).toFixed(1)}s</span>
                  )}
                  {job.stage_timings.index_ms != null && (
                    <span><span className="text-[var(--text-muted)]">Index</span> {(job.stage_timings.index_ms / 1000).toFixed(1)}s</span>
                  )}
                  {job.stage_timings.total_ms != null && (
                    <span><span className="text-[var(--ember-500)]">Total</span> {(job.stage_timings.total_ms / 1000).toFixed(1)}s</span>
                  )}
                </div>
              )}

              {/* Error message */}
              {job.error && (
                <p className="text-xs text-red-600 mt-2">{job.error}</p>
              )}

              {/* Success actions */}
              {job.status === "done" && (
                <div className="flex items-center gap-3 mt-4">
                  {job.doc_id && (
                    <a
                      href={`/chat?scope=${encodeURIComponent(job.doc_id)}`}
                      className="px-4 py-2 rounded-lg bg-[var(--ember-500)] hover:bg-[var(--ember-600)] text-white text-sm font-medium transition-colors"
                    >
                      Chat about this document
                    </a>
                  )}
                  {job.doc_id && (
                    <a
                      href="/documents"
                      className="px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-sm text-[var(--text-secondary)] transition-colors"
                    >
                      View in documents
                    </a>
                  )}
                  <button
                    onClick={() => {
                      setJob(null);
                      setError(null);
                    }}
                    className="px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-sm text-[var(--text-muted)] transition-colors"
                  >
                    Upload another
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pipeline steps legend */}
        <div className="mt-8">
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-3 font-medium">
            Processing Pipeline
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {["Render", "Extract", "Validate", "Index"].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[var(--bg-surface-subtle)] border border-[var(--border-default)] flex items-center justify-center text-[9px] text-[var(--text-muted)]">
                  {i + 1}
                </div>
                <span className="text-[10px] text-[var(--text-muted)]">
                  {step}
                </span>
                {i < 3 && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ink-300)" strokeWidth="2">
                    <polyline points="9,18 15,12 9,6" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
