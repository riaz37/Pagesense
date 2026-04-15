'use client';

import { useRef, type ReactNode, type MouseEvent } from 'react';
import { motion, useReducedMotion, useSpring } from 'framer-motion';
import { cn } from '@/lib/cn';

interface MagneticButtonProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

const SPRING_CONFIG = { stiffness: 260, damping: 20, mass: 0.6 } as const;

export function MagneticButton({
  children,
  strength = 0.2,
  className,
}: MagneticButtonProps) {
  const shouldReduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, SPRING_CONFIG);
  const y = useSpring(0, SPRING_CONFIG);

  if (shouldReduce) {
    return <div className={cn('inline-block', className)}>{children}</div>;
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>): void => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };

  const handleMouseLeave = (): void => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={cn('inline-block', className)}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}
