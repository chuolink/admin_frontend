'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import useClientApi from '@/lib/axios/clientSide';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Eye, Edit, Loader2 } from 'lucide-react';
import { IconWallet } from '@tabler/icons-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';

interface Consultant {
  id: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
  earnings: number;
  payment_type?: string;
  payment_name?: string;
  payment_account_name?: string;
  payment_account_number?: string;
}

interface Withdrawal {
  id: string;
  consultant: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

interface Response<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const withdrawalSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0')
});

type WithdrawalFormValues = z.infer<typeof withdrawalSchema>;

export default function EditConsultantPage() {
  const router = useRouter();
  const params = useParams();
  const { api } = useClientApi();
  const queryClient = useQueryClient();
  const consultantId = params.id as string;

  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: 0
    }
  });

  const { data: consultant, isLoading: isLoadingConsultant } =
    useQuery<Consultant>({
      queryKey: ['consultant', consultantId],
      queryFn: async () => {
        if (!api) throw new Error('API not initialized');
        const response = await api.get(`/consultant/overview/${consultantId}/`);
        return response.data;
      }
    });

  const { data: withdrawals, isLoading: isLoadingWithdrawals } = useQuery<
    Response<Withdrawal>
  >({
    queryKey: ['consultant-withdrawals', consultantId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/consultant/withdrawal/', {
        params: { consultant: consultantId }
      });
      return response.data;
    }
  });

  const createWithdrawalMutation = useMutation({
    mutationFn: async (data: WithdrawalFormValues) => {
      if (!api) throw new Error('API not initialized');
      await api.post('/consultant/withdrawal/', {
        consultant: consultantId,
        amount: data.amount
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['consultant-withdrawals', consultantId]
      });
      queryClient.invalidateQueries({ queryKey: ['consultant', consultantId] });
      toast.success('Withdrawal created successfully');
      form.reset();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to create withdrawal'
      );
    }
  });

  const onSubmit = (data: WithdrawalFormValues) => {
    if (data.amount > (consultant?.earnings || 0)) {
      toast.error('Withdrawal amount cannot exceed available earnings');
      return;
    }
    createWithdrawalMutation.mutate(data);
  };

  if (isLoadingConsultant || isLoadingWithdrawals) {
    return (
      <div className='container mx-auto py-6'>
        <div className='flex h-96 items-center justify-center'>
          <p>Loading consultant data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-6 md:px-8'>
      <div className='grid gap-6'>
        {/* Consultant Information */}
        <Card>
          <CardHeader>
            <CardTitle>Consultant Information</CardTitle>
            <CardDescription>
              View and manage consultant details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
              <div className='space-y-1'>
                <p className='text-muted-foreground text-sm font-medium'>
                  Name
                </p>
                <p className='font-medium'>
                  {consultant?.user.first_name} {consultant?.user.last_name}
                </p>
              </div>
              <div className='space-y-1'>
                <p className='text-muted-foreground text-sm font-medium'>
                  Email
                </p>
                <p className='font-medium'>{consultant?.user.email}</p>
              </div>
              <div className='space-y-1'>
                <p className='text-muted-foreground text-sm font-medium'>
                  Phone
                </p>
                <p className='font-medium'>{consultant?.user.phone_number}</p>
              </div>
              <div className='space-y-1'>
                <p className='text-muted-foreground text-sm font-medium'>
                  Status
                </p>
                <Badge
                  variant={consultant?.is_active ? 'default' : 'destructive'}
                >
                  {consultant?.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className='space-y-1'>
                <p className='text-muted-foreground text-sm font-medium'>
                  Earnings
                </p>
                <p className='font-medium'>
                  {formatCurrency(consultant?.earnings || 0)}
                </p>
              </div>
              <div className='space-y-1'>
                <p className='text-muted-foreground text-sm font-medium'>
                  Joined Date
                </p>
                <p className='font-medium'>
                  {formatDate(consultant?.created_at || '')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>
              Consultant&apos;s payment account details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
              <div className='space-y-1'>
                <p className='text-muted-foreground text-sm font-medium'>
                  Payment Type
                </p>
                <Badge variant='outline' className='capitalize'>
                  {consultant?.payment_type?.toLowerCase() || 'Not set'}
                </Badge>
              </div>
              <div className='space-y-1'>
                <p className='text-muted-foreground text-sm font-medium'>
                  Payment Name
                </p>
                <p className='font-medium'>
                  {consultant?.payment_name || 'Not set'}
                </p>
              </div>
              <div className='space-y-1'>
                <p className='text-muted-foreground text-sm font-medium'>
                  Account Name
                </p>
                <p className='font-medium'>
                  {consultant?.payment_account_name || 'Not set'}
                </p>
              </div>
              <div className='space-y-1'>
                <p className='text-muted-foreground text-sm font-medium'>
                  Account Number
                </p>
                <p className='font-medium'>
                  {consultant?.payment_account_number || 'Not set'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Withdrawal */}
        <Card>
          <CardHeader>
            <CardTitle>Create Withdrawal</CardTitle>
            <CardDescription>
              Create a new withdrawal for the consultant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-4'
              >
                <FormField
                  control={form.control}
                  name='amount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='0.01'
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Available balance:{' '}
                        {formatCurrency(consultant?.earnings || 0)}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type='submit'
                  disabled={createWithdrawalMutation.isPending}
                >
                  {createWithdrawalMutation.isPending ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Creating...
                    </>
                  ) : (
                    <>
                      <IconWallet className='mr-2 h-4 w-4' />
                      Create Withdrawal
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Withdrawal History */}
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal History</CardTitle>
            <CardDescription>
              View all withdrawals made by this consultant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {withdrawals?.results && withdrawals.results.length > 0 ? (
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                  {withdrawals.results.map((withdrawal) => (
                    <div key={withdrawal.id} className='rounded-lg border p-4'>
                      <div className='flex items-center justify-between'>
                        <div className='space-y-1'>
                          <p className='text-lg font-medium'>
                            {formatCurrency(withdrawal.amount)}
                          </p>
                          <p className='text-muted-foreground text-sm'>
                            {formatDate(withdrawal.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-muted-foreground text-sm'>
                  No withdrawals found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
