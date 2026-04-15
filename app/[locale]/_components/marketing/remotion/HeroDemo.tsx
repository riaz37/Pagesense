import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const HERO_DEMO_FPS = 30;
export const HERO_DEMO_DURATION_IN_FRAMES = 180;
export const HERO_DEMO_COMPOSITION_WIDTH = 1200;
export const HERO_DEMO_COMPOSITION_HEIGHT = 720;

const LATIN = 'var(--font-latin)';
const ARABIC = 'var(--font-arabic)';
const PANEL_SHADOW =
  'rgba(0,0,0,0.04) 0px 4px 18px, rgba(0,0,0,0.027) 0px 2.025px 7.84688px, rgba(0,0,0,0.02) 0px 0.8px 2.925px, rgba(0,0,0,0.01) 0px 0.175px 1.04062px';

const CONTENT = {
  ltr: {
    user: 'What is the total on invoice INV-2024-0341?',
    prefix: 'Total: ',
    amount: 'SAR 42,850.00',
    suffix: ' incl. 15% VAT.',
    placeholder: 'Ask about your documents…',
  },
  rtl: {
    user: 'ما إجمالي فاتورة INV-2024-0341؟',
    prefix: 'الإجمالي: ',
    amount: '42,850.00 ريال',
    suffix: ' شامل ضريبة القيمة المضافة ١٥٪.',
    placeholder: 'اسأل عن مستنداتك…',
  },
} as const;

type Dir = 'ltr' | 'rtl';
type Align = 'start' | 'end';

interface HeroDemoProps {
  dir: Dir;
}

const dot = (bg: string): React.ReactElement => (
  <span style={{ width: 11, height: 11, borderRadius: 9999, background: bg, display: 'inline-block' }} />
);

function TrafficLights({ align }: { align: Align }): React.ReactElement {
  return (
    <div style={{ position: 'absolute', top: 16, [align === 'start' ? 'insetInlineStart' : 'insetInlineEnd']: 18, display: 'flex', gap: 7 }}>
      {dot('rgba(0,0,0,0.14)')}{dot('rgba(0,0,0,0.10)')}{dot('rgba(0,0,0,0.08)')}
    </div>
  );
}

