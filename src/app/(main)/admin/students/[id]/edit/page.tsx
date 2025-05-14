'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, UseQueryOptions } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import useClientApi from '@/lib/axios/clientSide';
import { Student } from '@/types/student-details';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';

const editStudentSchema = z.object({
  user: z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email'),
    is_active: z.boolean()
  }),
  education_level: z.string().optional(),
  maritial_status: z.string().optional(),
  about_us: z.string().optional(),
  nida_no: z.string().optional(),
  preffered_service: z.string().optional()
});

type EditStudentForm = z.infer<typeof editStudentSchema>;

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const { api } = useClientApi();
  const studentId = params.id as string;

  const form = useForm<EditStudentForm>({
    resolver: zodResolver(editStudentSchema),
    defaultValues: {
      user: {
        first_name: '',
        last_name: '',
        email: '',
        is_active: true
      }
    }
  });

  // Fetch student data
  const { data: studentData, isLoading } = useQuery({
    queryKey: ['student', studentId],
    queryFn: async (): Promise<Student> => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get(`/admin/students/${studentId}/`);
      return response.data;
    },

    enabled: !!studentId
  });

  // Update form when data is loaded
  useEffect(() => {
    if (studentData) {
      form.reset({
        user: {
          first_name: studentData.user.first_name,
          last_name: studentData.user.last_name,
          email: studentData.user.email,
          is_active: studentData.user.is_active
        },
        education_level: studentData.education_level || '',
        maritial_status: (studentData as any).maritial_status || '',
        about_us: (studentData as any).about_us || '',
        nida_no: (studentData as any).nida_no || '',
        preffered_service: (studentData as any).preffered_service || ''
      });
    }
  }, [studentData, form]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: EditStudentForm) => {
      if (!api) throw new Error('API not initialized');
      const response = await api.patch(`/admin/students/${studentId}/`, values);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Student updated successfully');
      router.push(`/admin/students/${studentId}`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to update student');
    }
  });

  const onSubmit = (values: EditStudentForm) => {
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className='flex h-96 items-center justify-center'>
          <p>Loading student data...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Edit Student</h1>
            <p className='text-muted-foreground'>Update student information</p>
          </div>
          <Button
            variant='outline'
            onClick={() => router.push(`/admin/students/${studentId}`)}
          >
            Cancel
          </Button>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='user.first_name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='user.last_name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='user.email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type='email' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='user.is_active'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>
                          Active Account
                        </FormLabel>
                        <div className='text-muted-foreground text-sm'>
                          Enable or disable the student account
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='education_level'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Education Level</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select education level' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='A Level Graduate'>
                              A Level Graduate
                            </SelectItem>
                            <SelectItem value='A Level Student'>
                              A Level Student
                            </SelectItem>
                            <SelectItem value='O Level Student'>
                              O Level Student
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='maritial_status'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marital Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select marital status' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='Single'>Single</SelectItem>
                            <SelectItem value='Married'>Married</SelectItem>
                            <SelectItem value='Divorced'>Divorced</SelectItem>
                            <SelectItem value='Widowed'>Widowed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='nida_no'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NIDA Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='preffered_service'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Service</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='about_us'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Tell us about the student...'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.push(`/admin/students/${studentId}`)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </PageContainer>
  );
}
