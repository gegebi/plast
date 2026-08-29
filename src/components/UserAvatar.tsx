import React from 'react';

interface UserAvatarProps {
  avatar?: string;
  nickname?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  nickname,
  className = '',
  size = 'md'
}) => {
  const isUrl = avatar && (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:image/'));

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-9 h-9 text-base',
    lg: 'w-11 h-11 text-xl',
    xl: 'w-14 h-14 text-2xl'
  };

  const currentSizeClass = sizeClasses[size];

  if (isUrl) {
    return (
      <img
        src={avatar}
        alt={nickname || '프로필'}
        referrerPolicy="no-referrer"
        className={`${currentSizeClass} rounded-full object-cover border border-[#CCD5AE] shadow-xs shrink-0 ${className}`}
        onError={(e) => {
          // If image fails, replace with fallback
          const target = e.currentTarget;
          target.style.display = 'none';
          if (target.parentElement) {
            const fallback = document.createElement('span');
            fallback.innerText = '🌱';
            fallback.className = 'text-base';
            target.parentElement.appendChild(fallback);
          }
        }}
      />
    );
  }

  // Pure emoji or icon character
  return (
    <div className={`${currentSizeClass} rounded-full bg-[#E9EDC9] border border-[#CCD5AE] flex items-center justify-center select-none shadow-xs shrink-0 ${className}`}>
      <span>{avatar || '🌱'}</span>
    </div>
  );
};
