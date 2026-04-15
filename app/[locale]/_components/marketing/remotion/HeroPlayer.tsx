'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/cn';
import {
  HERO_DEMO_COMPOSITION_HEIGHT,
  HERO_DEMO_COMPOSITION_WIDTH,
  HERO_DEMO_DURATION_IN_FRAMES,
  HERO_DEMO_FPS,
} from './HeroDemo';

const LATIN_FONT = 'var(--font-latin)';
const ARABIC_FONT = 'var(--font-arabic)';
const PANEL_SHADOW =
  'rgba(0,0,0,0.04) 0px 4px 18px, rgba(0,0,0,0.027) 0px 2.025px 7.84688px, rgba(0,0,0,0.02) 0px 0.8px 2.925px, rgba(0,0,0,0.01) 0px 0.175px 1.04062px';

interface HeroPlayerProps {
  dir: 'ltr' | 'rtl';
  className?: string;
}

// Lazy-load the Remotion Player (browser-only bundle) and the composition.
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
          component={HeroDemo as unknown as React.ComponentType<Record<string, unknown>>}
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
        // While the reduced-motion media query is resolving, show the static
        // frame to avoid a Player flash for users who prefer reduced motion.
        <StaticHeroFrame dir={dir} />
      )}
    </div>
  );
}

interface StaticHeroFrameProps {
  dir: 'ltr' | 'rtl';
}

