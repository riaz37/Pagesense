'use client';

import { useEffect, type ReactNode } from 'react';
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface MarqueeProps {
  children: ReactNode;
  speed?: number;
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  className?: string;
}

const MASK =
  'linear-gradient(to right, transparent, black 10%, black 90%, transparent)';

export function Marquee({
  children,
  speed = 30,
  direction = 'left',
  pauseOnHover = true,
  className,
}: MarqueeProps) {
  const shouldReduce = useReducedMotion();
  const controls = useAnimationControls();

  useEffect(() => {
    if (shouldReduce) return;

    const from = direction === 'left' ? '0%' : '-50%';
    const to = direction === 'left' ? '-50%' : '0%';

    controls.start({
      x: [from, to],
      transition: {
        duration: speed,
        ease: 'linear',
        repeat: Infinity,
        repeatType: 'loop',
      },
    });
  }, [controls, direction, speed, shouldReduce]);

  if (shouldReduce) {
    return (
      <div
        className={cn('overflow-hidden', className)}
        style={{
          WebkitMaskImage: MASK,
          maskImage: MASK,
        }}
      >
        <div className="flex w-max">
          <div className="flex shrink-0 gap-8 pr-8">{children}</div>
        </div>
      </div>
    );
  }

  const handleEnter = (): void => {
    if (pauseOnHover) controls.stop();
  };

  const handleLeave = (): void => {
    if (!pauseOnHover) return;
    const from = direction === 'left' ? '0%' : '-50%';
    const to = direction === 'left' ? '-50%' : '0%';
    controls.start({
      x: [from, to],
      transition: {
        duration: speed,
        ease: 'linear',
        repeat: Infinity,
        repeatType: 'loop',
      },
    });
  };

  return (
    <div
      className={cn('overflow-hidden', className)}
      style={{
        WebkitMaskImage: MASK,
        maskImage: MASK,
      }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <motion.div
        className="flex w-max"
        animate={controls}
      >
        <div className="flex shrink-0 gap-8 pr-8">{children}</div>
        <div className="flex shrink-0 gap-8 pr-8" aria-hidden="true">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
