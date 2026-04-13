import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Composer } from '@/app/[locale]/(app)/chat/_components/Composer';
import { renderWithProviders } from '@/tests/helpers/render';

describe('Composer', () => {
  it('renders bilingual placeholder from chat namespace (EN)', async () => {
    await renderWithProviders(
      <Composer value="" onChange={() => {}} onSubmit={() => {}} />,
      { locale: 'en' },
    );
    expect(screen.getByPlaceholderText(/Ask about your documents/i)).toBeInTheDocument();
  });

  it('renders AR placeholder when locale is ar', async () => {
    await renderWithProviders(
      <Composer value="" onChange={() => {}} onSubmit={() => {}} />,
      { locale: 'ar' },
    );
    expect(screen.getByPlaceholderText(/اسأل عن مستنداتك/)).toBeInTheDocument();
  });

  it('disables send when input is empty', async () => {
    await renderWithProviders(
      <Composer value="" onChange={() => {}} onSubmit={() => {}} />,
    );
    const send = screen.getByRole('button', { name: /send/i });
    expect(send).toBeDisabled();
    expect(send).toHaveAttribute('data-state', 'empty');
  });

  it('enables send when input has text', async () => {
    await renderWithProviders(
      <Composer value="hello" onChange={() => {}} onSubmit={() => {}} />,
    );
    const send = screen.getByRole('button', { name: /send/i });
    expect(send).not.toBeDisabled();
    expect(send).toHaveAttribute('data-state', 'ready');
  });

  it('Enter sends, Shift+Enter does not', async () => {
    const onSubmit = vi.fn();
    await renderWithProviders(
      <Composer value="q" onChange={() => {}} onSubmit={onSubmit} />,
    );
    const textarea = screen.getByRole('textbox');
    textarea.focus();
    await userEvent.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledOnce();
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('does not submit when disabled (streaming)', async () => {
    const onSubmit = vi.fn();
    await renderWithProviders(
      <Composer value="q" onChange={() => {}} onSubmit={onSubmit} disabled isStreaming />,
    );
    const textarea = screen.getByRole('textbox');
    textarea.focus();
    await userEvent.keyboard('{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('mirrors send icon in RTL (AR locale)', async () => {
    await renderWithProviders(
      <Composer value="hello" onChange={() => {}} onSubmit={() => {}} />,
      { locale: 'ar' },
    );
    const send = screen.getByRole('button', { name: /إرسال/ });
    const icon = send.querySelector('svg');
    expect(icon?.getAttribute('style')).toContain('scale(-1, 1)');
  });
});
