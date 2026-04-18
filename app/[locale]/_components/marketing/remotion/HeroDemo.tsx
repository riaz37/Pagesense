import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  ARABIC,
  Avatar,
  Caret,
  ChatInputView,
  EMERALD_700,
  EvidenceDocCard,
  InlineCitationChip,
  LATIN,
  TrafficLights,
  getChipOrder,
  getChipThresholds,
  getContent,
  getTotalChars,
  type Dir,
  type DocKey,
  type Segment,
} from './HeroShared';

export const HERO_DEMO_FPS = 30;
export const HERO_DEMO_DURATION_IN_FRAMES = 240;
export const HERO_DEMO_COMPOSITION_WIDTH = 1200;
export const HERO_DEMO_COMPOSITION_HEIGHT = 720;

const STREAM_START = 82;
const STREAM_END = 220;
const INPUT_START = 12;
const INPUT_END = 42;
const SEND_FRAME = 44;
const BUBBLE_START = 48;
const DOTS_START = 62;
const DOTS_END = 80;
const RAIL_BASE = 52;
const FADE_OUT_START = 232;

interface HeroDemoProps {
  dir: Dir;
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
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: 9999,
        background: 'var(--text-muted)',
        display: 'inline-block',
        opacity: 0.35 + 0.55 * amp(offset),
        transform: `translateY(${-2 * amp(offset)}px)`,
      }}
    />
  );
  return (
    <div style={{ display: 'flex', justifyContent: dir === 'rtl' ? 'flex-end' : 'flex-start' }}>
      <div
        style={{
          display: 'inline-flex',
          gap: 5,
          alignItems: 'center',
          padding: '10px 14px',
          borderRadius: 12,
          background: 'rgba(0,0,0,0.04)',
        }}
      >
        {dotAt(0)}
        {dotAt(0.15)}
        {dotAt(0.3)}
      </div>
    </div>
  );
}

interface UserBubbleProps {
  text: string;
  dir: Dir;
  opacity: number;
  translate: number;
}

function UserBubble({ text, dir, opacity, translate }: UserBubbleProps): React.ReactElement {
  const isRtl = dir === 'rtl';
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        width: '100%',
        opacity,
        transform: `translateY(${translate}px)`,
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
        {text}
      </div>
    </div>
  );
}

interface StreamedAnswerProps {
  segments: Segment[];
  visibleChars: number;
  dir: Dir;
  chipProgress: number[];
  showCaret: boolean;
}

function StreamedAnswer({
  segments,
  visibleChars,
  dir,
  chipProgress,
  showCaret,
}: StreamedAnswerProps): React.ReactElement {
  const isRtl = dir === 'rtl';
  let consumed = 0;
  let chipIdx = 0;
  const out: React.ReactNode[] = [];

  segments.forEach((seg, i) => {
    if (seg.type === 'text') {
      const segLen = seg.text.length;
      if (visibleChars > consumed) {
        const remaining = visibleChars - consumed;
        const chunk = seg.text.slice(0, Math.min(remaining, segLen));
        const isAmount = i === 1;
        out.push(
          <span
            key={`t-${i}`}
            style={{
              fontFamily: isRtl ? ARABIC : LATIN,
              color: isAmount ? EMERALD_700 : 'var(--text-primary)',
              fontWeight: isAmount ? 700 : 400,
              fontVariantNumeric: isAmount ? 'tabular-nums' : 'normal',
            }}
          >
            {chunk}
          </span>,
        );
      }
      consumed += segLen;
    } else {
      const prog = chipProgress[chipIdx] ?? 0;
      if (prog > 0) {
        out.push(<InlineCitationChip key={`c-${i}`} label={seg.label} progress={prog} />);
      }
      chipIdx += 1;
    }
  });

  if (showCaret) {
    out.push(<Caret key="caret" />);
  }

  return <>{out}</>;
}

