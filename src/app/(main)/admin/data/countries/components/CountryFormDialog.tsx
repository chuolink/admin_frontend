'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  useCreateCountry,
  useUpdateCountry
} from '@/features/data-admin/hooks/use-countries';
import type { CountryDetail } from '@/features/data-admin/hooks/use-countries';

const countrySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  code: z.string().optional().default(''),
  order: z.number().optional().default(0),
  description: z.string().optional().default(''),
  no_of_universities: z.number().optional().default(0),
  no_of_students: z.number().optional().default(0),
  scholarship_only: z.boolean().default(false),
  // Location fields (nested in API as location: { latitude, longitude })
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional()
});

type CountryFormValues = z.infer<typeof countrySchema>;

interface CountryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country?: CountryDetail | null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

export function CountryFormDialog({
  open,
  onOpenChange,
  country
}: CountryFormDialogProps) {
  const isEdit = !!country;
  const createCountry = useCreateCountry();
  const updateCountry = useUpdateCountry();
  const [activeTab, setActiveTab] = useState('basic');

  const form = useForm<CountryFormValues>({
    resolver: zodResolver(countrySchema),
    defaultValues: {
      name: '',
      slug: '',
      code: '',
      order: 0,
      description: '',
      no_of_universities: 0,
      no_of_students: 0,
      scholarship_only: false,
      latitude: null,
      longitude: null
    }
  });

  // Reset form when sheet opens/closes or country changes
  useEffect(() => {
    if (open) {
      setActiveTab('basic');
      if (country) {
        const loc = (country as any).location;
        form.reset({
          name: country.name,
          slug: country.slug,
          code: (country as any).code ?? '',
          order: (country as any).order ?? 0,
          description: country.description ?? '',
          no_of_universities: (country as any).no_of_universities ?? 0,
          no_of_students: (country as any).no_of_students ?? 0,
          scholarship_only: country.scholarship_only,
          latitude: loc?.latitude ?? null,
          longitude: loc?.longitude ?? null
        });
      } else {
        form.reset({
          name: '',
          slug: '',
          code: '',
          order: 0,
          description: '',
          no_of_universities: 0,
          no_of_students: 0,
          scholarship_only: false,
          latitude: null,
          longitude: null
        });
      }
    }
  }, [open, country, form]);

  // Auto-generate slug from name (only for new countries)
  const watchedName = form.watch('name');
  useEffect(() => {
    if (!isEdit && watchedName) {
      form.setValue('slug', slugify(watchedName), { shouldValidate: true });
    }
  }, [watchedName, isEdit, form]);

  const onSubmit = (values: CountryFormValues) => {
    // Build payload — nest location fields
    const { latitude, longitude, ...rest } = values;
    const payload: Record<string, unknown> = { ...rest };
    payload.location = {
      latitude: latitude ?? 0,
      longitude: longitude ?? 0
    };

    if (isEdit && country) {
      updateCountry.mutate(
        { id: country.id, data: payload },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createCountry.mutate(payload as any, {
        onSuccess: () => onOpenChange(false)
      });
    }
  };

  const isPending = createCountry.isPending || updateCountry.isPending;

  return (
    <DataSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Country' : 'Add Country'}
      size='lg'
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='basic'>Basic Info</TabsTrigger>
              <TabsTrigger value='location'>Location</TabsTrigger>
            </TabsList>

            <TabsContent value='basic' className='mt-4 space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter country name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='slug'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder='auto-generated-slug' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='code'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country Code</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g. TZ, IN, MY' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='order'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='0'
                          value={field.value ?? 0}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='no_of_universities'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. of Universities</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='0'
                          value={field.value ?? 0}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='no_of_students'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. of Students</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='0'
                          value={field.value ?? 0}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter country description'
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='scholarship_only'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className='space-y-1 leading-none'>
                      <FormLabel>Scholarship Only</FormLabel>
                      <p className='text-muted-foreground text-sm'>
                        This country only allows scholarship applications
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value='location' className='mt-4 space-y-4'>
              <p className='text-muted-foreground mb-4 text-sm'>
                Set the geographic coordinates for this country (used for map
                display).
              </p>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='latitude'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='any'
                          placeholder='e.g. -6.369'
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ''
                                ? null
                                : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='longitude'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='any'
                          placeholder='e.g. 34.888'
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ''
                                ? null
                                : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
          </Tabs>

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
              {isEdit ? 'Update Country' : 'Create Country'}
            </Button>
          </div>
        </form>
      </Form>
    </DataSheet>
  );
}
