import {
  Sidebar,
  SidebarInset,
  SidebarProvider
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import { authOptions } from '@/lib/authOptions';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  IconDashboard,
  IconUsers,
  IconCreditCard,
  IconBuildingBank,
  IconBell,
  IconMail,
  IconFileText,
  IconWallet,
  IconUsersGroup
} from '@tabler/icons-react';
import { ReactNode } from 'react';
import KBar from '@/components/kbar';
import Header from '@/components/layout/header';
import AppSidebar from '@/components/layout/app-sidebar';

export const metadata: Metadata = {
  title: 'Chuolink Portal',
  description: 'Search, Discover, Apply'
};

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

export default async function AdminLayout({
  children
}: {
  children: ReactNode;
}) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  const sess = await getServerSession(authOptions);

  if (sess?.roles?.includes('consultant')) {
    redirect('/consultant/overview');
  }

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
