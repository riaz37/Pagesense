'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { Card, PillBadge } from '@/components/ui';
import { Reveal } from './animations';

interface InvoiceRow {
  label: string;
  value: string;
  emphasis?: boolean;
}

interface InvoiceData {
  dir: 'ltr' | 'rtl';
  title: string;
  rows: InvoiceRow[];
}

const CYCLE_MS = 2200;

export function BilingualProofSection(): React.ReactElement {
  const t = useTranslations('marketing.bilingualProof');
  const shouldReduce = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [hovered, setHovered] = useState<number | null>(null);

  const en: InvoiceData = {
    dir: 'ltr',
    title: t('invoiceTitleEn'),
    rows: [
      { label: t('issuerLabelEn'), value: t('issuerValueEn') },
      { label: t('dateLabelEn'), value: t('dateValue') },
      { label: t('totalLabelEn'), value: t('totalValue'), emphasis: true },
    ],
  };

  const ar: InvoiceData = {
    dir: 'rtl',
    title: t('invoiceTitleAr'),
    rows: [
      { label: t('issuerLabelAr'), value: t('issuerValueAr') },
      { label: t('dateLabelAr'), value: t('dateValueAr') },
      { label: t('totalLabelAr'), value: t('totalValue'), emphasis: true },
    ],
  };

  const rowCount = en.rows.length;
  const focused = hovered ?? activeIndex;

  useEffect(() => {
    if (shouldReduce || hovered !== null) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % rowCount);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [rowCount, shouldReduce, hovered]);

  return (
    <section
      className="relative w-full overflow-hidden bg-[color:var(--bg-page)] py-[120px]"
      aria-labelledby="bilingual-title"
    >
      <div className="relative mx-auto max-w-[1200px] px-4">
        <div className="mb-14 flex flex-col items-start gap-5">
          <Reveal variant="fadeUp">
            <PillBadge tone="emerald" size="lg">
              <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
              {t('eyebrow')}
            </PillBadge>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.08}>
            <h2
              id="bilingual-title"
              className="m-0 max-w-[920px] text-[color:var(--text-primary)]"
              style={{
                fontSize: 'clamp(32px, 4.2vw, 48px)',
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: '-1.5px',
                fontFeatureSettings: '"lnum", "locl"',
              }}
            >
              {t('title')}
            </h2>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.16}>
            <p
              className="max-w-[560px] text-[color:var(--text-secondary)]"
              style={{ fontSize: '20px', fontWeight: 500, lineHeight: 1.4 }}
            >
              {t('subtitle')}
            </p>
          </Reveal>
        </div>

        <Reveal variant="fadeUp" delay={0.1}>
          <div
            className="relative mx-auto grid w-full max-w-[1080px] grid-cols-1 items-stretch gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-0"
            onMouseLeave={() => setHovered(null)}
          >
            <InvoiceCard
              data={en}
              focusedIndex={focused}
              onRowFocus={setHovered}
              shouldReduce={!!shouldReduce}
              side="start"
            />

            <SyncBridge focusedIndex={focused} rowCount={rowCount} />

            <InvoiceCard
              data={ar}
              focusedIndex={focused}
              onRowFocus={setHovered}
              shouldReduce={!!shouldReduce}
              side="end"
            />
          </div>
        </Reveal>

        <div className="mt-6 flex justify-center gap-2" aria-hidden>
          {Array.from({ length: rowCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className="group relative h-1.5 rounded-full transition-all duration-300"
              style={{
                width: focused === i ? 28 : 8,
                background:
                  focused === i
                    ? 'var(--esap-emerald-500, #34d399)'
                    : 'color-mix(in srgb, var(--text-muted) 40%, transparent)',
              }}
              aria-label={`Highlight row ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface InvoiceCardProps {
  data: InvoiceData;
  focusedIndex: number;
  onRowFocus: (i: number | null) => void;
  shouldReduce: boolean;
  side: 'start' | 'end';
}

function InvoiceCard({
  data,
  focusedIndex,
  onRowFocus,
  shouldReduce,
  side,
}: InvoiceCardProps): React.ReactElement {
  return (
    <motion.div
      initial={shouldReduce ? false : { opacity: 0, x: side === 'start' ? -16 : 16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="relative h-full overflow-hidden">
        <div className="relative flex flex-col gap-6 p-8" dir={data.dir}>
          <div className="flex items-center justify-between gap-3">
            <h3
              className="m-0 text-[color:var(--text-primary)]"
              style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.25px' }}
            >
              {data.title}
            </h3>
            <span
              className="rounded-full border border-[color:var(--border-default)] px-2 py-0.5 text-[color:var(--text-muted)]"
              style={{
                fontFamily: 'var(--font-latin)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}
            >
              {data.dir.toUpperCase()}
            </span>
          </div>

          <dl className="m-0 grid grid-cols-1 gap-2">
            {data.rows.map((row, i) => {
              const isActive = i === focusedIndex;
              return (
                <motion.div
                  key={row.label}
                  data-row-index={i}
                  onMouseEnter={() => onRowFocus(i)}
                  onFocus={() => onRowFocus(i)}
                  className="relative flex flex-col gap-1 rounded-xl px-3 py-3"
                  animate={{
                    backgroundColor: isActive
                      ? 'color-mix(in srgb, var(--esap-emerald-500, #34d399) 8%, transparent)'
                      : 'rgba(0,0,0,0)',
                  }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  tabIndex={0}
                >
                  <motion.span
                    aria-hidden
                    className="absolute top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-full"
                    style={{
                      [data.dir === 'rtl' ? 'right' : 'left']: 0,
                      background: 'var(--esap-emerald-500, #34d399)',
                    }}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      scaleY: isActive ? 1 : 0.4,
                    }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <dt
                    className="uppercase text-[color:var(--text-muted)]"
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      letterSpacing: '0.125px',
                    }}
                  >
                    {row.label}
                  </dt>
                  <dd
                    className="m-0 text-[color:var(--text-primary)]"
                    style={{
                      fontSize: row.emphasis ? '18px' : '16px',
                      fontWeight: row.emphasis ? 700 : 500,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {row.value}
                  </dd>
                </motion.div>
              );
            })}
          </dl>
        </div>
      </Card>
    </motion.div>
  );
}

interface SyncBridgeProps {
  focusedIndex: number;
  rowCount: number;
}

function SyncBridge({ focusedIndex, rowCount }: SyncBridgeProps): React.ReactElement {
  const headerOffset = 116;
  const rowHeight = 60;
  const top = headerOffset + focusedIndex * rowHeight;

  return (
    <div
      aria-hidden
      className="relative hidden md:block"
      style={{ width: 64 }}
    >
      <div className="absolute inset-y-0 start-1/2 w-px -translate-x-1/2 bg-[color:var(--border-default)]" />

      <motion.div
        className="absolute start-1/2 -translate-x-1/2"
        animate={{ top }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: 56, height: 32 }}
      >
        <div className="relative flex h-full items-center justify-center">
          <span
            className="absolute h-px w-full"
            style={{ background: 'var(--esap-emerald-500, #34d399)' }}
          />
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            key={`pulse-${focusedIndex}`}
            className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--border-default)]"
            style={{
              background: 'var(--bg-page)',
              boxShadow:
                '0 0 0 4px color-mix(in srgb, var(--esap-emerald-500, #34d399) 18%, transparent)',
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: 'var(--esap-emerald-500, #34d399)' }}
            />
          </motion.span>
        </div>
      </motion.div>

      <span className="sr-only">
        Row {focusedIndex + 1} of {rowCount} synchronized
      </span>
    </div>
  );
}

