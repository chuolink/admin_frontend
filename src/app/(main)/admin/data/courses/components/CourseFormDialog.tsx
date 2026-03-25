'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
  useCreateCourse,
  useUpdateCourse
} from '@/features/data-admin/hooks/use-courses';
import type { DataCourse } from '@/features/data-admin/types';

const courseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  code: z.string().nullable().optional(),
  version: z.coerce.number().optional(),
  category: z.string().nullable().optional(),
  combination: z.string().nullable().optional(),
  short_description: z.string().nullable().optional(),
  long_description: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  order: z.coerce.number().optional().default(0),
  video_url: z.string().nullable().optional(),
  img_url: z.string().nullable().optional(),
  description: z.string().optional().default('')
});

type CourseFormValues = z.infer<typeof courseSchema>;

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  course?: DataCourse | null;
}

export function CourseFormDialog({
  open,
  onOpenChange,
  mode,
  course
}: CourseFormDialogProps) {
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: '',
      slug: '',
      code: null,
      version: undefined,
      category: null,
      combination: null,
      short_description: null,
      long_description: null,
      is_active: true,
      order: 0,
      video_url: null,
      img_url: null,
      description: ''
    }
  });

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && course) {
      form.reset({
        name: course.name,
        slug: course.slug,
        code: course.code ?? null,
        version: course.version ?? undefined,
        category: course.category ?? null,
        combination: course.combination ?? null,
        short_description: course.short_description ?? null,
        long_description: course.long_description ?? null,
        is_active: course.is_active ?? true,
        order: course.order ?? 0,
        video_url: course.video_url ?? null,
        img_url: course.img_url ?? null,
        description: course.description ?? ''
      });
    } else if (mode === 'create') {
      form.reset({
        name: '',
        slug: '',
        code: null,
        version: undefined,
        category: null,
        combination: null,
        short_description: null,
        long_description: null,
        is_active: true,
        order: 0,
        video_url: null,
        img_url: null,
        description: ''
      });
    }
  }, [mode, course, form]);

  // Auto-generate slug from name
  const watchName = form.watch('name');
  useEffect(() => {
    if (mode === 'create') {
      form.setValue('slug', slugify(watchName), { shouldValidate: true });
    }
  }, [watchName, mode, form]);

  const onSubmit = (values: CourseFormValues) => {
    // Clean up payload to match CourseDetailRequest
    const payload: Record<string, unknown> = {
      name: values.name,
      slug: values.slug,
      code: values.code || null,
      version: values.version,
      category: values.category || null,
      combination: values.combination || null,
      short_description: values.short_description || null,
      long_description: values.long_description || null,
      is_active: values.is_active,
      order: values.order,
      video_url: values.video_url || null,
      img_url: values.img_url || null,
      description: values.description || null
    };

    if (mode === 'create') {
      createMutation.mutate(payload as Partial<DataCourse>, {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        }
      });
    } else if (course) {
      updateMutation.mutate(
        { id: course.id, data: payload as Partial<DataCourse> },
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
      title={mode === 'create' ? 'Add Course' : 'Edit Course'}
      size='lg'
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g., Computer Science' {...field} />
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
                  <FormLabel required>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder='auto-generated-from-name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='grid grid-cols-3 gap-4'>
            <FormField
              control={form.control}
              name='code'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g., CS101'
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='version'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Version</FormLabel>
                  <FormControl>
                    <Input type='number' min={0} placeholder='1' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='order'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order</FormLabel>
                  <FormControl>
                    <Input type='number' min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g., Engineering'
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='combination'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Combination</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g., PCM'
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='short_description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Short Description</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Brief summary of the course'
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='long_description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Long Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Detailed course description...'
                    rows={3}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
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
                    placeholder='General description...'
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='video_url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='https://youtube.com/...'
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='img_url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='https://example.com/image.jpg'
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='is_active'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center gap-2 space-y-0'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className='font-normal'>Active</FormLabel>
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
              {mode === 'create' ? 'Create Course' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </DataSheet>
  );
}
