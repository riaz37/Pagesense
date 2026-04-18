'use client';

import * as React from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';

interface ContainerScrollProps {
  titleComponent: React.ReactNode;
  children: React.ReactNode;
}

const CARD_SHADOW =
  'rgba(0,0,0,0.04) 0 4px 18px, rgba(0,0,0,0.027) 0 2.025px 7.84688px, rgba(0,0,0,0.02) 0 0.8px 2.925px, rgba(0,0,0,0.01) 0 0.175px 1.04062px';

export function ContainerScroll({
  titleComponent,
  children,
}: ContainerScrollProps): React.ReactElement {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = (): void => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scaleRange: [number, number] = isMobile ? [0.85, 1] : [1.05, 1];
  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleRange);
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-[56rem] items-center justify-center md:h-[72rem]"
    >
      <div className="relative w-full" style={{ perspective: '1000px' }}>
        <Header translate={translate} reduceMotion={prefersReducedMotion ?? false}>
          {titleComponent}
        </Header>
        <Card rotate={rotate} scale={scale} reduceMotion={prefersReducedMotion ?? false}>
          {children}
        </Card>
      </div>
    </div>
  );
}

interface HeaderProps {
  translate: MotionValue<number>;
  reduceMotion: boolean;
  children: React.ReactNode;
}

function Header({ translate, reduceMotion, children }: HeaderProps): React.ReactElement {
  return (
    <motion.div
      style={reduceMotion ? undefined : { translateY: translate }}
      className="mx-auto max-w-5xl text-center"
    >
      {children}
    </motion.div>
  );
}

interface CardProps {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  reduceMotion: boolean;
  children: React.ReactNode;
}

function Card({ rotate, scale, reduceMotion, children }: CardProps): React.ReactElement {
  return (
    <motion.div
      style={
        reduceMotion
          ? { boxShadow: CARD_SHADOW }
          : { rotateX: rotate, scale, boxShadow: CARD_SHADOW }
      }
      className="mx-auto mt-10 aspect-[5/3] w-full max-w-[1100px] overflow-hidden rounded-[24px] border border-[color:var(--border-default)] bg-[color:var(--bg-surface)] md:mt-16"
    >
      {children}
    </motion.div>
  );
}
