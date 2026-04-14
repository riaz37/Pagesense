'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
  ToggleGroup,
  ToggleGroupItem,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import {
  type FilterAction,
  type FilterState,
  type ViewMode,
  isMoreFilterActive,
  isFilterActive,
} from '../_state/filters';

interface ToolbarProps {
  state: FilterState;
  dispatch: React.Dispatch<FilterAction>;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  availableTypes: string[];
  availableCurrencies: string[];
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  isCompact: boolean;
}

const STATUS_OPTIONS = ['indexed', 'processing', 'failed', 'draft'] as const;
const LANGUAGE_OPTIONS = ['ar', 'en', 'both'] as const;

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden className={className}>
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ChipButton({
  active,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active: boolean }) {
  return (
    <button
      type="button"
      data-active={active || undefined}
      className={
        'inline-flex items-center gap-1.5 h-8 rounded-full px-3 text-xs font-medium border transition-colors ' +
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)] ' +
        (active
          ? 'bg-[color:var(--badge-emerald-bg)] text-[color:var(--badge-emerald-text-dark)] border-transparent'
          : 'bg-transparent text-[color:var(--text-secondary)] border-[color:var(--border-subtle)] hover:text-[color:var(--text-primary)] hover:border-[color:var(--border-default)]')
      }
      {...props}
    >
      {children}
    </button>
  );
}

