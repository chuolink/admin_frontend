import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { authOptions } from '@/lib/authOptions';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NavGroup } from '@/components/layout/types';
import RegistrationProvider from './providers/RegistrationProvider';
import {
  LayoutDashboard,
  Kanban,
  UserSearch,
  Phone,
  Users,
  FileText,
  CreditCard,
  Wallet,
  User
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Chuolink Portal',
  description: 'Search, Discover, Apply'
};

const navGroups: NavGroup[] = [
  {
    title: 'General',
    items: [
      {
        title: 'Dashboard',
        url: '/consultant/overview',
        icon: LayoutDashboard
      },
      {
        title: 'My Pipeline',
        url: '/consultant/pipeline',
        icon: Kanban
      }
    ]
  },
  {
    title: 'CRM',
    items: [
      {
        title: 'My Leads',
        url: '/consultant/leads',
        icon: UserSearch
      },
      {
        title: 'My Calls',
        url: '/consultant/sales-calls',
        icon: Phone
      }
    ]
  },
  {
    title: 'Students',
    items: [
      {
        title: 'My Students',
        url: '/consultant/students',
        icon: Users
      },
      {
        title: 'Applications',
        url: '/consultant/applications',
        icon: FileText
      }
    ]
  },
  {
    title: 'Finance',
    items: [
      {
        title: 'Payments',
        url: '/consultant/payments',
        icon: CreditCard
      },
      {
        title: 'Withdrawals',
        url: '/consultant/withdrawals',
        icon: Wallet
      }
    ]
  },
  {
    title: 'Settings',
    items: [
      {
        title: 'Profile',
        url: '/consultant/profile',
        icon: User
      }
    ]
  }
];

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
        <AppSidebar navGroups={navGroups} />
        <SidebarInset>
          <Header fixed />
          <RegistrationProvider>{children}</RegistrationProvider>
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
