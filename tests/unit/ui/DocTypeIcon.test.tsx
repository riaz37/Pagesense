import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DocTypeIcon } from '@/components/ui/DocTypeIcon';
import type { DocType } from '@/components/ui/DocTypeIcon';

const types: DocType[] = ['invoice', 'contract', 'purchase_order', 'delivery_note', 'quotation', 'form'];

describe('DocTypeIcon', () => {
  it.each(types)('renders %s with accessible label', (t) => {
    render(<DocTypeIcon type={t} />);
    expect(screen.getByRole('img')).toHaveAccessibleName(t.replace(/_/g, ' '));
  });

  it('accepts size override', () => {
    render(<DocTypeIcon type="invoice" size={48} />);
    expect(screen.getByRole('img')).toHaveAttribute('width', '48');
  });
});
