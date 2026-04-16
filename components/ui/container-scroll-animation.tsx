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

export function ContainerScroll({
  titleComponent,
  children,
}: ContainerScrollProps): React.ReactElement {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scaleRange: [number, number] = isMobile ? [0.7, 0.9] : [1.05, 1];
  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleRange);
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-[60rem] items-center justify-center md:h-[80rem]"
    >
      <div
        className="relative w-full"
        style={{ perspective: '1000px' }}
      >
        <Header
          translate={translate}
          reduceMotion={prefersReducedMotion ?? false}
        >
          {titleComponent}
        </Header>
        <Card
          rotate={rotate}
          scale={scale}
          reduceMotion={prefersReducedMotion ?? false}
        >
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

const CARD_SHADOW =
  '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003';

function Card({ rotate, scale, reduceMotion, children }: CardProps): React.ReactElement {
  return (
    <motion.div
      style={
        reduceMotion
          ? { boxShadow: CARD_SHADOW }
          : { rotateX: rotate, scale, boxShadow: CARD_SHADOW }
      }
      className="mx-auto mt-10 w-full max-w-5xl overflow-hidden rounded-[30px] shadow-2xl md:mt-16 aspect-[5/3]"
    >
      {children}
    </motion.div>
  );
}
