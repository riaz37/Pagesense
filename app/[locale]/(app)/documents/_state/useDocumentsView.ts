'use client';

import * as React from 'react';
import type { ViewMode } from './filters';

const STORAGE_KEY = 'documents.view';

export function useDocumentsView(defaultView: ViewMode = 'grid') {
  const [view, setView] = React.useState<ViewMode>(defaultView);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'grid' || stored === 'table') {
        setView(stored);
      }
    } catch {
      // localStorage may be unavailable; fall back to default
    }
    setHydrated(true);
  }, []);

  const update = React.useCallback((next: ViewMode) => {
    setView(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore quota / privacy errors
    }
  }, []);

  return { view, setView: update, hydrated };
}