function Avatar({ align }: { align: Align }): React.ReactElement {
  return (
    <div style={{
      position: 'absolute', top: 6,
      [align === 'start' ? 'insetInlineStart' : 'insetInlineEnd']: 12,
      width: 32, height: 32, borderRadius: 9999,
      background: 'var(--esap-emerald-100)',
      color: 'var(--esap-emerald-800)',
      fontFamily: LATIN, fontWeight: 600, fontSize: 13,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>R</div>
  );
}

function InvoiceHeader({ dir }: { dir: Dir }): React.ReactElement {
  const isRtl = dir === 'rtl';
  const title = isRtl ? (
    <span style={{ fontFamily: ARABIC, fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>فاتورة</span>
  ) : (
    <span style={{ fontFamily: LATIN, fontWeight: 700, fontSize: 15, letterSpacing: '0.08em', color: 'var(--text-primary)' }}>INVOICE</span>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
      {title}
      <span style={{ fontFamily: LATIN, fontSize: 10, color: 'var(--text-muted)', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
        INV-2024-0341 · p.3
      </span>
    </div>
  );
}

interface InvoiceMockProps {
  dir: Dir;
  highlightOpacity: number;
  highlightGlow: number;
}

const ROWS: Array<{ w: number; a: number; hi?: boolean }> = [
  { w: 180, a: 70 },
  { w: 210, a: 80, hi: true },
  { w: 160, a: 60 },
];

function InvoiceMock({ dir, highlightOpacity, highlightGlow }: InvoiceMockProps): React.ReactElement {
  const borderSide = dir === 'rtl' ? 'borderInlineEnd' : 'borderInlineStart';
  return (
    <div style={{ width: '100%', height: '100%', padding: '24px 20px' }}>
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
        borderRadius: 8, boxShadow: 'rgba(0,0,0,0.04) 0px 4px 18px',
        padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <InvoiceHeader dir={dir} />
        <div style={{ height: 1, background: 'var(--border-default)', opacity: 0.6 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ROWS.map((row, i) => {
            const hi = row.hi === true;
            const active = hi && highlightOpacity > 0;
            return (
              <div key={i} style={{
                display: 'flex', flexDirection: dir === 'rtl' ? 'row-reverse' : 'row',
                alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 10px', borderRadius: 4,
                background: hi ? `rgba(236, 253, 245, ${highlightOpacity})` : 'transparent',
                [borderSide]: active ? '2px solid var(--esap-emerald-700)' : '2px solid transparent',
                boxShadow: hi && highlightGlow > 0 ? `0 0 ${12 * highlightGlow}px rgba(4,120,87,${0.18 * highlightGlow})` : 'none',
              }}>
                <span style={{ height: 8, width: row.w, maxWidth: '55%', borderRadius: 3, background: hi ? 'rgba(4,120,87,0.22)' : 'rgba(0,0,0,0.08)', display: 'inline-block' }} />
                <span style={{ height: 8, width: row.a, borderRadius: 3, background: hi ? 'rgba(4,120,87,0.34)' : 'rgba(0,0,0,0.10)', display: 'inline-block' }} />
              </div>
            );
          })}
        </div>
        <div style={{ height: 1, background: 'var(--border-default)', opacity: 0.4, marginTop: 4 }} />
        <div style={{ display: 'flex', flexDirection: dir === 'rtl' ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: dir === 'rtl' ? ARABIC : LATIN, fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: dir === 'rtl' ? 0 : '0.04em' }}>
            {dir === 'rtl' ? 'الإجمالي' : 'TOTAL'}
          </span>
          <span style={{ fontFamily: dir === 'rtl' ? ARABIC : LATIN, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {dir === 'rtl' ? '42,850.00 ريال' : 'SAR 42,850.00'}
          </span>
        </div>
      </div>
    </div>
  );
}

interface ChatBubbleProps {
  children: React.ReactNode;
  variant: 'user' | 'assistant';
  dir: Dir;
}

function ChatBubble({ children, variant, dir }: ChatBubbleProps): React.ReactElement {
  const isRtl = dir === 'rtl';
  if (variant === 'assistant') {
    return (
      <div style={{
        width: '100%',
        direction: dir,
        textAlign: 'start',
        fontFamily: isRtl ? ARABIC : LATIN,
        fontSize: 17,
        lineHeight: 1.55,
        color: 'var(--text-primary)',
      }}>
        {children}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
      <div style={{
        maxWidth: '80%', background: 'rgba(0,0,0,0.04)', borderRadius: 12,
        padding: '12px 14px', color: 'var(--text-primary)',
        fontFamily: isRtl ? ARABIC : LATIN, fontSize: 16, lineHeight: 1.6,
        direction: dir, textAlign: isRtl ? 'right' : 'left', whiteSpace: 'pre-wrap',
      }}>{children}</div>
    </div>
  );
}

function Caret(): React.ReactElement {
  return <span style={{ display: 'inline-block', width: 2, height: '1em', background: 'var(--esap-emerald-700)', marginInlineStart: 2, verticalAlign: 'text-bottom' }} />;
}

interface AssistantStreamProps {
  text: string;
  showCaret: boolean;
  prefixLen: number;
  amountLen: number;
  dir: Dir;
}

function AssistantStream({ text, showCaret, prefixLen, amountLen, dir }: AssistantStreamProps): React.ReactElement {
  const pEnd = prefixLen;
  const aEnd = pEnd + amountLen;
  const len = text.length;
  const prefix = text.slice(0, Math.min(len, pEnd));
  const amount = text.slice(Math.min(len, pEnd), Math.min(len, aEnd));
  const suffix = text.slice(Math.min(len, aEnd));
  return (
    <span style={{ fontFamily: dir === 'rtl' ? ARABIC : LATIN }}>
      <span>{prefix}</span>
      <strong style={{ color: 'var(--esap-emerald-700)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{amount}</strong>
      <span>{suffix}</span>
      {showCaret ? <Caret /> : null}
    </span>
  );
}

function useTypewriter(text: string, startFrame: number, endFrame: number): string {
  const frame = useCurrentFrame();
  if (frame < startFrame) return '';
  if (frame >= endFrame) return text;
  const progress = (frame - startFrame) / (endFrame - startFrame);
  return text.slice(0, Math.floor(progress * text.length));
}

interface TypingDotsProps {
  frame: number;
  fps: number;
  dir: Dir;
}

function TypingDots({ frame, fps, dir }: TypingDotsProps): React.ReactElement {
  const period = Math.max(1, Math.round(fps * 0.9));
  const phase = (frame % period) / period;
  const amp = (offset: number): number => {
    const p = (phase + offset) % 1;
    return Math.max(0, Math.sin(p * Math.PI));
  };
  const dotAt = (offset: number): React.ReactElement => (
    <span style={{
      width: 6, height: 6, borderRadius: 9999,
      background: 'var(--text-muted)',
      display: 'inline-block',
      opacity: 0.35 + 0.55 * amp(offset),
      transform: `translateY(${-2 * amp(offset)}px)`,
    }} />
  );
  return (
    <div style={{ display: 'flex', justifyContent: dir === 'rtl' ? 'flex-end' : 'flex-start' }}>
      <div style={{
        display: 'inline-flex', gap: 5, alignItems: 'center',
        padding: '10px 14px', borderRadius: 12,
        background: 'rgba(0,0,0,0.04)',
      }}>
        {dotAt(0)}
        {dotAt(0.15)}
        {dotAt(0.3)}
      </div>
    </div>
  );
}

interface ChatInputProps {
  dir: Dir;
  typedText: string;
  showCaret: boolean;
  sendPulse: number;
  placeholder: string;
}

function ChatInput({ dir, typedText, showCaret, sendPulse, placeholder }: ChatInputProps): React.ReactElement {
  const isRtl = dir === 'rtl';
  const hasText = typedText.length > 0;
  const sendActive = sendPulse > 0;
  return (
    <div style={{
      position: 'absolute', insetInlineStart: 20, insetInlineEnd: 20, bottom: 18,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', borderRadius: 14,
      background: 'var(--bg-surface-subtle)',
      border: '1px solid var(--border-default)',
      boxShadow: 'rgba(0,0,0,0.03) 0px 1px 2px',
      direction: dir,
    }}>
      <span style={{
        flex: 1, minWidth: 0,
        fontFamily: isRtl ? ARABIC : LATIN,
        fontSize: 14, lineHeight: 1.4,
        color: hasText ? 'var(--text-primary)' : 'var(--text-muted)',
        direction: dir, textAlign: isRtl ? 'right' : 'left',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {hasText ? typedText : placeholder}
        {showCaret ? <Caret /> : null}
      </span>
      <span style={{
        width: 30, height: 30, borderRadius: 9999,
        background: sendActive
          ? `rgba(4,120,87,${0.85 + 0.15 * sendPulse})`
          : hasText ? 'var(--esap-emerald-700)' : 'rgba(0,0,0,0.08)',
        color: hasText || sendActive ? '#fff' : 'var(--text-muted)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: `scale(${1 + 0.1 * sendPulse})`,
        boxShadow: sendActive ? `0 0 ${10 * sendPulse}px rgba(4,120,87,${0.35 * sendPulse})` : 'none',
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }}>
          <path d="M2 6 L10 6 M6 2 L10 6 L6 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}

function CitationChip(): React.ReactElement {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 10px', borderRadius: 9999,
      background: 'var(--badge-emerald-bg)', color: 'var(--badge-emerald-text-dark)',
      border: '1px solid rgba(4,120,87,0.15)',
      fontFamily: LATIN, fontSize: 12, fontWeight: 600,
      letterSpacing: '0.01em', fontVariantNumeric: 'tabular-nums',
    }}>
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
        <path d="M2 1h4l2 2v6H2z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
      INV-2024-0341 · p.3
    </span>
  );
}

function HeroDemo({ dir }: HeroDemoProps): React.ReactElement {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const content = CONTENT[dir];
  const userFont = dir === 'rtl' ? ARABIC : LATIN;
  const fullAnswer = content.prefix + content.amount + content.suffix;

  // Phase timeline:
  // 10-32 user types in input bar, 33 send pulse, 35 bubble drops in chat,
  // 38-50 typing dots, 50-120 answer streams, 125+ citation + highlight.
  const inputTyped = useTypewriter(content.user, 10, 32);
  const inputActive = frame >= 10 && frame < 34;
  const bubbleStart = 35;
  const bubbleVisible = frame >= bubbleStart;
  const dotsVisible = frame >= 38 && frame < 50;
  const asstText = useTypewriter(fullAnswer, 50, 120);
  const asstTyping = frame >= 50 && frame < 120;

  const blinkPeriod = Math.max(1, Math.round(fps * 0.6));
  const blinkHalf = Math.max(1, Math.round(fps * 0.3));
  const caretBlink = Math.floor((frame % blinkPeriod) / blinkHalf) === 0;

  const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
  const easeOutCubic = { ...clamp, easing: Easing.out(Easing.cubic) };

  const sendPulse = interpolate(frame, [32, 34, 38], [0, 1, 0], easeOutCubic);
  const bubbleSpring = spring({ frame: frame - bubbleStart, fps, config: { damping: 16, stiffness: 200, mass: 0.6 } });
  const bubbleOpacity = interpolate(bubbleSpring, [0, 1], [0, 1]);
  const bubbleTranslate = interpolate(bubbleSpring, [0, 1], [10, 0]);

  const chipSpring = spring({ frame: frame - 125, fps, config: { damping: 14, stiffness: 160, mass: 0.6 } });
  const chipOpacity = interpolate(frame, [125, 140], [0, 1], clamp);
  const chipTranslate = interpolate(chipSpring, [0, 1], [8, 0]);
  const chipScale = interpolate(chipSpring, [0, 1], [0.9, 1]);

  const highlightOpacity = interpolate(frame, [125, 145], [0, 1], easeOutCubic);
  const pulse = interpolate(Math.sin(((frame - 130) / 25) * Math.PI), [-1, 1], [0.35, 1]);
  const highlightGlow = frame >= 130 ? Math.max(0.35, pulse) : 0;

  const sceneOpacity = interpolate(frame, [0, 8, 170, 180], [0, 1, 1, 0], easeOutCubic);
  const panelRise = interpolate(frame, [0, 20], [14, 0], easeOutCubic);

  const chatIsLeft = dir === 'ltr';

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(180deg, var(--bg-surface-subtle) 0%, var(--bg-surface) 100%)',
      fontFamily: LATIN,
    }}>
      <AbsoluteFill style={{
        opacity: 0.03, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle at 50% 42%, rgba(4,120,87,0.45) 0%, rgba(4,120,87,0) 55%)',
      }} />

      <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: sceneOpacity }}>
        <div style={{
          width: 900, height: 560, borderRadius: 20,
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
          boxShadow: PANEL_SHADOW, overflow: 'hidden', position: 'relative',
          transform: `translateY(${panelRise}px)`, direction: dir,
        }}>
          <div style={{
            position: 'relative', height: 44,
            borderBottom: '1px solid var(--border-default)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-surface)',
          }}>
            <TrafficLights align={dir === 'rtl' ? 'end' : 'start'} />
            <span style={{ fontFamily: LATIN, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.01em' }}>
              ESAP · Chat
            </span>
            <Avatar align={dir === 'rtl' ? 'start' : 'end'} />
          </div>

          <div style={{ position: 'relative', height: 516, display: 'flex', flexDirection: chatIsLeft ? 'row' : 'row-reverse' }}>
            <div style={{
              position: 'relative',
              flex: '0 0 60%', padding: '28px 32px 88px',
              display: 'flex', flexDirection: 'column', gap: 20, direction: dir,
            }}>
              {bubbleVisible ? (
                <div style={{ opacity: bubbleOpacity, transform: `translateY(${bubbleTranslate}px)` }}>
                  <ChatBubble variant="user" dir={dir}>
                    <span style={{ fontFamily: userFont }}>{content.user}</span>
                  </ChatBubble>
                </div>
              ) : null}

              {dotsVisible ? (
                <TypingDots frame={frame - 38} fps={fps} dir={dir} />
              ) : null}

              {frame >= 50 ? (
                <ChatBubble variant="assistant" dir={dir}>
                  <AssistantStream
                    text={asstText}
                    showCaret={asstTyping && caretBlink}
                    prefixLen={content.prefix.length}
                    amountLen={content.amount.length}
                    dir={dir}
                  />
                  <div style={{
                    marginTop: 18, display: 'flex',
                    opacity: chipOpacity,
                    transform: `translateY(${chipTranslate}px) scale(${chipScale})`,
                  }}>
                    <CitationChip />
                  </div>
                </ChatBubble>
              ) : null}

              <ChatInput
                dir={dir}
                typedText={frame >= 34 ? '' : inputTyped}
                showCaret={inputActive && caretBlink}
                sendPulse={sendPulse}
                placeholder={content.placeholder}
              />
            </div>

            <div style={{ width: 1, background: 'var(--border-default)', alignSelf: 'stretch' }} />

            <div style={{ flex: '1 1 auto', background: 'var(--bg-surface-subtle)', direction: 'ltr' }}>
              <InvoiceMock dir={dir} highlightOpacity={highlightOpacity} highlightGlow={highlightGlow} />
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export default HeroDemo;
