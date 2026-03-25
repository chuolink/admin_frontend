import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { authOptions } from '@/lib/authOptions';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import RegistrationProvider from './providers/RegistrationProvider';

export const metadata: Metadata = {
  title: 'Chuolink Portal',
  description: 'Search, Discover, Apply'
};

export default async function ConsultantLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  const sess = await getServerSession(authOptions);

  if (sess?.roles?.includes('admin')) {
    redirect('/admin/overview');
  }

  return (
    <KBar>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar variant='consultant' />
        <SidebarInset>
          <Header fixed />
          <RegistrationProvider>{children}</RegistrationProvider>
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
