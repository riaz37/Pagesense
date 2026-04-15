'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import type { SourceDoc } from '@/lib/api';
import { Card } from '@/components/ui';
import SourceCard from '@/components/SourceCard';

const NON_CITED_VISIBLE = 3;
const SKELETON_COUNT = 3;

interface SourcesGridProps {
  sources?: SourceDoc[];
  additional?: SourceDoc[];
  citedIds?: string[];
  isStreaming?: boolean;
  onOpenSource: (source: SourceDoc) => void;
}

export default function SourcesGrid({
  sources,
  additional,
  citedIds,
  isStreaming,
  onOpenSource,
}: SourcesGridProps) {
  const t = useTranslations('chat.sources');
  const reduceMotion = useReducedMotion();

  const merged = useMemo(() => {
    const all = [...(sources || []), ...(additional || [])];
    const seen = new Set<string>();
    const unique = all.filter((s) => {
      if (seen.has(s.doc_id)) return false;
      seen.add(s.doc_id);
      return true;
    });
    const citedSet = new Set(citedIds || []);
    return unique.sort((a, b) => {
      const ac = citedSet.has(a.doc_id) ? 1 : 0;
      const bc = citedSet.has(b.doc_id) ? 1 : 0;
      if (ac !== bc) return bc - ac;
      return (b.score ?? 0) - (a.score ?? 0);
    });
  }, [sources, additional, citedIds]);

  const citedSet = useMemo(() => new Set(citedIds || []), [citedIds]);

  const { visible, overflow } = useMemo(() => {
    const cited = merged.filter((s) => citedSet.has(s.doc_id));
    const nonCited = merged.filter((s) => !citedSet.has(s.doc_id));
    return {
      visible: [...cited, ...nonCited.slice(0, NON_CITED_VISIBLE)],
      overflow: nonCited.slice(NON_CITED_VISIBLE),
    };
  }, [merged, citedSet]);

  if (merged.length === 0) {
    if (!isStreaming) return null;
    return (
      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="mb-4"
      >
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--text-secondary)]">
          {t('searching')}
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 [grid-auto-rows:1fr]">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <SourceCardSkeleton key={i} index={i} reduceMotion={reduceMotion ?? false} />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="mb-4"
    >
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--text-secondary)]">
        {citedSet.size > 0
          ? t('retrievedWithCited', { cited: citedSet.size, total: merged.length })
          : t('retrievedNoneCited', { count: merged.length })}
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((source, i) => (
          <SourceCard
            key={source.doc_id}
            source={source}
            index={i}
            cited={citedSet.has(source.doc_id)}
            onClick={() => onOpenSource(source)}
          />
        ))}
      </div>
      {overflow.length > 0 && (
        <details className="mt-3 group">
          <summary className="list-none cursor-pointer inline-flex items-center gap-1.5 rounded-[8px] border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface-subtle)] px-3 py-1.5 text-[12px] font-medium text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-surface-hover)] hover:text-[color:var(--text-primary)] hover:border-[color:var(--esap-emerald-700)]/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]">
            <span className="transition-transform group-open:rotate-90" aria-hidden>
              ▸
            </span>
            <span>{t('moreRetrieved', { count: overflow.length })}</span>
          </summary>
          <p className="mt-1.5 text-[11px] text-[color:var(--text-muted)]" dir="auto">
            {t('moreRetrievedHelp')}
          </p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {overflow.map((source, i) => (
              <SourceCard
                key={source.doc_id}
                source={source}
                index={i}
                cited={citedSet.has(source.doc_id)}
                onClick={() => onOpenSource(source)}
              />
            ))}
          </div>
        </details>
      )}
    </motion.div>
  );
}

function SourceCardSkeleton({ index, reduceMotion }: { index: number; reduceMotion: boolean }) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0.4 }}
      animate={reduceMotion ? { opacity: 0.6 } : { opacity: [0.4, 0.7, 0.4] }}
      transition={{
        duration: 1.6,
        repeat: reduceMotion ? 0 : Infinity,
        ease: 'easeInOut',
        delay: index * 0.15,
      }}
    >
      <Card className="p-3" aria-hidden>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-4 w-14 rounded bg-[color:var(--bg-surface-subtle)]" />
          <div className="h-3 w-16 rounded bg-[color:var(--bg-surface-subtle)]" />
        </div>
        <div className="h-4 w-3/4 rounded bg-[color:var(--bg-surface-subtle)] mb-1.5" />
        <div className="h-3 w-full rounded bg-[color:var(--bg-surface-subtle)] mb-1" />
        <div className="h-3 w-5/6 rounded bg-[color:var(--bg-surface-subtle)]" />
      </Card>
    </motion.div>
  );
}
