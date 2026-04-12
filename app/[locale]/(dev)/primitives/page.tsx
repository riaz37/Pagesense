'use client';

import * as React from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Input,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  PillBadge,
  StatusPill,
  CitationChip,
  LanguageToggle,
  Dropzone,
  SourceViewer,
  DocTypeIcon,
  Nav,
  Sidebar,
  TopBar,
} from '@/components/ui';
import type { DocType } from '@/components/ui';

const docTypes: DocType[] = ['invoice', 'contract', 'purchase_order', 'delivery_note', 'quotation', 'form'];
const navItems = [
  { label: 'Chat', href: '#chat', active: true },
  { label: 'Documents', href: '#docs' },
  { label: 'Upload', href: '#upload' },
];
const sidebarItems = [
  { label: 'Chat', href: '#chat', active: true },
  { label: 'Documents', href: '#docs' },
  { label: 'Upload', href: '#upload' },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      data-primitive={id}
      className="space-y-3 border-b border-black/10 py-6 dark:border-white/10"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--text-secondary)]">
        {title}
      </h2>
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </section>
  );
}

export default function PrimitivesPreview() {
  const [lang, setLang] = React.useState<'en' | 'ar'>('en');
  const [sourceOpen, setSourceOpen] = React.useState(false);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Primitives Preview</h1>
        <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
          DESIGN.md §4 + §12 — light/dark × LTR/RTL via theme toggle + /ar route.
        </p>
      </header>

      <Section id="button" title="Button">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button disabled>Disabled</Button>
      </Section>

      <Section id="card" title="Card">
        <Card className="w-[280px]">
          <CardHeader>
            <h3 className="text-base font-semibold">Card title</h3>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-[color:var(--text-secondary)]">
              Whisper border + multi-layer shadow.
            </p>
          </CardBody>
        </Card>
      </Section>

      <Section id="input" title="Input / Textarea">
        <div className="w-64 space-y-2">
          <Input placeholder="Search…" />
          <Textarea placeholder="Long form text" />
        </div>
      </Section>

      <Section id="select" title="Select">
        <div className="w-64">
          <Select defaultValue="invoice">
            <SelectTrigger aria-label="Document type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="purchase_order">Purchase Order</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      <Section id="pill" title="PillBadge / StatusPill">
        <PillBadge>Indexed</PillBadge>
        <PillBadge tone="amber">Warning</PillBadge>
        <PillBadge tone="red">Error</PillBadge>
        <PillBadge tone="neutral">Draft</PillBadge>
        <StatusPill status="indexed" />
        <StatusPill status="processing" />
        <StatusPill status="failed" />
        <StatusPill status="draft" />
        <StatusPill status="indexed" locale="ar" />
      </Section>

      <Section id="citation" title="CitationChip">
        <p className="max-w-prose text-sm">
          Total payable on invoice{' '}
          <CitationChip docId="inv-0341" page={3} label="INV-2024-0341" /> is SAR 12,400.
        </p>
      </Section>

      <Section id="language-toggle" title="LanguageToggle">
        <LanguageToggle value={lang} onValueChange={setLang} />
      </Section>

      <Section id="dropzone" title="Dropzone">
        <div className="w-full max-w-md">
          <Dropzone
            accept=".pdf,image/*"
            label="Drop files here or press Enter to browse"
            description="PDF, PNG, JPG up to 20MB"
            onFiles={() => {
              /* preview only */
            }}
          />
        </div>
      </Section>

      <Section id="source-viewer" title="SourceViewer">
        <Button onClick={() => setSourceOpen(true)}>Open source pane</Button>
        <SourceViewer
          open={sourceOpen}
          onOpenChange={setSourceOpen}
          title="INV-2024-0341.pdf"
        >
          <p className="text-sm">Page 3 — highlighted span preview.</p>
        </SourceViewer>
      </Section>

      <Section id="doc-type-icon" title="DocTypeIcon">
        {docTypes.map((t) => (
          <div key={t} className="flex flex-col items-center gap-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[color:var(--bg-surface-subtle)]">
              <DocTypeIcon type={t} />
            </div>
            <span className="text-xs text-[color:var(--text-secondary)]">{t}</span>
          </div>
        ))}
      </Section>

      <Section id="nav" title="Nav">
        <Nav items={navItems} />
      </Section>

      <Section id="shell" title="Sidebar + TopBar">
        <div className="flex h-[320px] w-full overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
          <Sidebar
            brand={<span className="text-base font-bold">ESAP</span>}
            items={sidebarItems}
          />
          <div className="flex flex-1 flex-col">
            <TopBar
              breadcrumb={<span>Workspace / Chat</span>}
              actions={<LanguageToggle value={lang} onValueChange={setLang} />}
            />
            <div className="flex-1 bg-[color:var(--bg-page)]" />
          </div>
        </div>
      </Section>
    </div>
  );
}
