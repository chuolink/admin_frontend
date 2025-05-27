'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent as BaseDialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import { toast } from 'sonner';
import { User } from '@/types/user';
import PhoneAndEmail from '@/components/phone_email_verify';
import { useStateStore } from '@/stores/useStateStore';
import { BsCheckLg } from 'react-icons/bs';
import { PiSpinner } from 'react-icons/pi';
import { cn } from '@/lib/utils';
import React from 'react';

const formSchema = z.object({
  first_name: z.string().min(2, 'First name is required'),
  last_name: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().min(10, 'Phone number is required'),
  payment_type: z.enum(['MOBILE', 'BANK']),
  payment_name: z.string().min(2, 'Payment name is required'),
  payment_account_name: z.string().min(2, 'Account name is required'),
  payment_account_number: z.string().min(2, 'Account number is required')
});

type FormValues = z.infer<typeof formSchema>;

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Custom DialogContent without close button
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className='data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50' />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 sm:rounded-lg',
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = 'DialogContent';

export default function OnboardingModal({
  isOpen,
  onClose
}: OnboardingModalProps) {
  const { api, session } = useClientApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setPhoneAndEmailVerify, phoneAndEmailVerify } = useStateStore();
  const [contact, setContact] = useState({
    email: '',
    phoneNumber: ''
  });

  // Fetch user data
  const { data: userData, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ['user', session?.user?.id],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get(`/user/`);
      return response.data[0];
    },
    enabled: !!session?.user?.id && isOpen
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      payment_type: 'MOBILE',
      payment_name: '',
      payment_account_name: '',
      payment_account_number: ''
    }
  });

  // Update form values when user data is loaded
  useEffect(() => {
    if (userData) {
      form.reset({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        phone_number: userData.phone_number || '',
        payment_type: 'MOBILE',
        payment_name: '',
        payment_account_name: '',
        payment_account_number: ''
      });
      setContact({
        email: userData.email || '',
        phoneNumber: userData.phone_number || ''
      });
    }
  }, [userData, form]);

  // Update user mutation
  const updateUser = useMutation({
    mutationFn: async (data: Partial<User>) => {
      if (!api) throw new Error('API not initialized');
      const response = await api.patch(`/user/${session?.user?.id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('User information updated successfully');
    },
    onError: (error: any) => {
      if (
        error.response?.status === 400 &&
        error.response?.data?.phone_number?.[0]?.includes('already exists')
      ) {
        toast.error(
          'This phone number is already registered. Please use a different phone number.'
        );
        setPhoneAndEmailVerify({
          ...phoneAndEmailVerify,
          isOpen: true,
          phone: '',
          isRequired: true
        });
      } else {
        toast.error('Failed to update user information');
        console.error(error);
      }
    }
  });
  const queryClient = useQueryClient();
  // Create consultant mutation
  const createConsultant = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!api) throw new Error('API not initialized');
      const response = await api.post('/consultant/overview/', {
        payment_type: data.payment_type,
        payment_name: data.payment_name,
        payment_account_name: data.payment_account_name,
        payment_account_number: data.payment_account_number
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Profile created successfully');
      queryClient.invalidateQueries({ queryKey: ['consultant-profile'] });
    },
    onError: (error) => {
      toast.error('Failed to create profile');
      console.error(error);
    }
  });

  const onSubmit = async (data: FormValues) => {
    if (
      !phoneAndEmailVerify.verifiedNumber?.some(
        (number) => number.phone_number === contact.phoneNumber
      )
    ) {
      toast.error('Please verify your phone number first');
      return;
    }

    setIsSubmitting(true);
    try {
      // First update user information
      await updateUser.mutateAsync({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone_number
      });

      // Then create consultant profile
      await createConsultant.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingUser) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='sm:max-w-[425px]'>
          <div className='flex h-96 items-center justify-center'>
            <p>Loading user information...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent
          className='sm:max-w-[425px]'
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>
              Please provide your personal and payment information.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <PhoneAndEmail />
              <FormField
                control={form.control}
                name='first_name'
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
                name='last_name'
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
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className='space-y-2'>
                        <Input
                          {...field}
                          type='email'
                          disabled
                          className='bg-gray-100'
                        />
                        <p className='text-sm text-gray-500'>
                          Email cannot be edited
                        </p>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phone_number'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className='space-y-2'>
                        <Input
                          {...field}
                          onChange={(e) => {
                            if (e.target.value.length <= 3) return;
                            if (e.target.value.length > 13) return;
                            field.onChange(e);
                            setContact((prev) => ({
                              ...prev,
                              phoneNumber: e.target.value
                            }));
                          }}
                        />
                        {field.value && field.value.length > 3 && (
                          <div className='flex items-center gap-2'>
                            {phoneAndEmailVerify.verifiedNumber?.some(
                              (number) => number.phone_number === field.value
                            ) ? (
                              <div className='flex items-center gap-2 text-green-500'>
                                <BsCheckLg size={16} />
                                <span className='text-sm'>
                                  Phone number verified
                                </span>
                              </div>
                            ) : (
                              <Button
                                type='button'
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (
                                    !field.value ||
                                    field.value.length !== 13
                                  ) {
                                    toast.error(
                                      'Please enter a valid phone number'
                                    );
                                    return;
                                  }
                                  setPhoneAndEmailVerify({
                                    ...phoneAndEmailVerify,
                                    isOpen: true,
                                    phone: field.value,
                                    email: '',
                                    isRequired: true
                                  });
                                }}
                                className='bg-primary hover:bg-primaryLight h-8 px-3 py-1 text-sm'
                              >
                                Verify Phone
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='payment_type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
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
                control={form.control}
                name='payment_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {form.watch('payment_type') === 'MOBILE'
                        ? 'Mobile Money Provider'
                        : 'Bank Name'}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              form.watch('payment_type') === 'MOBILE'
                                ? 'Select mobile money provider'
                                : 'Select bank'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {form.watch('payment_type') === 'MOBILE' ? (
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
                control={form.control}
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
                control={form.control}
                name='payment_account_number'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <div className='space-y-2'>
                        <div className='relative'>
                          {form.watch('payment_type') === 'MOBILE' && (
                            <span className='absolute top-1/2 left-3 -translate-y-1/2 text-white'>
                              +255
                            </span>
                          )}
                          <Input
                            {...field}
                            className={
                              form.watch('payment_type') === 'MOBILE'
                                ? 'pl-12'
                                : ''
                            }
                            onChange={(e) => {
                              if (form.watch('payment_type') === 'MOBILE') {
                                // Remove any non-digit characters
                                const value = e.target.value.replace(/\D/g, '');
                                // Only allow up to 9 digits
                                if (value.length <= 9) {
                                  field.onChange(value);
                                }
                              } else {
                                field.onChange(e.target.value);
                              }
                            }}
                          />
                        </div>
                        {form.watch('payment_type') === 'MOBILE' &&
                          field.value &&
                          field.value.length > 0 && (
                            <div className='flex items-center gap-2'>
                              {field.value.length !== 9 && (
                                <span className='text-sm text-gray-500'>
                                  Enter 9 digits
                                </span>
                              )}
                            </div>
                          )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type='submit'
                className='w-full'
                disabled={
                  isSubmitting ||
                  !phoneAndEmailVerify.verifiedNumber?.some(
                    (number) => number.phone_number === contact.phoneNumber
                  )
                }
              >
                {isSubmitting ? (
                  <div className='flex items-center gap-2'>
                    <PiSpinner className='animate-spin' size={20} />
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save Profile'
                )}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
