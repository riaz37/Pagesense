import type { DocumentMeta } from '@/lib/api';

export type DocStatus = 'indexed' | 'processing' | 'failed' | 'draft';
export type DocLanguage = 'ar' | 'en' | 'both';
export type ViewMode = 'grid' | 'table';

export type SortColumn = 'document' | 'issuer' | 'date' | 'amount' | 'pages';
export type SortDirection = 'asc' | 'desc';

export interface FilterState {
  search: string;
  types: string[];
  status: DocStatus | null;
  language: DocLanguage | null;
  dateFrom: string | null;
  dateTo: string | null;
  issuer: string | null;
  currency: string | null;
  pageMin: number | null;
  pageMax: number | null;
  amountMin: number | null;
  amountMax: number | null;
  sortBy: SortColumn;
  sortDir: SortDirection;
}

export const initialFilterState: FilterState = {
  search: '',
  types: [],
  status: null,
  language: null,
  dateFrom: null,
  dateTo: null,
  issuer: null,
  currency: null,
  pageMin: null,
  pageMax: null,
  amountMin: null,
  amountMax: null,
  sortBy: 'date',
  sortDir: 'desc',
};

export type FilterAction =
  | { type: 'setSearch'; value: string }
  | { type: 'toggleType'; value: string }
  | { type: 'setTypes'; value: string[] }
  | { type: 'setStatus'; value: DocStatus | null }
  | { type: 'setLanguage'; value: DocLanguage | null }
  | { type: 'setDateRange'; from: string | null; to: string | null }
  | { type: 'setIssuer'; value: string | null }
  | { type: 'setCurrency'; value: string | null }
  | { type: 'setPageRange'; min: number | null; max: number | null }
  | { type: 'setAmountRange'; min: number | null; max: number | null }
  | { type: 'setSort'; column: SortColumn; direction: SortDirection }
  | { type: 'toggleSort'; column: SortColumn }
  | { type: 'clearMore' }
  | { type: 'clearAll' }
  | { type: 'replace'; value: FilterState };

export function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'setSearch':
      return { ...state, search: action.value };
    case 'toggleType': {
      const has = state.types.includes(action.value);
      return {
        ...state,
        types: has ? state.types.filter((t) => t !== action.value) : [...state.types, action.value],
      };
    }
    case 'setTypes':
      return { ...state, types: action.value };
    case 'setStatus':
      return { ...state, status: action.value };
    case 'setLanguage':
      return { ...state, language: action.value };
    case 'setDateRange':
      return { ...state, dateFrom: action.from, dateTo: action.to };
    case 'setIssuer':
      return { ...state, issuer: action.value };
    case 'setCurrency':
      return { ...state, currency: action.value };
    case 'setPageRange':
      return { ...state, pageMin: action.min, pageMax: action.max };
    case 'setAmountRange':
      return { ...state, amountMin: action.min, amountMax: action.max };
    case 'setSort':
      return { ...state, sortBy: action.column, sortDir: action.direction };
    case 'toggleSort': {
      if (state.sortBy === action.column) {
        return { ...state, sortDir: state.sortDir === 'asc' ? 'desc' : 'asc' };
      }
      return { ...state, sortBy: action.column, sortDir: 'asc' };
    }
    case 'clearMore':
      return {
        ...state,
        dateFrom: null,
        dateTo: null,
        issuer: null,
        currency: null,
        pageMin: null,
        pageMax: null,
        amountMin: null,
        amountMax: null,
      };
    case 'clearAll':
      return { ...initialFilterState };
    case 'replace':
      return action.value;
    default:
      return state;
  }
}

export function isFilterActive(state: FilterState): boolean {
  return (
    state.search.trim() !== '' ||
    state.types.length > 0 ||
    state.status !== null ||
    state.language !== null ||
    state.dateFrom !== null ||
    state.dateTo !== null ||
    state.issuer !== null ||
    state.currency !== null ||
    state.pageMin !== null ||
    state.pageMax !== null ||
    state.amountMin !== null ||
    state.amountMax !== null
  );
}

export function isMoreFilterActive(state: FilterState): boolean {
  return (
    state.dateFrom !== null ||
    state.dateTo !== null ||
    state.issuer !== null ||
    state.currency !== null ||
    state.pageMin !== null ||
    state.pageMax !== null ||
    state.amountMin !== null ||
    state.amountMax !== null
  );
}

export function serializeFilters(state: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.search.trim()) params.set('q', state.search.trim());
  if (state.types.length > 0) params.set('type', state.types.join(','));
  if (state.status) params.set('status', state.status);
  if (state.language) params.set('lang', state.language);
  if (state.dateFrom) params.set('from', state.dateFrom);
  if (state.dateTo) params.set('to', state.dateTo);
  if (state.issuer) params.set('issuer', state.issuer);
  if (state.currency) params.set('currency', state.currency);
  if (state.pageMin !== null) params.set('pmin', String(state.pageMin));
  if (state.pageMax !== null) params.set('pmax', String(state.pageMax));
  if (state.amountMin !== null) params.set('amin', String(state.amountMin));
  if (state.amountMax !== null) params.set('amax', String(state.amountMax));
  if (state.sortBy !== initialFilterState.sortBy) params.set('sort', state.sortBy);
  if (state.sortDir !== initialFilterState.sortDir) params.set('dir', state.sortDir);
  return params;
}

