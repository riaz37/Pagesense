'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

interface TocItem {
  id: string;
  label: string;
}

interface LegalTocProps {
  label: string;
  items: TocItem[];
}

export function LegalToc({ label, items }: LegalTocProps): React.ReactElement {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return undefined;

    const visibility = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target.id, entry.intersectionRatio);
        }

        let bestId: string | null = null;
        let bestTop = Number.POSITIVE_INFINITY;
        for (const section of sections) {
          const ratio = visibility.get(section.id) ?? 0;
          if (ratio <= 0) continue;
          const top = section.getBoundingClientRect().top;
          if (top < bestTop) {
            bestTop = top;
            bestId = section.id;
          }
        }

        if (bestId) {
          setActiveId(bestId);
          return;
        }

        const viewportTop = 0;
        let fallbackId: string | null = sections[0]?.id ?? null;
        for (const section of sections) {
          if (section.getBoundingClientRect().top <= viewportTop + 120) {
            fallbackId = section.id;
          }
        }
        if (fallbackId) setActiveId(fallbackId);
      },
      {
        rootMargin: '-96px 0px -60% 0px',
        threshold: [0, 0.25, 0.5, 1],
      },
    );

    sections.forEach((section) => observer.observe(section));

    const onScroll = (): void => {
      let topmost: string | null = sections[0]?.id ?? null;
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 120) topmost = section.id;
        else break;
      }
      if (topmost) setActiveId(topmost);
    };
    onScroll();

    return () => observer.disconnect();
  }, [items]);

  const handleClick = (id: string) => (event: React.MouseEvent<HTMLAnchorElement>): void => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    setActiveId(id);
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  return (
    <nav aria-label={label}>
      <p
        className="m-0 uppercase text-[color:var(--text-muted)]"
        style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.125px' }}
      >
        {label}
      </p>
      <ul className="relative mt-3 m-0 flex list-none flex-col gap-0.5 p-0 border-s border-[color:var(--border-default)]">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <li key={item.id} className="relative">
              <span
                aria-hidden="true"
                className={cn(
                  'absolute inset-y-1 start-[-1px] w-[2px] rounded-full',
                  'transition-[background-color,opacity] duration-200 ease-out',
                  isActive
                    ? 'bg-[color:var(--focus-emerald,#059669)] opacity-100'
                    : 'bg-transparent opacity-0',
                )}
              />
              <a
                href={`#${item.id}`}
                onClick={handleClick(item.id)}
                aria-current={isActive ? 'location' : undefined}
                className={cn(
                  'block ps-4 pe-2 py-1.5 text-[14px] leading-snug',
                  'transition-colors duration-150 ease-out',
                  isActive
                    ? 'font-semibold text-[color:var(--text-primary)]'
                    : 'font-medium text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]',
                )}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
