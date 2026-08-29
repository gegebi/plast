import React from 'react';
import { motion } from 'motion/react';
import { UserProfile, RecyclingRecord, TreeItem } from '../types';
import { MOUNTAIN_LEAGUES } from '../data/mountains';
import { TreePine, Flame, Award, Trash2, Calendar, X, RefreshCw, LogOut, CheckCircle2, AlertTriangle, ShieldCheck, Sprout, Axe } from 'lucide-react';
import { playSound } from '../utils/sound';

interface ForestStatsModalProps {
  user: UserProfile;
  trees?: TreeItem[];
  onClose: () => void;
  onLogout: () => void;
  onEditProfile?: () => void;
}

export const ForestStatsModal: React.FC<ForestStatsModalProps> = ({
  user,
  trees = [],
  onClose,
  onLogout,
  onEditProfile,
}) => {
  const currentMountain = MOUNTAIN_LEAGUES[user.currentLeagueId];
  const totalCarbonKg = (user.carbonSavedGrams / 1000).toFixed(2);

  const cleanRecordsCount = user.history.filter(h => h.verdict === 'PLANT_SEEDLING').length;
  const choppedRecordsCount = user.history.filter(h => h.verdict === 'CHOP_TREE').length;
  const totalScansCount = user.history.length;
  const successRate = totalScansCount > 0 ? Math.round((cleanRecordsCount / totalScansCount) * 100) : 100;

  const totalGrown = user.totalTreesGrownAllTime;
  const totalChopped = user.totalTreesChopped || 0;
  const activeTreesInMeadow = trees.filter(t => t.stage !== 'chopped').length;
  const matureTreesInMeadow = trees.filter(t => t.stage === 'mature_tree' || t.stage === 'golden_tree').length;
  const growingTreesInMeadow = trees.filter(t => t.stage !== 'chopped' && t.growthPercent < 100).length;
  const stumpsInMeadow = trees.filter(t => t.stage === 'chopped').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-lg bg-[#F9F7F2] rounded-3xl border border-[#E8E4D9] p-6 sm:p-8 text-[#3C4030] shadow-2xl my-8 relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E9EDC9] border border-[#CCD5AE] flex items-center justify-center text-2xl text-[#4A5D23] shadow-xs">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.nickname} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                '🌿'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-sans font-extrabold text-[#2D3319]">{user.nickname}</h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#DDE5B6] text-[#4A5D23] font-bold border border-[#CCD5AE]">
                  {currentMountain.name} 리그
                </span>
                {user.isGuest ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                    게스트 모드
                  </span>
                ) : onEditProfile ? (
                  <button
                    onClick={() => {
                      playSound('click');
                      onEditProfile();
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white hover:bg-[#F0EDE5] text-[#4A7856] font-bold border border-[#A3B18A] transition-colors"
                  >
                    ✏️ 프로필 수정
                  </button>
                ) : null}
              </div>
              <p className="text-xs text-[#8C8F7A]">
                {user.isGuest ? '1회용 체험 세션 (저장되지 않음)' : user.email}
              </p>
            </div>
          </div>

          <button
            onClick={() => { playSound('click'); onClose(); }}
            className="p-2 rounded-full bg-white border border-[#E8E4D9] text-[#6B705C] hover:text-[#2D3319] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Core Metric Impact Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 text-center">
          <div className="bg-white border border-[#CCD5AE] p-3 rounded-2xl shadow-xs">
            <span className="text-[10px] text-[#4A5D23] block font-extrabold flex items-center justify-center gap-1">
              <span>🌱</span> 총 키운 묘목
            </span>
            <span className="text-xl font-black text-[#2D6A4F] font-mono mt-0.5 block">
              {totalGrown}그루
            </span>
          </div>

          <div className="bg-rose-50/70 border border-rose-200 p-3 rounded-2xl shadow-xs">
            <span className="text-[10px] text-rose-700 block font-extrabold flex items-center justify-center gap-1">
              <span>🪓</span> 총 벌목된 묘목
            </span>
            <span className="text-xl font-black text-rose-600 font-mono mt-0.5 block">
              {totalChopped}그루
            </span>
          </div>

          <div className="bg-white border border-[#E8E4D9] p-3 rounded-2xl shadow-xs">
            <span className="text-[10px] text-[#8C8F7A] block font-bold">탄소 저감량</span>
            <span className="text-lg font-bold text-[#7A9D54] font-mono mt-0.5 block">
              {totalCarbonKg}kg
            </span>
          </div>

          <div className="bg-white border border-[#E8E4D9] p-3 rounded-2xl shadow-xs">
            <span className="text-[10px] text-[#8C8F7A] block font-bold">연속 인증</span>
            <span className="text-lg font-bold text-[#E2B842] font-mono mt-0.5 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-[#E2B842] text-[#E2B842]" /> {user.recyclingStreakDays}일
            </span>
          </div>
        </div>

        {/* Detailed Forest & Tree Ecology Breakdown Card */}
        <div className="mb-5 bg-white rounded-2xl border border-[#E8E4D9] p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-extrabold text-[#2D3319] uppercase tracking-wider flex items-center gap-1.5">
              <span>🌲 묘목 & 생태 통계 리포트</span>
            </h4>
            <span className="text-[11px] font-bold text-[#4A7856] bg-[#E9EDC9] px-2.5 py-0.5 rounded-full border border-[#DDE5B6]">
              세척 성공률 {successRate}%
            </span>
          </div>

          {/* Grown vs Chopped Visual Ratio Bar */}
          <div className="space-y-1.5 mb-3">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-[#2D6A4F] flex items-center gap-1">
                <span>🌱 키운 묘목</span> <strong>{totalGrown}그루</strong>
              </span>
              <span className="text-rose-600 flex items-center gap-1">
                <span>🪓 벌목된 묘목</span> <strong>{totalChopped}그루</strong>
              </span>
            </div>
            <div className="w-full h-3 bg-rose-200 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-[#52B788] to-[#2D6A4F] transition-all duration-500"
                style={{
                  width: `${(totalGrown + totalChopped) > 0 ? (totalGrown / (totalGrown + totalChopped)) * 100 : 100}%`
                }}
              />
            </div>
          </div>

          {/* Sub-grid of detailed tree stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#F8F9FA] p-2.5 rounded-xl border border-[#E9ECEF] flex items-center justify-between">
              <span className="text-[#6B705C] flex items-center gap-1">
                <span>🌳</span> 완전 성장 성목
              </span>
              <span className="font-extrabold text-[#2D3319]">{matureTreesInMeadow}그루</span>
            </div>

            <div className="bg-[#F8F9FA] p-2.5 rounded-xl border border-[#E9ECEF] flex items-center justify-between">
              <span className="text-[#6B705C] flex items-center gap-1">
                <span>🌿</span> 현재 자라는 묘목
              </span>
              <span className="font-extrabold text-[#2D3319]">{growingTreesInMeadow}그루</span>
            </div>

            <div className="bg-[#F8F9FA] p-2.5 rounded-xl border border-[#E9ECEF] flex items-center justify-between">
              <span className="text-[#6B705C] flex items-center gap-1">
                <span>🍃</span> 풀밭 내 총 생존
              </span>
              <span className="font-extrabold text-[#4A7856]">{activeTreesInMeadow}그루</span>
            </div>

            <div className="bg-rose-50/50 p-2.5 rounded-xl border border-rose-100 flex items-center justify-between">
              <span className="text-rose-700 flex items-center gap-1">
                <span>🪵</span> 풀밭 잔여 그루터기
              </span>
              <span className="font-extrabold text-rose-700">{stumpsInMeadow}그루</span>
            </div>
          </div>
        </div>

        {/* Recent Recycling Activity Log */}
        <div className="mb-6">
          <h4 className="text-xs font-bold text-[#6B705C] uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>최근 분리수거 인증 기록</span>
            <span className="text-[#8C8F7A] font-normal">총 {user.history.length}건</span>
          </h4>

          {user.history.length === 0 ? (
            <div className="text-center py-6 bg-white rounded-2xl border border-[#E8E4D9] text-[#8C8F7A] text-xs">
              아직 인증된 분리수거 기록이 없습니다.
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {user.history.slice(0, 10).map((record) => (
                <div
                  key={record.id}
                  className="p-3 rounded-2xl bg-white border border-[#E8E4D9] flex items-center justify-between text-xs shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">
                      {record.verdict === 'PLANT_SEEDLING' ? '🌱' : '🪓'}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-[#2D3319]">
                        <span>{record.categoryName}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          record.cleanlinessScore >= 80 ? 'bg-[#DDE5B6] text-[#4A5D23]' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {record.cleanlinessScore}점
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8C8F7A] mt-0.5">
                        {new Date(record.timestamp).toLocaleString('ko-KR', {
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold ${
                    record.verdict === 'PLANT_SEEDLING' ? 'text-[#4A7856]' : 'text-rose-600'
                  }`}>
                    {record.verdict === 'PLANT_SEEDLING' ? '+1 묘목 심기' : '-1 나무 벌목'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E8E4D9]">
          <button
            onClick={() => {
              playSound('click');
              if (window.confirm('정말 로그아웃 하시겠습니까?')) {
                onLogout();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-[#8C8F7A] hover:text-rose-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>로그아웃</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#4A7856] hover:bg-[#3E6548] text-white font-bold text-xs shadow-xs transition-colors"
          >
            확인
          </button>
        </div>
      </motion.div>
    </div>
  );
};

