'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface DrawLineProps {
  d: string;
  stroke?: string;
  strokeWidth?: number;
  duration?: number;
  className?: string;
}

export function DrawLine({
  d,
  stroke,
  strokeWidth = 2,
  duration = 1.2,
  className,
}: DrawLineProps) {
  const shouldReduce = useReducedMotion();
  const strokeColor = stroke ?? 'var(--esap-emerald-700)';

  return (
    <motion.path
      d={d}
      fill="none"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
      initial={{ pathLength: shouldReduce ? 1 : 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={
        shouldReduce
          ? { duration: 0 }
          : { duration, ease: [0.22, 1, 0.36, 1] }
      }
    />
  );
}
