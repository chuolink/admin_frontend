'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface EntityPickerItem {
  id: string;
  name: string;
  subtitle?: string;
}

interface EntityPickerProps {
  /** API endpoint to search (e.g., '/data-admin/countries/') */
  endpoint: string;
  /** React Query cache key prefix */
  queryKey: string;
  /** Map API response item to EntityPickerItem */
  mapItem: (item: Record<string, unknown>) => EntityPickerItem;
  /** Currently selected item ID */
  value: string | null;
  /** Called when selection changes */
  onChange: (id: string | null) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
}

export function EntityPicker({
  endpoint,
  queryKey,
  mapItem,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false
}: EntityPickerProps) {
  const { api } = useClientApi();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Fetch search results
  const { data, isLoading } = useQuery({
    queryKey: [queryKey, 'search', debouncedSearch],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get(endpoint, {
        params: { search: debouncedSearch, page_size: 20 }
      });
      return response.data;
    },
    enabled: !!api && open && debouncedSearch.length >= 2
  });

  // Fetch selected item details when we have a value but need its label
  const { data: selectedItem } = useQuery({
    queryKey: [queryKey, 'selected', value],
    queryFn: async () => {
      if (!api || !value) throw new Error('API not initialized');
      const response = await api.get(`${endpoint}${value}/`);
      return mapItem(response.data);
    },
    enabled: !!api && !!value
  });

  const results: EntityPickerItem[] = (data?.results ?? []).map(mapItem);

  const handleSelect = (itemId: string) => {
    if (value === itemId) {
      onChange(null);
    } else {
      onChange(itemId);
    }
    setOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const displayLabel = selectedItem?.name ?? placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          <span className='truncate'>{value ? displayLabel : placeholder}</span>
          <div className='ml-2 flex shrink-0 items-center gap-1'>
            {value && !disabled && (
              <span
                role='button'
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ')
                    handleClear(e as unknown as React.MouseEvent);
                }}
                className='hover:bg-muted-foreground/20 rounded-full p-0.5'
              >
                <X className='h-3 w-3' />
              </span>
            )}
            <ChevronsUpDown className='h-4 w-4 opacity-50' />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-[var(--radix-popover-trigger-width)] p-0'
        align='start'
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={`Search...`}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading && debouncedSearch.length >= 2 ? (
              <div className='flex items-center justify-center py-6'>
                <Loader2 className='text-muted-foreground h-4 w-4 animate-spin' />
              </div>
            ) : debouncedSearch.length < 2 ? (
              <CommandEmpty>Type at least 2 characters to search</CommandEmpty>
            ) : results.length === 0 ? (
              <CommandEmpty>No results found</CommandEmpty>
            ) : (
              <CommandGroup>
                {results.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => handleSelect(item.id)}
                    className='cursor-pointer'
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4 shrink-0',
                        value === item.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className='flex min-w-0 flex-col'>
                      <span className='truncate text-sm'>{item.name}</span>
                      {item.subtitle && (
                        <span className='text-muted-foreground truncate text-xs'>
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
