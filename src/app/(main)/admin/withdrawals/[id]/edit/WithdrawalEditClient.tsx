'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Withdrawal } from '@/types/withdrawal';
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
  status: z.enum(['SUCCESS', 'FAILED', 'PENDING']),
  type: z.enum(['DEPOSIT', 'PAYMENT']),
  bank: z.string().optional(),
  account_name: z.string().optional(),
  account_number: z.string().optional(),
  receipt: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface WithdrawalEditClientProps {
  params: {
    id: string;
  };
}

export default function WithdrawalEditClient({
  params
}: WithdrawalEditClientProps) {
  const { api } = useClientApi();
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'PENDING',
      type: 'PAYMENT',
      bank: '',
      account_name: '',
      account_number: '',
      receipt: ''
    }
  });

  // Fetch withdrawal details
  const {
    data: withdrawal,
    isLoading,
    error
  } = useQuery({
    queryKey: ['withdrawal', params.id],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get(`/admin/withdrawals/${params.id}/`);
      return response.data as Withdrawal;
    }
  });

  // Update withdrawal mutation
  const updateWithdrawalMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!api) throw new Error('API not initialized');
      await api.patch(`/admin/withdrawals/${params.id}/`, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawal', params.id] });
      toast.success('Withdrawal updated successfully');
      router.push(`/admin/withdrawals/${params.id}`);
    },
    onError: () => {
      toast.error('Failed to update withdrawal');
    }
  });

  const onSubmit = (values: FormValues) => {
    updateWithdrawalMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <PageContainer className='w-full'>
        <div className='flex h-96 items-center justify-center'>
          <p>Loading withdrawal details...</p>
        </div>
      </PageContainer>
    );
  }

  if (error || !withdrawal) {
    return (
      <PageContainer className='w-full'>
        <div className='flex h-96 items-center justify-center'>
          <p className='text-red-500'>
            Error loading withdrawal details. Please try again later.
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
              <h1 className='text-3xl font-bold'>Edit Withdrawal</h1>
              <p className='text-muted-foreground'>
                Update withdrawal information
              </p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Information</CardTitle>
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
                          <SelectItem value='SUCCESS'>Success</SelectItem>
                          <SelectItem value='FAILED'>Failed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='type'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='DEPOSIT'>Deposit</SelectItem>
                          <SelectItem value='PAYMENT'>Payment</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='bank'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                          placeholder='Enter bank name'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='account_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                          placeholder='Enter account name'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='account_number'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                          placeholder='Enter account number'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='receipt'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receipt</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                          placeholder='Enter receipt number'
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
                      {withdrawal.student?.name ||
                        `${withdrawal.user.first_name} ${withdrawal.user.last_name}`}
                    </div>
                    <div>
                      <span className='font-medium'>Email:</span>{' '}
                      {withdrawal.student?.email || withdrawal.user.email}
                    </div>
                    {withdrawal.student?.phone && (
                      <div>
                        <span className='font-medium'>Phone:</span>{' '}
                        {withdrawal.student.phone}
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
