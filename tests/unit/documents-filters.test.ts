import { describe, expect, it } from 'vitest';
import {
  applyFilters,
  detectLanguage,
  filterReducer,
  initialFilterState,
  isFilterActive,
  isMoreFilterActive,
  parseFilters,
  serializeFilters,
  uniqueCurrencies,
  uniqueIssuers,
  uniqueTypes,
} from '@/app/[locale]/(app)/documents/_state/filters';
import type { DocumentMeta } from '@/lib/api';

const docs: DocumentMeta[] = [
  {
    doc_id: 'inv_001',
    document_type: 'invoice',
    document_date: '2024-03-12',
    document_number: 'INV-001',
    issuer_name: 'Saudi Aramco',
    recipient_name: 'شركة المقاول',
    total_amount: 12500,
    currency: 'SAR',
    page_count: 2,
    source_file: 'invoice-001.pdf',
  },
  {
    doc_id: 'inv_002',
    document_type: 'invoice',
    document_date: '2024-05-04',
    document_number: 'INV-002',
    issuer_name: 'Acme Co',
    recipient_name: 'Beta LLC',
    total_amount: 8400,
    currency: 'USD',
    page_count: 1,
    source_file: 'invoice-002.pdf',
  },
  {
    doc_id: 'po_010',
    document_type: 'purchase_order',
    document_date: '2023-11-22',
    document_number: 'PO-010',
    issuer_name: 'شركة المقاول',
    recipient_name: 'Saudi Aramco',
    total_amount: 250000,
    currency: 'SAR',
    page_count: 8,
    source_file: 'po-010.pdf',
  },
];

describe('filterReducer', () => {
  it('toggles a type filter', () => {
    const after = filterReducer(initialFilterState, { type: 'toggleType', value: 'invoice' });
    expect(after.types).toEqual(['invoice']);
    const back = filterReducer(after, { type: 'toggleType', value: 'invoice' });
    expect(back.types).toEqual([]);
  });

  it('updates search', () => {
    const next = filterReducer(initialFilterState, { type: 'setSearch', value: 'aramco' });
    expect(next.search).toBe('aramco');
  });

  it('toggleSort flips direction when same column', () => {
    const a = filterReducer({ ...initialFilterState, sortBy: 'amount', sortDir: 'asc' }, {
      type: 'toggleSort',
      column: 'amount',
    });
    expect(a.sortDir).toBe('desc');
    const b = filterReducer(a, { type: 'toggleSort', column: 'amount' });
    expect(b.sortDir).toBe('asc');
  });

  it('toggleSort resets direction when switching columns', () => {
    const a = filterReducer({ ...initialFilterState, sortBy: 'date', sortDir: 'desc' }, {
      type: 'toggleSort',
      column: 'amount',
    });
    expect(a.sortBy).toBe('amount');
    expect(a.sortDir).toBe('asc');
  });

  it('clearAll resets to initial state', () => {
    const dirty = filterReducer(initialFilterState, { type: 'setSearch', value: 'x' });
    expect(filterReducer(dirty, { type: 'clearAll' })).toEqual(initialFilterState);
  });

  it('clearMore wipes only popover-managed filters', () => {
    const state = filterReducer(initialFilterState, {
      type: 'setDateRange',
      from: '2024-01-01',
      to: '2024-12-31',
    });
    const withType = filterReducer(state, { type: 'toggleType', value: 'invoice' });
    const cleared = filterReducer(withType, { type: 'clearMore' });
    expect(cleared.dateFrom).toBeNull();
    expect(cleared.dateTo).toBeNull();
    expect(cleared.types).toEqual(['invoice']);
  });
});

describe('serializeFilters / parseFilters', () => {
  it('round-trips state through URL params', () => {
    const state = {
      ...initialFilterState,
      search: 'aramco',
      types: ['invoice', 'purchase_order'],
      status: 'indexed' as const,
      language: 'ar' as const,
      dateFrom: '2024-01-01',
      dateTo: '2024-12-31',
      issuer: 'Saudi Aramco',
      currency: 'SAR',
      pageMin: 1,
      pageMax: 10,
      amountMin: 100,
      amountMax: 500000,
      sortBy: 'amount' as const,
      sortDir: 'asc' as const,
    };
    const params = serializeFilters(state);
    expect(parseFilters(params)).toEqual(state);
  });

  it('omits axes that match defaults', () => {
    const params = serializeFilters(initialFilterState);
    expect(params.toString()).toBe('');
  });

  it('rejects invalid status / language values', () => {
    const params = new URLSearchParams('status=bogus&lang=fr&sort=evil&dir=sideways');
    const state = parseFilters(params);
    expect(state.status).toBeNull();
    expect(state.language).toBeNull();
    expect(state.sortBy).toBe(initialFilterState.sortBy);
    expect(state.sortDir).toBe(initialFilterState.sortDir);
  });
});

