import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SourceViewer } from '@/components/ui/SourceViewer';

describe('SourceViewer', () => {
  it('renders title + content when open', () => {
    render(
      <SourceViewer open onOpenChange={() => {}} title="INV-0341.pdf">
        <p>Page 3</p>
      </SourceViewer>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('INV-0341.pdf')).toBeInTheDocument();
    expect(screen.getByText('Page 3')).toBeInTheDocument();
  });

  it('close button calls onOpenChange(false)', async () => {
    const onOpenChange = vi.fn();
    render(
      <SourceViewer open onOpenChange={onOpenChange} title="t">
        content
      </SourceViewer>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders nothing when closed', () => {
    render(
      <SourceViewer open={false} onOpenChange={() => {}} title="t">
        x
      </SourceViewer>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
