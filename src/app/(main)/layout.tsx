import { authOptions } from '@/lib/authOptions';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import React from 'react';

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const sess = await getServerSession(authOptions);
  console.log(sess);

  if (!sess) {
    redirect('/signin');
  }

  if (sess?.error === 'RefreshAccessTokenError') {
    console.log('RefreshAccessTokenError');
    redirect('/signin?logout=true');
  }

  if (!sess.roles?.includes('admin') && !sess.roles?.includes('consultant')) {
    redirect('https://app.chuolink.com/');
  }

  return <>{children}</>;
};

export default MainLayout;
