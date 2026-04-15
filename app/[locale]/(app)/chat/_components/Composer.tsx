'use client';

import { forwardRef, useCallback, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/cn';

export type AttachmentState = 'uploading' | 'indexing' | 'ready' | 'error';

export interface ComposerAttachment {
  filename: string;
  state: AttachmentState;
  progress?: number;
  error?: string;
  docId?: string;
}

interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
  centered?: boolean;
  attachment?: ComposerAttachment;
  onAttach?: (file: File) => void;
  onRemoveAttachment?: () => void;
}

const ATTACH_ACCEPT = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png';

const MAX_HEIGHT_PX = 200;

export const Composer = forwardRef<HTMLTextAreaElement, ComposerProps>(function Composer(
  {
    value,
    onChange,
    onSubmit,
    onStop,
    disabled,
    isStreaming,
    centered,
    attachment,
    onAttach,
    onRemoveAttachment,
  },
  ref,
) {
  const t = useTranslations('chat');
  const locale = useLocale();
  const reduceMotion = useReducedMotion();
  const hasText = value.trim().length > 0;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

  const canAttach = Boolean(onAttach) && !attachment;
  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (file && onAttach) onAttach(file);
    },
    [onAttach],
  );

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`;
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (isStreaming) return;
        if (!disabled && hasText) onSubmit();
      }
    },
    [disabled, hasText, isStreaming, onSubmit],
  );

  const handleFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isStreaming) {
        onStop?.();
        return;
      }
      if (!disabled && hasText) onSubmit();
    },
    [disabled, hasText, isStreaming, onStop, onSubmit],
  );

  const sendIconTransform = locale === 'ar' ? 'scale(-1, 1)' : undefined;
  const sendLabel = isStreaming ? t('stop') : t('send');

  const buttonHoverProps = reduceMotion
    ? {}
    : { whileHover: { scale: 1.06 }, whileTap: { scale: 0.92 } };

  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      <form
        onSubmit={handleFormSubmit}
        className={cn('mx-auto w-full max-w-[760px] px-4', centered ? 'py-0' : 'pb-5 pt-3')}
        data-testid="composer"
      >
        <div
          className={cn(
            'relative flex flex-col gap-2 rounded-3xl',
            'border border-[color:var(--border-input)] bg-[color:var(--bg-input)]',
            'px-3 pt-2.5 pb-2 shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
            'focus-within:border-[color:var(--esap-emerald-700)]/40',
            'focus-within:ring-2 focus-within:ring-[color:var(--esap-emerald-700)]/10',
            'transition-[border-color,box-shadow] duration-150',
          )}
        >
          <AnimatePresence initial={false}>
            {attachment && (
              <AttachmentChip
                key={attachment.filename + attachment.state}
                attachment={attachment}
                onRemove={onRemoveAttachment}
                t={t}
                reduceMotion={reduceMotion ?? false}
              />
            )}
          </AnimatePresence>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('placeholder')}
            dir="auto"
            rows={1}
            aria-label={t('placeholder')}
            className={cn(
              'w-full resize-none bg-transparent px-1 py-1 text-[15px] leading-[1.5]',
              'text-[color:var(--text-primary)] placeholder:text-[color:var(--text-tertiary)]',
              'outline-none',
            )}
            style={{ maxHeight: MAX_HEIGHT_PX }}
          />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept={ATTACH_ACCEPT}
                className="sr-only"
                onChange={handleFileChange}
                tabIndex={-1}
                aria-hidden
              />
              <TooltipPrimitive.Root>
                <TooltipPrimitive.Trigger asChild>
                  <motion.button
                    type="button"
                    aria-label={t('attach.label')}
                    onClick={handleAttachClick}
                    disabled={!canAttach}
                    {...buttonHoverProps}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className={cn(
                      'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      'text-[color:var(--text-tertiary)]',
                      'hover:bg-[color:var(--bg-control)] hover:text-[color:var(--text-secondary)]',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
                      'transition-colors',
                    )}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.button>
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                  <TooltipPrimitive.Content
                    side="top"
                    sideOffset={6}
                    className={cn(
                      'z-50 rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)]',
                      'px-2 py-1 text-xs text-[color:var(--text-primary)] shadow-md',
                    )}
                  >
                    {t('attach.label')}
                  </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
              </TooltipPrimitive.Root>

            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled
                className={cn(
                  'hidden h-8 items-center gap-1 rounded-full px-2.5 text-[12px]',
                  'text-[color:var(--text-muted)] sm:inline-flex',
                  'hover:bg-[color:var(--bg-control)]',
                  'disabled:cursor-not-allowed disabled:opacity-70',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
                )}
                aria-label={t('modelPicker')}
              >
                <span>{t('modelDefault')}</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                  <path
                    d="M2 4l3 3 3-3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <TooltipPrimitive.Root>
                <TooltipPrimitive.Trigger asChild>
                  <motion.button
                    type="submit"
                    aria-label={sendLabel}
                    disabled={!isStreaming && !hasText}
                    data-state={isStreaming ? 'streaming' : hasText ? 'ready' : 'empty'}
                    {...(hasText || isStreaming ? buttonHoverProps : {})}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className={cn(
                      'inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
                      isStreaming
                        ? 'bg-[color:var(--bg-surface-subtle)] text-[color:var(--text-primary)] hover:bg-[color:var(--bg-surface-hover)] border border-[color:var(--border-subtle)]'
                        : hasText
                          ? 'bg-[color:var(--esap-emerald-700)] text-white hover:bg-[color:var(--esap-emerald-800)]'
                          : 'bg-[color:var(--bg-control)] text-[color:var(--text-tertiary)]',
                      'disabled:cursor-not-allowed',
                    )}
                  >
                    {isStreaming ? (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
                        <rect width="10" height="10" rx="1.5" />
                      </svg>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden
                        style={sendIconTransform ? { transform: sendIconTransform } : undefined}
                      >
                        <path
                          d="M2 8l12-6-4 14-2.5-5.5L2 8z"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinejoin="round"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                  </motion.button>
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                  <TooltipPrimitive.Content
                    side="top"
                    sideOffset={6}
                    className={cn(
                      'z-50 rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)]',
                      'px-2 py-1 text-xs text-[color:var(--text-primary)] shadow-md',
                    )}
                  >
                    {sendLabel}
                  </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
              </TooltipPrimitive.Root>
            </div>
          </div>
        </div>
        <p
          className="mt-2 text-center text-[11px] text-[color:var(--text-tertiary)]"
          aria-hidden
        >
          {t('composerHint')}
        </p>
      </form>
    </TooltipPrimitive.Provider>
  );
});

interface AttachmentChipProps {
  attachment: ComposerAttachment;
  onRemove?: () => void;
  t: ReturnType<typeof useTranslations<'chat'>>;
  reduceMotion: boolean;
}

function AttachmentChip({ attachment, onRemove, t, reduceMotion }: AttachmentChipProps) {
  const { filename, state, progress, error } = attachment;
  const pct = Math.max(0, Math.min(100, Math.round(progress ?? 0)));

  let statusText: string;
  if (state === 'uploading') statusText = t('attach.uploading');
  else if (state === 'indexing') statusText = t('attach.indexing', { percent: pct });
  else if (state === 'ready') statusText = t('attach.ready');
  else statusText = error || t('attach.errorGeneric');

  const isError = state === 'error';
  const isReady = state === 'ready';

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: -6, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, height: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'flex items-center gap-2 rounded-xl px-2.5 py-1.5',
        'border text-[12px]',
        isError
          ? 'border-[color:var(--danger-border)] bg-[color:var(--danger-bg)] text-[color:var(--text-primary)]'
          : isReady
            ? 'border-[color:var(--esap-emerald-500)]/35 bg-[color:var(--badge-emerald-bg)] text-[color:var(--text-primary)]'
            : 'border-[color:var(--border-subtle)] bg-[color:var(--bg-surface-subtle)] text-[color:var(--text-primary)]',
      )}
      dir="auto"
      role="status"
      aria-live="polite"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
        <path
          d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      <span className="min-w-0 flex-1 truncate font-medium text-[color:var(--text-primary)]">
        {filename}
      </span>
      <span
        className={cn(
          'shrink-0 text-[11px] font-medium',
          isError
            ? 'text-[color:var(--danger-text)]'
            : isReady
              ? 'text-[color:var(--badge-emerald-text)]'
              : 'text-[color:var(--text-secondary)]',
        )}
      >
        {statusText}
      </span>
      {(state === 'uploading' || state === 'indexing') && (
        <span
          className="h-1 w-12 shrink-0 overflow-hidden rounded-full bg-[color:var(--bg-control)]"
          aria-hidden
        >
          <motion.span
            className="block h-full rounded-full bg-[color:var(--esap-emerald-700)]"
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 140, damping: 22, mass: 0.6 }}
          />
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={t('attach.remove')}
          className={cn(
            'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
            'text-[color:var(--text-tertiary)]',
            'hover:bg-[color:var(--bg-control)] hover:text-[color:var(--text-secondary)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
            'transition-colors',
          )}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
            <path
              d="M2 2l6 6M8 2L2 8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </motion.div>
  );
}
