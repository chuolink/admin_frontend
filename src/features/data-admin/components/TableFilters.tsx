// @ts-nocheck
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

export interface FilterDef {
  /** Query param key sent to API */
  key: string;
  /** Display label */
  label: string;
  /** Filter type */
  type: 'select' | 'entity' | 'boolean';
  /** For select: static options */
  options?: { value: string; label: string }[];
  /** For entity: API endpoint to fetch options */
  endpoint?: string;
  /** For entity: query key */
  queryKey?: string;
  /** For entity: map API item to { value, label } */
  mapItem?: (item: Record<string, unknown>) => { value: string; label: string };
}

interface TableFiltersProps {
  filters: FilterDef[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function TableFilters({ filters, values, onChange }: TableFiltersProps) {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      {filters.map((filter) => (
        <SearchableFilter
          key={filter.key}
          filter={filter}
          value={values[filter.key] || ''}
          onChange={(val) => onChange(filter.key, val)}
        />
      ))}
    </div>
  );
}

function SearchableFilter({
  filter,
  value,
  onChange
}: {
  filter: FilterDef;
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);

  // Build options based on type
  let options: { value: string; label: string }[] = [];

  if (filter.type === 'boolean') {
    options = [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' }
    ];
  } else if (filter.type === 'select') {
    options = filter.options || [];
  }

  // For entity type, we need to fetch
  if (filter.type === 'entity') {
    return (
      <EntitySearchableFilter
        filter={filter}
        value={value}
        onChange={onChange}
      />
    );
  }

  const selectedLabel = options.find(
    (o: { value: string; label: string }) => o.value === value
  )?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='h-8 w-auto max-w-[200px] min-w-[120px] justify-between text-xs font-normal'
        >
          <span className='truncate'>
            {value ? selectedLabel || value : `All ${filter.label}`}
          </span>
          {value ? (
            <X
              className='ml-1 h-3 w-3 shrink-0 opacity-50 hover:opacity-100'
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                setOpen(false);
              }}
            />
          ) : (
            <ChevronsUpDown className='ml-1 h-3 w-3 shrink-0 opacity-50' />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0' align='start'>
        <Command>
          <CommandInput
            placeholder={`Search ${filter.label.toLowerCase()}...`}
            className='h-8 text-xs'
          />
          <CommandList>
            <CommandEmpty className='py-3 text-center text-xs'>
              No results.
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                value='__all__'
                onSelect={() => {
                  onChange('');
                  setOpen(false);
                }}
                className='text-xs'
              >
                <Check
                  className={cn(
                    'mr-2 h-3 w-3',
                    !value ? 'opacity-100' : 'opacity-0'
                  )}
                />
                All {filter.label}
              </CommandItem>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  onSelect={() => {
                    onChange(opt.value === value ? '' : opt.value);
                    setOpen(false);
                  }}
                  className='text-xs'
                >
                  <Check
                    className={cn(
                      'mr-2 h-3 w-3',
                      value === opt.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function EntitySearchableFilter({
  filter,
  value,
  onChange
}: {
  filter: FilterDef;
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { api } = useClientApi();

  const { data } = useQuery({
    queryKey: [filter.queryKey || filter.endpoint],
    queryFn: () =>
      api!
        .get(filter.endpoint!, { params: { page_size: 200 } })
        .then((r) => r.data?.results || r.data || []),
    enabled: !!api && !!filter.endpoint
  });

  const options = (data || []).map(
    filter.mapItem ||
      ((item: Record<string, unknown>) => ({
        value: String(item.id),
        label: String(item.name || item.title || item.id)
      }))
  );

  const selectedLabel = options.find(
    (o: { value: string; label: string }) => o.value === value
  )?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='h-8 w-auto max-w-[220px] min-w-[140px] justify-between text-xs font-normal'
        >
          <span className='truncate'>
            {value ? selectedLabel || value : `All ${filter.label}`}
          </span>
          {value ? (
            <X
              className='ml-1 h-3 w-3 shrink-0 opacity-50 hover:opacity-100'
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                setOpen(false);
              }}
            />
          ) : (
            <ChevronsUpDown className='ml-1 h-3 w-3 shrink-0 opacity-50' />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[250px] p-0' align='start'>
        <Command>
          <CommandInput
            placeholder={`Search ${filter.label.toLowerCase()}...`}
            className='h-8 text-xs'
          />
          <CommandList>
            <CommandEmpty className='py-3 text-center text-xs'>
              No results.
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                value='__all__'
                onSelect={() => {
                  onChange('');
                  setOpen(false);
                }}
                className='text-xs'
              >
                <Check
                  className={cn(
                    'mr-2 h-3 w-3',
                    !value ? 'opacity-100' : 'opacity-0'
                  )}
                />
                All {filter.label}
              </CommandItem>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  onSelect={() => {
                    onChange(opt.value === value ? '' : opt.value);
                    setOpen(false);
                  }}
                  className='text-xs'
                >
                  <Check
                    className={cn(
                      'mr-2 h-3 w-3',
                      value === opt.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
