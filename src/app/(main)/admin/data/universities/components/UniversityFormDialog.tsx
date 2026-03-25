// @ts-nocheck
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { EntityPicker } from '@/features/data-admin/components/EntityPicker';
import { DataSheet } from '@/features/data-admin/components/DataSheet';
import {
  useCreateUniversity,
  useUpdateUniversity
} from '@/features/data-admin/hooks/use-universities';
import type { DataUniversity } from '@/features/data-admin/types';

const universitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  code: z.string().nullable().optional(),
  order: z.coerce.number().optional().default(0),
  country: z.string().min(1, 'Country is required'),
  category: z.enum(['PUBLIC', 'PRIVATE'], {
    required_error: 'Category is required'
  }),
  institution_type: z.string().optional().default(''),
  scholarship: z.enum(['FULL', 'TUITION', 'HALF', 'NONE']).default('NONE'),
  offer: z.coerce.number().optional().default(0),
  max_applications: z.coerce.number().optional().default(0),
  website_link: z.string().nullable().optional(),
  admission_link: z.string().nullable().optional(),
  video_url: z.string().nullable().optional(),
  img_url: z.string().nullable().optional(),
  description: z.string().optional().default(''),
  capacity: z.coerce.number().nullable().optional(),
  no_of_students: z.coerce.number().optional().default(0),
  // Nested location
  location_region: z.string().nullable().optional(),
  location_address: z.string().nullable().optional(),
  location_latitude: z.coerce.number().nullable().optional(),
  location_longitude: z.coerce.number().nullable().optional(),
  // Nested ranking
  global_rank: z.coerce.number().nullable().optional(),
  country_rank: z.coerce.number().nullable().optional(),
  continent_rank: z.coerce.number().nullable().optional()
});

type UniversityFormValues = z.infer<typeof universitySchema>;

interface UniversityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  university?: DataUniversity | null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