function StaticHeroFrame({ dir }: StaticHeroFrameProps): React.ReactElement {
  const chatIsLeft = dir === 'ltr';
  const isRtl = dir === 'rtl';
  const userText = isRtl
    ? 'ما إجمالي فاتورة INV-2024-0341؟'
    : 'What is the total on invoice INV-2024-0341?';
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
        padding: '5%',
        direction: dir,
      }}
      aria-label="ESAP answering a bilingual invoice question"
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
        {/* Header */}
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
          <StaticTrafficLights align={dir === 'rtl' ? 'end' : 'start'} />
          <span
            style={{
              fontFamily: LATIN_FONT,
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}
          >
            ESAP · Chat
          </span>
          <StaticAvatar align={dir === 'rtl' ? 'start' : 'end'} />
        </div>

        {/* Body */}
        <div
          style={{
            position: 'relative',
            height: 'calc(100% - 44px)',
            display: 'flex',
            flexDirection: chatIsLeft ? 'row' : 'row-reverse',
          }}
        >
          {/* Chat */}
          <div
            style={{
              position: 'relative',
              flex: '0 0 60%',
              padding: '28px 32px 88px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              direction: dir,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: dir === 'rtl' ? 'flex-start' : 'flex-end',
                width: '100%',
              }}
            >
              <div
                style={{
                  maxWidth: '80%',
                  background: 'rgba(0,0,0,0.04)',
                  borderRadius: 12,
                  padding: '12px 14px',
                  color: 'var(--text-primary)',
                  fontFamily: isRtl ? ARABIC_FONT : LATIN_FONT,
                  fontSize: 16,
                  lineHeight: 1.6,
                  direction: dir,
                  textAlign: isRtl ? 'right' : 'left',
                }}
              >
                {userText}
              </div>
            </div>

            <div
              style={{
                width: '100%',
                direction: dir,
                textAlign: 'start',
                fontFamily: isRtl ? ARABIC_FONT : LATIN_FONT,
                fontSize: 17,
                lineHeight: 1.55,
                color: 'var(--text-primary)',
              }}
            >
              {isRtl ? (
                <span style={{ fontFamily: ARABIC_FONT }}>
                  الإجمالي:{' '}
                  <strong
                    style={{
                      color: 'var(--esap-emerald-700)',
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    42,850.00 ريال
                  </strong>{' '}
                  شامل ضريبة القيمة المضافة ١٥٪.
                </span>
              ) : (
                <span style={{ fontFamily: LATIN_FONT }}>
                  Total:{' '}
                  <strong
                    style={{
                      color: 'var(--esap-emerald-700)',
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    SAR 42,850.00
                  </strong>{' '}
                  incl. 15% VAT.
                </span>
              )}

              <div style={{ marginTop: 18, display: 'flex' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 10px',
                    borderRadius: 9999,
                    background: 'var(--badge-emerald-bg)',
                    color: 'var(--badge-emerald-text-dark)',
                    border: '1px solid rgba(4,120,87,0.15)',
                    fontFamily: LATIN_FONT,
                    fontSize: 12,
                    fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 1h4l2 2v6H2z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                  </svg>
                  INV-2024-0341 · p.3
                </span>
              </div>
            </div>

            <StaticChatInput dir={dir} placeholder={isRtl ? 'اسأل عن مستنداتك…' : 'Ask about your documents…'} />
          </div>

          <div
            style={{
              width: 1,
              background: 'var(--border-default)',
              alignSelf: 'stretch',
            }}
          />

          {/* Invoice */}
          <div
            style={{
              flex: '1 1 auto',
              background: 'var(--bg-surface-subtle)',
              direction: 'ltr',
              padding: '24px 20px',
            }}
          >
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 8,
                boxShadow: 'rgba(0,0,0,0.04) 0px 4px 18px',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <StaticInvoiceHeader dir={dir} />

              <div
                style={{
                  height: 1,
                  background: 'var(--border-default)',
                  opacity: 0.6,
                }}
              />

              <StaticInvoiceRows dir={dir} />

              <div
                style={{
                  height: 1,
                  background: 'var(--border-default)',
                  opacity: 0.4,
                  marginTop: 4,
                }}
              />

              <div
                style={{
                  display: 'flex',
                  flexDirection: dir === 'rtl' ? 'row-reverse' : 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: isRtl ? ARABIC_FONT : LATIN_FONT,
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    letterSpacing: isRtl ? 0 : '0.04em',
                  }}
                >
                  {isRtl ? 'الإجمالي' : 'TOTAL'}
                </span>
                <span
                  style={{
                    fontFamily: isRtl ? ARABIC_FONT : LATIN_FONT,
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {isRtl ? '42,850.00 ريال' : 'SAR 42,850.00'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AlignProps {
  align: 'start' | 'end';
}

function StaticTrafficLights({ align }: AlignProps): React.ReactElement {
  const dot = (bg: string) => (
    <span
      style={{
        width: 11,
        height: 11,
        borderRadius: 9999,
        background: bg,
        display: 'inline-block',
      }}
    />
  );
  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        [align === 'start' ? 'insetInlineStart' : 'insetInlineEnd']: 18,
        display: 'flex',
        gap: 7,
        alignItems: 'center',
      }}
    >
      {dot('rgba(0,0,0,0.14)')}
      {dot('rgba(0,0,0,0.10)')}
      {dot('rgba(0,0,0,0.08)')}
    </div>
  );
}

function StaticAvatar({ align }: AlignProps): React.ReactElement {
  return (
    <div
      style={{
        position: 'absolute',
        top: 6,
        [align === 'start' ? 'insetInlineStart' : 'insetInlineEnd']: 12,
        width: 32,
        height: 32,
        borderRadius: 9999,
        background: 'var(--esap-emerald-100)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--esap-emerald-800)',
        fontFamily: LATIN_FONT,
        fontWeight: 600,
        fontSize: 13,
      }}
    >
      R
    </div>
  );
}

interface DirOnlyProps {
  dir: 'ltr' | 'rtl';
}

function StaticInvoiceHeader({ dir }: DirOnlyProps): React.ReactElement {
  const isRtl = dir === 'rtl';
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        alignItems: isRtl ? 'flex-end' : 'flex-start',
      }}
    >
      {isRtl ? (
        <span
          style={{
            fontFamily: ARABIC_FONT,
            fontWeight: 700,
            fontSize: 15,
            color: 'var(--text-primary)',
          }}
        >
          فاتورة
        </span>
      ) : (
        <span
          style={{
            fontFamily: LATIN_FONT,
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: '0.08em',
            color: 'var(--text-primary)',
          }}
        >
          INVOICE
        </span>
      )}
      <span
        style={{
          fontFamily: LATIN_FONT,
          fontSize: 10,
          color: 'var(--text-muted)',
          marginTop: 2,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        INV-2024-0341 · p.3
      </span>
    </div>
  );
}

function StaticInvoiceRows({ dir }: DirOnlyProps): React.ReactElement {
  const rows = [
    { w: 180, amountW: 70, highlighted: false },
    { w: 210, amountW: 80, highlighted: true },
    { w: 160, amountW: 60, highlighted: false },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rows.map((row, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            flexDirection: dir === 'rtl' ? 'row-reverse' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            borderRadius: 4,
            background: row.highlighted
              ? 'var(--badge-emerald-bg)'
              : 'transparent',
            [dir === 'rtl' ? 'borderInlineEnd' : 'borderInlineStart']:
              row.highlighted
                ? '2px solid var(--esap-emerald-700)'
                : '2px solid transparent',
          }}
        >
          <span
            style={{
              height: 8,
              width: row.w,
              maxWidth: '55%',
              borderRadius: 3,
              background: row.highlighted
                ? 'rgba(4,120,87,0.22)'
                : 'rgba(0,0,0,0.08)',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              height: 8,
              width: row.amountW,
              borderRadius: 3,
              background: row.highlighted
                ? 'rgba(4,120,87,0.34)'
                : 'rgba(0,0,0,0.10)',
              display: 'inline-block',
            }}
          />
        </div>
      ))}
    </div>
  );
}

interface StaticChatInputProps {
  dir: 'ltr' | 'rtl';
  placeholder: string;
}

function StaticChatInput({ dir, placeholder }: StaticChatInputProps): React.ReactElement {
  const isRtl = dir === 'rtl';
  return (
    <div
      style={{
        position: 'absolute',
        insetInlineStart: 20,
        insetInlineEnd: 20,
        bottom: 18,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        borderRadius: 14,
        background: 'var(--bg-surface-subtle)',
        border: '1px solid var(--border-default)',
        boxShadow: 'rgba(0,0,0,0.03) 0px 1px 2px',
        direction: dir,
      }}
    >
      <span
        style={{
          flex: 1,
          minWidth: 0,
          fontFamily: isRtl ? ARABIC_FONT : LATIN_FONT,
          fontSize: 14,
          lineHeight: 1.4,
          color: 'var(--text-muted)',
          direction: dir,
          textAlign: isRtl ? 'right' : 'left',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {placeholder}
      </span>
      <span
        style={{
          width: 30,
          height: 30,
          borderRadius: 9999,
          background: 'rgba(0,0,0,0.08)',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          aria-hidden="true"
          style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }}
        >
          <path
            d="M2 6 L10 6 M6 2 L10 6 L6 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}
