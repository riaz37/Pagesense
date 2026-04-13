'use client';

import { forwardRef, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
  centered?: boolean;
}

export const Composer = forwardRef<HTMLTextAreaElement, ComposerProps>(function Composer(
  { value, onChange, onSubmit, disabled, isStreaming, centered },
  ref,
) {
  const t = useTranslations('chat');
  const locale = useLocale();
  const hasText = value.trim().length > 0;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!disabled && hasText) onSubmit();
      }
    },
    [disabled, hasText, onSubmit],
  );

  const handleFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!disabled && hasText) onSubmit();
    },
    [disabled, hasText, onSubmit],
  );

  // Mirror send icon horizontally in RTL so the arrow always points toward the flow direction.
  const sendIconTransform = locale === 'ar' ? 'scale(-1, 1)' : undefined;

  return (
    <form
      onSubmit={handleFormSubmit}
      className={cn('mx-auto w-full max-w-[760px] px-4', centered ? 'py-0' : 'pb-5 pt-3')}
      data-testid="composer"
    >
      <div
        className={cn(
          'relative flex min-h-[56px] items-end gap-2 rounded-[16px]',
          'border border-[color:var(--border-input)] bg-[color:var(--bg-input)]',
          'px-3 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
          'focus-within:border-[color:var(--esap-emerald-700)]/40',
          'focus-within:ring-2 focus-within:ring-[color:var(--esap-emerald-700)]/10',
          'transition-[border-color,box-shadow] duration-150',
        )}
      >
        <button
          type="button"
          aria-label={t('attachment')}
          disabled
          className={cn(
            'mb-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px]',
            'text-[color:var(--text-tertiary)] hover:bg-black/5 hover:text-[color:var(--text-secondary)]',
            'disabled:opacity-50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
            'dark:hover:bg-white/5',
          )}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M21 12.79V19a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h6.21"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 3h5v5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('placeholder')}
          dir="auto"
          rows={1}
          disabled={disabled}
          aria-label={t('placeholder')}
          className={cn(
            'flex-1 resize-none bg-transparent py-1.5 text-[15px] leading-[1.5]',
            'text-[color:var(--text-primary)] placeholder:text-[color:var(--text-tertiary)]',
            'max-h-40 outline-none',
            'disabled:cursor-not-allowed disabled:opacity-60',
          )}
        />

        <div className="mb-0.5 flex shrink-0 items-center gap-1.5">
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
              <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label={t('mic')}
            disabled
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-full',
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
          <button
            type="submit"
            aria-label={isStreaming ? t('streaming') : t('send')}
            disabled={disabled || !hasText}
            data-state={hasText ? 'ready' : 'empty'}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
              hasText && !disabled
                ? 'bg-[color:var(--esap-emerald-700)] text-white hover:bg-[color:var(--esap-emerald-800)]'
                : 'bg-black/5 text-[color:var(--text-tertiary)] dark:bg-white/5',
              'disabled:cursor-not-allowed',
            )}
          >
            {isStreaming ? (
              <span
                className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden
              />
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
        </div>
      </div>
      <p
        className="mt-2 text-center text-[11px] text-[color:var(--text-tertiary)]"
        aria-hidden
      >
        {t('composerHint')}
      </p>
    </form>
  );
});
