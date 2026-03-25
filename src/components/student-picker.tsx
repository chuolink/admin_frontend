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
import { Button } from '@/components/ui/button';
import { ChevronsUpDown, Check, GraduationCap, X, Loader2 } from 'lucide-react';

export interface StudentSearchResult {
  id: string;
  user_name: string;
  user_email: string;
  education_level: string | null;
}

interface StudentPickerProps {
  value: StudentSearchResult | null;
  onSelect: (student: StudentSearchResult | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function StudentPicker({
  value,
  onSelect,
  placeholder = 'Search for a student...',
  disabled = false
}: StudentPickerProps) {
  const { api } = useClientApi();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['student-search', debouncedSearch],
    queryFn: async () => {
      const response = await api!.get('/admin/students/', {
        params: {
          search: debouncedSearch,
          page_size: 10
        }
      });
      return response.data;
    },
    enabled: !!api && debouncedSearch.length >= 2
  });

  const students: StudentSearchResult[] = (data?.results ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (s: any) => ({
      id: s.id,
      user_name:
        s.user_name ??
        `${s.user?.first_name ?? ''} ${s.user?.last_name ?? ''}`.trim(),
      user_email: s.user_email ?? s.user?.email ?? '',
      education_level: s.education_level ?? null
    })
  );

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
          {value ? (
            <span className='flex items-center gap-2 truncate'>
              <GraduationCap className='h-4 w-4 shrink-0' />
              <span className='truncate'>{value.user_name}</span>
              <span className='text-muted-foreground truncate text-xs'>
                {value.user_email}
              </span>
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
          <div className='flex shrink-0 items-center gap-1'>
            {value && (
              <X
                className='text-muted-foreground hover:text-foreground h-3.5 w-3.5'
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(null);
                }}
              />
            )}
            <ChevronsUpDown className='text-muted-foreground h-4 w-4' />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-[var(--radix-popover-trigger-width)] p-0'
        align='start'
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder='Type name, email, or phone...'
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading && debouncedSearch.length >= 2 ? (
              <div className='flex items-center justify-center py-6'>
                <Loader2 className='text-muted-foreground h-5 w-5 animate-spin' />
              </div>
            ) : debouncedSearch.length < 2 ? (
              <CommandEmpty>Type at least 2 characters to search</CommandEmpty>
            ) : students.length === 0 ? (
              <CommandEmpty>No students found</CommandEmpty>
            ) : (
              <CommandGroup heading='Students'>
                {students.map((student) => (
                  <CommandItem
                    key={student.id}
                    value={student.id}
                    onSelect={() => {
                      onSelect(student);
                      setOpen(false);
                      setSearch('');
                    }}
                    className='cursor-pointer'
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4 shrink-0',
                        value?.id === student.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className='flex min-w-0 flex-col'>
                      <span className='truncate text-sm font-medium'>
                        {student.user_name}
                      </span>
                      <span className='text-muted-foreground truncate text-xs'>
                        {student.user_email}
                        {student.education_level &&
                          ` · ${student.education_level}`}
                      </span>
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
