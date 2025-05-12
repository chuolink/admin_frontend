import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'next-auth';
interface UserAvatarProfileProps {
  className?: string;
  showInfo?: boolean;
  user: User;
}

export function UserAvatarProfile({
  className,
  showInfo = false,
  user
}: UserAvatarProfileProps) {
  return (
    <div className='flex items-center gap-2'>
      <Avatar className={className}>
        {/* @ts-ignore */}
        <AvatarImage
          src={user?.profile_img || ''}
          alt={user?.first_name || ''}
        />
        <AvatarFallback className='rounded-lg'>
          {user?.first_name?.slice(0, 2)?.toUpperCase() || 'CN'}
        </AvatarFallback>
      </Avatar>

      {showInfo && (
        <div className='grid flex-1 text-left text-sm leading-tight'>
          <span className='truncate font-semibold'>
            {user?.first_name + ' ' + user?.last_name || ''}
          </span>
          <span className='truncate text-xs'>{user?.email || ''}</span>
        </div>
      )}
    </div>
  );
}
