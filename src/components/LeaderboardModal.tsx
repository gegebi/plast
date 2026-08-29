import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserProfile, MountainId, LeaderboardUser } from '../types';
import { MOUNTAIN_LEAGUES, LEAGUE_ORDER } from '../data/mountains';
import { Trophy, Medal, Mountain, Heart, UserCheck, Flame, X, Sparkles } from 'lucide-react';
import { playSound } from '../utils/sound';
import { firestoreService } from '../services/firestoreService';

interface LeaderboardModalProps {
  user: UserProfile;
  onClose: () => void;
}

// Baseline competition data for each mountain league
const getMockLeagueUsers = (leagueId: MountainId): Omit<LeaderboardUser, 'leagueId' | 'leagueRank' | 'isCurrentUser'>[] => {
  const mountain = MOUNTAIN_LEAGUES[leagueId];
  const maxTrees = mountain.requiredTrees;

  const mockUsers: Record<MountainId, Omit<LeaderboardUser, 'leagueId' | 'leagueRank' | 'isCurrentUser'>[]> = {
    namsan: [
      { id: 'user_1', nickname: '초록지킴이', avatar: '🌱', treesInMountain: Math.min(maxTrees - 1, 48), totalGrown: 48, streak: 12 },
      { id: 'user_2', nickname: '엽떡세척달인', avatar: '🍲', treesInMountain: 42, totalGrown: 42, streak: 8 },
      { id: 'user_3', nickname: '맑은하늘', avatar: '🌤️', treesInMountain: 35, totalGrown: 35, streak: 5 },
      { id: 'user_4', nickname: '에코히어로', avatar: '🦸', treesInMountain: 28, totalGrown: 28, streak: 4 },
      { id: 'user_5', nickname: '페트병수호자', avatar: '🍾', treesInMountain: 20, totalGrown: 20, streak: 3 },
      { id: 'user_6', nickname: '그린새싹', avatar: '🌿', treesInMountain: 14, totalGrown: 14, streak: 2 },
    ],
    hallasan: [
      { id: 'user_h1', nickname: '백록담의정령', avatar: '🦌', treesInMountain: 95, totalGrown: 145, streak: 24 },
      { id: 'user_h2', nickname: '제주바람', avatar: '🌊', treesInMountain: 82, totalGrown: 132, streak: 15 },
      { id: 'user_h3', nickname: '동백꽃필무렵', avatar: '🌺', treesInMountain: 64, totalGrown: 114, streak: 9 },
      { id: 'user_h4', nickname: '한라봉요정', avatar: '🍊', treesInMountain: 45, totalGrown: 95, streak: 7 },
    ],
    jirisan: [
      { id: 'user_j1', nickname: '반달곰지킴이', avatar: '🐻', treesInMountain: 188, totalGrown: 338, streak: 45 },
      { id: 'user_j2', nickname: '천왕봉일출', avatar: '🌅', treesInMountain: 152, totalGrown: 302, streak: 30 },
      { id: 'user_j3', nickname: '노고단운해', avatar: '☁️', treesInMountain: 110, totalGrown: 260, streak: 18 },
    ],
    seoraksan: [
      { id: 'user_s1', nickname: '울산바위도인', avatar: '🪨', treesInMountain: 285, totalGrown: 635, streak: 60 },
      { id: 'user_s2', nickname: '단풍마스터', avatar: '🍁', treesInMountain: 210, totalGrown: 560, streak: 40 },
    ],
    k2: [
      { id: 'user_k1', nickname: '고산등반가', avatar: '🧗', treesInMountain: 470, totalGrown: 1120, streak: 90 },
      { id: 'user_k2', nickname: '빙하수호신', avatar: '❄️', treesInMountain: 340, totalGrown: 990, streak: 75 },
    ],
    everest: [
      { id: 'user_e1', nickname: '지구의영웅', avatar: '👑', treesInMountain: 980, totalGrown: 2130, streak: 180 },
      { id: 'user_e2', nickname: '에코신화', avatar: '⭐', treesInMountain: 850, totalGrown: 2000, streak: 120 },
    ]
  };

  return mockUsers[leagueId] || [];
};

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  user,
  onClose
}) => {
  const [selectedLeague, setSelectedLeague] = useState<MountainId>(user.currentLeagueId);
  const [cheeredUserIds, setCheeredUserIds] = useState<Set<string>>(new Set());
  const [liveEntries, setLiveEntries] = useState<LeaderboardUser[]>([]);

  const currentLeagueInfo = MOUNTAIN_LEAGUES[selectedLeague];

  // Subscribe to real-time Firestore leaderboard
  useEffect(() => {
    const unsub = firestoreService.subscribeLeaderboard(selectedLeague, (entries) => {
      setLiveEntries(entries);
    });
    return () => unsub();
  }, [selectedLeague]);

  // Merge live Firestore entries with mock community entries
  const mockList = getMockLeagueUsers(selectedLeague);
  const combinedMap = new Map<string, LeaderboardUser>();

  // Add mock users first
  mockList.forEach((m, idx) => {
    combinedMap.set(m.id, {
      ...m,
      leagueId: selectedLeague,
      leagueRank: idx + 1,
      isCurrentUser: m.id === user.id
    });
  });

  // Overlay live Firestore entries
  liveEntries.forEach((entry) => {
    combinedMap.set(entry.id, {
      ...entry,
      leagueId: selectedLeague,
      isCurrentUser: entry.id === user.id
    });
  });

  // If current user is in this league, ensure they are present
  if (user.currentLeagueId === selectedLeague) {
    const existing = combinedMap.get(user.id);
    combinedMap.set(user.id, {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatarUrl || '🌟',
      leagueId: selectedLeague,
      leagueRank: existing?.leagueRank || 1,
      treesInMountain: user.treesInCurrentMountain,
      totalGrown: user.totalTreesGrownAllTime,
      streak: user.recyclingStreakDays,
      isCurrentUser: true,
    });
  }

  const leaderboardUsers = Array.from(combinedMap.values());
  leaderboardUsers.sort((a, b) => b.treesInMountain - a.treesInMountain || b.totalGrown - a.totalGrown);
  leaderboardUsers.forEach((item, index) => {
    item.leagueRank = index + 1;
  });

  // Find user rank in current viewed league
  const currentUserEntry = leaderboardUsers.find(u => u.isCurrentUser);

  const handleCheer = (userId: string) => {
    playSound('plant');
    setCheeredUserIds(prev => new Set(prev).add(userId));
  };


  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
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
            <p className="text-xs text-[#6B705C] mt-1">
              각 산별로 깨끗한 분리수거를 실천하는 에코 러너들의 실시간 순위입니다.
            </p>
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
              #{currentUserEntry ? currentUserEntry.leagueRank : user.leagueRank}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-[#2D3319]">{user.nickname}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DDE5B6] text-[#4A5D23] font-bold border border-[#CCD5AE]">
                  내 랭킹
                </span>
              </div>
              <p className="text-xs font-bold text-[#4A7856] mt-0.5">
                {currentLeagueInfo.name} 리그 {currentUserEntry ? currentUserEntry.leagueRank : user.leagueRank}위
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-[#6B705C] block">현재 산 나무</span>
            <span className="font-mono font-bold text-[#4A7856] text-sm">
              {user.treesInCurrentMountain} / {currentLeagueInfo.requiredTrees}그루
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

        {/* Leaderboard Table List */}
        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
          {leaderboardUsers.map((item) => {
            const isTop3 = item.leagueRank <= 3;
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
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs ${
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

                  <span className="text-xl">{item.avatar}</span>

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
                    className={`p-2 rounded-xl transition-all ${
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
          })}
        </div>
      </motion.div>
    </div>
  );
};
