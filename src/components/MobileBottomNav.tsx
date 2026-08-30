import React from 'react';
import { Camera, TreePine, Mountain, Trophy, User } from 'lucide-react';
import { playSound } from '../utils/sound';
import { UserProfile } from '../types';
import { MOUNTAIN_LEAGUES } from '../data/mountains';
import { UserAvatar } from './UserAvatar';

interface MobileBottomNavProps {
  user: UserProfile;
  onOpenScanner: () => void;
  onOpenMountains: () => void;
  onOpenLeaderboard: () => void;
  onOpenStats: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  user,
  onOpenScanner,
  onOpenMountains,
  onOpenLeaderboard,
  onOpenStats,
}) => {
  const currentMountain = MOUNTAIN_LEAGUES[user.currentLeagueId] || MOUNTAIN_LEAGUES.namsan;

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F9F7F2]/95 backdrop-blur-lg border-t border-[#E8E4D9] px-3 py-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Meadow Home */}
        <button
          onClick={() => {
            playSound('click');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-0.5 py-1 px-2.5 text-[#4A7856] transition-transform active:scale-90"
        >
          <TreePine className="w-5 h-5" />
          <span className="text-[10px] font-bold">내 풀밭</span>
        </button>

        {/* 2. Mountain League */}
        <button
          onClick={() => {
            playSound('click');
            onOpenMountains();
          }}
          className="flex flex-col items-center gap-0.5 py-1 px-2.5 text-[#6B705C] hover:text-[#2D3319] transition-transform active:scale-90"
        >
          <Mountain className="w-5 h-5 text-[#7A9D54]" />
          <span className="text-[10px] font-bold">{currentMountain.name}</span>
        </button>

        {/* 3. Center Big Camera Action Button */}
        <button
          onClick={() => {
            playSound('click');
            onOpenScanner();
          }}
          className="relative -top-3 flex flex-col items-center group"
          aria-label="실시간 촬영 인식"
        >
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#4A7856] to-[#7A9D54] flex items-center justify-center text-white shadow-[0_8px_20px_rgba(74,120,86,0.4)] border-3 border-white group-active:scale-95 transition-all">
            <Camera className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-extrabold text-[#2D3319] mt-0.5">촬영인증</span>
        </button>

        {/* 4. Leaderboard */}
        <button
          onClick={() => {
            playSound('click');
            onOpenLeaderboard();
          }}
          className="flex flex-col items-center gap-0.5 py-1 px-2.5 text-[#6B705C] hover:text-[#2D3319] transition-transform active:scale-90"
        >
          <Trophy className="w-5 h-5 text-[#E2B842]" />
          <span className="text-[10px] font-bold">리그랭킹</span>
        </button>

        {/* 5. Stats / Profile */}
        <button
          onClick={() => {
            playSound('click');
            onOpenStats();
          }}
          className="flex flex-col items-center gap-0.5 py-1 px-2.5 text-[#6B705C] hover:text-[#2D3319] transition-transform active:scale-90"
        >
          <UserAvatar 
            avatar={user.avatarUrl} 
            nickname={user.nickname} 
            size="xs" 
            className="w-5 h-5 border border-[#A3B18A]"
          />
          <span className="text-[10px] font-bold">에코통계</span>
        </button>
      </div>
    </nav>
  );
};
