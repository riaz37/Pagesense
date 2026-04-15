'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface TypewriterCaretProps {
  text: string;
  speed?: number;
  startDelay?: number;
  onDone?: () => void;
  className?: string;
  dir?: 'ltr' | 'rtl' | 'auto';
}

export function TypewriterCaret({
  text,
  speed = 22,
  startDelay = 0,
  onDone,
  className,
  dir = 'auto',
}: TypewriterCaretProps) {
  const shouldReduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [displayed, setDisplayed] = useState<string>(shouldReduce ? text : '');

  useEffect(() => {
    if (shouldReduce) {
      setDisplayed(text);
      onDone?.();
      return;
    }
    if (!inView) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const chars = Array.from(text);
    let idx = 0;

    timeoutId = setTimeout(() => {
      if (cancelled) return;
      intervalId = setInterval(() => {
        idx += 1;
        setDisplayed(chars.slice(0, idx).join(''));
        if (idx >= chars.length) {
          if (intervalId) clearInterval(intervalId);
          onDone?.();
        }
      }, speed);
    }, startDelay);

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [inView, text, speed, startDelay, shouldReduce, onDone]);

  return (
    <span ref={ref} dir={dir} className={cn('inline-flex items-baseline', className)}>
      <span>{displayed}</span>
      <motion.span
        aria-hidden="true"
        className="ms-[0.08em] inline-block w-[0.08em] self-stretch"
        style={{
          backgroundColor: 'var(--esap-emerald-500)',
          minHeight: '1em',
        }}
        animate={
          shouldReduce
            ? { opacity: 1 }
            : { opacity: [1, 1, 0, 0, 1] }
        }
        transition={
          shouldReduce
            ? undefined
            : {
                duration: 0.8,
                ease: 'easeInOut',
                repeat: Infinity,
                times: [0, 0.45, 0.5, 0.95, 1],
              }
        }
      />
    </span>
  );
}
