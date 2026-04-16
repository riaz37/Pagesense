'use client';

import { useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
} from 'framer-motion';
import { Upload, ScanSearch, Database, MessagesSquare } from 'lucide-react';
import { Card, PillBadge } from '@/components/ui';
import { Reveal } from './animations';
import { cn } from '@/lib/cn';

interface PipelineStep {
  num: string;
  title: string;
  desc: string;
}

const STEP_ICONS = [Upload, ScanSearch, Database, MessagesSquare] as const;

// Zig-zag bezier connecting 4 tile centers across a 1200x400 viewBox.
// Tile centers approx: (150, 120), (450, 280), (750, 120), (1050, 280).
const PIPELINE_PATH =
  'M 150 120 C 260 120, 340 280, 450 280 S 640 120, 750 120 S 940 280, 1050 280';

export function PipelineSection(): React.ReactElement {
  const t = useTranslations('marketing');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const steps = t.raw('pipeline.steps') as PipelineStep[];
  const shouldReduce = useReducedMotion();

  const flowRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: flowRef,
    offset: ['start 90%', 'end 60%'],
  });
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const [reachedIndex, setReachedIndex] = useState<number>(-1);
  // Card thresholds along path: card1=0, card2≈0.33, card3≈0.66, card4=1
  const cardThresholds = [0, 0.33, 0.66, 0.98];
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    let next = -1;
    for (let i = 0; i < cardThresholds.length; i++) {
      if (v >= cardThresholds[i]) next = i;
    }
    setReachedIndex(next);
  });

  return (
    <section
      id="pipeline"
      className="relative w-full bg-[color:var(--bg-page)] py-[120px]"
    >
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="mb-16 flex flex-col items-start gap-5">
          <Reveal variant="fadeUp">
            <PillBadge tone="emerald" size="lg"><span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />{t('pipeline.eyebrow')}</PillBadge>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.08}>
            <h2
              className="m-0 max-w-[920px] text-[color:var(--text-primary)]"
              style={{
                fontSize: 'clamp(32px, 4.2vw, 48px)',
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: '-1.5px',
                fontFeatureSettings: '"lnum", "locl"',
              }}
            >
              {t('pipeline.title')}
            </h2>
          </Reveal>
        </div>

        <div ref={flowRef} className="relative">
          <svg
            aria-hidden="true"
            viewBox="0 0 1200 400"
            preserveAspectRatio="none"
            className={cn(
              'pointer-events-none absolute inset-0 hidden h-full w-full lg:block',
              isRtl && '[transform:scaleX(-1)]',
            )}
            style={{ zIndex: 0 }}
          >
            <motion.path
              d={PIPELINE_PATH}
              fill="none"
              stroke="var(--esap-emerald-300)"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ pathLength: shouldReduce ? 1 : pathLength }}
            />
          </svg>

          <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => {
              const Icon = STEP_ICONS[i] ?? Upload;
              const raised = i % 2 === 0; // stagger tiles vertically on desktop for "flow"
              const reached = i <= reachedIndex;
              return (
                <Reveal
                  key={step.num}
                  variant="fadeUp"
                  delay={i * 0.08}
                  className={cn('h-full', raised ? 'lg:mt-0' : 'lg:mt-28')}
                >
                  <PipelineTile step={step} Icon={Icon} reached={reached} />
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

interface PipelineTileProps {
  step: PipelineStep;
  Icon: typeof Upload;
  reached?: boolean;
}

function PipelineTile({ step, Icon, reached = false }: PipelineTileProps): React.ReactElement {
  return (
    <Card
      className="h-full transition-[border-color,box-shadow,transform] duration-500 ease-out hover:shadow-[rgba(0,0,0,0.06)_0px_8px_32px,rgba(0,0,0,0.04)_0px_4px_14px,rgba(0,0,0,0.03)_0px_2px_6px]"
      style={{
        borderColor: reached
          ? 'color-mix(in srgb, var(--esap-emerald-500, #34d399) 60%, transparent)'
          : undefined,
        boxShadow: reached
          ? '0 12px 40px color-mix(in srgb, var(--esap-emerald-500, #34d399) 18%, transparent)'
          : undefined,
        transform: reached ? 'translateY(-4px)' : undefined,
      }}
    >
      <div className="flex h-full flex-col gap-5 p-7">
        <div className="flex items-start justify-between">
          <span
            className="block"
            style={{
              fontFamily: 'var(--font-latin)',
              fontSize: '48px',
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '-1.5px',
              color: 'var(--esap-emerald-700)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {step.num}
          </span>
          <Icon
            size={28}
            strokeWidth={1.5}
            className="text-[color:var(--text-secondary)]"
            aria-hidden="true"
          />
        </div>
        <span
          className="text-[color:var(--text-primary)]"
          style={{
            fontSize: '22px',
            fontWeight: 700,
            lineHeight: 1.3,
            letterSpacing: '-0.25px',
          }}
        >
          {step.title}
        </span>
        <p
          className="text-[color:var(--text-secondary)]"
          style={{ fontSize: '15px', fontWeight: 500, lineHeight: 1.5 }}
        >
          {step.desc}
        </p>
      </div>
    </Card>
  );
}
