import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders primary variant by default', () => {
    render(<Button>Go</Button>);
    const btn = screen.getByRole('button', { name: 'Go' });
    expect(btn).toBeInTheDocument();
    expect(btn.className).toMatch(/esap-emerald/);
  });

  it('applies secondary and ghost variants', () => {
    const { rerender } = render(<Button variant="secondary">S</Button>);
    expect(screen.getByRole('button').className).toMatch(/border-\[color:var\(--border-default\)\]/);
    expect(screen.getByRole('button').className).toMatch(/bg-\[color:var\(--bg-surface\)\]/);
    rerender(<Button variant="ghost">G</Button>);
    expect(screen.getByRole('button').className).toMatch(/bg-transparent/);
    expect(screen.getByRole('button').className).toMatch(/border-\[color:var\(--border-default\)\]/);
  });

  it('disabled prevents click', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        X
      </Button>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('asChild delegates rendering via Slot', () => {
    render(
      <Button asChild>
        <a href="https://example.com">Link</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Link' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link.className).toMatch(/esap-emerald/);
  });

  it('fires click on Enter via keyboard', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>K</Button>);
    const btn = screen.getByRole('button');
    btn.focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalled();
  });
});
