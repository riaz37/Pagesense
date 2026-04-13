import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RetryBanner } from '@/app/[locale]/(app)/chat/_components/RetryBanner';
import { renderWithProviders } from '@/tests/helpers/render';

describe('RetryBanner', () => {
  it('announces via role=alert (D5: SSE disconnect UX)', async () => {
    await renderWithProviders(<RetryBanner onRetry={() => {}} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders EN copy by default', async () => {
    await renderWithProviders(<RetryBanner onRetry={() => {}} />, { locale: 'en' });
    expect(screen.getByRole('alert')).toHaveTextContent(/connection lost/i);
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('renders AR copy', async () => {
    await renderWithProviders(<RetryBanner onRetry={() => {}} />, { locale: 'ar' });
    expect(screen.getByRole('alert')).toHaveTextContent(/انقطع الاتصال/);
  });

  it('fires onRetry when CTA clicked', async () => {
    const onRetry = vi.fn();
    await renderWithProviders(<RetryBanner onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
