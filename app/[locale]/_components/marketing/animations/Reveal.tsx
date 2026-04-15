'use client';

import { useMemo, type ElementType, type ReactNode } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { cn } from '@/lib/cn';
import { fadeIn, fadeUp, scaleIn } from './variants';

type RevealVariant = 'fadeUp' | 'fadeIn' | 'scaleIn';

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  variant?: RevealVariant;
  delay?: number;
  margin?: string;
  className?: string;
}

const VARIANT_MAP: Record<RevealVariant, Variants> = {
  fadeUp,
  fadeIn,
  scaleIn,
};

// Common tag shortcuts avoid re-creating motion components on every render.
const TAG_MAP = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  aside: motion.aside,
  header: motion.header,
  footer: motion.footer,
  li: motion.li,
  ul: motion.ul,
  ol: motion.ol,
  span: motion.span,
  p: motion.p,
  figure: motion.figure,
} as const;

type TagKey = keyof typeof TAG_MAP;

export function Reveal({
  children,
  as = 'div',
  variant = 'fadeUp',
  delay = 0,
  margin,
  className,
}: RevealProps) {
  const shouldReduce = useReducedMotion();

  const MotionComponent = useMemo(() => {
    if (typeof as === 'string' && as in TAG_MAP) {
      return TAG_MAP[as as TagKey];
    }
    return motion.create(as as ElementType);
  }, [as]);

  if (shouldReduce) {
    const Static = as as ElementType;
    return <Static className={className}>{children}</Static>;
  }

  const variants = VARIANT_MAP[variant];

  return (
    <MotionComponent
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: margin ?? '-80px' }}
      variants={variants}
      transition={{ delay }}
    >
      {children}
    </MotionComponent>
  );
}
