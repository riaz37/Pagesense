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
        <div className="mb-2 flex items-center gap-2">
          <span
            className="relative inline-flex h-1.5 w-1.5 items-center justify-center"
            aria-hidden
          >
            <span className="absolute inset-0 rounded-full bg-[color:var(--esap-emerald-500)] opacity-70 motion-safe:animate-ping" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-[color:var(--esap-emerald-600)]" />
          </span>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--text-secondary)]">
            {t('searching')}
            <span className="ms-0.5 inline-flex gap-[1px] align-baseline" aria-hidden>
              <span className="skeleton-dot" style={{ animationDelay: '0ms' }}>·</span>
              <span className="skeleton-dot" style={{ animationDelay: '180ms' }}>·</span>
              <span className="skeleton-dot" style={{ animationDelay: '360ms' }}>·</span>
            </span>
          </p>
        </div>
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

const SKELETON_VARIANTS = [
  { badge: 'w-20', num: 'w-14', title: 'w-[72%]', issuer: 'w-[44%]', snippet2: 'w-[88%]' },
  { badge: 'w-16', num: 'w-20', title: 'w-[60%]', issuer: 'w-[38%]', snippet2: 'w-[70%]' },
  { badge: 'w-24', num: 'w-12', title: 'w-[80%]', issuer: 'w-[50%]', snippet2: 'w-[82%]' },
] as const;

function SourceCardSkeleton({ index, reduceMotion }: { index: number; reduceMotion: boolean }) {
  const v = SKELETON_VARIANTS[index % SKELETON_VARIANTS.length];
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
        delay: reduceMotion ? 0 : index * 0.08,
      }}
      className="h-full"
    >
      <Card
        className="relative h-full overflow-hidden p-3 border-[color:var(--border-subtle)]"
        aria-hidden
      >
        {/* Emerald scanning sweep */}
        {!reduceMotion && (
          <span
            className="pointer-events-none absolute inset-0 skeleton-sweep"
            style={{ ['--sweep-delay' as string]: `${index * 220}ms` }}
            aria-hidden
          />
        )}

        {/* Row 1: badge + doc# + page */}
        <div className="relative flex items-center gap-2 mb-2">
          <div className={`skeleton h-[18px] ${v.badge} rounded-[4px]`} />
          <div className={`skeleton h-3 ${v.num} rounded-[3px]`} />
          <div className="skeleton ms-auto h-2.5 w-10 rounded-[3px] opacity-60" />
        </div>

        {/* Row 2: title */}
        <div className={`skeleton relative h-[15px] ${v.title} rounded-[4px] mb-1.5`} />

        {/* Row 3: issuer */}
        <div className={`skeleton relative h-[11px] ${v.issuer} rounded-[3px] mb-2`} />

        {/* Rows 4-5: snippet */}
        <div className="skeleton relative h-[11px] w-full rounded-[3px] mb-1" />
        <div className={`skeleton relative h-[11px] ${v.snippet2} rounded-[3px]`} />
      </Card>
    </motion.div>
  );
}
