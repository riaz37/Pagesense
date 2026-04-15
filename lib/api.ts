// When running via Next.js dev server, API calls are proxied through next.config.ts rewrites
// so we use "" (relative). For direct FastAPI access, set NEXT_PUBLIC_API_URL.
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export interface SourceDoc {
  doc_id: string;
  score: number;
  metadata: Record<string, unknown>;
  page_images: string[];
  structured_data?: Record<string, unknown>;
  snippet?: string;
  matched_page?: number;
}

export interface SearchResult extends SourceDoc {
  structured_data: Record<string, unknown>;
}

export interface DocumentMeta {
  doc_id: string;
  source_file?: string;
  document_type?: string;
  document_date?: string;
  document_number?: string;
  issuer_name?: string;
  recipient_name?: string;
  total_amount?: number;
  currency?: string;
  page_count?: number;
  has_line_items?: boolean;
}

export interface DocumentDetail {
  doc_id: string;
  metadata: Record<string, unknown>;
  structured_data: Record<string, unknown>;
  page_images: string[];
}

export interface Stats {
  total_documents: number;
  document_types: Record<string, number>;
  total_financial_amount: number;
}

export interface RetrievalTiming {
  embed_ms: number;
  search_ms: number;
  rerank_ms?: number;
  total_ms: number;
}

export interface GenerationTiming {
  ttft_ms: number;
  total_ms: number;
}

export interface ChatTiming {
  retrieval: RetrievalTiming;
  generation: GenerationTiming;
  total_ms: number;
}

export interface UploadStageTiming {
  ingest_ms?: number;
  extract_ms?: number;
  normalize_ms?: number;
  prepare_ms?: number;
  index_ms?: number;
  total_ms?: number;
}

export interface UploadJob {
  job_id: string;
  filename: string;
  status: string;
  progress: number;
  error?: string | null;
  doc_id?: string | null;
  stage_timings?: UploadStageTiming;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: SourceDoc[];
  citedDocIds?: string[];
  additionalSources?: SourceDoc[];
  timing?: ChatTiming;
}

export function imageUrl(docId: string, page: string): string {
  return `${API_BASE}/api/images/${encodeURIComponent(docId)}/${page}`;
}

export async function fetchStats(): Promise<Stats> {
  const res = await fetch(`${API_BASE}/api/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function fetchDocuments(): Promise<DocumentMeta[]> {
  const res = await fetch(`${API_BASE}/api/documents`);
  if (!res.ok) throw new Error("Failed to fetch documents");
  const data = await res.json();
  return data.documents;
}

export async function fetchDocument(docId: string): Promise<DocumentDetail> {
  const res = await fetch(`${API_BASE}/api/documents/${encodeURIComponent(docId)}`);
  if (!res.ok) throw new Error("Document not found");
  return res.json();
}

export async function searchDocuments(query: string, topK = 5, filters?: Record<string, unknown>): Promise<SearchResult[]> {
  const res = await fetch(`${API_BASE}/api/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, top_k: topK, filters }),
  });
  if (!res.ok) throw new Error("Search failed");
  const data = await res.json();
  return data.results;
}

const MOCK_UPLOAD = process.env.NEXT_PUBLIC_MOCK_UPLOAD === "1";

interface MockJob {
  job_id: string;
  filename: string;
  started: number;
  errorAt: number | null;
  errorMsg: string;
}

const MOCK_JOBS = new Map<string, MockJob>();

const MOCK_STAGES: { name: string; until: number }[] = [
  { name: "queued", until: 1000 },
  { name: "ingesting", until: 3000 },
  { name: "extracting", until: 6000 },
  { name: "normalizing", until: 8000 },
  { name: "preparing", until: 10000 },
  { name: "indexing", until: 12000 },
];
const MOCK_TOTAL_MS = 12000;

const MOCK_ERRORS = [
  "OCR failed: unreadable scan",
  "Schema mismatch in extracted fields",
  "Indexer timeout",
  "Unsupported file encoding",
];

