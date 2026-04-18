import { getTranslations } from 'next-intl/server';
import { FileQuestion, Camera, FileScan, Languages, LayoutList, ClipboardList } from 'lucide-react';
import { Card, PillBadge } from '@/components/ui';
import { Reveal } from './animations';

interface ProblemItem {
  title: string;
  desc: string;
}

interface ProblemSectionProps {
  locale: string;
}

const ITEM_ICONS = [FileQuestion, Camera, FileScan, Languages, LayoutList, ClipboardList] as const;

export async function ProblemSection({
  locale,
}: ProblemSectionProps): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: 'marketing' });
  const items = t.raw('problem.items') as ProblemItem[];

  return (
    <section
      id="problem"
      className="relative w-full bg-[color:var(--bg-page)] py-[120px]"
    >
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="mb-16 flex flex-col items-center gap-5 text-center">
          <Reveal variant="fadeUp">
            <PillBadge tone="emerald" size="lg"><span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />{t('problem.eyebrow')}</PillBadge>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.08}>
            <h2
              className="m-0 max-w-[920px] text-[color:var(--text-primary)]"
              style={{
                fontSize: 'clamp(32px, 4.2vw, 48px)',
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-1.5px',
                fontFeatureSettings: '"lnum", "locl"',
              }}
            >
              {t('problem.title')}
            </h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const Icon = ITEM_ICONS[i] ?? FileQuestion;
            return (
              <Reveal
                key={item.title}
                variant="fadeUp"
                delay={i * 0.06}
              >
                <ProblemCard item={item} Icon={Icon} />
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

interface ProblemCardProps {
  item: ProblemItem;
  Icon: typeof FileQuestion;
}

function ProblemCard({ item, Icon }: ProblemCardProps): React.ReactElement {
  return (
    <Card
      className={[
        'group h-full',
        'transition-shadow duration-150 ease-out',
        'hover:shadow-[rgba(0,0,0,0.06)_0px_8px_32px,rgba(0,0,0,0.04)_0px_4px_14px,rgba(0,0,0,0.03)_0px_2px_6px,rgba(0,0,0,0.02)_0px_1px_2px]',
      ].join(' ')}
    >
      <div className="flex h-full flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--badge-emerald-bg)] text-[color:var(--esap-emerald-500)]"
          >
            <Icon size={20} strokeWidth={1.75} />
          </span>
          <span
            className="text-[color:var(--text-primary)]"
            style={{
              fontSize: '18px',
              fontWeight: 700,
              lineHeight: 1.3,
              letterSpacing: '-0.25px',
            }}
          >
            {item.title}
          </span>
        </div>
        <p
          className="mt-auto text-[color:var(--text-secondary)]"
          style={{ fontSize: '15px', fontWeight: 500, lineHeight: 1.5 }}
        >
          {item.desc}
        </p>
      </div>
    </Card>
  );
}
