import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PillBadge } from '@/components/ui/PillBadge';
import { StatusPill } from '@/components/ui/StatusPill';

describe('PillBadge', () => {
  it('renders emerald tone by default', () => {
    render(<PillBadge>Indexed</PillBadge>);
    expect(screen.getByText('Indexed').className).toMatch(/badge-emerald-bg/);
  });

  it('applies amber, red, neutral tones', () => {
    const { rerender } = render(<PillBadge tone="amber">w</PillBadge>);
    expect(screen.getByText('w').className).toMatch(/warning-bg/);
    rerender(<PillBadge tone="red">e</PillBadge>);
    expect(screen.getByText('e').className).toMatch(/red-/);
    rerender(<PillBadge tone="neutral">n</PillBadge>);
    expect(screen.getByText('n').className).toMatch(/bg-black\/5/);
  });
});

describe('StatusPill', () => {
  it('renders English labels', () => {
    render(<StatusPill status="indexed" />);
    expect(screen.getByRole('status')).toHaveTextContent('Indexed');
  });

  it('renders Arabic labels when locale=ar', () => {
    render(<StatusPill status="processing" locale="ar" />);
    expect(screen.getByRole('status')).toHaveTextContent('قيد المعالجة');
  });

  it('processing variant has pulse animation', () => {
    render(<StatusPill status="processing" />);
    expect(screen.getByRole('status').className).toMatch(/animate-/);
  });

  it('emits data-status attr', () => {
    render(<StatusPill status="failed" />);
    expect(screen.getByRole('status')).toHaveAttribute('data-status', 'failed');
  });
});
