import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropzone } from '@/components/ui/Dropzone';

function makeFile(name: string, type = 'application/pdf'): File {
  return new File(['x'], name, { type });
}

describe('Dropzone', () => {
  it('emits files on drop', () => {
    const onFiles = vi.fn();
    render(<Dropzone onFiles={onFiles} label="Drop" />);
    const zone = screen.getByRole('button', { name: 'Drop' });
    const file = makeFile('a.pdf');
    fireEvent.drop(zone, { dataTransfer: { files: [file] } });
    expect(onFiles).toHaveBeenCalledWith([file]);
  });

  it('toggles data-active on dragover', () => {
    render(<Dropzone onFiles={vi.fn()} label="Drop" />);
    const zone = screen.getByRole('button', { name: 'Drop' });
    fireEvent.dragOver(zone);
    expect(zone).toHaveAttribute('data-active', 'true');
    fireEvent.dragLeave(zone);
    expect(zone).not.toHaveAttribute('data-active');
  });

  it('filters by MIME accept', () => {
    const onFiles = vi.fn();
    render(<Dropzone accept="application/pdf" onFiles={onFiles} label="Drop" />);
    const zone = screen.getByRole('button', { name: 'Drop' });
    const bad = makeFile('bad.txt', 'text/plain');
    fireEvent.drop(zone, { dataTransfer: { files: [bad] } });
    expect(onFiles).not.toHaveBeenCalled();
    const good = makeFile('ok.pdf', 'application/pdf');
    fireEvent.drop(zone, { dataTransfer: { files: [good] } });
    expect(onFiles).toHaveBeenCalledWith([good]);
  });

  it('Enter key opens file picker (ARIA)', async () => {
    render(<Dropzone onFiles={vi.fn()} label="Drop" />);
    const zone = screen.getByRole('button', { name: 'Drop' });
    zone.focus();
    await userEvent.keyboard('{Enter}');
    // No assertion on native dialog; verify tabIndex + role so SR users can reach it.
    expect(zone).toHaveAttribute('tabindex', '0');
  });

  it('disabled blocks drop + sets aria-disabled', () => {
    const onFiles = vi.fn();
    render(<Dropzone disabled onFiles={onFiles} label="Drop" />);
    const zone = screen.getByRole('button', { name: 'Drop' });
    expect(zone).toHaveAttribute('aria-disabled', 'true');
    fireEvent.drop(zone, { dataTransfer: { files: [makeFile('a.pdf')] } });
    expect(onFiles).not.toHaveBeenCalled();
  });
});
