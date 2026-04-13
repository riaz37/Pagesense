'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

export interface DropzoneProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrop'> {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  onFiles: (files: File[]) => void;
  label: string;
  description?: string;
}

function filesFromList(list: FileList | null): File[] {
  return list ? Array.from(list) : [];
}

function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  const patterns = accept.split(',').map((s) => s.trim()).filter(Boolean);
  if (patterns.length === 0) return true;
  return patterns.some((pattern) => {
    if (pattern.startsWith('.')) return file.name.toLowerCase().endsWith(pattern.toLowerCase());
    if (pattern.endsWith('/*')) {
      const prefix = pattern.slice(0, -1);
      return file.type.startsWith(prefix);
    }
    return file.type === pattern;
  });
}

export function Dropzone({
  accept,
  multiple = true,
  disabled = false,
  onFiles,
  label,
  description,
  className,
  ...props
}: DropzoneProps) {
  const [active, setActive] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = React.useCallback(
    (files: File[]) => {
      const accepted = files.filter((f) => matchesAccept(f, accept));
      if (accepted.length > 0) onFiles(accepted);
    },
    [accept, onFiles],
  );

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={label}
      data-active={active ? 'true' : undefined}
      onClick={openPicker}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openPicker();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setActive(true);
      }}
      onDragLeave={() => setActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setActive(false);
        if (disabled) return;
        handleFiles(filesFromList(e.dataTransfer.files));
      }}
      className={cn(
        'flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-2',
        'rounded-2xl border border-dashed border-black/15 dark:border-white/15',
        'bg-[color:var(--bg-surface-subtle)] px-6 py-8 text-center',
        'transition-colors',
        'data-[active=true]:border-2 data-[active=true]:border-[color:var(--esap-emerald-700)]',
        'data-[active=true]:bg-[color:var(--badge-emerald-bg)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
        'aria-disabled:cursor-not-allowed aria-disabled:opacity-60',
        className,
      )}
      {...props}
    >
      <p className="text-[15px] font-semibold text-[color:var(--text-primary)]">{label}</p>
      {description && <p className="text-sm text-[color:var(--text-secondary)]">{description}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => handleFiles(filesFromList(e.target.files))}
      />
    </div>
  );
}
