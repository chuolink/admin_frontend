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
import { Badge } from '@/components/ui/badge';
import { X, Loader2, Search } from 'lucide-react';

export interface PickerItem {
  id: string;
  name: string;
  subtitle?: string;
}

interface EntityMultiPickerProps {
  /** API endpoint to search (e.g. '/admin/universities/') */
  endpoint: string;
  /** React Query cache key prefix */
  queryKey: string;
  /** Map API response item to PickerItem */
  mapItem: (item: Record<string, unknown>) => PickerItem;
  /** Currently selected items */
  value: PickerItem[];
  /** Called when selection changes */
  onChange: (items: PickerItem[]) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Label shown above the results group */
  groupLabel?: string;
  /** Disabled state */
  disabled?: boolean;
}

export function EntityMultiPicker({
  endpoint,
  queryKey,
  mapItem,
  value,
  onChange,
  placeholder = 'Search...',
  groupLabel = 'Results',
  disabled = false
}: EntityMultiPickerProps) {
  const { api } = useClientApi();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: [queryKey, debouncedSearch],
    queryFn: async () => {
      const response = await api!.get(endpoint, {
        params: { search: debouncedSearch, page_size: 15 }
      });
      return response.data;
    },
    enabled: !!api && debouncedSearch.length >= 2
  });

  const results: PickerItem[] = (data?.results ?? []).map(mapItem);
  const selectedIds = new Set(value.map((v) => v.id));

  const toggleItem = (item: PickerItem) => {
    if (selectedIds.has(item.id)) {
      onChange(value.filter((v) => v.id !== item.id));
    } else {
      onChange([...value, item]);
    }
  };

  const removeItem = (id: string) => {
    onChange(value.filter((v) => v.id !== id));
  };

  return (
    <div className='space-y-2'>
      {/* Selected badges */}
      {value.length > 0 && (
        <div className='flex flex-wrap gap-1.5'>
          {value.map((item) => (
            <Badge
              key={item.id}
              variant='secondary'
              className='gap-1 pr-1 text-xs'
            >
              {item.name}
              {!disabled && (
                <button
                  type='button'
                  onClick={() => removeItem(item.id)}
                  className='hover:bg-muted-foreground/20 ml-0.5 rounded-full p-0.5'
                >
                  <X className='h-2.5 w-2.5' />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Search popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type='button'
            disabled={disabled}
            className={cn(
              'border-input flex h-9 w-full items-center gap-2 rounded-md border bg-transparent px-3 text-sm shadow-xs transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              'focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              !value.length && 'text-muted-foreground'
            )}
          >
            <Search className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
            <span className='flex-1 truncate text-left'>{placeholder}</span>
            {value.length > 0 && (
              <Badge
                variant='secondary'
                className='h-5 min-w-5 justify-center rounded-full px-1.5 text-xs'
              >
                {value.length}
              </Badge>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className='w-[var(--radix-popover-trigger-width)] p-0'
          align='start'
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={placeholder}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {isLoading && debouncedSearch.length >= 2 ? (
                <div className='flex items-center justify-center py-6'>
                  <Loader2 className='text-muted-foreground h-4 w-4 animate-spin' />
                </div>
              ) : debouncedSearch.length < 2 ? (
                <CommandEmpty>
                  Type at least 2 characters to search
                </CommandEmpty>
              ) : results.length === 0 ? (
                <CommandEmpty>No results found</CommandEmpty>
              ) : (
                <CommandGroup heading={groupLabel}>
                  {results.map((item) => {
                    const isSelected = selectedIds.has(item.id);
                    return (
                      <CommandItem
                        key={item.id}
                        value={item.id}
                        onSelect={() => toggleItem(item)}
                        className='cursor-pointer'
                      >
                        <div
                          className={cn(
                            'mr-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border',
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground/30'
                          )}
                        >
                          {isSelected && (
                            <svg
                              className='h-3 w-3'
                              fill='none'
                              viewBox='0 0 24 24'
                              stroke='currentColor'
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                d='M5 13l4 4L19 7'
                              />
                            </svg>
                          )}
                        </div>
                        <div className='flex min-w-0 flex-col'>
                          <span className='truncate text-sm'>{item.name}</span>
                          {item.subtitle && (
                            <span className='text-muted-foreground truncate text-xs'>
                              {item.subtitle}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ─── Specialized pickers ────────────────────────────────────────────────────

export function UniversityPicker({
  value,
  onChange,
  disabled
}: {
  value: PickerItem[];
  onChange: (items: PickerItem[]) => void;
  disabled?: boolean;
}) {
  return (
    <EntityMultiPicker
      endpoint='/university/'
      queryKey='university-search'
      groupLabel='Universities'
      placeholder='Search universities...'
      disabled={disabled}
      value={value}
      onChange={onChange}
      mapItem={(item) => {
        // The app serializer uses depth=2 so country is an object
        const country =
          typeof item.country === 'object' && item.country !== null
            ? (item.country as Record<string, unknown>).name
            : (item.country_name ?? item.country);
        return {
          id: item.id as string,
          name: item.name as string,
          subtitle: (country as string) || ''
        };
      }}
    />
  );
}

export function CoursePicker({
  value,
  onChange,
  disabled,
  universityId
}: {
  value: PickerItem[];
  onChange: (items: PickerItem[]) => void;
  disabled?: boolean;
  /** When set, only shows courses offered by this university */
  universityId?: string | null;
}) {
  // Build endpoint with optional university filter (backend uses university__id)
  const endpoint = universityId
    ? `/course_university/?university__id=${universityId}`
    : '/course_university/';

  return (
    <EntityMultiPicker
      endpoint={endpoint}
      queryKey={`course-offering-search-${universityId || 'all'}`}
      groupLabel='Courses'
      placeholder={
        universityId
          ? 'Search courses at this university...'
          : 'Select a university first...'
      }
      disabled={disabled || !universityId}
      value={value}
      onChange={onChange}
      mapItem={(item) => {
        // course_university serializer has depth=1 so university is nested
        const uni =
          typeof item.university === 'object' && item.university !== null
            ? (item.university as Record<string, unknown>).name
            : item.university_name;
        return {
          id: item.id as string,
          name: item.name as string,
          subtitle: (uni as string) || ''
        };
      }}
    />
  );
}
