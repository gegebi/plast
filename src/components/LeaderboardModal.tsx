import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserProfile, MountainId, LeaderboardUser } from '../types';
import { MOUNTAIN_LEAGUES, LEAGUE_ORDER } from '../data/mountains';
import { Trophy, Mountain, Heart, Flame, X, Sparkles, Users, Sprout } from 'lucide-react';
import { playSound } from '../utils/sound';
import { firestoreService } from '../services/firestoreService';
import { UserAvatar } from './UserAvatar';
import { extractCleanNicknameAndAvatar, sanitizeNickname } from '../utils/userUtils';

interface LeaderboardModalProps {
  user: UserProfile;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  user,
  onClose
}) => {
  const [selectedLeague, setSelectedLeague] = useState<MountainId>(user.currentLeagueId);
  const [cheeredUserIds, setCheeredUserIds] = useState<Set<string>>(new Set());
  const [liveEntries, setLiveEntries] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const currentLeagueInfo = MOUNTAIN_LEAGUES[selectedLeague] || MOUNTAIN_LEAGUES.namsan;
  const userLeagueInfo = MOUNTAIN_LEAGUES[user.currentLeagueId] || MOUNTAIN_LEAGUES.namsan;

  // Subscribe to real-time Firestore leaderboard for selected league
  useEffect(() => {
    setIsLoading(true);
    const unsub = firestoreService.subscribeLeaderboard(selectedLeague, (entries) => {
      setLiveEntries(entries);
      setIsLoading(false);
    });
    return () => unsub();
  }, [selectedLeague]);

  // Combine ONLY real Firestore entries + current active user if in this league
  const combinedMap = new Map<string, LeaderboardUser>();

  // 1. Add real live entries directly from Firestore database
  liveEntries.forEach((entry) => {
    const { nickname: cleanName, avatarUrl: cleanAvatar } = extractCleanNicknameAndAvatar(entry.nickname, entry.avatar);
    combinedMap.set(entry.id, {
      ...entry,
      nickname: cleanName,
      avatar: cleanAvatar,
      leagueId: selectedLeague,
      isCurrentUser: entry.id === user.id
    });
  });

  // 2. If current user belongs to the selected league, ensure their real-time state is synced/included
  if (user.currentLeagueId === selectedLeague) {
    const existing = combinedMap.get(user.id);
    const { nickname: cleanName, avatarUrl: cleanAvatar } = extractCleanNicknameAndAvatar(user.nickname, user.avatarUrl);
    combinedMap.set(user.id, {
      id: user.id,
      nickname: cleanName,
      avatar: cleanAvatar,
      leagueId: selectedLeague,
      leagueRank: existing?.leagueRank || 1,
      treesInMountain: user.treesInCurrentMountain,
      totalGrown: user.totalTreesGrownAllTime,
      streak: user.recyclingStreakDays,
      isCurrentUser: true,
    });
  }

  // 3. Sort purely real users and dynamically assign accurate ranks
  const leaderboardUsers = Array.from(combinedMap.values());
  leaderboardUsers.sort((a, b) => (b.treesInMountain - a.treesInMountain) || (b.totalGrown - a.totalGrown));
  leaderboardUsers.forEach((item, index) => {
    item.leagueRank = index + 1;
  });

  // Find user rank in currently viewed league
  const currentUserEntry = leaderboardUsers.find(u => u.isCurrentUser);

  const handleCheer = (userId: string) => {
    playSound('plant');
    setCheeredUserIds(prev => new Set(prev).add(userId));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-xl bg-[#F9F7F2] rounded-3xl border border-[#E8E4D9] p-6 sm:p-8 text-[#3C4030] shadow-2xl my-8 relative overflow-hidden"
      >
        {/* Header Section */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#E2B842]" />
              <h3 className="text-2xl font-sans font-extrabold text-[#2D3319]">
                산(Mountain) 리그 랭킹
              </h3>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Firebase 실시간 연동
              </span>
              <span className="text-xs text-[#6B705C]">
                • 실제 참여자 {leaderboardUsers.length}명
              </span>
            </div>
          </div>
          <button
            onClick={() => { playSound('click'); onClose(); }}
            className="p-2 rounded-full bg-white border border-[#E8E4D9] text-[#6B705C] hover:text-[#2D3319] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Rank Highlight Card */}
        <div className="p-4 rounded-2xl bg-[#E9EDC9] border border-[#CCD5AE] mb-5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#7A9D54] text-white flex items-center justify-center font-black text-lg shadow-sm">
              {currentUserEntry ? `#${currentUserEntry.leagueRank}` : '-'}
            </div>
            <div className="flex items-center gap-2.5">
              <UserAvatar avatar={user.avatarUrl} nickname={user.nickname} size="md" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-[#2D3319]">{sanitizeNickname(user.nickname)}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DDE5B6] text-[#4A5D23] font-bold border border-[#CCD5AE]">
                    내 프로필
                  </span>
                </div>
                <p className="text-xs font-bold text-[#4A7856] mt-0.5">
                  {currentUserEntry 
                    ? `${currentLeagueInfo.name} 리그 ${currentUserEntry.leagueRank}위 (${user.treesInCurrentMountain}그루)`
                    : `현재 소속: ${userLeagueInfo.name} 리그`}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-[#6B705C] block">
              {user.currentLeagueId === selectedLeague ? '현재 산 나무' : '내 산 진행도'}
            </span>
            <span className="font-mono font-bold text-[#4A7856] text-sm">
              {user.treesInCurrentMountain} / {userLeagueInfo.requiredTrees}그루
            </span>
          </div>
        </div>

        {/* Mountain League Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
          {LEAGUE_ORDER.map((leagueId) => {
            const league = MOUNTAIN_LEAGUES[leagueId];
            const isSelected = selectedLeague === leagueId;
            return (
              <button
                key={league.id}
                onClick={() => {
                  playSound('click');
                  setSelectedLeague(league.id);
                }}
                className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#7A9D54] text-white shadow-xs'
                    : 'bg-white border border-[#E8E4D9] text-[#6B705C] hover:text-[#2D3319]'
                }`}
              >
                <Mountain className="w-3.5 h-3.5" />
                <span>{league.name}</span>
                <span className="text-[10px] opacity-75">({league.altitude}m)</span>
              </button>
            );
          })}
        </div>

        {/* Leaderboard Table List or Empty State */}
        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-8 h-8 rounded-full border-3 border-[#7A9D54] border-t-transparent animate-spin" />
              <p className="text-xs text-[#6B705C] font-medium">실시간 랭킹 데이터를 불러오는 중...</p>
            </div>
          ) : leaderboardUsers.length === 0 ? (
            <div className="py-10 px-4 text-center bg-white/60 rounded-2xl border border-dashed border-[#DDE5B6] flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-[#E9EDC9] flex items-center justify-center text-[#7A9D54] mb-1">
                <Sprout className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-[#2D3319]">
                아직 {currentLeagueInfo.name} 리그에 등록된 사용자가 없습니다
              </p>
              <p className="text-xs text-[#8C8F7A] max-w-xs leading-relaxed">
                올바른 분리수거로 나무를 키워 {currentLeagueInfo.name} 리그의 첫 번째 랭커가 되어보세요!
              </p>
            </div>
          ) : (
            leaderboardUsers.map((item) => {
              const hasCheered = cheeredUserIds.has(item.id);

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                    item.isCurrentUser
                      ? 'bg-[#F0EDE5] border-2 border-[#7A9D54] shadow-xs'
                      : 'bg-white border-[#E8E4D9] hover:border-[#CCD5AE] shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                      item.leagueRank === 1
                        ? 'bg-[#E2B842] text-[#2D3319] shadow-xs'
                        : item.leagueRank === 2
                        ? 'bg-[#DDE5B6] text-[#4A5D23]'
                        : item.leagueRank === 3
                        ? 'bg-[#CCD5AE] text-[#4A5D23]'
                        : 'bg-[#F0EDE5] text-[#8C8F7A]'
                    }`}>
                      {item.leagueRank === 1 ? '🥇' : item.leagueRank === 2 ? '🥈' : item.leagueRank === 3 ? '🥉' : item.leagueRank}
                    </div>

                    {/* Clean Avatar Graphic or Photo */}
                    <UserAvatar avatar={item.avatar} nickname={item.nickname} size="sm" />

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold ${item.isCurrentUser ? 'text-[#4A7856]' : 'text-[#2D3319]'}`}>
                          {item.nickname}
                        </span>
                        {item.isCurrentUser && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-[#7A9D54] text-white font-bold rounded-full">
                            나
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#8C8F7A] mt-0.5">
                        <span>나무 <strong className="text-[#3C4030] font-mono">{item.treesInMountain}</strong>그루</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-[#E2B842]">
                          <Flame className="w-3 h-3 fill-[#E2B842]" /> {item.streak}일 연속
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cheer Action Button */}
                  {!item.isCurrentUser && (
                    <button
                      onClick={() => handleCheer(item.id)}
                      className={`p-2 rounded-xl transition-all active:scale-95 ${
                        hasCheered
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : 'bg-[#F0EDE5] hover:bg-rose-50 text-[#8C8F7A] hover:text-rose-600'
                      }`}
                      title="응원하기"
                    >
                      <Heart className={`w-4 h-4 ${hasCheered ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};
