import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

describe('LanguageToggle', () => {
  it('marks active language with aria-pressed / data-state', () => {
    render(<LanguageToggle value="en" />);
    const en = screen.getByRole('radio', { name: 'English' });
    expect(en).toHaveAttribute('data-state', 'on');
    const ar = screen.getByRole('radio', { name: 'Arabic' });
    expect(ar).toHaveAttribute('data-state', 'off');
  });

  it('fires onValueChange on click', async () => {
    const onChange = vi.fn();
    render(<LanguageToggle value="en" onValueChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Arabic' }));
    expect(onChange).toHaveBeenCalledWith('ar');
  });
});
