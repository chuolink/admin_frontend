// @ts-nocheck
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { DataSheet } from '@/features/data-admin/components/DataSheet';
import {
  useCreateDiscipline,
  useUpdateDiscipline
} from '@/features/data-admin/hooks/use-courses';
import type { DataDiscipline } from '@/features/data-admin/types';

const disciplineSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional()
});

type DisciplineFormValues = z.infer<typeof disciplineSchema>;

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

interface DisciplineFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  discipline?: DataDiscipline | null;
}

export function DisciplineFormDialog({
  open,
  onOpenChange,
  mode,
  discipline
}: DisciplineFormDialogProps) {
  const createMutation = useCreateDiscipline();
  const updateMutation = useUpdateDiscipline();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<DisciplineFormValues>({
    resolver: zodResolver(disciplineSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: ''
    }
  });

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && discipline) {
      form.reset({
        name: discipline.name,
        slug: discipline.slug,
        description: discipline.description ?? ''
      });
    } else if (mode === 'create') {
      form.reset({
        name: '',
        slug: '',
        description: ''
      });
    }
  }, [mode, discipline, form]);

  // Auto-generate slug from name
  const watchName = form.watch('name');
  useEffect(() => {
    if (mode === 'create') {
      form.setValue('slug', slugify(watchName), { shouldValidate: true });
    }
  }, [watchName, mode, form]);

  const onSubmit = (values: DisciplineFormValues) => {
    if (mode === 'create') {
      createMutation.mutate(values, {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        }
      });
    } else if (discipline) {
      updateMutation.mutate(
        { id: discipline.id, data: values },
        {
          onSuccess: () => {
            onOpenChange(false);
          }
        }
      );
    }
  };

  return (
    <DataSheet
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Add Discipline' : 'Edit Discipline'}
      size='md'
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='e.g., Engineering' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='slug'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder='auto-generated-from-name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Discipline description...'
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex justify-end gap-2 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {mode === 'create' ? 'Create Discipline' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </DataSheet>
  );
}
