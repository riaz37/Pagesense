import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Message } from '@/app/[locale]/(app)/chat/_components/Message';
import { renderWithProviders } from '@/tests/helpers/render';
import type { ChatMessage } from '@/lib/api';

const mixedParagraph: ChatMessage = {
  role: 'user',
  content: 'What is the total of فاتورة INV-0341?',
};

describe('Message', () => {
  it('user bubble renders per-paragraph dir="auto" for mixed AR+EN text', async () => {
    await renderWithProviders(<Message message={mixedParagraph} onOpenSource={() => {}} />);
    const paragraph = screen.getByText(/What is the total of/);
    expect(paragraph).toHaveAttribute('dir', 'auto');
  });

  it('assistant message renders cited CitationChips from citedDocIds (inline citations)', async () => {
    const msg: ChatMessage = {
      role: 'assistant',
      content: 'The total is 4,200 SAR.',
      sources: [
        {
          doc_id: 'inv_0341',
          score: 0.9,
          metadata: { document_number: 'INV-0341' },
          page_images: ['p1.jpg'],
          matched_page: 2,
        },
      ],
      citedDocIds: ['inv_0341'],
    };
    await renderWithProviders(<Message message={msg} onOpenSource={() => {}} />);
    const chip = screen.getByRole('button', { name: /page 3/i });
    expect(chip).toHaveTextContent('INV-0341');
    expect(chip).toHaveTextContent('p.3');
  });

  it('chip click dispatches onOpenSource with the cited source', async () => {
    const onOpenSource = vi.fn();
    const source = {
      doc_id: 'inv_1',
      score: 0.8,
      metadata: { document_number: 'INV-1' },
      page_images: ['p.jpg'],
      matched_page: 0,
    };
    const msg: ChatMessage = {
      role: 'assistant',
      content: 'Answer',
      sources: [source],
      citedDocIds: ['inv_1'],
    };
    await renderWithProviders(<Message message={msg} onOpenSource={onOpenSource} />);
    await userEvent.click(screen.getByRole('button', { name: /page 1/i }));
    expect(onOpenSource).toHaveBeenCalledWith(source);
  });

  it('shows streaming indicator when assistant content is empty and streaming', async () => {
    const msg: ChatMessage = { role: 'assistant', content: '', sources: [] };
    await renderWithProviders(<Message message={msg} isStreaming onOpenSource={() => {}} />);
    expect(screen.getByRole('status')).toHaveAccessibleName(/generating response/i);
  });
});
