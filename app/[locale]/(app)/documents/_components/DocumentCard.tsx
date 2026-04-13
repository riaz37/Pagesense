'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { DocumentMeta } from '@/lib/api';
import { Card, DocTypeIcon, StatusPill } from '@/components/ui';
import { asDocType } from '@/components/ui/DocTypeIcon';
import { detectLanguage, deriveStatus } from '../_state/filters';
import { CardActionMenu } from './CardActionMenu';

interface DocumentCardProps {
  doc: DocumentMeta;
  onOpen: (doc: DocumentMeta) => void;
  onCopyId: (docId: string) => void;
  rowIndex: number;
  colIndex: number;
  focused: boolean;
  onFocus: (rowIndex: number, colIndex: number) => void;
  registerRef: (rowIndex: number, colIndex: number, el: HTMLButtonElement | null) => void;
}

function formatDate(value: string | undefined, locale: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return value;
  }
}

export const DocumentCard = React.memo(function DocumentCard({
  doc,
  onOpen,
  onCopyId,
  rowIndex,
  colIndex,
  focused,
  onFocus,
  registerRef,
}: DocumentCardProps) {
  const t = useTranslations('documents');
  const locale = useLocale();
  const docType = asDocType(doc.document_type);
  const status = deriveStatus(doc);
  const language = detectLanguage(doc);
  const title = doc.document_number || doc.doc_id.replace(/_/g, ' ');
  const filename = doc.source_file ?? doc.doc_id;
  const dateLabel = formatDate(doc.document_date, locale) ?? t('card.noDate');
  const pages = doc.page_count ?? 0;

  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  React.useEffect(() => {
    registerRef(rowIndex, colIndex, btnRef.current);
    return () => registerRef(rowIndex, colIndex, null);
  }, [registerRef, rowIndex, colIndex]);

  return (
    <Card
      role="gridcell"
      className="group relative flex flex-col h-full transition-shadow duration-150 hover:shadow-[var(--shadow-card)] focus-within:shadow-[var(--shadow-focus)]"
    >
      <div className="flex items-center justify-between px-3 pt-3">
        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-md badge-${docType}`}>
          <DocTypeIcon type={docType} size={18} className="text-current" />
        </span>
        <div className="flex items-center gap-1">
          <StatusPill status={status} locale={locale === 'ar' ? 'ar' : 'en'} />
          <CardActionMenu onOpen={() => onOpen(doc)} onCopyId={() => onCopyId(doc.doc_id)} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-3 pt-3 pb-2">
        <button
          ref={btnRef}
          type="button"
          tabIndex={focused ? 0 : -1}
          onClick={() => onOpen(doc)}
          onFocus={() => onFocus(rowIndex, colIndex)}
          aria-label={`${t('card.open')}: ${title}`}
          className="text-[15px] font-semibold leading-[1.4] text-start text-[color:var(--text-primary)] line-clamp-2 hover:underline focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
          dir="auto"
        >
          {title}
        </button>
        <span
          className="truncate-leading text-[13px] text-[color:var(--text-secondary)] font-mono"
          title={filename}
          dir="ltr"
        >
          {filename}
        </span>
      </div>
      <div className="flex items-center gap-2 border-t border-[color:var(--border-subtle)] px-3 py-2 text-[11px] text-[color:var(--text-tertiary)]">
        <span className="tabular-nums">{t('card.pages', { count: pages })}</span>
        <span aria-hidden>·</span>
        <span className="truncate" title={dateLabel}>
          {dateLabel}
        </span>
        <span aria-hidden>·</span>
        <span className="uppercase tracking-wider">
          {language === 'both' ? t('language.both') : t(`language.${language}` as 'language.ar')}
        </span>
      </div>
    </Card>
  );
});
