'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui';

interface CardActionMenuProps {
  onOpen: () => void;
  onCopyId: () => void;
  onReindex?: () => void;
  onDelete?: () => void;
}

export function CardActionMenu({ onOpen, onCopyId, onReindex, onDelete }: CardActionMenuProps) {
  const t = useTranslations('documents');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t('card.actions')}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[color:var(--text-tertiary)] hover:bg-[color:var(--bg-surface-hover)] hover:text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <circle cx="12" cy="5" r="1.6" />
            <circle cx="12" cy="12" r="1.6" />
            <circle cx="12" cy="19" r="1.6" />
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onSelect={onOpen}>{t('actions.open')}</DropdownMenuItem>
        <DropdownMenuItem onSelect={onCopyId}>{t('actions.copyLink')}</DropdownMenuItem>
        {onReindex && (
          <DropdownMenuItem onSelect={onReindex}>{t('actions.reindex')}</DropdownMenuItem>
        )}
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={onDelete}
              className="text-red-700 dark:text-red-300 data-[highlighted]:bg-red-500/10"
            >
              {t('actions.delete')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
