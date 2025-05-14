import { User } from 'next-auth';

export interface UserNavProps {
  user?: User;
}

export interface UserAvatarProfileProps {
  user: User;
}

export interface UserDropdownProps {
  user: User;
  onSignOut: () => void;
  onProfileClick: () => void;
}

export interface UserDropdownItem {
  label: string;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

export interface UserDropdownGroup {
  items: UserDropdownItem[];
  label?: string;
  separator?: boolean;
}

export interface UserDropdownContentProps {
  user: User;
  groups: UserDropdownGroup[];
  onSignOut: () => void;
  onProfileClick: () => void;
}
