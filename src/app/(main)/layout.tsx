import { authOptions } from '@/lib/authOptions';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import React from 'react';

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const sess = await getServerSession(authOptions);

  if (!sess) {
    redirect('/signin');
  }

  if (!sess.roles?.includes('admin') && !sess.roles?.includes('consultant')) {
    redirect('https://app.chuolink.com/');
  }

  return <>{children}</>;
};

export default MainLayout;
