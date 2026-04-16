import React from 'react';

export const LATIN = 'var(--font-latin)';
export const ARABIC = 'var(--font-arabic)';
export const EMERALD_700 = 'var(--esap-emerald-700)';
export const EMERALD_800 = 'var(--esap-emerald-800)';
export const PANEL_SHADOW =
  'rgba(0,0,0,0.04) 0px 4px 18px, rgba(0,0,0,0.027) 0px 2.025px 7.84688px, rgba(0,0,0,0.02) 0px 0.8px 2.925px, rgba(0,0,0,0.01) 0px 0.175px 1.04062px';

export type Dir = 'ltr' | 'rtl';
export type DocKey = 'invoice' | 'po' | 'dn';

export type Segment =
  | { type: 'text'; text: string }
  | { type: 'chip'; doc: DocKey; label: string };

export interface DocView {
  titleLine: string;
  titleFont: typeof LATIN | typeof ARABIC;
  subtitle: string;
  amountLabel: string;
  amount: string;
  amountFont: typeof LATIN | typeof ARABIC;
}

export interface Content {
  user: string;
  placeholder: string;
  segments: Segment[];
  docs: Record<DocKey, DocView>;
  ariaLabel: string;
}

export const EN_CONTENT: Content = {
  user: 'Does invoice INV-2024-0341 match PO 2024-118 and delivery note DN-0341?',
  placeholder: 'Ask about your documents…',
  segments: [
    { type: 'text', text: 'Yes — invoice total ' },
    { type: 'text', text: 'SAR 42,850.00' },
    { type: 'text', text: ' ' },
    { type: 'chip', doc: 'invoice', label: 'INV-2024-0341 · p.3' },
    { type: 'text', text: ' matches the purchase order amount ' },
    { type: 'chip', doc: 'po', label: 'PO-2024-118 · p.1' },
    { type: 'text', text: ' and goods received on 12 Mar 2024 ' },
    { type: 'chip', doc: 'dn', label: 'DN-0341 · p.1' },
    { type: 'text', text: '.' },
  ],
  docs: {
    invoice: {
      titleLine: 'INVOICE',
      titleFont: LATIN,
      subtitle: 'INV-2024-0341 · p.3',
      amountLabel: 'TOTAL',
      amount: 'SAR 42,850.00',
      amountFont: LATIN,
    },
    po: {
      titleLine: 'PURCHASE ORDER',
      titleFont: LATIN,
      subtitle: 'PO-2024-118 · p.1',
      amountLabel: 'AMOUNT',
      amount: 'SAR 42,850.00',
      amountFont: LATIN,
    },
    dn: {
      titleLine: 'DELIVERY NOTE',
      titleFont: LATIN,
      subtitle: 'DN-0341 · p.1',
      amountLabel: 'RECEIVED',
      amount: '12 Mar 2024',
      amountFont: LATIN,
    },
  },
  ariaLabel:
    'ESAP answering with cited evidence from invoice, purchase order, and delivery note',
};

export const AR_CONTENT: Content = {
  user: 'هل تطابق فاتورة INV-2024-0341 أمر الشراء PO 2024-118 وسند التسليم DN-0341؟',
  placeholder: 'اسأل عن مستنداتك…',
  segments: [
    { type: 'text', text: 'نعم — إجمالي الفاتورة ' },
    { type: 'text', text: '٤٢٬٨٥٠٫٠٠ ريال' },
    { type: 'text', text: ' ' },
    { type: 'chip', doc: 'invoice', label: 'INV-2024-0341 · p.3' },
    { type: 'text', text: ' يطابق قيمة أمر الشراء ' },
    { type: 'chip', doc: 'po', label: 'PO-2024-118 · p.1' },
    { type: 'text', text: ' والبضاعة المستلمة في ١٢ مارس ٢٠٢٤ ' },
    { type: 'chip', doc: 'dn', label: 'DN-0341 · p.1' },
    { type: 'text', text: '.' },
  ],
  docs: {
    invoice: {
      titleLine: 'فاتورة',
      titleFont: ARABIC,
      subtitle: 'INV-2024-0341 · p.3',
      amountLabel: 'الإجمالي',
      amount: '٤٢٬٨٥٠٫٠٠ ريال',
      amountFont: ARABIC,
    },
    po: {
      titleLine: 'أمر شراء',
      titleFont: ARABIC,
      subtitle: 'PO-2024-118 · p.1',
      amountLabel: 'القيمة',
      amount: '٤٢٬٨٥٠٫٠٠ ريال',
      amountFont: ARABIC,
    },
    dn: {
      titleLine: 'سند التسليم',
      titleFont: ARABIC,
      subtitle: 'DN-0341 · p.1',
      amountLabel: 'تاريخ الاستلام',
      amount: '١٢ مارس ٢٠٢٤',
      amountFont: ARABIC,
    },
  },
  ariaLabel:
    'إسأب يجيب بأدلة موثّقة من الفاتورة وأمر الشراء وسند التسليم',
};

