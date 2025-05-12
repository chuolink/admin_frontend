'use client';

import { Button, buttonVariants } from '@/components/ui/button2';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { PiSpinnerGap } from 'react-icons/pi';
import { createRegistrationUrl, customSignIn } from '@/lib/helpers';
import { useRouter, useSearchParams } from 'next/navigation';
//@ts-ignore
import illustration from '../../../public/illustration.svg';
import Image from 'next/image';
import Footer from '@/components/Footer';

export default function Main() {
  const [isLoadingRegister, setIsLoadingRegister] = useState(false);
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function login() {
    const provider = 'keycloak';
    setIsLoadingLogin(true);
    try {
      // Get redirect_uri from query parameters if available
      const redirectUri = searchParams.get('redirect_uri');

      // Create custom parameters object
      const customParams: Record<string, string> = {};

      // Add all search parameters to our custom params
      searchParams.forEach((value, key) => {
        customParams[key] = value;
      });

      // Use our custom sign-in function
      if (Object.keys(customParams).length > 0) {
        console.log('Using custom sign-in with params:', customParams);
        await customSignIn(provider, customParams);
      } else {
        // Fall back to regular sign-in if no custom params
        await signIn(provider);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Something went wrong!');
    } finally {
      setIsLoadingLogin(false);
    }
  }
  function register() {
    setIsLoadingRegister(true);
    try {
      // Get the base URL
      const valid_url = window.location.origin.replace('www.', '');

      // Create custom parameters object
      const customParams: Record<string, string> = {};

      // Add all search parameters to our custom params
      searchParams.forEach((value, key) => {
        customParams[key] = value;
      });

      // Create the callback URL with the referral code if it exists
      const callbackUrl = `${valid_url}/api/auth/callback/keycloak`;

      // Create registration URL with custom parameters
      let registrationUrl = createRegistrationUrl(callbackUrl, customParams);

      router.push(registrationUrl);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Something went wrong!');
    } finally {
      setIsLoadingRegister(false);
    }
  }
  // return (
  //   <main className="w-full px-4 xs:px-6 sm:px-16 flex flex-col flex-1 justify-end pb-8 xs:pb-12 sm:pb-20 space-y-4">
  //     <button onClick={() => register()} className={buttonVariants({})}>
  //       {isLoadingRegister ? (
  //         <PiSpinnerGap size={30} className="animate-spin" />
  //       ) : (
  //         "CreateAccount"
  //       )}
  //     </button>
  //     <button
  //       onClick={() => login()}
  //       className={buttonVariants({ variant: "outline" })}
  //     >
  //       {isLoadingLogin ? (
  //         <PiSpinnerGap size={30} className="animate-spin" />
  //       ) : (
  //         "Login"
  //       )}
  //     </button>
  //   </main>
  // );

  return (
    <div className='fixed inset-0 flex h-screen flex-1 flex-col items-center justify-between bg-black px-4 lg:flex-row'>
      <div className='relative mx-auto h-1/2 w-screen overflow-visible sm:w-[80vw] lg:h-screen lg:w-1/2 lg:pr-8'>
        <Image
          referrerPolicy='no-referrer'
          src={illustration}
          alt={'Welcome'}
          className='h-full w-full object-contain object-center'
        />
      </div>
      <div className='flex w-full flex-col items-center lg:w-1/2'>
        <header className='m-auto text-center'>
          <h1 className='xs:mb-4 text-error xs:text-3xl mb-2 text-2xl lg:text-4xl xl:text-5xl'>
            Welcome to <strong className='text-primary'>ChuoLink</strong>
          </h1>
          <p className='xs:text-xl text-center text-lg font-thin text-white'>
            Search, Discover, Apply
          </p>
        </header>
        <div className='flex w-full flex-col items-center justify-center lg:mt-20 lg:flex-row lg:justify-between lg:gap-14'>
          <Button
            onClick={() => register()}
            className='mx-auto my-2 mt-4 flex w-11/12 items-center justify-center space-x-1 active:scale-90 lg:mt-auto lg:mb-auto'
          >
            {isLoadingRegister ? (
              <PiSpinnerGap size={30} className='animate-spin' />
            ) : (
              'CreateAccount'
            )}
          </Button>

          <Button
            onClick={() => login()}
            className='mx-auto my-2 mb-52 w-11/12 active:scale-90 lg:mt-auto lg:mb-auto'
            variant={'outline'}
          >
            {isLoadingLogin ? (
              <PiSpinnerGap size={30} className='animate-spin' />
            ) : (
              'Login'
            )}
          </Button>
        </div>
      </div>
      <div className='absolute right-0 bottom-0 left-0'>
        <Footer />
      </div>
    </div>
  );
}