describe('isFilterActive / isMoreFilterActive', () => {
  it('reports false for initial state', () => {
    expect(isFilterActive(initialFilterState)).toBe(false);
    expect(isMoreFilterActive(initialFilterState)).toBe(false);
  });

  it('detects active search', () => {
    expect(isFilterActive({ ...initialFilterState, search: 'foo' })).toBe(true);
  });

  it('isMoreFilterActive ignores chip-rail axes', () => {
    expect(isMoreFilterActive({ ...initialFilterState, types: ['invoice'] })).toBe(false);
    expect(isMoreFilterActive({ ...initialFilterState, currency: 'SAR' })).toBe(true);
  });
});

describe('detectLanguage', () => {
  it('detects mixed AR + EN as both', () => {
    expect(detectLanguage(docs[0])).toBe('both');
  });

  it('detects pure English as en', () => {
    expect(detectLanguage(docs[1])).toBe('en');
  });
});

describe('applyFilters', () => {
  it('filters by type', () => {
    const result = applyFilters(docs, { ...initialFilterState, types: ['invoice'] });
    expect(result.map((d) => d.doc_id)).toEqual(['inv_002', 'inv_001']);
  });

  it('filters by search across multiple fields', () => {
    const result = applyFilters(docs, { ...initialFilterState, search: 'aramco' });
    expect(result.map((d) => d.doc_id).sort()).toEqual(['inv_001', 'po_010']);
  });

  it('filters by date range', () => {
    const result = applyFilters(docs, {
      ...initialFilterState,
      dateFrom: '2024-01-01',
      dateTo: '2024-12-31',
    });
    expect(result.map((d) => d.doc_id).sort()).toEqual(['inv_001', 'inv_002']);
  });

  it('filters by currency case-insensitively', () => {
    const result = applyFilters(docs, { ...initialFilterState, currency: 'sar' });
    expect(result.every((d) => d.currency === 'SAR')).toBe(true);
  });

  it('filters by page range', () => {
    const result = applyFilters(docs, { ...initialFilterState, pageMin: 5 });
    expect(result.map((d) => d.doc_id)).toEqual(['po_010']);
  });

  it('filters by amount range', () => {
    const min = applyFilters(docs, { ...initialFilterState, amountMin: 10000 });
    expect(min.map((d) => d.doc_id).sort()).toEqual(['inv_001', 'po_010']);
    const max = applyFilters(docs, { ...initialFilterState, amountMax: 10000 });
    expect(max.map((d) => d.doc_id)).toEqual(['inv_002']);
    const both = applyFilters(docs, {
      ...initialFilterState,
      amountMin: 10000,
      amountMax: 100000,
    });
    expect(both.map((d) => d.doc_id)).toEqual(['inv_001']);
  });

  it('sorts by amount descending then ascending', () => {
    const desc = applyFilters(docs, { ...initialFilterState, sortBy: 'amount', sortDir: 'desc' });
    expect(desc[0].doc_id).toBe('po_010');
    const asc = applyFilters(docs, { ...initialFilterState, sortBy: 'amount', sortDir: 'asc' });
    expect(asc[0].doc_id).toBe('inv_002');
  });
});

describe('uniqueX helpers', () => {
  it('extracts unique sorted currencies', () => {
    expect(uniqueCurrencies(docs)).toEqual(['SAR', 'USD']);
  });

  it('extracts unique sorted issuers', () => {
    expect(uniqueIssuers(docs)).toEqual(['Acme Co', 'Saudi Aramco', 'شركة المقاول']);
  });

  it('extracts unique sorted types', () => {
    expect(uniqueTypes(docs)).toEqual(['invoice', 'purchase_order']);
  });
});
