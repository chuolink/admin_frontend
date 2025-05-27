'use client';
import Modal from '@/components/Modal';
import React, { useEffect, useState } from 'react';
import useClientApi from '@/lib/axios/clientSide';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useStateStore } from '@/stores/useStateStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PiSpinner, PiCheckCircle, PiXCircle, PiClock } from 'react-icons/pi';
import { IoCloseCircleOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';

const PhoneAndEmail = ({ onClose }: { onClose?: () => void }) => {
  const { phoneAndEmailVerify, setPhoneAndEmailVerify } = useStateStore();
  const [verificationCode, setVerificationCode] = useState('');
  const [mainCountdown, setMainCountdown] = useState(300); // 5 minutes
  const [resendCountdown, setResendCountdown] = useState(90); // 1.5 minutes
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const [previousContact, setPreviousContact] = useState('');
  const [isSending, setIsSending] = useState(false);
  const queryClient = useQueryClient();
  const { api } = useClientApi();

  useQuery({
    queryKey: ['verifiedNumberAndEmail'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('auth/phone/verify/');

      setPhoneAndEmailVerify({
        ...phoneAndEmailVerify,
        verifiedNumber: response.data.verified_phones,
        verifiedEmail: response.data.verified_emails
      });

      return response.data;
    }
  });

  useEffect(() => {
    const currentContact =
      phoneAndEmailVerify.phone || phoneAndEmailVerify.email;
    if (phoneAndEmailVerify.isOpen && currentContact !== previousContact) {
      setVerificationCode('');
      setMainCountdown(300);
      setResendCountdown(90);
      setIsResendEnabled(false);
      setIsSending(true);
      sendCodeMutation.mutate();
      setPreviousContact(currentContact);
    }
  }, [
    phoneAndEmailVerify.phone,
    phoneAndEmailVerify.email,
    phoneAndEmailVerify.isOpen
  ]);

  const sendCodeMutation = useMutation({
    mutationFn: async () => {
      if (!api) throw new Error('API not initialized');
      if (phoneAndEmailVerify.phone) {
        return api.post('auth/phone/', {
          phone_number: phoneAndEmailVerify.phone
        });
      } else if (phoneAndEmailVerify.email) {
        return api.post('auth/email/', {
          email: phoneAndEmailVerify.email
        });
      }
    },
    onSuccess: () => {
      toast.success('Verification code sent successfully');
      setMainCountdown(300);
      setResendCountdown(90);
      setIsResendEnabled(false);
      setIsSending(false);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to send verification code'
      );
      setIsSending(false);
    }
  });

  const verifyCodeMutation = useMutation({
    mutationFn: async () => {
      if (!api) throw new Error('API not initialized');
      if (phoneAndEmailVerify.phone) {
        return api
          .post('auth/phone/verify/', {
            phone_number: phoneAndEmailVerify.phone,
            code: verificationCode
          })
          .then((res) => {
            setPhoneAndEmailVerify({
              ...phoneAndEmailVerify,
              isOpen: false,
              isRequired: false,
              verifiedNumber: [
                ...(phoneAndEmailVerify.verifiedNumber || []),
                {
                  phone_number: phoneAndEmailVerify.phone,
                  updated_at: new Date().toISOString()
                }
              ]
            });
            return res.data;
          });
      } else if (phoneAndEmailVerify.email) {
        return api
          .post('auth/email/verify/', {
            email: phoneAndEmailVerify.email,
            code: verificationCode
          })
          .then((res) => {
            setPhoneAndEmailVerify({
              ...phoneAndEmailVerify,
              isRequired: false,
              isOpen: false,
              verifiedEmail: [
                ...(phoneAndEmailVerify.verifiedEmail || []),
                {
                  email: phoneAndEmailVerify.email,
                  updated_at: new Date().toISOString()
                }
              ]
            });
            return res.data;
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verifiedNumberAndEmail'] });
      toast.success('Verification successful');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Invalid verification code');
    }
  });

  useEffect(() => {
    if (phoneAndEmailVerify.isOpen && !isSending) {
      const mainTimer = setInterval(() => {
        setMainCountdown((prev) => {
          if (prev <= 0) {
            clearInterval(mainTimer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const resendTimer = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 0) {
            clearInterval(resendTimer);
            setIsResendEnabled(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(mainTimer);
        clearInterval(resendTimer);
      };
    }
  }, [phoneAndEmailVerify.isOpen, isSending]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {phoneAndEmailVerify.isOpen &&
        (phoneAndEmailVerify.phone || phoneAndEmailVerify.email) &&
        phoneAndEmailVerify.isRequired && (
          <Modal
            onClose={() => {
              setPhoneAndEmailVerify({ ...phoneAndEmailVerify, isOpen: false });
              onClose?.();
            }}
            isCloseable={false}
          >
            <div className='border-t-rounded text-opacity-95 relative mt-20 h-screen overflow-y-auto rounded-t-2xl bg-black px-5 text-white'>
              <div className='sticky top-0 z-10 flex justify-between border-b border-white/10 bg-black px-7 py-4'>
                <h1 className='w-full text-center text-xl font-bold'>
                  Verify {phoneAndEmailVerify.phone ? 'Phone Number' : 'Email'}
                </h1>
                <button
                  type='button'
                  className='my-auto h-fit w-fit'
                  onClick={() =>
                    setPhoneAndEmailVerify({
                      ...phoneAndEmailVerify,
                      isOpen: false
                    })
                  }
                >
                  <IoCloseCircleOutline className='text-3xl' />
                </button>
              </div>

              <div className='mt-8 p-6'>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className='mb-8 flex flex-col items-center text-center'
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className='bg-primary/20 mb-4 flex h-16 w-16 items-center justify-center rounded-full'
                  >
                    <PiClock className='text-primary h-8 w-8' />
                  </motion.div>
                  <motion.h2
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className='mb-2 text-2xl font-bold'
                  >
                    {phoneAndEmailVerify.phone || phoneAndEmailVerify.email}
                  </motion.h2>
                  <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className='text-muted-foreground'
                  >
                    Enter the verification code sent to your{' '}
                    {phoneAndEmailVerify.phone ? 'phone' : 'email'}
                  </motion.p>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className='space-y-4'
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    className='bg-backgroundLight/30 rounded-xl p-4'
                  >
                    <div className='mb-3 flex items-center justify-between'>
                      <span className='text-muted-foreground text-sm'>
                        Verification Code
                      </span>
                      {isSending ? (
                        <span className='text-primary flex items-center gap-2 text-sm font-medium'>
                          <PiSpinner className='animate-spin' />
                          Sending...
                        </span>
                      ) : (
                        <span className='text-primary text-sm font-medium'>
                          {formatTime(mainCountdown)}
                        </span>
                      )}
                    </div>
                    <Input
                      type='text'
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder='Enter 6-digit code'
                      className='bg-backgroundLight border-white/20 focus:border-white/40'
                    />
                  </motion.div>

                  <Button
                    onClick={() => verifyCodeMutation.mutate()}
                    disabled={
                      verificationCode.length !== 6 ||
                      verifyCodeMutation.isPending
                    }
                    className='bg-primary hover:bg-primaryLight text-background0 w-full'
                  >
                    {verifyCodeMutation.isPending ? (
                      <PiSpinner className='animate-spin' />
                    ) : (
                      'Verify'
                    )}
                  </Button>

                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    className='text-muted-foreground flex items-center justify-center gap-2 text-sm'
                  >
                    <span>Didn&apos;t receive the code?</span>
                    <button
                      onClick={() => sendCodeMutation.mutate()}
                      disabled={!isResendEnabled || sendCodeMutation.isPending}
                      className='text-primary hover:text-primaryLight disabled:opacity-50'
                    >
                      {sendCodeMutation.isPending ? (
                        <PiSpinner className='animate-spin' />
                      ) : isResendEnabled ? (
                        'Resend'
                      ) : (
                        `Resend in ${formatTime(resendCountdown)}`
                      )}
                    </button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </Modal>
        )}
    </>
  );
};

export default PhoneAndEmail;
