import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input, Textarea } from '@/components/ui/Input';

describe('Input', () => {
  it('accepts typing', async () => {
    render(<Input aria-label="Search" />);
    const input = screen.getByLabelText('Search');
    await userEvent.type(input, 'hello');
    expect(input).toHaveValue('hello');
  });

  it('disabled blocks input', async () => {
    render(<Input aria-label="X" disabled />);
    expect(screen.getByLabelText('X')).toBeDisabled();
  });
});

describe('Textarea', () => {
  it('accepts multiline', async () => {
    render(<Textarea aria-label="notes" />);
    const ta = screen.getByLabelText('notes');
    await userEvent.type(ta, 'a{Enter}b');
    expect(ta).toHaveValue('a\nb');
  });
});
