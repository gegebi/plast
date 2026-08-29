import React from 'react';
import { motion } from 'motion/react';
import { MountainLeagueInfo, UserProfile, MountainId } from '../types';
import { MOUNTAIN_LEAGUES, LEAGUE_ORDER, getNextLeague } from '../data/mountains';
import { Mountain, Award, ChevronRight, Sparkles, Check, Lock, ArrowUpCircle, X } from 'lucide-react';
import { playSound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface MountainLeagueViewProps {
  user: UserProfile;
  onClose: () => void;
  onUpgradeMountain: () => void;
}

export const MountainLeagueView: React.FC<MountainLeagueViewProps> = ({
  user,
  onClose,
  onUpgradeMountain
}) => {
  const currentMountain = MOUNTAIN_LEAGUES[user.currentLeagueId] || MOUNTAIN_LEAGUES.namsan;
  const nextMountain = getNextLeague(user.currentLeagueId);
  const currentMountainIndex = LEAGUE_ORDER.indexOf(user.currentLeagueId);

  const canUpgrade = user.treesInCurrentMountain >= currentMountain.requiredTrees && nextMountain !== null;

  const handleUpgrade = () => {
    playSound('level_up');
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6']
    });
    onUpgradeMountain();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl bg-[#F9F7F2] rounded-3xl border border-[#E8E4D9] p-6 sm:p-8 text-[#3C4030] shadow-2xl my-8 relative overflow-hidden"
      >
        {/* Header Section */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-serif italic font-bold text-[#2D3319]">
                🏔️ 산(Mountain) 리그 시스템
              </h3>
              <span className="px-3 py-0.5 rounded-full bg-[#DDE5B6] text-[#4A5D23] text-xs font-bold border border-[#CCD5AE]">
                리그 {currentMountain.level}단계
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6B705C] mt-1">
              큰 나무가 모이면 산을 형성합니다! 다음 산 리그로 승급하여 더 높은 봉우리에 도전하세요.
            </p>
          </div>
          <button
            onClick={() => { playSound('click'); onClose(); }}
            className="p-2 rounded-full bg-white border border-[#E8E4D9] text-[#6B705C] hover:text-[#2D3319] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Mountain Status Card */}
        <div className={`p-6 rounded-3xl bg-gradient-to-r ${currentMountain.badgeBg} text-white mb-6 shadow-md relative overflow-hidden`}>
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-widest font-bold opacity-85">
                현재 활동 중인 산 리그
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold mt-0.5">
                {currentMountain.name} ({currentMountain.altitude.toLocaleString()}m)
              </h3>
              <p className="text-xs opacity-90 mt-1 max-w-md leading-relaxed">
                {currentMountain.description}
              </p>
              <div className="mt-2.5 text-xs font-medium bg-black/20 backdrop-blur-xs px-3 py-1 rounded-full inline-block">
                📍 랜드마크: {currentMountain.landmark}
              </div>
            </div>

            {/* Tree Progress in current mountain */}
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl text-center min-w-[140px] border border-white/20">
              <span className="text-[11px] opacity-85 block font-medium">목표 나무 수</span>
              <span className="text-2xl font-mono font-bold">
                {user.treesInCurrentMountain} / {currentMountain.requiredTrees}
              </span>
              <span className="text-[10px] block opacity-85 mt-0.5">
                {Math.min(100, Math.round((user.treesInCurrentMountain / currentMountain.requiredTrees) * 100))}% 달성
              </span>
            </div>
          </div>

          {/* Promotion CTA banner when goal reached */}
          {canUpgrade && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-4 pt-4 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-amber-100">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                <span>{currentMountain.name} 완성! 다음 {nextMountain?.name} 리그로 승급할 수 있습니다.</span>
              </div>
              <button
                onClick={handleUpgrade}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white text-[#2D3319] hover:bg-[#F0EDE5] font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <ArrowUpCircle className="w-4 h-4 text-[#7A9D54]" />
                <span>{nextMountain?.name} 리그로 승급하기 (0부터 시작)</span>
              </button>
            </motion.div>
          )}
        </div>

        {/* Mountain Trail Vertical Timeline / Stages */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[#8C8F7A] uppercase tracking-wider">
            세계 최고봉으로 향하는 산 리그 여정
          </h4>

          <div className="space-y-2.5">
            {LEAGUE_ORDER.map((leagueId, idx) => {
              const league = MOUNTAIN_LEAGUES[leagueId];
              const isCurrent = league.id === user.currentLeagueId;
              const isPast = idx < currentMountainIndex;
              const isLocked = idx > currentMountainIndex;

              return (
                <div
                  key={league.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    isCurrent
                      ? 'bg-white border-2 border-[#7A9D54] shadow-sm'
                      : isPast
                      ? 'bg-[#E9EDC9]/40 border-[#CCD5AE]'
                      : 'bg-white/40 border-[#E8E4D9] opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isCurrent
                        ? 'bg-[#7A9D54] text-white'
                        : isPast
                        ? 'bg-[#DDE5B6] text-[#4A5D23] border border-[#CCD5AE]'
                        : 'bg-[#F0EDE5] text-[#8C8F7A]'
                    }`}>
                      {isPast ? <Check className="w-5 h-5 text-[#4A5D23]" /> : isLocked ? <Lock className="w-4 h-4" /> : idx + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#2D3319] font-serif">
                          {league.name}
                        </span>
                        <span className="text-xs font-mono text-[#8C8F7A]">
                          ({league.altitude.toLocaleString()}m)
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DDE5B6] text-[#4A5D23] font-bold">
                            현재 리그
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6B705C] mt-0.5">
                        필요 나무: <span className="font-mono text-[#4A7856] font-semibold">{league.requiredTrees}그루</span> • {league.landmark}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {isCurrent && (
                      <span className="text-xs font-mono font-bold text-[#4A7856]">
                        {user.treesInCurrentMountain} / {league.requiredTrees}
                      </span>
                    )}
                    {isPast && (
                      <span className="text-xs font-bold text-[#4A7856] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> 정복 완료
                      </span>
                    )}
                    {isLocked && (
                      <span className="text-xs text-[#8C8F7A]">
                        잠금
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
