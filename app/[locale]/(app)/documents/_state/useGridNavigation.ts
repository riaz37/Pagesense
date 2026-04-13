'use client';

import * as React from 'react';

export interface GridNavOptions {
  totalItems: number;
  columns: number;
  rtl: boolean;
}

export function useGridNavigation({ totalItems, columns, rtl }: GridNavOptions) {
  const [focused, setFocused] = React.useState(0);
  const refs = React.useRef<Map<number, HTMLElement>>(new Map());

  React.useEffect(() => {
    if (focused >= totalItems) {
      setFocused(Math.max(0, totalItems - 1));
    }
  }, [totalItems, focused]);

  const registerRef = React.useCallback(
    (rowIndex: number, colIndex: number, el: HTMLElement | null) => {
      const flat = rowIndex * columns + colIndex;
      if (el) refs.current.set(flat, el);
      else refs.current.delete(flat);
    },
    [columns],
  );

  const focusItem = React.useCallback((index: number) => {
    const el = refs.current.get(index);
    if (el) {
      el.focus();
      setFocused(index);
    }
  }, []);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (totalItems === 0) return;
      const cols = Math.max(1, columns);
      let next = focused;
      switch (e.key) {
        case 'ArrowRight':
          next = focused + (rtl ? -1 : 1);
          break;
        case 'ArrowLeft':
          next = focused + (rtl ? 1 : -1);
          break;
        case 'ArrowDown':
          next = focused + cols;
          break;
        case 'ArrowUp':
          next = focused - cols;
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = totalItems - 1;
          break;
        case 'PageDown':
          next = Math.min(totalItems - 1, focused + cols * 3);
          break;
        case 'PageUp':
          next = Math.max(0, focused - cols * 3);
          break;
        default:
          return;
      }
      if (next < 0 || next >= totalItems) return;
      e.preventDefault();
      focusItem(next);
    },
    [focused, columns, rtl, totalItems, focusItem],
  );

  const onItemFocus = React.useCallback((rowIndex: number, colIndex: number) => {
    setFocused(rowIndex * columns + colIndex);
  }, [columns]);

  return { focused, handleKeyDown, registerRef, onItemFocus };
}
