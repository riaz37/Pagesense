import * as React from 'react';
import { cn } from '@/lib/cn';

export type DocType =
  | 'invoice'
  | 'contract'
  | 'purchase_order'
  | 'delivery_note'
  | 'quotation'
  | 'form'
  | 'approval'
  | 'quantity_survey'
  | 'other';

const paths: Record<DocType, React.ReactNode> = {
  invoice: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1" strokeWidth="1.5" />
      <path d="M8 8h8M8 12h8M8 16h5" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  contract: (
    <>
      <path d="M6 3h9l4 4v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" strokeWidth="1.5" />
      <path d="M15 3v4h4M8 14l2 2 4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  purchase_order: (
    <>
      <path d="M4 6h16l-2 12H6L4 6z" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="9" cy="21" r="1" strokeWidth="1.5" />
      <circle cx="17" cy="21" r="1" strokeWidth="1.5" />
    </>
  ),
  delivery_note: (
    <>
      <rect x="3" y="7" width="13" height="10" rx="1" strokeWidth="1.5" />
      <path d="M16 10h4l1 3v4h-5V10z" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="7" cy="18" r="1.5" strokeWidth="1.5" />
      <circle cx="18" cy="18" r="1.5" strokeWidth="1.5" />
    </>
  ),
  quotation: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1" strokeWidth="1.5" />
      <path d="M9 9c0-1 .5-2 2-2M13 9c0-1 .5-2 2-2M8 14h8M8 18h5" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  form: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="1.5" strokeWidth="1.5" />
      <path d="M8 9h3M8 13h3M8 17h3M14 9h3M14 13h3" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  approval: (
    <>
      <path d="M6 3h9l4 4v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" strokeWidth="1.5" />
      <circle cx="12" cy="14" r="3" strokeWidth="1.5" />
      <path d="M12 11v3l2 1" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  quantity_survey: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="1" strokeWidth="1.5" />
      <path d="M4 10h16M10 4v16" strokeWidth="1.5" />
      <path d="M14 14h3M14 17h3" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  other: (
    <>
      <path d="M6 3h9l4 4v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" strokeWidth="1.5" />
      <path d="M15 3v4h4" strokeWidth="1.5" />
    </>
  ),
};

export function isDocType(value: string): value is DocType {
  return value in paths;
}

export function asDocType(value: string | undefined | null): DocType {
  if (value && isDocType(value)) return value;
  return 'other';
}

export interface DocTypeIconProps extends React.SVGAttributes<SVGSVGElement> {
  type: DocType;
  size?: number;
}

export function DocTypeIcon({ type, size = 24, className, ...props }: DocTypeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={type.replace(/_/g, ' ')}
      className={cn('text-[color:var(--text-primary)]', className)}
      {...props}
    >
      {paths[type]}
    </svg>
  );
}