function HeroDemo({ dir }: HeroDemoProps): React.ReactElement {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const content = getContent(dir);
  const userFont = dir === 'rtl' ? ARABIC : LATIN;

  const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
  const easeOutCubic = { ...clamp, easing: Easing.out(Easing.cubic) };

  const inputTyped = useTypewriter(content.user, INPUT_START, INPUT_END);
  const inputActive = frame >= INPUT_START && frame < INPUT_END + 2;
  const sendPulse = interpolate(frame, [SEND_FRAME - 2, SEND_FRAME, SEND_FRAME + 6], [0, 1, 0], easeOutCubic);

  const bubbleSpring = spring({
    frame: frame - BUBBLE_START,
    fps,
    config: { damping: 16, stiffness: 200, mass: 0.6 },
  });
  const bubbleOpacity = interpolate(bubbleSpring, [0, 1], [0, 1]);
  const bubbleTranslate = interpolate(bubbleSpring, [0, 1], [10, 0]);

  const dotsVisible = frame >= DOTS_START && frame < DOTS_END;

  const totalChars = getTotalChars(content.segments);
  const thresholds = getChipThresholds(content.segments);
  const chipOrder = getChipOrder(content.segments);
  const streamSpan = STREAM_END - STREAM_START;

  const visibleChars = (() => {
    if (frame < STREAM_START) return 0;
    if (frame >= STREAM_END) return totalChars;
    const progress = (frame - STREAM_START) / streamSpan;
    return Math.floor(progress * totalChars);
  })();

  const chipStartFrames = thresholds.map((t) => {
    if (totalChars === 0) return STREAM_START;
    return STREAM_START + (t / totalChars) * streamSpan;
  });

  const chipProgress = chipStartFrames.map((start) =>
    interpolate(frame, [start, start + 10], [0, 1], clamp),
  );

  const pulseByDoc: Record<DocKey, number> = { invoice: 0, po: 0, dn: 0 };
  const holdByDoc: Record<DocKey, number> = { invoice: 0, po: 0, dn: 0 };
  chipOrder.forEach((doc, i) => {
    const start = chipStartFrames[i];
    const pulse = interpolate(frame, [start, start + 10, start + 28], [0, 1, 0], easeOutCubic);
    const hold = interpolate(frame, [start, start + 18], [0, 1], clamp);
    pulseByDoc[doc] = Math.max(pulseByDoc[doc], pulse);
    holdByDoc[doc] = Math.max(holdByDoc[doc], hold);
  });

  const docKeys: DocKey[] = ['invoice', 'po', 'dn'];
  const railAppear: Record<DocKey, number> = {
    invoice: interpolate(frame, [RAIL_BASE, RAIL_BASE + 14], [0, 1], easeOutCubic),
    po: interpolate(frame, [RAIL_BASE + 6, RAIL_BASE + 20], [0, 1], easeOutCubic),
    dn: interpolate(frame, [RAIL_BASE + 12, RAIL_BASE + 26], [0, 1], easeOutCubic),
  };

  const blinkPeriod = Math.max(1, Math.round(fps * 0.6));
  const blinkHalf = Math.max(1, Math.round(fps * 0.3));
  const caretBlink = Math.floor((frame % blinkPeriod) / blinkHalf) === 0;
  const asstTyping = frame >= STREAM_START && frame < STREAM_END;

  const sceneOpacity = interpolate(
    frame,
    [0, 8, FADE_OUT_START, HERO_DEMO_DURATION_IN_FRAMES],
    [0, 1, 1, 0],
    easeOutCubic,
  );

  const chatIsLeft = dir === 'ltr';

  return (
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(180deg, var(--bg-surface-subtle) 0%, var(--bg-surface) 100%)',
        fontFamily: LATIN,
        opacity: sceneOpacity,
        direction: dir,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          position: 'relative',
          height: 44,
          flexShrink: 0,
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-surface)',
        }}
      >
        <TrafficLights align={dir === 'rtl' ? 'end' : 'start'} />
        <span
          style={{
            fontFamily: LATIN,
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            letterSpacing: '0.01em',
          }}
        >
          ESAP · Chat
        </span>
        <Avatar align={dir === 'rtl' ? 'start' : 'end'} />
      </div>

      <div
        style={{
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: chatIsLeft ? 'row' : 'row-reverse',
          minHeight: 0,
        }}
      >
        <div
          style={{
            flex: '0 0 58%',
            padding: '26px 28px 86px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            direction: dir,
            overflow: 'hidden',
          }}
        >
          {frame >= BUBBLE_START ? (
            <UserBubble text={content.user} dir={dir} opacity={bubbleOpacity} translate={bubbleTranslate} />
          ) : null}

          {dotsVisible ? <TypingDots frame={frame - DOTS_START} fps={fps} dir={dir} /> : null}

          {frame >= STREAM_START ? (
            <div
              style={{
                width: '100%',
                direction: dir,
                textAlign: 'start',
                fontFamily: userFont,
                fontSize: 16,
                lineHeight: 1.65,
                color: 'var(--text-primary)',
              }}
            >
              <StreamedAnswer
                segments={content.segments}
                visibleChars={visibleChars}
                dir={dir}
                chipProgress={chipProgress}
                showCaret={asstTyping && caretBlink}
              />
            </div>
          ) : null}

          <ChatInputView
            dir={dir}
            placeholder={content.placeholder}
            typedText={frame >= SEND_FRAME ? '' : inputTyped}
            showCaret={inputActive && caretBlink}
            sendPulse={sendPulse}
          />
        </div>

        <div style={{ width: 1, background: 'var(--border-default)', alignSelf: 'stretch' }} />

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
              cited={holdByDoc[key] > 0.02}
              pulse={pulseByDoc[key]}
              hold={holdByDoc[key]}
              appearProgress={railAppear[key]}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}

export default HeroDemo;
