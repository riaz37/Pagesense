'use client';

import { useEffect, useRef, useState } from 'react';
import {
  animate,
  useInView,
  useMotionValue,
  useReducedMotion,
} from 'framer-motion';
import { cn } from '@/lib/cn';

interface CounterProps {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
  suffix?: string;
}

const defaultFormat = (n: number): string => {
  try {
    return n.toLocaleString();
  } catch {
    return String(n);
  }
};

export function Counter({
  value,
  duration = 1.6,
  format = defaultFormat,
  className,
  suffix = '',
}: CounterProps) {
  const shouldReduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState<string>(
    shouldReduce ? format(value) : format(0),
  );

  const isFloat = !Number.isInteger(value);

  useEffect(() => {
    if (shouldReduce) {
      setDisplay(format(value));
      return;
    }
    if (!inView) return;

    const unsub = motionValue.on('change', (latest: number) => {
      const rounded = isFloat
        ? Math.round(latest * 10) / 10
        : Math.round(latest);
      setDisplay(format(rounded));
    });

    const controls = animate(motionValue, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });

    return () => {
      controls.stop();
      unsub();
    };
  }, [inView, value, duration, format, motionValue, shouldReduce, isFloat]);

  return (
    <span ref={ref} className={cn(className)}>
      {display}
      {suffix}
    </span>
  );
}
