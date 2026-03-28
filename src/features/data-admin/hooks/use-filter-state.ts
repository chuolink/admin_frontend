// @ts-nocheck
'use client';

import { useQueryStates, parseAsString } from 'nuqs';
import { useMemo } from 'react';

/**
 * useFilterState — stores filter values in URL query params via nuqs.
 *
 * Drop-in replacement for useState<Record<string, string>> that persists
 * filters in the URL so they survive navigation and can be shared.
 *
 * Usage:
 *   const [filterValues, setFilter, setFilterValues] = useFilterState(['country', 'currency', 'is_default']);
 *
 * This creates URL params like: ?country=xyz&currency=TZS&is_default=true
 */
export function useFilterState(filterKeys: string[]) {
  // Build the nuqs parser map from the filter keys
  const parsers = useMemo(() => {
    const p: Record<string, ReturnType<typeof parseAsString>> = {};
    for (const key of filterKeys) {
      p[key] = parseAsString.withDefault('');
    }
    return p;
  }, [filterKeys.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const [queryValues, setQueryValues] = useQueryStates(parsers, {
    history: 'replace' // Don't create new history entries for filter changes
  });

  // Convert nuqs values to simple Record<string, string> (strip nulls/empty)
  const values: Record<string, string> = {};
  for (const key of filterKeys) {
    const val = queryValues[key];
    if (val) values[key] = val;
  }

  // Single filter change
  const setFilter = (key: string, value: string) => {
    setQueryValues({ [key]: value || '' } as any);
  };

  // Bulk set
  const setFilterValues = (newValues: Record<string, string>) => {
    setQueryValues(newValues as any);
  };

  return [values, setFilter, setFilterValues] as const;
}
