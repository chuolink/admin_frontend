'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import useClientApi from '@/lib/axios/clientSide';
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

const createStudentSchema = z.object({
  user: z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    phone_number: z.string().optional()
  }),
  education_level: z.string().optional(),
  maritial_status: z.string().optional(),
  about_us: z.string().optional(),
  nida_no: z.string().optional(),
  preffered_service: z.string().optional()
});

type CreateStudentForm = z.infer<typeof createStudentSchema>;

export default function CreateStudentPage() {
  const router = useRouter();
  const { api } = useClientApi();

  const form = useForm<CreateStudentForm>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      user: {
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone_number: ''
      }
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: CreateStudentForm) => {
      if (!api) throw new Error('API not initialized');

      // First create the user
      const userResponse = await api.post('/auth/register/', {
        first_name: values.user.first_name,
        last_name: values.user.last_name,
        email: values.user.email,
        password: values.user.password,
        phone_number: values.user.phone_number || ''
      });

      // Then create the student with the new user ID
      const studentResponse = await api.post('/admin/students/', {
        user: userResponse.data.user.id,
        education_level: values.education_level || '',
        maritial_status: values.maritial_status || '',
        about_us: values.about_us || '',
        nida_no: values.nida_no || '',
        preffered_service: values.preffered_service || ''
      });

      return studentResponse.data;
    },
    onSuccess: (data) => {
      toast.success('Student created successfully');
      router.push(`/admin/students/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to create student');
    }
  });

  const onSubmit = (values: CreateStudentForm) => {
    createMutation.mutate(values);
  };

  return (
    <PageContainer>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Create Student</h1>
            <p className='text-muted-foreground'>
              Add a new student to the system
            </p>
          </div>
          <Button
            variant='outline'
            onClick={() => router.push('/admin/students')}
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
                        <FormLabel>First Name *</FormLabel>
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
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='user.email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type='email' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='user.password'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password *</FormLabel>
                        <FormControl>
                          <Input type='password' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='user.phone_number'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='+255712345678' />
                      </FormControl>
                      <FormMessage />
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
                          placeholder='How did the student hear about us?'
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
                onClick={() => router.push('/admin/students')}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Student'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </PageContainer>
  );
}
