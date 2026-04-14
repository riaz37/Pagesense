'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  fetchUploadJobs,
  fetchUploadStatus,
  uploadDocument,
  type UploadJob,
} from '@/lib/api';

const STORAGE_KEY = 'esap.uploadJobs.v1';
const POLL_INTERVAL_MS = 1500;
const TERMINAL_STATUSES = new Set(['done', 'error']);

export interface UploadJobsContextValue {
  jobs: UploadJob[];
  activeJobs: UploadJob[];
  startUpload: (file: File) => Promise<string | null>;
  startUploads: (files: File[]) => Promise<string[]>;
  removeJob: (jobId: string) => void;
  clearCompleted: () => void;
  getJobByDocId: (docId: string) => UploadJob | undefined;
  getJobById: (jobId: string) => UploadJob | undefined;
}

const UploadJobsContext = createContext<UploadJobsContextValue | null>(null);

function loadStoredJobIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function saveJobIds(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage full or disabled — ignore
  }
}

export function UploadJobsProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const jobsRef = useRef<UploadJob[]>([]);
  const hydratedRef = useRef(false);

  useEffect(() => {
    jobsRef.current = jobs;
  }, [jobs]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    saveJobIds(jobs.map((j) => j.job_id));
  }, [jobs]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const storedIds = loadStoredJobIds();

      let backendJobs: UploadJob[] = [];
      try {
        backendJobs = await fetchUploadJobs();
      } catch {
        // backend unreachable — continue with stored ids only
      }

      const backendJobMap = new Map(backendJobs.map((j) => [j.job_id, j]));
      const merged: UploadJob[] = [];
      const seen = new Set<string>();

      for (const id of storedIds) {
        const mapped = backendJobMap.get(id);
        if (mapped) {
          merged.push(mapped);
          seen.add(id);
          continue;
        }
        try {
          const job = await fetchUploadStatus(id);
          if (cancelled) return;
          merged.push(job);
          seen.add(id);
        } catch {
          // job evicted — drop
        }
      }

      for (const j of backendJobs) {
        if (!seen.has(j.job_id)) {
          merged.push(j);
          seen.add(j.job_id);
        }
      }

      if (!cancelled) {
        setJobs(merged);
        hydratedRef.current = true;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const hasActive = jobs.some((j) => !TERMINAL_STATUSES.has(j.status));

    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    if (!hasActive) return;

    pollRef.current = setInterval(async () => {
      const activeIds = jobsRef.current
        .filter((j) => !TERMINAL_STATUSES.has(j.status))
        .map((j) => j.job_id);

      if (activeIds.length === 0) return;

      const updates = await Promise.all(
        activeIds.map(async (id) => {
          try {
            return await fetchUploadStatus(id);
          } catch {
            return null;
          }
        }),
      );

      setJobs((prev) => {
        const updateMap = new Map<string, UploadJob>();
        for (const u of updates) {
          if (u) updateMap.set(u.job_id, u);
        }
        if (updateMap.size === 0) return prev;
        return prev.map((j) => updateMap.get(j.job_id) ?? j);
      });
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [jobs]);

  const startUpload = useCallback(async (file: File): Promise<string | null> => {
    try {
      const result = await uploadDocument(file);
      const newJob: UploadJob = {
        job_id: result.job_id,
        filename: file.name,
        status: 'queued',
        progress: 0,
      };
      setJobs((prev) => [newJob, ...prev]);
      return result.job_id;
    } catch {
      return null;
    }
  }, []);

  const startUploads = useCallback(
    async (files: File[]): Promise<string[]> => {
      const ids: string[] = [];
      for (const file of files) {
        const id = await startUpload(file);
        if (id) ids.push(id);
      }
      return ids;
    },
    [startUpload],
  );

  const removeJob = useCallback((jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.job_id !== jobId));
  }, []);

  const clearCompleted = useCallback(() => {
    setJobs((prev) => prev.filter((j) => !TERMINAL_STATUSES.has(j.status)));
  }, []);

  const getJobByDocId = useCallback(
    (docId: string) => jobs.find((j) => j.doc_id === docId),
    [jobs],
  );

  const getJobById = useCallback((jobId: string) => jobs.find((j) => j.job_id === jobId), [jobs]);

  const activeJobs = useMemo(
    () => jobs.filter((j) => !TERMINAL_STATUSES.has(j.status)),
    [jobs],
  );

  const value = useMemo<UploadJobsContextValue>(
    () => ({
      jobs,
      activeJobs,
      startUpload,
      startUploads,
      removeJob,
      clearCompleted,
      getJobByDocId,
      getJobById,
    }),
    [
      jobs,
      activeJobs,
      startUpload,
      startUploads,
      removeJob,
      clearCompleted,
      getJobByDocId,
      getJobById,
    ],
  );

  return <UploadJobsContext.Provider value={value}>{children}</UploadJobsContext.Provider>;
}

export function useUploadJobs(): UploadJobsContextValue {
  const ctx = useContext(UploadJobsContext);
  if (!ctx) {
    throw new Error('useUploadJobs must be used within UploadJobsProvider');
  }
  return ctx;
}

export { TERMINAL_STATUSES };
