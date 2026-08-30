import React, { useState } from 'react';

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
  const [imageError, setImageError] = useState(false);

  const isUrl = !imageError && avatar && (
    avatar.startsWith('http://') || 
    avatar.startsWith('https://') || 
    avatar.startsWith('data:image/') ||
    avatar.startsWith('/')
  );

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
        crossOrigin="anonymous"
        className={`${currentSizeClass} rounded-full object-cover border border-[#CCD5AE] shadow-xs shrink-0 select-none ${className}`}
        onError={() => setImageError(true)}
      />
    );
  }

  // Pure emoji, text icon or fallback
  const displayContent = (!avatar || avatar.startsWith('http') || avatar.length > 4) 
    ? (nickname ? nickname.slice(0, 1) : '🌱')
    : avatar;

  return (
    <div className={`${currentSizeClass} rounded-full bg-[#E9EDC9] border border-[#CCD5AE] flex items-center justify-center font-bold text-[#4A5D23] select-none shadow-xs shrink-0 ${className}`}>
      <span>{displayContent}</span>
    </div>
  );
};

