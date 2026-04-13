'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/cn';

export interface SourceViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  closeLabel?: string;
  children?: React.ReactNode;
}

export function SourceViewer({
  open,
  onOpenChange,
  title,
  closeLabel = 'Close',
  children,
}: SourceViewerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]',
            'data-[state=open]:animate-[fadeIn_0.2s_ease-out]',
          )}
        />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            'fixed inset-y-0 end-0 z-50 flex w-full max-w-[480px] flex-col',
            'border-s border-black/10 dark:border-white/10',
            'bg-[color:var(--bg-surface)] text-[color:var(--text-primary)]',
            'shadow-[rgba(0,0,0,0.01)_0px_1px_3px,rgba(0,0,0,0.02)_0px_3px_7px,rgba(0,0,0,0.02)_0px_7px_15px,rgba(0,0,0,0.04)_0px_14px_28px,rgba(0,0,0,0.05)_0px_23px_52px]',
            'data-[state=open]:animate-[slideInRight_0.25s_ease-out]',
          )}
        >
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/10">
            <Dialog.Title className="text-[15px] font-semibold">{title}</Dialog.Title>
            <Dialog.Close
              aria-label={closeLabel}
              className={cn(
                'rounded-[4px] p-1 text-[color:var(--text-secondary)]',
                'hover:bg-[color:var(--bg-surface-hover)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
              )}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-auto px-4 py-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
