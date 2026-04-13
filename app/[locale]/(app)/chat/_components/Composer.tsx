'use client';

import { forwardRef, useCallback, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
  centered?: boolean;
}

const MAX_HEIGHT_PX = 200;

export const Composer = forwardRef<HTMLTextAreaElement, ComposerProps>(function Composer(
  { value, onChange, onSubmit, onStop, disabled, isStreaming, centered },
  ref,
) {
  const t = useTranslations('chat');
  const locale = useLocale();
  const hasText = value.trim().length > 0;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

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
              <button
                type="button"
                aria-label={t('mic')}
                disabled
                className={cn(
                  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  'text-[color:var(--text-tertiary)] hover:bg-black/5 hover:text-[color:var(--text-secondary)]',
                  'disabled:opacity-50',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
                  'dark:hover:bg-white/5',
                )}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M5 11a7 7 0 0014 0M12 18v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled
                className={cn(
                  'hidden h-8 items-center gap-1 rounded-full px-2.5 text-[12px]',
                  'text-[color:var(--text-muted)] hover:bg-black/5 sm:inline-flex',
                  'disabled:cursor-not-allowed disabled:opacity-70',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
                  'dark:hover:bg-white/5',
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
                  <button
                    type="submit"
                    aria-label={sendLabel}
                    disabled={!isStreaming && !hasText}
                    data-state={isStreaming ? 'streaming' : hasText ? 'ready' : 'empty'}
                    className={cn(
                      'inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
                      isStreaming
                        ? 'bg-[color:var(--bg-surface-subtle)] text-[color:var(--text-primary)] hover:bg-[color:var(--bg-surface-muted)] border border-[color:var(--border-subtle)]'
                        : hasText
                          ? 'bg-[color:var(--esap-emerald-700)] text-white hover:bg-[color:var(--esap-emerald-800)]'
                          : 'bg-black/5 text-[color:var(--text-tertiary)] dark:bg-white/5',
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
                  </button>
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
