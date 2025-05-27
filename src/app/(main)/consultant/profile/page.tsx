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

export default function ConsultantProfile() {
  const { api } = useClientApi();
  const queryClient = useQueryClient();
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<boolean | null>(null);
  const { consultant } = useStateStore();

  // Mutation for updating active status
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
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
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
