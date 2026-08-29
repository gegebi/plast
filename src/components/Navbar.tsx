import React from 'react';
import { Camera, Mountain, Trophy, Sparkles, User, TreePine, Flame, Leaf } from 'lucide-react';
import { UserProfile } from '../types';
import { MOUNTAIN_LEAGUES } from '../data/mountains';
import { playSound } from '../utils/sound';

interface NavbarProps {
  user: UserProfile;
  treesCount: number;
  growthMultiplier: number;
  onOpenScanner: () => void;
  onOpenMountains: () => void;
  onOpenLeaderboard: () => void;
  onOpenStats: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  treesCount,
  growthMultiplier,
  onOpenScanner,
  onOpenMountains,
  onOpenLeaderboard,
  onOpenStats,
  onLogout
}) => {
  const currentMountain = MOUNTAIN_LEAGUES[user.currentLeagueId] || MOUNTAIN_LEAGUES.namsan;
  const progressPercent = Math.min(100, Math.round((user.treesInCurrentMountain / currentMountain.requiredTrees) * 100));

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F9F7F2]/90 backdrop-blur-md border-b border-[#E8E4D9] px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Mountain Status */}
        <div className="flex items-center gap-3">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              playSound('click');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="w-11 h-11 bg-[#7A9D54] rounded-full flex items-center justify-center shadow-md border-2 border-white group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-lg font-sans">P</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-xl tracking-tight text-[#2D3319] font-sans">
                  Plast
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DDE5B6] text-[#4A5D23] font-bold uppercase tracking-wider">
                  Eco-Forest
                </span>
              </div>
              <p className="text-[11px] text-[#8C8F7A] font-medium hidden sm:block">
                Eco-Restoration Project
              </p>
            </div>
          </div>

          {/* User Mountain Rank Badge (e.g., "사용자닉네임: 남산 1위") */}
          <div 
            onClick={() => { playSound('click'); onOpenLeaderboard(); }}
            className="hidden md:flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-md shadow-xs border border-[#E8E4D9] hover:border-[#7A9D54] cursor-pointer transition-all hover:bg-white"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFD966] shadow-[0_0_8px_rgba(255,217,102,0.8)]" />
            <span className="text-xs font-semibold text-[#6B705C]">
              {user.nickname}:
            </span>
            <span className="text-xs font-bold text-[#2D3319] flex items-center gap-1">
              <Mountain className="w-3.5 h-3.5 text-[#7A9D54]" />
              {currentMountain.name} {user.leagueRank}위
            </span>
          </div>
        </div>

        {/* Forest Status & Tree Counter */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Growth Multiplier (More trees = faster growth!) */}
          <div 
            title="나무가 많을수록 광합성 시너지로 성장 속도가 증가합니다!"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/80 border border-[#E8E4D9] text-[#3C4030] text-xs font-medium shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#7A9D54] animate-spin" style={{ animationDuration: '6s' }} />
            <span className="font-bold text-[#2D3319]">x{growthMultiplier.toFixed(1)}</span>
            <span className="hidden lg:inline text-[#8C8F7A]">성장 부스트</span>
          </div>

          {/* Mountain Progress */}
          <button
            onClick={() => { playSound('click'); onOpenMountains(); }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/80 hover:bg-white border border-[#E8E4D9] hover:border-[#7A9D54] text-xs text-[#3C4030] shadow-xs transition-all"
          >
            <TreePine className="w-4 h-4 text-[#7A9D54]" />
            <div className="text-left">
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#2D3319]">
                <span>{currentMountain.name}</span>
                <span className="text-[#8C8F7A]">({user.treesInCurrentMountain}/{currentMountain.requiredTrees})</span>
              </div>
              <div className="w-16 sm:w-20 h-1.5 bg-[#F0EDE5] rounded-full overflow-hidden mt-0.5">
                <div 
                  className="h-full bg-[#7A9D54] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </button>

          {/* Leaderboard CTA */}
          <button
            onClick={() => { playSound('click'); onOpenLeaderboard(); }}
            aria-label="랭킹보기"
            className="p-2.5 rounded-full bg-white/80 hover:bg-white border border-[#E8E4D9] text-[#6B705C] hover:text-[#2D3319] shadow-xs transition-colors"
          >
            <Trophy className="w-4 h-4 text-[#7A9D54]" />
          </button>

          {/* Real-time Camera Scanner Trigger */}
          <button
            onClick={() => {
              playSound('click');
              onOpenScanner();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#4A7856] hover:bg-[#3E6548] text-white font-bold text-xs sm:text-sm shadow-[0_6px_20px_rgba(74,120,86,0.25)] active:scale-95 transition-all"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">실시간 촬영 인식</span>
            <span className="sm:hidden">인식</span>
          </button>

          {/* User Profile / Menu */}
          <button
            onClick={() => { playSound('click'); onOpenStats(); }}
            className="w-9 h-9 rounded-full bg-white border border-[#E8E4D9] shadow-xs overflow-hidden hover:border-[#7A9D54] transition-all flex items-center justify-center text-xs font-bold text-[#3C4030]"
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.nickname} className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-[#6B705C]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
