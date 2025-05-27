'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Consultant, Response } from '@/types/consultant';
import useClientApi from '@/lib/axios/clientSide';
import OnboardingModal from '@/features/consultant/components/onboarding-modal';
import { useStateStore } from '@/stores/useStateStore';
import PhoneAndEmail from '@/components/phone_email_verify';

const RegistrationProvider = ({ children }: { children: React.ReactNode }) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { api } = useClientApi();
  const { setConsultant } = useStateStore();
  // First, fetch the consultant profile
  const { data: consultant, isLoading: isLoadingConsultant } =
    useQuery<Consultant>({
      queryKey: ['consultant-profile'],
      queryFn: async () => {
        if (!api) throw new Error('API not initialized');
        const response = await api.get('/consultant/overview/');
        const data = response.data as Response<Consultant>;
        const cons = data.results[0];
        console.log(cons, 'cons');
        if (!cons) {
          console.log('no consultant');
          setShowOnboarding(true);
        } else {
          setShowOnboarding(false);
          setConsultant(cons);
        }
        return cons;
      }
    });

  return (
    <>
      {isLoadingConsultant ? (
        <div className='flex h-96 items-center justify-center'>
          <p>Loading consultant profile...</p>
        </div>
      ) : consultant ? (
        children
      ) : (
        <div className='flex h-96 items-center justify-center'>
          <p>No consultant profile found</p>
        </div>
      )}

      {showOnboarding && (
        <OnboardingModal
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
        />
      )}
    </>
  );
};

export default RegistrationProvider;
