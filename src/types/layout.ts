import { IconProps } from '@tabler/icons-react';

export interface NavigationItem {
  name: string;
  href: string;
  icon: IconProps;
  disabled?: boolean;
  external?: boolean;
  shortcut?: [string, string];
  label?: string;
  description?: string;
  isActive?: boolean;
  items?: NavigationItem[];
}

export interface NavigationItemWithChildren extends NavigationItem {
  items: NavigationItemWithChildren[];
}

export interface NavigationItemWithOptionalChildren extends NavigationItem {
  items?: NavigationItemWithChildren[];
}

export interface LayoutProps {
  children: React.ReactNode;
}

export interface SidebarProps {
  navigation: NavigationItem[];
  defaultOpen?: boolean;
}

export interface HeaderProps {
  title?: string;
  description?: string;
}

export interface AppSidebarProps {
  defaultOpen?: boolean;
}

export interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export interface SidebarInsetProps {
  children: React.ReactNode;
}
