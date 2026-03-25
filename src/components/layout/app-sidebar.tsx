'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { ChevronsUpDown, LogOut, User as UserIcon, Bell } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { OrgSwitcher } from '../org-switcher';
import { NavGroup } from './nav-group';
import { adminNavGroups, consultantNavGroups } from './nav-config';
import { User } from 'next-auth';

const tenants = [
  { id: '1', name: 'Chuolink' },
  { id: '2', name: 'Africa Unilink' }
];

interface AppSidebarProps {
  variant: 'admin' | 'consultant';
}

export default function AppSidebar({ variant }: AppSidebarProps) {
  const navGroups = variant === 'admin' ? adminNavGroups : consultantNavGroups;
  const { data: session } = useSession();
  const user = session?.user as User;
  const router = useRouter();

  const handleSwitchTenant = (_tenantId: string) => {};
  const activeTenant = tenants[0];

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <OrgSwitcher
          tenants={tenants}
          defaultTenant={activeTenant}
          onTenantSwitch={handleSwitchTenant}
        />
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        {navGroups.map((group) => (
          <NavGroup key={group.title} {...group} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                  {user && (
                    <UserAvatarProfile
                      className='h-8 w-8 rounded-lg'
                      showInfo
                      user={user}
                    />
                  )}
                  <ChevronsUpDown className='ml-auto size-4' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='px-1 py-1.5'>
                    {user && (
                      <UserAvatarProfile
                        className='h-8 w-8 rounded-lg'
                        showInfo
                        user={user}
                      />
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => router.push('/admin/settings')}
                  >
                    <UserIcon className='mr-2 h-4 w-4' />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className='mr-2 h-4 w-4' />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className='mr-2 h-4 w-4' />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
