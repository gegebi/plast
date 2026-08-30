import React, { useState, useEffect } from 'react';
import { Camera, Mountain, Trophy, Sparkles, User, TreePine, Flame, Leaf, UserX, HelpCircle, BookOpen } from 'lucide-react';
import { UserProfile } from '../types';
import { MOUNTAIN_LEAGUES } from '../data/mountains';
import { playSound } from '../utils/sound';
import { sanitizeNickname } from '../utils/userUtils';
import { firestoreService } from '../services/firestoreService';
import { UserAvatar } from './UserAvatar';

interface NavbarProps {
  user: UserProfile;
  treesCount: number;
  growthMultiplier: number;
  onOpenScanner: () => void;
  onOpenMountains: () => void;
  onOpenLeaderboard: () => void;
  onOpenStats: () => void;
  onOpenGuide?: () => void;
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
  onOpenGuide,
  onLogout
}) => {
  const currentMountain = MOUNTAIN_LEAGUES[user.currentLeagueId] || MOUNTAIN_LEAGUES.namsan;
  const progressPercent = Math.min(100, Math.round((user.treesInCurrentMountain / currentMountain.requiredTrees) * 100));

  const [liveRank, setLiveRank] = useState<number | null>(null);

  // Subscribe to real-time Firestore leaderboard for accurate ranking when logged in
  useEffect(() => {
    if (user.isGuest || !user.id) {
      setLiveRank(null);
      return;
    }

    const unsub = firestoreService.subscribeLeaderboard(user.currentLeagueId, (entries) => {
      const myEntry = entries.find(e => e.id === user.id);
      if (myEntry) {
        setLiveRank(myEntry.leagueRank);
      } else {
        // Compute rank among existing entries
        const myTrees = user.treesInCurrentMountain || 0;
        const higherRankCount = entries.filter(e => e.treesInMountain > myTrees).length;
        setLiveRank(higherRankCount + 1);
      }
    });

    return () => unsub();
  }, [user.isGuest, user.id, user.currentLeagueId, user.treesInCurrentMountain]);

  const displayRank = liveRank ?? user.leagueRank ?? 1;

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
            <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-md border-2 border-white group-hover:scale-105 transition-transform bg-[#7A9D54] flex items-center justify-center">
              <img src="/favicon.svg" alt="Plast Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight text-[#2D3319] font-sans">
                Plast
              </h1>
            </div>
          </div>

          {/* User Mountain Rank / Guest Badge */}
          <div 
            onClick={() => { playSound('click'); onOpenLeaderboard(); }}
            title={user.isGuest ? '게스트 모드 (클릭 시 랭킹 확인)' : `${currentMountain.name} 리그 실시간 ${displayRank}위`}
            className="hidden md:flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-md shadow-xs border border-[#E8E4D9] hover:border-[#7A9D54] cursor-pointer transition-all hover:bg-white"
          >
            <div className={`w-2.5 h-2.5 rounded-full ${
              user.isGuest 
                ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' 
                : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse'
            }`} />
            {user.isGuest ? (
              <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                게스트 모드
              </span>
            ) : (
              <span className="text-xs font-bold text-[#2D3319] flex items-center gap-1">
                <Mountain className="w-3.5 h-3.5 text-[#7A9D54]" />
                {currentMountain.name} {displayRank}위
              </span>
            )}
          </div>
        </div>

        {/* Forest Status & Tree Counter */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Guide / Tutorial Button */}
          {onOpenGuide && (
            <button
              onClick={() => { playSound('click'); onOpenGuide(); }}
              aria-label="이용 가이드 보기"
              title="Plast 이용 가이드 보기"
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-white/80 hover:bg-[#E9EDC9] border border-[#E8E4D9] hover:border-[#CCD5AE] text-xs font-bold text-[#4A5D23] shadow-xs transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#4A7856]" />
              <span className="hidden sm:inline">가이드</span>
            </button>
          )}

          {/* Mountain Progress */}
          <button
            onClick={() => { playSound('click'); onOpenMountains(); }}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-2xl bg-white/80 hover:bg-white border border-[#E8E4D9] hover:border-[#7A9D54] text-xs text-[#3C4030] shadow-xs transition-all"
          >
            <TreePine className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#7A9D54]" />
            <div className="text-left">
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#2D3319]">
                <span>{currentMountain.name}</span>
                <span className="text-[#8C8F7A]">({user.treesInCurrentMountain}/{currentMountain.requiredTrees})</span>
              </div>
              <div className="w-12 sm:w-20 h-1.5 bg-[#F0EDE5] rounded-full overflow-hidden mt-0.5">
                <div 
                  className="h-full bg-[#7A9D54] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </button>

          {/* Leaderboard CTA (hidden on smallest mobile since bottom nav has it) */}
          <button
            onClick={() => { playSound('click'); onOpenLeaderboard(); }}
            aria-label="랭킹보기"
            className="hidden sm:flex p-2.5 rounded-full bg-white/80 hover:bg-white border border-[#E8E4D9] text-[#6B705C] hover:text-[#2D3319] shadow-xs transition-colors"
          >
            <Trophy className="w-4 h-4 text-[#7A9D54]" />
          </button>

          {/* Real-time Camera Scanner Trigger (Desktop/Tablet) */}
          <button
            onClick={() => {
              playSound('click');
              onOpenScanner();
            }}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-[#4A7856] hover:bg-[#3E6548] text-white font-bold text-xs sm:text-sm shadow-[0_6px_20px_rgba(74,120,86,0.25)] active:scale-95 transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>실시간 촬영 인식</span>
          </button>

          {/* User Profile / Menu */}
          <button
            onClick={() => { playSound('click'); onOpenStats(); }}
            aria-label="에코 통계 프로필"
            className="rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <UserAvatar 
              avatar={user.avatarUrl} 
              nickname={user.nickname} 
              size="sm" 
              className="border-2 border-white hover:border-[#7A9D54] shadow-sm transition-all"
            />
          </button>
        </div>
      </div>
    </header>
  );
};

