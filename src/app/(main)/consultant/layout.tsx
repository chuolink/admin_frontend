import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { authOptions } from '@/lib/authOptions';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Icons } from '@/components/icons';
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
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  const sess = await getServerSession(authOptions);

  if (sess?.roles?.includes('admin')) {
    redirect('/admin/overview');
  }

  type NavigationItem = {
    name: string;
    href: string;
    icon: keyof typeof Icons;
  };

  const navigation: NavigationItem[] = [
    {
      name: 'Overview',
      href: '/consultant/overview',
      icon: 'dashboard'
    },
    {
      name: 'Applications',
      href: '/consultant/applications',
      icon: 'file-text'
    },
    {
      name: 'Payments',
      href: '/consultant/payments',
      icon: 'credit-card'
    },
    {
      name: 'Withdrawals',
      href: '/consultant/withdrawals',
      icon: 'wallet'
    },

    {
      name: 'Profile',
      href: '/consultant/profile',
      icon: 'user'
    }
  ];

  return (
    <KBar>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar navigation={navigation} />
        <SidebarInset>
          <Header />
          {/* page main content */}
          <RegistrationProvider>{children}</RegistrationProvider>
          {/* page main content ends */}
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
