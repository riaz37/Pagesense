import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CitationChip } from '@/components/ui/CitationChip';

describe('CitationChip', () => {
  it('renders label + page format', () => {
    render(<CitationChip docId="d1" page={3} label="INV-0341" />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent('INV-0341');
    expect(btn).toHaveTextContent('p.3');
  });

  it('click dispatches docId + page via data attrs', async () => {
    const onClick = vi.fn();
    render(<CitationChip docId="d1" page={5} label="X" onClick={onClick} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('data-doc-id', 'd1');
    expect(btn).toHaveAttribute('data-page', '5');
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('has accessible label including page', () => {
    render(<CitationChip docId="d" page={2} label="Contract" />);
    expect(screen.getByRole('button')).toHaveAccessibleName(/page 2/i);
  });
});
