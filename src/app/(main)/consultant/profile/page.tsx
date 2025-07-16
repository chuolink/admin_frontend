'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import { Consultant } from '@/types/consultant';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { useStateStore } from '@/stores/useStateStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const paymentFormSchema = z.object({
  payment_type: z.enum(['MOBILE', 'BANK']),
  payment_name: z.string().min(2, 'Payment name is required'),
  payment_account_name: z.string().min(2, 'Account name is required'),
  payment_account_number: z.string().min(2, 'Account number is required')
});
type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export default function ConsultantProfile() {
  const { api } = useClientApi();
  const queryClient = useQueryClient();
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<boolean | null>(null);
  const { consultant } = useStateStore();
  const [showEditPayment, setShowEditPayment] = useState(false);
  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      payment_type: consultant?.payment_type || 'MOBILE',
      payment_name: consultant?.payment_name || '',
      payment_account_name: consultant?.payment_account_name || '',
      payment_account_number: consultant?.payment_account_number || ''
    },
    values: consultant
      ? {
          payment_type: consultant.payment_type || 'MOBILE',
          payment_name: consultant.payment_name || '',
          payment_account_name: consultant.payment_account_name || '',
          payment_account_number: consultant.payment_account_number || ''
        }
      : undefined
  });
  const { mutate: updateActiveStatus, isPending } = useMutation({
    mutationFn: async (isActive: boolean) => {
      if (!api) throw new Error('API not initialized');
      await api.patch(`/consultant/overview/${consultant?.id}/`, {
        is_active: isActive
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultant-profile'] });
      toast.success('Profile updated successfully');
      setShowStatusDialog(false);
    },
    onError: (error) => {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
      setShowStatusDialog(false);
    }
  });
  const { mutate: updatePayment, isPending: isUpdatingPayment } = useMutation({
    mutationFn: async (data: PaymentFormValues) => {
      if (!api) throw new Error('API not initialized');
      await api.patch(`/consultant/overview/${consultant?.id}/`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultant-profile'] });
      toast.success('Payment information updated successfully');
      setShowEditPayment(false);
    },
    onError: (error) => {
      toast.error('Failed to update payment information');
      console.error('Error updating payment info:', error);
    }
  });

  const handleStatusChange = (checked: boolean) => {
    setPendingStatus(checked);
    setShowStatusDialog(true);
  };

  if (!consultant) {
    return (
      <div className='p-6'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>No consultant profile found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='space-y-6 p-6'>
      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Consultant Status</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatus
                ? 'Are you sure you want to go online? You will start receiving applications.'
                : 'Are you sure you want to go offline? You will stop receiving applications.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                pendingStatus !== null && updateActiveStatus(pendingStatus)
              }
              className={
                pendingStatus
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Payment Modal */}
      <Dialog open={showEditPayment} onOpenChange={setShowEditPayment}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Edit Payment Information</DialogTitle>
            <DialogDescription>
              Update your payment details below.
            </DialogDescription>
          </DialogHeader>
          <Form {...paymentForm}>
            <form
              onSubmit={paymentForm.handleSubmit((data) => updatePayment(data))}
              className='space-y-4'
            >
              <FormField
                control={paymentForm.control}
                name='payment_type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select payment method' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='MOBILE'>Mobile Money</SelectItem>
                        <SelectItem value='BANK'>Bank Account</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name='payment_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {paymentForm.watch('payment_type') === 'MOBILE'
                        ? 'Mobile Money Provider'
                        : 'Bank Name'}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              paymentForm.watch('payment_type') === 'MOBILE'
                                ? 'Select mobile money provider'
                                : 'Select bank'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentForm.watch('payment_type') === 'MOBILE' ? (
                          <>
                            <SelectItem value='MIX BY YAS'>
                              MIX BY YAS
                            </SelectItem>
                            <SelectItem value='AIRTEL MONEY'>
                              AIRTEL MONEY
                            </SelectItem>
                            <SelectItem value='MPESA'>MPESA</SelectItem>
                            <SelectItem value='HALOPESA'>HALOPESA</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value='CRDB'>CRDB</SelectItem>
                            <SelectItem value='NMB'>NMB</SelectItem>
                            <SelectItem value='NBC'>NBC</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name='payment_account_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name='payment_account_number'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type='submit'
                className='w-full'
                disabled={isUpdatingPayment}
              >
                {isUpdatingPayment ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle>Consultant Profile</CardTitle>
          <div className='flex items-center space-x-2'>
            <Switch
              id='active-status'
              checked={consultant.is_active}
              onCheckedChange={handleStatusChange}
              disabled={isPending}
              className={consultant.is_active ? 'bg-green-600' : 'bg-red-600'}
            />
            <Label
              htmlFor='active-status'
              className={
                consultant.is_active ? 'text-green-600' : 'text-red-600'
              }
            >
              {consultant.is_active ? 'Online' : 'Offline'}
            </Label>
          </div>
        </CardHeader>
      </Card>

      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label className='text-muted-foreground'>Full Name</Label>
              <p className='text-sm font-medium'>
                {`${consultant.user.first_name} ${consultant.user.middle_name || ''} ${consultant.user.last_name}`}
              </p>
            </div>
            <div>
              <Label className='text-muted-foreground'>Email</Label>
              <p className='text-sm font-medium'>{consultant.user.email}</p>
            </div>
            <div>
              <Label className='text-muted-foreground'>Phone Number</Label>
              <p className='text-sm font-medium'>
                {consultant.user.phone_number || 'Not provided'}
              </p>
            </div>
            <div>
              <Label className='text-muted-foreground'>Gender</Label>
              <p className='text-sm font-medium'>{consultant.user.gender}</p>
            </div>
            <div>
              <Label className='text-muted-foreground'>Birth Date</Label>
              <p className='text-sm font-medium'>
                {format(new Date(consultant.user.birth_date), 'MMMM d, yyyy')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>Payment Information</CardTitle>
            <Button
              size='sm'
              variant='outline'
              onClick={() => setShowEditPayment(true)}
            >
              Edit
            </Button>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label className='text-muted-foreground'>Payment Type</Label>
              <p className='text-sm font-medium'>{consultant.payment_type}</p>
            </div>
            <div>
              <Label className='text-muted-foreground'>Payment Name</Label>
              <p className='text-sm font-medium'>{consultant.payment_name}</p>
            </div>
            <div>
              <Label className='text-muted-foreground'>Account Name</Label>
              <p className='text-sm font-medium'>
                {consultant.payment_account_name}
              </p>
            </div>
            <div>
              <Label className='text-muted-foreground'>Account Number</Label>
              <p className='text-sm font-medium'>
                {consultant.payment_account_number}
              </p>
            </div>
            <div>
              <Label className='text-muted-foreground'>Total Earnings</Label>
              <p className='text-sm font-medium text-green-600'>
                {consultant.earnings.toLocaleString()} TZS
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <Label className='text-muted-foreground'>Account Status</Label>
            <p
              className={`text-sm font-medium ${consultant.is_active ? 'text-green-600' : 'text-red-600'}`}
            >
              {consultant.is_active ? 'Online' : 'Offline'}
            </p>
          </div>
          <div>
            <Label className='text-muted-foreground'>Created At</Label>
            <p className='text-sm font-medium'>
              {format(new Date(consultant.created_at), 'MMMM d, yyyy HH:mm')}
            </p>
          </div>
          <div>
            <Label className='text-muted-foreground'>Last Updated</Label>
            <p className='text-sm font-medium'>
              {format(new Date(consultant.updated_at), 'MMMM d, yyyy HH:mm')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
