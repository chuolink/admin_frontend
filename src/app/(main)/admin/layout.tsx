import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { authOptions } from '@/lib/authOptions';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import KBar from '@/components/kbar';
import Header from '@/components/layout/header';
import AppSidebar from '@/components/layout/app-sidebar';

export const metadata: Metadata = {
  title: 'Chuolink Portal',
  description: 'Search, Discover, Apply'
};

export default async function AdminLayout({
  children
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  const sess = await getServerSession(authOptions);

  if (sess?.roles?.includes('consultant')) {
    redirect('/consultant/overview');
  }

  return (
    <KBar>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar variant='admin' />
        <SidebarInset>
          <Header fixed />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