const VALID_STATUS: DocStatus[] = ['indexed', 'processing', 'failed', 'draft'];
const VALID_LANG: DocLanguage[] = ['ar', 'en', 'both'];
const VALID_SORT: SortColumn[] = ['document', 'issuer', 'date', 'amount', 'pages'];

export function parseFilters(params: URLSearchParams): FilterState {
  const status = params.get('status') as DocStatus | null;
  const lang = params.get('lang') as DocLanguage | null;
  const sort = params.get('sort') as SortColumn | null;
  const dir = params.get('dir');
  const pmin = params.get('pmin');
  const pmax = params.get('pmax');
  const amin = params.get('amin');
  const amax = params.get('amax');
  return {
    search: params.get('q') ?? '',
    types: params.get('type')?.split(',').filter(Boolean) ?? [],
    status: status && VALID_STATUS.includes(status) ? status : null,
    language: lang && VALID_LANG.includes(lang) ? lang : null,
    dateFrom: params.get('from'),
    dateTo: params.get('to'),
    issuer: params.get('issuer'),
    currency: params.get('currency'),
    pageMin: pmin && Number.isFinite(Number(pmin)) ? Number(pmin) : null,
    pageMax: pmax && Number.isFinite(Number(pmax)) ? Number(pmax) : null,
    amountMin: amin && Number.isFinite(Number(amin)) ? Number(amin) : null,
    amountMax: amax && Number.isFinite(Number(amax)) ? Number(amax) : null,
    sortBy: sort && VALID_SORT.includes(sort) ? sort : initialFilterState.sortBy,
    sortDir: dir === 'asc' || dir === 'desc' ? dir : initialFilterState.sortDir,
  };
}

const ARABIC_RE = /[\u0600-\u06FF]/;
const LATIN_RE = /[A-Za-z]/;

export function detectLanguage(doc: DocumentMeta): DocLanguage {
  const blob = `${doc.issuer_name ?? ''} ${doc.recipient_name ?? ''} ${doc.source_file ?? ''}`;
  const hasAr = ARABIC_RE.test(blob);
  const hasEn = LATIN_RE.test(blob);
  if (hasAr && hasEn) return 'both';
  if (hasAr) return 'ar';
  return 'en';
}

export function deriveStatus(_doc: DocumentMeta): DocStatus {
  return 'indexed';
}

function compareValues(a: unknown, b: unknown, dir: SortDirection): number {
  const sign = dir === 'asc' ? 1 : -1;
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return (a - b) * sign;
  return String(a).localeCompare(String(b)) * sign;
}

export function applyFilters(documents: DocumentMeta[], state: FilterState): DocumentMeta[] {
  const q = state.search.trim().toLowerCase();
  const filtered = documents.filter((d) => {
    if (state.types.length > 0 && !state.types.includes(d.document_type ?? 'other')) {
      return false;
    }
    if (state.status && deriveStatus(d) !== state.status) {
      return false;
    }
    if (state.language && detectLanguage(d) !== state.language) {
      return false;
    }
    if (state.dateFrom && (!d.document_date || d.document_date < state.dateFrom)) {
      return false;
    }
    if (state.dateTo && (!d.document_date || d.document_date > state.dateTo)) {
      return false;
    }
    if (state.issuer) {
      const needle = state.issuer.toLowerCase();
      if (!(d.issuer_name ?? '').toLowerCase().includes(needle)) return false;
    }
    if (state.currency && (d.currency ?? '').toUpperCase() !== state.currency.toUpperCase()) {
      return false;
    }
    const pages = d.page_count ?? 0;
    if (state.pageMin !== null && pages < state.pageMin) return false;
    if (state.pageMax !== null && pages > state.pageMax) return false;
    const amount = d.total_amount ?? null;
    if (state.amountMin !== null && (amount === null || amount < state.amountMin)) return false;
    if (state.amountMax !== null && (amount === null || amount > state.amountMax)) return false;
    if (q) {
      const haystack = [d.doc_id, d.issuer_name, d.recipient_name, d.source_file, d.document_number]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (state.sortBy) {
      case 'document':
        return compareValues(a.document_number ?? a.doc_id, b.document_number ?? b.doc_id, state.sortDir);
      case 'issuer':
        return compareValues(a.issuer_name, b.issuer_name, state.sortDir);
      case 'date':
        return compareValues(a.document_date, b.document_date, state.sortDir);
      case 'amount':
        return compareValues(a.total_amount, b.total_amount, state.sortDir);
      case 'pages':
        return compareValues(a.page_count, b.page_count, state.sortDir);
      default:
        return 0;
    }
  });

  return sorted;
}

export function uniqueCurrencies(documents: DocumentMeta[]): string[] {
  const set = new Set<string>();
  for (const d of documents) {
    if (d.currency) set.add(d.currency.toUpperCase());
  }
  return Array.from(set).sort();
}

export function uniqueIssuers(documents: DocumentMeta[]): string[] {
  const set = new Set<string>();
  for (const d of documents) {
    if (d.issuer_name) set.add(d.issuer_name);
  }
  return Array.from(set).sort();
}

export function uniqueTypes(documents: DocumentMeta[]): string[] {
  const set = new Set<string>();
  for (const d of documents) {
    set.add(d.document_type ?? 'other');
  }
  return Array.from(set).sort();
}