export function getContent(dir: Dir): Content {
  return dir === 'rtl' ? AR_CONTENT : EN_CONTENT;
}

export function getChipOrder(segments: Segment[]): DocKey[] {
  const out: DocKey[] = [];
  for (const s of segments) {
    if (s.type === 'chip') out.push(s.doc);
  }
  return out;
}

export function getChipThresholds(segments: Segment[]): number[] {
  const out: number[] = [];
  let running = 0;
  for (const s of segments) {
    if (s.type === 'text') running += s.text.length;
    else out.push(running);
  }
  return out;
}

export function getTotalChars(segments: Segment[]): number {
  return segments.reduce(
    (n, s) => n + (s.type === 'text' ? s.text.length : 0),
    0,
  );
}

export function Caret(): React.ReactElement {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 2,
        height: '1em',
        background: EMERALD_700,
        marginInlineStart: 2,
        verticalAlign: 'text-bottom',
      }}
    />
  );
}

export interface InlineCitationChipProps {
  label: string;
  progress: number;
}

export function InlineCitationChip({
  label,
  progress,
}: InlineCitationChipProps): React.ReactElement {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '2px 8px',
        borderRadius: 9999,
        background: 'var(--badge-emerald-bg)',
        color: 'var(--badge-emerald-text-dark)',
        border: '1px solid rgba(4,120,87,0.18)',
        fontFamily: LATIN,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.01em',
        fontVariantNumeric: 'tabular-nums',
        opacity: clamped,
        transform: `translateY(${(1 - clamped) * 4}px) scale(${0.9 + 0.1 * clamped})`,
        verticalAlign: 'baseline',
        whiteSpace: 'nowrap',
        marginInline: 2,
      }}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <path
          d="M2 1h4l2 2v6H2z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </span>
  );
}

export interface EvidenceDocCardProps {
  dir: Dir;
  doc: DocView;
  cited: boolean;
  pulse: number; // 0..1 momentary pulse
  hold: number; // 0..1 steady cited state
  appearProgress: number; // 0..1 card entrance
}

