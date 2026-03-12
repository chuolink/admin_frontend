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
import type { NavGroup } from '@/components/layout/types';
import {
  LayoutDashboard,
  Kanban,
  UserSearch,
  Phone,
  CalendarCheck,
  Users,
  FileText,
  FolderCheck,
  CreditCard,
  Wallet,
  UserCog,
  Globe,
  Settings
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
        url: '/admin/overview',
        icon: LayoutDashboard
      },
      {
        title: 'Pipeline',
        url: '/admin/pipeline',
        icon: Kanban
      }
    ]
  },
  {
    title: 'CRM',
    items: [
      {
        title: 'Leads',
        url: '/admin/leads',
        icon: UserSearch
      },
      {
        title: 'Sales Calls',
        url: '/admin/sales-calls',
        icon: Phone
      },
      {
        title: 'Consultations',
        url: '/admin/consultations',
        icon: CalendarCheck
      }
    ]
  },
  {
    title: 'Students',
    items: [
      {
        title: 'All Students',
        url: '/admin/students',
        icon: Users
      },
      {
        title: 'Applications',
        url: '/admin/applications',
        icon: FileText
      },
      {
        title: 'Documents',
        url: '/admin/documents',
        icon: FolderCheck
      }
    ]
  },
  {
    title: 'Finance',
    items: [
      {
        title: 'Payments',
        url: '/admin/payments',
        icon: CreditCard
      },
      {
        title: 'Withdrawals',
        url: '/admin/withdrawals',
        icon: Wallet
      }
    ]
  },
  {
    title: 'Configuration',
    items: [
      {
        title: 'Consultants',
        url: '/admin/consultants',
        icon: UserCog
      },
      {
        title: 'Countries',
        url: '/admin/countries',
        icon: Globe
      }
    ]
  },
  {
    title: 'Settings',
    items: [
      {
        title: 'Profile',
        url: '/admin/settings',
        icon: Settings
      }
    ]
  }
];

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
        <AppSidebar navGroups={navGroups} />
        <SidebarInset>
          <Header fixed />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
