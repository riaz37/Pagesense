'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { Card, CitationChip, PillBadge } from '@/components/ui';
import { Reveal } from './animations';

export function DemoSection(): React.ReactElement {
  const t = useTranslations('marketing');
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <section
      id="demo"
      className="relative w-full bg-[color:var(--bg-page)] py-[120px]"
    >
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="mb-14 flex flex-col items-start gap-5">
          <Reveal variant="fadeUp">
            <PillBadge tone="emerald" size="lg"><span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />{t('demo.eyebrow')}</PillBadge>
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
              {t('demo.title')}
            </h2>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.16}>
            <p
              className="max-w-[560px] text-[color:var(--text-secondary)]"
              style={{ fontSize: '20px', fontWeight: 500, lineHeight: 1.4 }}
            >
              {t('demo.subtitle')}
            </p>
          </Reveal>
        </div>

        <Reveal variant="scaleIn" delay={0.1}>
          <div className="mx-auto max-w-[760px]">
            <Card>
              <div className="flex flex-col gap-6 p-6">
                <UserBubble
                  text={isAr ? t('demo.userMessage') : t('demo.userMessageEn')}
                  isAr={isAr}
                />
                <DemoAssistantLine
                  prefix={t('demo.assistantPrefix')}
                  amount={t('demo.assistantAmount')}
                  suffix={t('demo.assistantSuffix')}
                  citationLabel={t('demo.citationLabel')}
                />
              </div>
            </Card>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

interface UserBubbleProps {
  text: string;
  isAr: boolean;
}

function UserBubble({ text, isAr }: UserBubbleProps): React.ReactElement {
  return (
    <div className={`flex ${isAr ? 'justify-start' : 'justify-end'}`} dir="auto">
      <div
        className="rounded-xl bg-[color:var(--bg-surface-subtle)] px-4 py-3"
        dir={isAr ? 'rtl' : 'ltr'}
        style={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: 'var(--text-primary)',
        }}
      >
        {text}
      </div>
    </div>
  );
}

type StreamPhase = 0 | 1 | 2 | 3;

interface DemoAssistantLineProps {
  prefix: string;
  amount: string;
  suffix: string;
  citationLabel: string;
}

function DemoAssistantLine({
  prefix,
  amount,
  suffix,
  citationLabel,
}: DemoAssistantLineProps): React.ReactElement {
  const shouldReduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  const [phase, setPhase] = useState<StreamPhase>(shouldReduce ? 3 : 0);
  const [prefixText, setPrefixText] = useState<string>(shouldReduce ? prefix : '');
  const [amountText, setAmountText] = useState<string>(shouldReduce ? amount : '');
  const [suffixText, setSuffixText] = useState<string>(shouldReduce ? suffix : '');

  useEffect(() => {
    if (shouldReduce || !inView) return;

    let cancelled = false;
    let activeInterval: ReturnType<typeof setInterval> | null = null;
    let activeTimeout: ReturnType<typeof setTimeout> | null = null;

    const typeSegment = (
      full: string,
      setter: (v: string) => void,
      onDone: () => void,
      speed = 24,
    ): void => {
      let i = 0;
      activeInterval = setInterval(() => {
        if (cancelled) return;
        i += 1;
        setter(full.slice(0, i));
        if (i >= full.length) {
          if (activeInterval) clearInterval(activeInterval);
          activeInterval = null;
          onDone();
        }
      }, speed);
    };

    setPhase(0);
    activeTimeout = setTimeout(() => {
      if (cancelled) return;
      setPhase(1);
      typeSegment(
        prefix,
        setPrefixText,
        () => {
          if (cancelled) return;
          setPhase(2);
          typeSegment(
            amount,
            setAmountText,
            () => {
              if (cancelled) return;
              setPhase(3);
              typeSegment(suffix, setSuffixText, () => {
                // done
              }, 24);
            },
            32,
          );
        },
        24,
      );
    }, 450);

    return () => {
      cancelled = true;
      if (activeInterval) clearInterval(activeInterval);
      if (activeTimeout) clearTimeout(activeTimeout);
    };
  }, [inView, prefix, amount, suffix, shouldReduce]);

  const streamDone = phase === 3 && suffixText === suffix;
  const showCaret = !shouldReduce && !streamDone;

  return (
    <div ref={ref} className="flex flex-col gap-4">
      <p
        className="text-[color:var(--text-primary)]"
        style={{
          fontSize: '16px',
          lineHeight: 1.55,
        }}
      >
        <span>{prefixText}</span>
        <strong
          style={{
            color: 'var(--esap-emerald-700)',
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {amountText}
        </strong>
        <span>{suffixText}</span>
        {showCaret ? (
          <motion.span
            aria-hidden="true"
            className="ms-[0.12em] inline-block h-[1em] w-[2px] align-[-0.12em]"
            style={{ backgroundColor: 'var(--esap-emerald-500)' }}
            animate={{ opacity: [1, 1, 0, 0, 1] }}
            transition={{
              duration: 0.8,
              ease: 'easeInOut',
              repeat: Infinity,
              times: [0, 0.45, 0.5, 0.95, 1],
            }}
          />
        ) : null}
      </p>

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={streamDone ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <CitationChip
          docId="INV-2024-0341"
          page={3}
          label={citationLabel}
          tabIndex={streamDone ? 0 : -1}
        />
      </motion.div>
    </div>
  );
}