export function EvidenceDocCard({
  dir,
  doc,
  cited,
  pulse,
  hold,
  appearProgress,
}: EvidenceDocCardProps): React.ReactElement {
  const isRtl = dir === 'rtl';
  const pulseScale = 1 + 0.018 * Math.sin(pulse * Math.PI);
  const borderColor = cited
    ? `rgba(4,120,87,${0.25 + 0.35 * hold})`
    : 'rgba(0,0,0,0.1)';
  const glow = cited
    ? `0 0 ${16 * hold}px rgba(4,120,87,${0.1 * hold})`
    : 'none';
  const highlightBg = cited
    ? `rgba(236,253,245,${0.6 * hold + 0.25 * pulse})`
    : 'transparent';
  const highlightBarL = cited
    ? 'rgba(4,120,87,0.3)'
    : 'rgba(0,0,0,0.08)';
  const highlightBarR = cited
    ? 'rgba(4,120,87,0.48)'
    : 'rgba(0,0,0,0.10)';
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${borderColor}`,
        borderRadius: 10,
        padding: '11px 13px',
        display: 'flex',
        flexDirection: 'column',
        gap: 7,
        direction: dir,
        opacity: appearProgress,
        transform: `translateY(${(1 - appearProgress) * 10}px) scale(${pulseScale})`,
        boxShadow: glow,
        [isRtl ? 'borderInlineEnd' : 'borderInlineStart']: cited
          ? `2px solid ${EMERALD_700}`
          : '2px solid transparent',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          flexDirection: isRtl ? 'row-reverse' : 'row',
          gap: 10,
        }}
      >
        <span
          style={{
            fontFamily: doc.titleFont,
            fontWeight: 700,
            fontSize: 12,
            color: 'var(--text-primary)',
            letterSpacing: doc.titleFont === LATIN ? '0.08em' : 0,
            whiteSpace: 'nowrap',
          }}
        >
          {doc.titleLine}
        </span>
        <span
          style={{
            fontFamily: LATIN,
            fontSize: 10,
            color: 'var(--text-muted)',
            fontVariantNumeric: 'tabular-nums',
            whiteSpace: 'nowrap',
          }}
        >
          {doc.subtitle}
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {[0, 1, 2].map((i) => {
          const isKey = i === 1;
          const rowBg = isKey ? highlightBg : 'transparent';
          const barL = isKey ? highlightBarL : 'rgba(0,0,0,0.08)';
          const barR = isKey ? highlightBarR : 'rgba(0,0,0,0.10)';
          const widths = [90, 110, 80];
          const amountWidths = [32, 44, 28];
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: isRtl ? 'row-reverse' : 'row',
                padding: '4px 6px',
                borderRadius: 4,
                background: rowBg,
                [isRtl ? 'borderInlineEnd' : 'borderInlineStart']:
                  isKey && cited
                    ? `2px solid ${EMERALD_700}`
                    : '2px solid transparent',
              }}
            >
              <span
                style={{
                  height: 5,
                  width: widths[i],
                  maxWidth: '55%',
                  borderRadius: 3,
                  background: barL,
                }}
              />
              <span
                style={{
                  height: 5,
                  width: amountWidths[i],
                  borderRadius: 3,
                  background: barR,
                }}
              />
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: isRtl ? 'row-reverse' : 'row',
          paddingTop: 6,
          borderTop: '1px solid var(--border-default)',
        }}
      >
        <span
          style={{
            fontFamily: doc.amountFont,
            fontSize: 10,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            letterSpacing: doc.amountFont === LATIN ? '0.04em' : 0,
            textTransform: doc.amountFont === LATIN ? 'uppercase' : 'none',
          }}
        >
          {doc.amountLabel}
        </span>
        <span
          style={{
            fontFamily: doc.amountFont,
            fontSize: 11,
            fontWeight: 700,
            color: cited ? EMERALD_800 : 'var(--text-primary)',
            fontVariantNumeric: 'tabular-nums',
            whiteSpace: 'nowrap',
          }}
        >
          {doc.amount}
        </span>
      </div>
    </div>
  );
}

export function TrafficLights({
  align,
}: {
  align: 'start' | 'end';
}): React.ReactElement {
  const dot = (bg: string): React.ReactElement => (
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
      }}
    >
      {dot('rgba(0,0,0,0.14)')}
      {dot('rgba(0,0,0,0.10)')}
      {dot('rgba(0,0,0,0.08)')}
    </div>
  );
}

export function Avatar({
  align,
}: {
  align: 'start' | 'end';
}): React.ReactElement {
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
        color: EMERALD_800,
        fontFamily: LATIN,
        fontWeight: 600,
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      R
    </div>
  );
}

export interface ChatInputViewProps {
  dir: Dir;
  placeholder: string;
  typedText: string;
  showCaret: boolean;
  sendPulse: number;
}

export function ChatInputView({
  dir,
  placeholder,
  typedText,
  showCaret,
  sendPulse,
}: ChatInputViewProps): React.ReactElement {
  const isRtl = dir === 'rtl';
  const hasText = typedText.length > 0;
  const sendActive = sendPulse > 0;
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
          fontFamily: isRtl ? ARABIC : LATIN,
          fontSize: 14,
          lineHeight: 1.4,
          color: hasText ? 'var(--text-primary)' : 'var(--text-muted)',
          direction: dir,
          textAlign: isRtl ? 'right' : 'left',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {hasText ? typedText : placeholder}
        {showCaret ? <Caret /> : null}
      </span>
      <span
        style={{
          width: 30,
          height: 30,
          borderRadius: 9999,
          background: sendActive
            ? `rgba(4,120,87,${0.85 + 0.15 * sendPulse})`
            : hasText
              ? EMERALD_700
              : 'rgba(0,0,0,0.08)',
          color: hasText || sendActive ? '#fff' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${1 + 0.1 * sendPulse})`,
          boxShadow: sendActive
            ? `0 0 ${10 * sendPulse}px rgba(4,120,87,${0.35 * sendPulse})`
            : 'none',
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
