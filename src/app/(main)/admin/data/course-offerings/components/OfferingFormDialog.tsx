// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { EntityPicker } from '@/features/data-admin/components/EntityPicker';
import { DataSheet } from '@/features/data-admin/components/DataSheet';
import {
  useCreateCourseOffering,
  useUpdateCourseOffering,
  useCourseRequirements,
  useCourseOfferingExpenses
} from '@/features/data-admin/hooks/use-course-offerings';
import type { DataCourseOffering } from '@/features/data-admin/types';

// ── Expense schema (matches CourseUniversityExpensesNestedRequest) ────

const expenseSchema = z.object({
  id: z.string().optional(),
  currency: z.string().default('TZS'),
  iname: z.string().default(''),
  name: z.string().min(1, 'Expense name is required'),
  offer: z.coerce.number().min(0).optional().default(0),
  is_default: z.boolean().default(false),
  tag: z.string().optional().default(''),
  linked_stage: z.string().optional().default(''),
  description: z.string().optional().default(''),
  start_amount: z.coerce.number().min(0, 'Must be >= 0'),
  end_amount: z.coerce.number().min(0, 'Must be >= 0')
});

// ── Main form schema (matches CourseUniversityDetailRequest) ─────────

const offeringSchema = z.object({
  // Basic
  course: z.string().min(1, 'Course is required'),
  university: z.string().min(1, 'University is required'),
  name: z.string().min(1, 'Name is required'),
  unclear_name: z.string().optional().default(''),
  offer: z.coerce.number().min(0).optional().default(0),
  min_capacity: z.coerce.number().min(0).optional().default(0),
  max_capacity: z.coerce.number().min(0).optional().default(0),
  duration: z.coerce.number().min(0).optional().default(0),
  fee: z.coerce.number().min(0).optional().default(0),
  is_active: z.boolean().default(true),

  // Requirements (matches CourseRequirementsNestedRequest)
  combinations: z.string().optional().default(''),
  admission_points: z.coerce.number().min(0).optional().default(0),
  requirement: z.string().optional().default(''),
  detailed_requirement: z.string().optional().default(''),
  requirement_json: z.string().optional().default(''),

  // Expenses
  course_expenses: z.array(expenseSchema).default([])
});

type OfferingFormValues = z.infer<typeof offeringSchema>;

// ── Props ───────────────────────────────────────────────────────────────

interface OfferingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  offering?: DataCourseOffering | null;
}

