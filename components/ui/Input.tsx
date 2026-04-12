import * as React from 'react';
import { cn } from '@/lib/cn';

const baseField = [
  'w-full rounded-[4px] border border-[color:var(--border-input)] bg-[color:var(--bg-input)]',
  'px-3 py-2 text-[color:var(--text-primary)] text-[15px] leading-[1.5]',
  'placeholder:text-[color:var(--text-tertiary)]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
  'focus-visible:border-transparent',
  'disabled:cursor-not-allowed disabled:opacity-60',
].join(' ');

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input ref={ref} type={type} className={cn(baseField, className)} {...props} />
  ),
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(baseField, 'min-h-[96px] resize-y', className)}
    {...props}
  />
));
Textarea.displayName = 'Textarea';