export function Toolbar({
  state,
  dispatch,
  view,
  onViewChange,
  availableTypes,
  availableCurrencies,
  searchInputRef,
  isCompact,
}: ToolbarProps) {
  const t = useTranslations('documents');
  const moreActive = isMoreFilterActive(state);
  const anyActive = isFilterActive(state);

  const typeLabel = React.useCallback(
    (type: string) => {
      const key = `type.${type}` as 'type.invoice';
      return t.has(key) ? t(key) : type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    },
    [t],
  );

  const typeChipLabel =
    state.types.length === 0
      ? t('filters.type')
      : state.types.length === 1
        ? typeLabel(state.types[0])
        : `${t('filters.type')} (${state.types.length})`;

  const statusChipLabel = state.status ? t(`status.${state.status}` as 'status.indexed') : t('filters.status');
  const languageChipLabel = state.language
    ? t(`language.${state.language}` as 'language.ar')
    : t('filters.language');

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px] max-w-[320px]">
          <span
            className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-[color:var(--text-tertiary)]"
            style={{ insetInlineStart: '14px' }}
            aria-hidden
          >
            <SearchIcon />
          </span>
          <input
            ref={searchInputRef}
            type="search"
            inputMode="search"
            value={state.search}
            onChange={(e) => dispatch({ type: 'setSearch', value: e.target.value })}
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchAria')}
            aria-keyshortcuts="/"
            dir="auto"
            className="w-full ps-10 pe-3 py-2 rounded-full border border-[color:var(--border-input)] bg-[color:var(--bg-input)] text-[15px] leading-[1.5] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)] focus-visible:border-transparent transition-colors"
          />
        </div>

        <div
          className="flex items-center gap-1.5 overflow-x-auto -mx-1 px-1 max-w-full"
          role="toolbar"
          aria-label={t('filters.applied')}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ChipButton
                active={state.types.length > 0}
                aria-label={typeChipLabel}
                onClick={(e) => {
                  if (state.types.length > 0) {
                    e.preventDefault();
                    dispatch({ type: 'setTypes', value: [] });
                  }
                }}
                onKeyDown={(e) => {
                  if (state.types.length > 0 && (e.key === 'Backspace' || e.key === 'Delete')) {
                    e.preventDefault();
                    dispatch({ type: 'setTypes', value: [] });
                  }
                }}
              >
                {typeChipLabel}
                <ChevronIcon />
              </ChipButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>{t('filters.type')}</DropdownMenuLabel>
              {availableTypes.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={state.types.includes(type)}
                  onSelect={(e) => e.preventDefault()}
                  onCheckedChange={() => dispatch({ type: 'toggleType', value: type })}
                >
                  {typeLabel(type)}
                </DropdownMenuCheckboxItem>
              ))}
              {state.types.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'setTypes', value: [] })}
                    className="w-full px-3 py-1.5 text-start text-xs text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-surface-hover)] rounded-[4px]"
                  >
                    {t('filters.clear')}
                  </button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ChipButton
                active={state.status !== null}
                aria-label={statusChipLabel}
                onClick={(e) => {
                  if (state.status !== null) {
                    e.preventDefault();
                    dispatch({ type: 'setStatus', value: null });
                  }
                }}
              >
                {statusChipLabel}
                <ChevronIcon />
              </ChipButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>{t('filters.status')}</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={state.status ?? 'all'}
                onValueChange={(v) =>
                  dispatch({
                    type: 'setStatus',
                    value: v === 'all' ? null : (v as FilterState['status']),
                  })
                }
              >
                <DropdownMenuRadioItem value="all">{t('status.all')}</DropdownMenuRadioItem>
                {STATUS_OPTIONS.map((s) => (
                  <DropdownMenuRadioItem key={s} value={s}>
                    {t(`status.${s}` as 'status.indexed')}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ChipButton
                active={state.language !== null}
                aria-label={languageChipLabel}
                onClick={(e) => {
                  if (state.language !== null) {
                    e.preventDefault();
                    dispatch({ type: 'setLanguage', value: null });
                  }
                }}
              >
                {languageChipLabel}
                <ChevronIcon />
              </ChipButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>{t('filters.language')}</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={state.language ?? 'all'}
                onValueChange={(v) =>
                  dispatch({
                    type: 'setLanguage',
                    value: v === 'all' ? null : (v as FilterState['language']),
                  })
                }
              >
                <DropdownMenuRadioItem value="all">{t('language.all')}</DropdownMenuRadioItem>
                {LANGUAGE_OPTIONS.map((l) => (
                  <DropdownMenuRadioItem key={l} value={l}>
                    {t(`language.${l}` as 'language.ar')}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover>
            <PopoverTrigger asChild>
              <ChipButton active={moreActive} aria-label={t('filters.more')}>
                {t('filters.more')}
                <ChevronIcon />
              </ChipButton>
            </PopoverTrigger>
            <PopoverContent align="start">
              <MoreFiltersForm
                state={state}
                dispatch={dispatch}
                availableCurrencies={availableCurrencies}
              />
            </PopoverContent>
          </Popover>

          {anyActive && (
            <button
              type="button"
              onClick={() => dispatch({ type: 'clearAll' })}
              className="h-8 px-3 rounded-md text-xs font-medium text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--bg-surface-hover)] transition-colors"
            >
              {t('filters.clear')}
            </button>
          )}
        </div>

        <div className={'flex items-center gap-2 ' + (isCompact ? 'hidden' : 'ms-auto')}>
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => v && onViewChange(v as ViewMode)}
            aria-label={t('view.grid') + ' / ' + t('view.table')}
          >
            <ToggleGroupItem value="grid" aria-label={t('view.grid')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              <span className="hidden md:inline">{t('view.grid')}</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label={t('view.table')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              <span className="hidden md:inline">{t('view.table')}</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </div>
  );
}

function MoreFiltersForm({
  state,
  dispatch,
  availableCurrencies,
}: {
  state: FilterState;
  dispatch: React.Dispatch<FilterAction>;
  availableCurrencies: string[];
}) {
  const t = useTranslations('documents');
  const [dateFrom, setDateFrom] = React.useState(state.dateFrom ?? '');
  const [dateTo, setDateTo] = React.useState(state.dateTo ?? '');
  const [issuer, setIssuer] = React.useState(state.issuer ?? '');
  const [currency, setCurrency] = React.useState(state.currency ?? '');
  const [pageMin, setPageMin] = React.useState(
    state.pageMin !== null ? String(state.pageMin) : '',
  );
  const [pageMax, setPageMax] = React.useState(
    state.pageMax !== null ? String(state.pageMax) : '',
  );
  const [amountMin, setAmountMin] = React.useState(
    state.amountMin !== null ? String(state.amountMin) : '',
  );
  const [amountMax, setAmountMax] = React.useState(
    state.amountMax !== null ? String(state.amountMax) : '',
  );

  const apply = () => {
    dispatch({
      type: 'setDateRange',
      from: dateFrom || null,
      to: dateTo || null,
    });
    dispatch({ type: 'setIssuer', value: issuer.trim() || null });
    dispatch({ type: 'setCurrency', value: currency || null });
    dispatch({
      type: 'setPageRange',
      min: pageMin && Number.isFinite(Number(pageMin)) ? Number(pageMin) : null,
      max: pageMax && Number.isFinite(Number(pageMax)) ? Number(pageMax) : null,
    });
    dispatch({
      type: 'setAmountRange',
      min: amountMin && Number.isFinite(Number(amountMin)) ? Number(amountMin) : null,
      max: amountMax && Number.isFinite(Number(amountMax)) ? Number(amountMax) : null,
    });
  };

  const reset = () => {
    setDateFrom('');
    setDateTo('');
    setIssuer('');
    setCurrency('');
    setPageMin('');
    setPageMax('');
    setAmountMin('');
    setAmountMax('');
    dispatch({ type: 'clearMore' });
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs font-semibold text-[color:var(--text-secondary)]">
          {t('more.dateRange')}
        </legend>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1 text-xs text-[color:var(--text-tertiary)]">
            <span>{t('more.issuedFrom')}</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 px-2 rounded-md bg-[color:var(--bg-input)] border border-[color:var(--border-input)] text-sm text-[color:var(--text-primary)]"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[color:var(--text-tertiary)]">
            <span>{t('more.issuedTo')}</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 px-2 rounded-md bg-[color:var(--bg-input)] border border-[color:var(--border-input)] text-sm text-[color:var(--text-primary)]"
            />
          </label>
        </div>
      </fieldset>

      <label className="flex flex-col gap-1 text-xs text-[color:var(--text-tertiary)]">
        <span>{t('more.issuer')}</span>
        <input
          type="text"
          value={issuer}
          onChange={(e) => setIssuer(e.target.value)}
          placeholder={t('more.issuerPlaceholder')}
          dir="auto"
          className="h-9 px-3 rounded-md bg-[color:var(--bg-input)] border border-[color:var(--border-input)] text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--text-tertiary)]"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-[color:var(--text-tertiary)]">
        <span>{t('more.currency')}</span>
        <Select value={currency || 'all'} onValueChange={(v) => setCurrency(v === 'all' ? '' : v)}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder={t('more.currency')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-sm">
              {t('more.anyCurrency')}
            </SelectItem>
            {availableCurrencies.map((c) => (
              <SelectItem key={c} value={c} className="text-sm">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs font-semibold text-[color:var(--text-secondary)]">
          {t('more.pageRange')}
        </legend>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1 text-xs text-[color:var(--text-tertiary)]">
            <span>{t('more.minPages')}</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={pageMin}
              onChange={(e) => setPageMin(e.target.value)}
              className="h-9 px-2 rounded-md bg-[color:var(--bg-input)] border border-[color:var(--border-input)] text-sm text-[color:var(--text-primary)]"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[color:var(--text-tertiary)]">
            <span>{t('more.maxPages')}</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={pageMax}
              onChange={(e) => setPageMax(e.target.value)}
              className="h-9 px-2 rounded-md bg-[color:var(--bg-input)] border border-[color:var(--border-input)] text-sm text-[color:var(--text-primary)]"
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs font-semibold text-[color:var(--text-secondary)]">
          {t('more.amountRange')}
        </legend>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1 text-xs text-[color:var(--text-tertiary)]">
            <span>{t('more.minAmount')}</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={amountMin}
              onChange={(e) => setAmountMin(e.target.value)}
              className="h-9 px-2 rounded-md bg-[color:var(--bg-input)] border border-[color:var(--border-input)] text-sm text-[color:var(--text-primary)]"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[color:var(--text-tertiary)]">
            <span>{t('more.maxAmount')}</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={amountMax}
              onChange={(e) => setAmountMax(e.target.value)}
              className="h-9 px-2 rounded-md bg-[color:var(--bg-input)] border border-[color:var(--border-input)] text-sm text-[color:var(--text-primary)]"
            />
          </label>
        </div>
      </fieldset>

      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={reset}
          className="h-9 px-3 rounded-md text-xs font-medium text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
        >
          {t('filters.reset')}
        </button>
        <PopoverClose asChild>
          <Button type="submit" size="sm" onClick={apply}>
            {t('filters.apply')}
          </Button>
        </PopoverClose>
      </div>
    </form>
  );
}