export function UniversityFormDialog({
  open,
  onOpenChange,
  university
}: UniversityFormDialogProps) {
  const isEdit = !!university;
  const createUniversity = useCreateUniversity();
  const updateUniversity = useUpdateUniversity();
  const [activeTab, setActiveTab] = useState('basic');

  const form = useForm<UniversityFormValues>({
    resolver: zodResolver(universitySchema),
    defaultValues: {
      name: '',
      slug: '',
      code: null,
      order: 0,
      country: '',
      category: 'PUBLIC',
      institution_type: '',
      scholarship: 'NONE',
      offer: 0,
      max_applications: 0,
      website_link: null,
      admission_link: null,
      video_url: null,
      img_url: null,
      description: '',
      capacity: null,
      no_of_students: 0,
      location_region: null,
      location_address: null,
      location_latitude: null,
      location_longitude: null,
      global_rank: null,
      country_rank: null,
      continent_rank: null
    }
  });

  // Reset form when sheet opens/closes or university changes
  useEffect(() => {
    if (open) {
      setActiveTab('basic');
      if (university) {
        form.reset({
          name: university.name,
          slug: university.slug,
          code: university.code ?? null,
          order: university.order ?? 0,
          country: university.country,
          category: university.category,
          institution_type: university.institution_type ?? '',
          scholarship: university.scholarship ?? 'NONE',
          offer: university.offer ?? 0,
          max_applications: university.max_applications ?? 0,
          website_link: university.website_link ?? null,
          admission_link: university.admission_link ?? null,
          video_url: university.video_url ?? null,
          img_url: university.img_url ?? null,
          description: university.description ?? '',
          capacity: university.capacity ?? null,
          no_of_students: university.no_of_students ?? 0,
          location_region: university.location?.region ?? null,
          location_address: university.location?.address ?? null,
          location_latitude: university.location?.latitude ?? null,
          location_longitude: university.location?.longitude ?? null,
          global_rank: university.ranking?.global_rank ?? null,
          country_rank: university.ranking?.country_rank ?? null,
          continent_rank: university.ranking?.continent_rank ?? null
        });
      } else {
        form.reset({
          name: '',
          slug: '',
          code: null,
          order: 0,
          country: '',
          category: 'PUBLIC',
          institution_type: '',
          scholarship: 'NONE',
          offer: 0,
          max_applications: 0,
          website_link: null,
          admission_link: null,
          video_url: null,
          img_url: null,
          description: '',
          capacity: null,
          no_of_students: 0,
          location_region: null,
          location_address: null,
          location_latitude: null,
          location_longitude: null,
          global_rank: null,
          country_rank: null,
          continent_rank: null
        });
      }
    }
  }, [open, university, form]);

  // Auto-generate slug from name (only for new universities)
  const watchedName = form.watch('name');
  useEffect(() => {
    if (!isEdit && watchedName) {
      form.setValue('slug', slugify(watchedName), { shouldValidate: true });
    }
  }, [watchedName, isEdit, form]);

  const onSubmit = (values: UniversityFormValues) => {
    // Build nested payload to match UniversityDetailRequest
    const payload: Record<string, unknown> = {
      name: values.name,
      slug: values.slug,
      code: values.code || null,
      order: values.order,
      country: values.country,
      category: values.category,
      institution_type: values.institution_type || '',
      scholarship: values.scholarship,
      offer: values.offer,
      max_applications: values.max_applications,
      website_link: values.website_link || null,
      admission_link: values.admission_link || null,
      video_url: values.video_url || null,
      img_url: values.img_url || null,
      description: values.description || null,
      capacity: values.capacity || null,
      no_of_students: values.no_of_students || 0,
      location:
        values.location_region ||
        values.location_address ||
        values.location_latitude ||
        values.location_longitude
          ? {
              region: values.location_region || null,
              address: values.location_address || null,
              latitude: values.location_latitude || null,
              longitude: values.location_longitude || null
            }
          : null,
      ranking:
        values.global_rank || values.country_rank || values.continent_rank
          ? {
              global_rank: values.global_rank || null,
              country_rank: values.country_rank || null,
              continent_rank: values.continent_rank || null
            }
          : null
    };

    if (isEdit && university) {
      updateUniversity.mutate(
        { id: university.id, data: payload },
        {
          onSuccess: () => {
            onOpenChange(false);
          }
        }
      );
    } else {
      createUniversity.mutate(payload, {
        onSuccess: () => {
          onOpenChange(false);
        }
      });
    }
  };

  const isPending = createUniversity.isPending || updateUniversity.isPending;

  return (
    <DataSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit University' : 'Add University'}
      size='xl'
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='basic'>Basic Info</TabsTrigger>
              <TabsTrigger value='location'>Location & Ranking</TabsTrigger>
              <TabsTrigger value='media'>Media & Details</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value='basic' className='mt-4 space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter university name' {...field} />
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
                        <Input placeholder='auto-generated-slug' {...field} />
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
                          placeholder='e.g., UDSM'
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value || null)
                          }
                        />
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

                <FormField
                  control={form.control}
                  name='institution_type'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Institution Type</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g., University' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='country'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Country</FormLabel>
                      <FormControl>
                        <EntityPicker
                          endpoint='/data-admin/countries/'
                          queryKey='data-admin-countries'
                          mapItem={(item) => ({
                            id: item.id as string,
                            name: item.name as string
                          })}
                          value={field.value || null}
                          onChange={(id) => field.onChange(id ?? '')}
                          placeholder='Select country...'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='category'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select category' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='PUBLIC'>Public</SelectItem>
                          <SelectItem value='PRIVATE'>Private</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='scholarship'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scholarship</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select...' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='FULL'>Full</SelectItem>
                          <SelectItem value='TUITION'>Tuition</SelectItem>
                          <SelectItem value='HALF'>Half</SelectItem>
                          <SelectItem value='NONE'>None</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='offer'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Offer (discount)</FormLabel>
                      <FormControl>
                        <Input type='number' min={0} step='0.01' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='max_applications'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Applications</FormLabel>
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
                  name='website_link'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://university.edu'
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value || null)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='admission_link'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admission Link</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://university.edu/admission'
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value || null)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='capacity'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={0}
                          placeholder='e.g., 5000'
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val ? Number(val) : null);
                          }}
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
                        <Input type='number' min={0} {...field} />
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
                        placeholder='Enter university description'
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            {/* Location & Ranking Tab */}
            <TabsContent value='location' className='mt-4 space-y-4'>
              <h3 className='text-sm font-medium'>Location</h3>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='location_region'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g., Dar es Salaam'
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value || null)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='location_address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Full address'
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value || null)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='location_latitude'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='0.000001'
                          placeholder='-6.7924'
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val ? Number(val) : null);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='location_longitude'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='0.000001'
                          placeholder='39.2083'
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val ? Number(val) : null);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <h3 className='pt-4 text-sm font-medium'>Ranking</h3>
              <div className='grid grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='global_rank'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Global Rank</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={1}
                          placeholder='e.g., 150'
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val ? Number(val) : null);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='country_rank'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country Rank</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={1}
                          placeholder='e.g., 5'
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val ? Number(val) : null);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='continent_rank'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Continent Rank</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={1}
                          placeholder='e.g., 20'
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val ? Number(val) : null);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value='media' className='mt-4 space-y-4'>
              <FormField
                control={form.control}
                name='video_url'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='https://youtube.com/watch?v=...'
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
              {isEdit ? 'Update University' : 'Create University'}
            </Button>
          </div>
        </form>
      </Form>
    </DataSheet>
  );
}