export function OfferingFormDialog({
  open,
  onOpenChange,
  mode,
  offering
}: OfferingFormDialogProps) {
  const [formTab, setFormTab] = useState('basic');

  const createMutation = useCreateCourseOffering();
  const updateMutation = useUpdateCourseOffering();
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Fetch existing requirements + expenses in edit mode
  const { data: existingRequirements } = useCourseRequirements(
    mode === 'edit' ? (offering?.id ?? null) : null
  );
  const { data: existingExpenses } = useCourseOfferingExpenses(
    mode === 'edit' && offering ? { course_university: offering.id } : undefined
  );

  const form = useForm<OfferingFormValues>({
    resolver: zodResolver(offeringSchema),
    defaultValues: {
      course: '',
      university: '',
      name: '',
      unclear_name: '',
      offer: 0,
      min_capacity: 0,
      max_capacity: 0,
      duration: 0,
      fee: 0,
      is_active: true,
      combinations: '',
      admission_points: 0,
      requirement: '',
      detailed_requirement: '',
      requirement_json: '',
      course_expenses: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'course_expenses'
  });

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && offering) {
      form.reset({
        course: offering.course ?? '',
        university: offering.university ?? '',
        name: offering.name ?? '',
        unclear_name: offering.unclear_name ?? '',
        offer: offering.offer ?? 0,
        min_capacity: offering.min_capacity ?? 0,
        max_capacity: offering.max_capacity ?? 0,
        duration: offering.duration ?? 0,
        fee: offering.fee ?? 0,
        is_active: offering.is_active ?? true,
        combinations: '',
        admission_points: 0,
        requirement: '',
        detailed_requirement: '',
        requirement_json: '',
        course_expenses: []
      });
    } else if (mode === 'create') {
      form.reset({
        course: '',
        university: '',
        name: '',
        unclear_name: '',
        offer: 0,
        min_capacity: 0,
        max_capacity: 0,
        duration: 0,
        fee: 0,
        is_active: true,
        combinations: '',
        admission_points: 0,
        requirement: '',
        detailed_requirement: '',
        requirement_json: '',
        course_expenses: []
      });
      setFormTab('basic');
    }
  }, [mode, offering, form]);

  // Apply existing requirements data (field names match CourseRequirementsNested)
  useEffect(() => {
    if (existingRequirements && mode === 'edit') {
      form.setValue('combinations', existingRequirements.combinations ?? '');
      form.setValue(
        'admission_points',
        existingRequirements.admission_points ?? 0
      );
      form.setValue('requirement', existingRequirements.requirement ?? '');
      form.setValue(
        'detailed_requirement',
        existingRequirements.detailed_requirement ?? ''
      );
      form.setValue(
        'requirement_json',
        existingRequirements.requirement_json
          ? JSON.stringify(existingRequirements.requirement_json)
          : ''
      );
    }
  }, [existingRequirements, mode, form]);

  // Apply existing expenses data (field names match CourseUniversityExpenses)
  useEffect(() => {
    if (existingExpenses?.results && mode === 'edit') {
      const mapped = existingExpenses.results.map((exp) => ({
        id: exp.id,
        currency: exp.currency ?? 'TZS',
        iname: exp.iname ?? '',
        name: exp.name,
        offer: exp.offer ?? 0,
        is_default: exp.is_default ?? false,
        tag: exp.tag ?? '',
        linked_stage: exp.linked_stage ?? '',
        description: exp.description ?? '',
        start_amount: exp.start_amount ?? 0,
        end_amount: exp.end_amount ?? 0
      }));
      form.setValue('course_expenses', mapped);
    }
  }, [existingExpenses, mode, form]);

  const onSubmit = (values: OfferingFormValues) => {
    // Build the nested payload matching CourseUniversityDetailRequest
    const payload: Record<string, unknown> = {
      name: values.name,
      course: values.course,
      university: values.university,
      unclear_name: values.unclear_name || null,
      offer: values.offer || undefined,
      min_capacity: values.min_capacity || null,
      max_capacity: values.max_capacity || null,
      duration: values.duration || null,
      fee: values.fee || 0,
      is_active: values.is_active,
      requirements: {
        combinations: values.combinations || null,
        admission_points: values.admission_points || null,
        requirement: values.requirement || null,
        detailed_requirement: values.detailed_requirement || null,
        requirement_json: values.requirement_json
          ? JSON.parse(values.requirement_json)
          : undefined
      },
      course_expenses: values.course_expenses.map((exp) => ({
        ...(exp.id ? { id: exp.id } : {}),
        currency: exp.currency,
        iname: exp.iname || '',
        name: exp.name,
        offer: exp.offer || undefined,
        is_default: exp.is_default,
        tag: exp.tag || null,
        linked_stage: exp.linked_stage || null,
        description: exp.description || null,
        start_amount: exp.start_amount,
        end_amount: exp.end_amount
      }))
    };

    if (mode === 'create') {
      createMutation.mutate(payload as Partial<DataCourseOffering>, {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        }
      });
    } else if (offering) {
      updateMutation.mutate(
        {
          id: offering.id,
          data: payload as Partial<DataCourseOffering>
        },
        {
          onSuccess: () => {
            onOpenChange(false);
          }
        }
      );
    }
  };

  const addExpenseRow = () => {
    append({
      currency: 'TZS',
      iname: '',
      name: '',
      offer: 0,
      is_default: false,
      tag: '',
      linked_stage: '',
      description: '',
      start_amount: 0,
      end_amount: 0
    });
  };

  return (
    <DataSheet
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Add Course Offering' : 'Edit Course Offering'}
      size='xl'
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <Tabs value={formTab} onValueChange={setFormTab}>
            <TabsList className='w-full'>
              <TabsTrigger value='basic' className='flex-1'>
                Basic Info
              </TabsTrigger>
              <TabsTrigger value='requirements' className='flex-1'>
                Requirements
              </TabsTrigger>
              <TabsTrigger value='expenses' className='flex-1'>
                Expenses
                {fields.length > 0 && (
                  <Badge variant='secondary' className='ml-2'>
                    {fields.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ── Tab 1: Basic Info ─────────────────────────────────── */}
            <TabsContent value='basic' className='mt-4 space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='course'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
                      <FormControl>
                        <EntityPicker
                          endpoint='/data-admin/courses/'
                          queryKey='data-admin-courses'
                          mapItem={(item) => ({
                            id: item.id as string,
                            name: item.name as string
                          })}
                          value={field.value || null}
                          onChange={(val) => field.onChange(val ?? '')}
                          placeholder='Select a course...'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='university'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>University</FormLabel>
                      <FormControl>
                        <EntityPicker
                          endpoint='/data-admin/universities/'
                          queryKey='data-admin-universities'
                          mapItem={(item) => ({
                            id: item.id as string,
                            name: item.name as string,
                            subtitle: item.country_name as string | undefined
                          })}
                          value={field.value || null}
                          onChange={(val) => field.onChange(val ?? '')}
                          placeholder='Select a university...'
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
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g., BSc Computer Science'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='unclear_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unclear Name (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder='Alternative name...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='offer'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scholarship discount (0-1)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='0.01'
                          min='0'
                          max='1'
                          placeholder='0.0'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='min_capacity'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min='0'
                          placeholder='0'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='max_capacity'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min='0'
                          placeholder='0'
                          {...field}
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
                  name='duration'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (years)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min='0'
                          step='0.5'
                          placeholder='3'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='fee'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fee</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min='0'
                          placeholder='0'
                          {...field}
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
            </TabsContent>

            {/* ── Tab 2: Requirements ───────────────────────────────── */}
            <TabsContent value='requirements' className='mt-4 space-y-4'>
              <FormField
                control={form.control}
                name='combinations'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Combinations</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g., PCM, PCB, ECA' {...field} />
                    </FormControl>
                    <FormDescription>
                      Comma-separated A-Level combinations
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='admission_points'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum admission points</FormLabel>
                    <FormControl>
                      <Input type='number' min='0' placeholder='7' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='requirement'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short requirement text</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., Min 3 principal passes'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='detailed_requirement'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full requirement description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Detailed requirements...'
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='requirement_json'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Structured requirements (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{"olevel": {"min_passes": 5}, "alevel": {"combinations": ["PCM", "PCB"]}}'
                        rows={4}
                        className='font-mono text-sm'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional JSON object for structured requirement data
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            {/* ── Tab 3: Expenses ───────────────────────────────────── */}
            <TabsContent value='expenses' className='mt-4 space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-sm font-medium'>Course Expenses</h3>
                  <p className='text-muted-foreground text-xs'>
                    {fields.length} expense{fields.length !== 1 ? 's' : ''}{' '}
                    configured
                  </p>
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={addExpenseRow}
                >
                  <Plus className='mr-1 h-4 w-4' />
                  Add Expense
                </Button>
              </div>

              {fields.length === 0 && (
                <div className='flex flex-col items-center justify-center rounded-lg border border-dashed py-8'>
                  <p className='text-muted-foreground text-sm'>
                    No expenses added yet
                  </p>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='mt-2'
                    onClick={addExpenseRow}
                  >
                    <Plus className='mr-1 h-4 w-4' />
                    Add your first expense
                  </Button>
                </div>
              )}

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className='bg-muted/30 relative rounded-lg border p-4'
                >
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='absolute top-2 right-2 h-7 w-7 p-0'
                    onClick={() => remove(index)}
                  >
                    <X className='h-4 w-4' />
                  </Button>

                  <div className='text-muted-foreground mb-3 text-xs font-medium'>
                    Expense #{index + 1}
                  </div>

                  <div className='grid grid-cols-3 gap-3'>
                    <FormField
                      control={form.control}
                      name={`course_expenses.${index}.name`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className='text-xs'>Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='e.g., Tuition'
                              className='h-8'
                              {...f}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`course_expenses.${index}.iname`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className='text-xs'>
                            Internal Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Internal identifier'
                              className='h-8'
                              {...f}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`course_expenses.${index}.currency`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className='text-xs'>Currency</FormLabel>
                          <Select value={f.value} onValueChange={f.onChange}>
                            <FormControl>
                              <SelectTrigger className='h-8'>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value='TZS'>TZS</SelectItem>
                              <SelectItem value='USD'>USD</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className='mt-3 grid grid-cols-4 gap-3'>
                    <FormField
                      control={form.control}
                      name={`course_expenses.${index}.start_amount`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className='text-xs'>
                            Start Amount
                          </FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              min='0'
                              placeholder='0'
                              className='h-8'
                              {...f}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`course_expenses.${index}.end_amount`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className='text-xs'>End Amount</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              min='0'
                              placeholder='0'
                              className='h-8'
                              {...f}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`course_expenses.${index}.tag`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className='text-xs'>Tag</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Optional'
                              className='h-8'
                              {...f}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`course_expenses.${index}.offer`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className='text-xs'>Offer (0-1)</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              step='0.01'
                              min='0'
                              max='1'
                              placeholder='0'
                              className='h-8'
                              {...f}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className='mt-3 grid grid-cols-3 gap-3'>
                    <FormField
                      control={form.control}
                      name={`course_expenses.${index}.linked_stage`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className='text-xs'>
                            Linked Stage
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Optional'
                              className='h-8'
                              {...f}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`course_expenses.${index}.description`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className='text-xs'>Description</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Optional'
                              className='h-8'
                              {...f}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`course_expenses.${index}.is_default`}
                      render={({ field: f }) => (
                        <FormItem className='flex flex-row items-end gap-2 space-y-0 pb-1'>
                          <FormControl>
                            <Checkbox
                              checked={f.value}
                              onCheckedChange={f.onChange}
                            />
                          </FormControl>
                          <FormLabel className='text-xs font-normal'>
                            Default expense
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>

          <Separator />

          <div className='flex justify-end gap-2'>
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
              {mode === 'create' ? 'Create Offering' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </DataSheet>
  );
}
