'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/cn';
import {
  ARABIC,
  Avatar,
  ChatInputView,
  EvidenceDocCard,
  InlineCitationChip,
  LATIN,
  PANEL_SHADOW,
  TrafficLights,
  getContent,
  type Dir,
  type DocKey,
} from './HeroShared';
import {
  HERO_DEMO_COMPOSITION_HEIGHT,
  HERO_DEMO_COMPOSITION_WIDTH,
  HERO_DEMO_DURATION_IN_FRAMES,
  HERO_DEMO_FPS,
} from './HeroDemo';

interface HeroPlayerProps {
  dir: Dir;
  className?: string;
}

const Player = dynamic(
  async () => {
    const mod = await import('@remotion/player');
    return { default: mod.Player };
  },
  { ssr: false },
);

const HeroDemo = dynamic(() => import('./HeroDemo'), { ssr: false });

export default function HeroPlayer({
  dir,
  className,
}: HeroPlayerProps): React.ReactElement {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={cn(
        'relative w-full max-w-[900px] mx-auto aspect-[5/3]',
        className,
      )}
    >
      {!mounted || prefersReducedMotion === true ? (
        <StaticHeroFrame dir={dir} />
      ) : prefersReducedMotion === false ? (
        <Player
          component={
            HeroDemo as unknown as React.ComponentType<Record<string, unknown>>
          }
          inputProps={{ dir } as Record<string, unknown>}
          durationInFrames={HERO_DEMO_DURATION_IN_FRAMES}
          compositionWidth={HERO_DEMO_COMPOSITION_WIDTH}
          compositionHeight={HERO_DEMO_COMPOSITION_HEIGHT}
          fps={HERO_DEMO_FPS}
          autoPlay
          loop
          controls={false}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '20px',
            overflow: 'hidden',
          }}
        />
      ) : (
        <StaticHeroFrame dir={dir} />
      )}
    </div>
  );
}

interface StaticHeroFrameProps {
  dir: Dir;
}

function StaticHeroFrame({ dir }: StaticHeroFrameProps): React.ReactElement {
  const content = getContent(dir);
  const chatIsLeft = dir === 'ltr';
  const isRtl = dir === 'rtl';
  const docKeys: DocKey[] = ['invoice', 'po', 'dn'];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 20,
        overflow: 'hidden',
        background:
          'linear-gradient(180deg, var(--bg-surface-subtle) 0%, var(--bg-surface) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4%',
        direction: dir,
      }}
      aria-label={content.ariaLabel}
      role="img"
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          backgroundImage:
            'radial-gradient(circle at 50% 42%, rgba(4,120,87,0.45) 0%, rgba(4,120,87,0) 55%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          width: '100%',
          height: '100%',
          maxWidth: 900,
          maxHeight: 560,
          aspectRatio: '900 / 560',
          borderRadius: 20,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: PANEL_SHADOW,
          overflow: 'hidden',
          position: 'relative',
          direction: dir,
        }}
      >
        <div
          style={{
            position: 'relative',
            height: 44,
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-surface)',
          }}
        >
          <TrafficLights align={isRtl ? 'end' : 'start'} />
          <span
            style={{
              fontFamily: LATIN,
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}
          >
            ESAP · Chat
          </span>
          <Avatar align={isRtl ? 'start' : 'end'} />
        </div>

        <div
          style={{
            position: 'relative',
            height: 'calc(100% - 44px)',
            display: 'flex',
            flexDirection: chatIsLeft ? 'row' : 'row-reverse',
          }}
        >
          <div
            style={{
              position: 'relative',
              flex: '0 0 58%',
              padding: '26px 28px 86px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              direction: dir,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                width: '100%',
              }}
            >
              <div
                style={{
                  maxWidth: '82%',
                  background: 'rgba(0,0,0,0.04)',
                  borderRadius: 12,
                  padding: '12px 14px',
                  color: 'var(--text-primary)',
                  fontFamily: isRtl ? ARABIC : LATIN,
                  fontSize: 16,
                  lineHeight: 1.55,
                  direction: dir,
                  textAlign: isRtl ? 'right' : 'left',
                }}
              >
                {content.user}
              </div>
            </div>

            <div
              style={{
                width: '100%',
                direction: dir,
                textAlign: 'start',
                fontFamily: isRtl ? ARABIC : LATIN,
                fontSize: 16,
                lineHeight: 1.65,
                color: 'var(--text-primary)',
              }}
            >
              <StaticAnswer dir={dir} />
            </div>

            <ChatInputView
              dir={dir}
              placeholder={content.placeholder}
              typedText=""
              showCaret={false}
              sendPulse={0}
            />
          </div>

          <div
            style={{
              width: 1,
              background: 'var(--border-default)',
              alignSelf: 'stretch',
            }}
          />

          <div
            style={{
              flex: '1 1 auto',
              background: 'var(--bg-surface-subtle)',
              direction: dir,
              padding: '20px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              overflow: 'hidden',
            }}
          >
            {docKeys.map((key) => (
              <EvidenceDocCard
                key={key}
                dir={dir}
                doc={content.docs[key]}
                cited
                pulse={0}
                hold={1}
                appearProgress={1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StaticAnswer({ dir }: { dir: Dir }): React.ReactElement {
  const content = getContent(dir);
  const isRtl = dir === 'rtl';
  const nodes: React.ReactNode[] = [];
  content.segments.forEach((seg, i) => {
    if (seg.type === 'text') {
      const isAmount = i === 1;
      nodes.push(
        <span
          key={`t-${i}`}
          style={{
            fontFamily: isRtl ? ARABIC : LATIN,
            color: isAmount ? 'var(--esap-emerald-700)' : 'var(--text-primary)',
            fontWeight: isAmount ? 700 : 400,
            fontVariantNumeric: isAmount ? 'tabular-nums' : 'normal',
          }}
        >
          {seg.text}
        </span>,
      );
    } else {
      nodes.push(
        <InlineCitationChip key={`c-${i}`} label={seg.label} progress={1} />,
      );
    }
  });
  return <>{nodes}</>;
}