function mockJobToUploadJob(job: MockJob): UploadJob {
  const elapsed = Date.now() - job.started;
  if (job.errorAt !== null && elapsed >= job.errorAt) {
    return {
      job_id: job.job_id,
      filename: job.filename,
      status: "error",
      progress: Math.min(1, job.errorAt / MOCK_TOTAL_MS),
      error: job.errorMsg,
      doc_id: null,
    };
  }
  if (elapsed >= MOCK_TOTAL_MS) {
    return {
      job_id: job.job_id,
      filename: job.filename,
      status: "done",
      progress: 1,
      error: null,
      doc_id: `mock-${job.job_id.slice(0, 8)}`,
    };
  }
  const stage = MOCK_STAGES.find((s) => elapsed < s.until) ?? MOCK_STAGES[MOCK_STAGES.length - 1];
  return {
    job_id: job.job_id,
    filename: job.filename,
    status: stage.name,
    progress: Math.min(0.99, elapsed / MOCK_TOTAL_MS),
    error: null,
    doc_id: null,
  };
}

export async function uploadDocument(file: File): Promise<{ job_id: string }> {
  if (MOCK_UPLOAD) {
    const job_id = crypto.randomUUID();
    const willError = Math.random() < 0.1;
    MOCK_JOBS.set(job_id, {
      job_id,
      filename: file.name,
      started: Date.now(),
      errorAt: willError ? 2000 + Math.random() * 8000 : null,
      errorMsg: MOCK_ERRORS[Math.floor(Math.random() * MOCK_ERRORS.length)],
    });
    return { job_id };
  }
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export async function fetchUploadStatus(jobId: string): Promise<UploadJob> {
  if (MOCK_UPLOAD) {
    const job = MOCK_JOBS.get(jobId);
    if (!job) throw new Error("Job not found");
    return mockJobToUploadJob(job);
  }
  const res = await fetch(`${API_BASE}/api/upload/${jobId}`);
  if (!res.ok) throw new Error("Job not found");
  return res.json();
}

export async function fetchUploadJobs(): Promise<UploadJob[]> {
  if (MOCK_UPLOAD) {
    return Array.from(MOCK_JOBS.values()).map(mockJobToUploadJob);
  }
  const res = await fetch(`${API_BASE}/api/uploads`);
  if (!res.ok) throw new Error("Failed to fetch upload jobs");
  const data = await res.json();
  return data.jobs ?? data;
}

// SSE chat stream using fetch + ReadableStream
export async function* chatStream(
  query: string,
  conversationHistory: { role: string; content: string }[],
  topK = 5,
  filters?: Record<string, unknown>,
  scopeDocId?: string,
  signal?: AbortSignal,
): AsyncGenerator<
  | { type: "sources"; data: SourceDoc[] }
  | { type: "additional"; data: SourceDoc[] }
  | { type: "chunk"; data: string }
  | { type: "cited"; data: string[] }
  | { type: "timing"; data: ChatTiming }
  | { type: "done" }
  | { type: "error"; data: string }
> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      top_k: topK,
      filters,
      conversation_history: conversationHistory.length > 0 ? conversationHistory : undefined,
      scope_doc_id: scopeDocId || undefined,
    }),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error("Chat request failed");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  let eventType = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (line.startsWith("event: ")) {
        eventType = line.slice(7).trim();
      } else if (line.startsWith("data: ") && eventType) {
        const data = line.slice(6);
        try {
          const parsed = JSON.parse(data);
          if (eventType === "sources") {
            yield { type: "sources", data: parsed as SourceDoc[] };
          } else if (eventType === "additional") {
            yield { type: "additional", data: parsed as SourceDoc[] };
          } else if (eventType === "chunk") {
            yield { type: "chunk", data: parsed.text as string };
          } else if (eventType === "cited") {
            yield { type: "cited", data: parsed as string[] };
          } else if (eventType === "timing") {
            yield { type: "timing", data: parsed as ChatTiming };
          } else if (eventType === "done") {
            yield { type: "done" };
          } else if (eventType === "error") {
            yield { type: "error", data: parsed.error as string };
          }
        } catch {
          // skip malformed JSON
        }
        eventType = "";
      }
    }
  }
}
