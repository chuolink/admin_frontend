'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Payment } from '@/types/payment';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  status: z.enum([
    'PENDING',
    'PROCESSING',
    'SUCCESS',
    'FAILED',
    'CANCELLED',
    'REFUNDED'
  ]),
  mode: z.enum(['BANK', 'MOBILE', 'BALANCE']),
  description: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export default function PaymentEditPage() {
  const { api } = useClientApi();
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();
  const id =
    typeof params.id === 'string'
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : '';

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'PENDING',
      mode: 'BANK',
      description: ''
    }
  });

  // Fetch payment details
  const {
    data: payment,
    isLoading,
    error
  } = useQuery({
    queryKey: ['payment', id],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get(`/admin/payments/${id}/`);
      return response.data as Payment;
    }
    // onSuccess: (data) => {
    //   form.reset({
    //     status: data.status,
    //     mode: data.mode,
    //     description: data.description || ''
    //   });
    // }
  });

  // Update payment mutation
  const updatePaymentMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!api) throw new Error('API not initialized');
      await api.patch(`/admin/payments/${id}/`, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment', id] });
      toast.success('Payment updated successfully');
      router.push(`/payments/${id}`);
    },
    onError: () => {
      toast.error('Failed to update payment');
    }
  });

  const onSubmit = (values: FormValues) => {
    updatePaymentMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <PageContainer className='w-full'>
        <div className='flex h-96 items-center justify-center'>
          <p>Loading payment details...</p>
        </div>
      </PageContainer>
    );
  }

  if (error || !payment) {
    return (
      <PageContainer className='w-full'>
        <div className='flex h-96 items-center justify-center'>
          <p className='text-red-500'>
            Error loading payment details. Please try again later.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        {/* Header */}
        <div className='flex w-full items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button variant='outline' size='icon' onClick={() => router.back()}>
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <div>
              <h1 className='text-3xl font-bold'>Edit Payment</h1>
              <p className='text-muted-foreground'>
                Update payment information
              </p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-6'
              >
                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select status' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='PENDING'>Pending</SelectItem>
                          <SelectItem value='PROCESSING'>Processing</SelectItem>
                          <SelectItem value='SUCCESS'>Success</SelectItem>
                          <SelectItem value='FAILED'>Failed</SelectItem>
                          <SelectItem value='CANCELLED'>Cancelled</SelectItem>
                          <SelectItem value='REFUNDED'>Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='mode'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Mode</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select payment mode' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='BANK'>Bank</SelectItem>
                          <SelectItem value='MOBILE'>Mobile</SelectItem>
                          <SelectItem value='BALANCE'>Balance</SelectItem>
                        </SelectContent>
                      </Select>
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
                        <textarea
                          {...field}
                          className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                          placeholder='Enter payment description'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='space-y-2'>
                  <h3 className='text-lg font-semibold'>User Information</h3>
                  <div className='grid gap-2'>
                    <div>
                      <span className='font-medium'>Name:</span>{' '}
                      {payment.student?.name ||
                        `${payment.user.first_name} ${payment.user.last_name}`}
                    </div>
                    <div>
                      <span className='font-medium'>Email:</span>{' '}
                      {payment.student?.email || payment.user.email}
                    </div>
                    {payment.student?.phone && (
                      <div>
                        <span className='font-medium'>Phone:</span>{' '}
                        {payment.student.phone}
                      </div>
                    )}
                  </div>
                </div>

                <div className='flex justify-end gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button type='submit'>Save Changes</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
