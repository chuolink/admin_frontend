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
export const metadata: Metadata = {
  title: 'Chuolink Portal',
  description: 'Search, Discover, Apply'
};

export default async function DashboardLayout({
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
      href: '/admin/overview',
      icon: 'dashboard'
    },
    {
      name: 'Students',
      href: '/admin/students',
      icon: 'users'
    },
    {
      name: 'Applications',
      href: '/admin/applications',
      icon: 'file-text'
    },
    {
      name: 'Payments',
      href: '/admin/payments',
      icon: 'credit-card'
    },
    {
      name: 'Withdrawals',
      href: '/admin/withdrawals',
      icon: 'wallet'
    },
    {
      name: 'Countries',
      href: '/admin/countries',
      icon: 'map'
    }

    // {
    //   name: 'Referrals',
    //   href: '/admin/referrals',
    //   icon: 'users-group'
    // },
    // {
    //   name: 'Settings',
    //   href: '/admin/settings',
    //   icon: 'settings'
    // }
  ];

  return (
    <KBar>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar navigation={navigation} />
        <SidebarInset>
          <Header />
          {/* page main content */}
          {children}
          {/* page main content ends */}
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
