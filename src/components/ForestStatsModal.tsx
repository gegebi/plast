import React from 'react';
import { motion } from 'motion/react';
import { UserProfile, RecyclingRecord } from '../types';
import { MOUNTAIN_LEAGUES } from '../data/mountains';
import { TreePine, Flame, Award, Trash2, Calendar, X, RefreshCw, LogOut, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { playSound } from '../utils/sound';

interface ForestStatsModalProps {
  user: UserProfile;
  onClose: () => void;
  onLogout: () => void;
}

export const ForestStatsModal: React.FC<ForestStatsModalProps> = ({
  user,
  onClose,
  onLogout
}) => {
  const currentMountain = MOUNTAIN_LEAGUES[user.currentLeagueId];
  const totalCarbonKg = (user.carbonSavedGrams / 1000).toFixed(2);

  const cleanRecordsCount = user.history.filter(h => h.verdict === 'PLANT_SEEDLING').length;
  const totalScansCount = user.history.length;
  const successRate = totalScansCount > 0 ? Math.round((cleanRecordsCount / totalScansCount) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
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
                <h3 className="text-xl font-serif font-bold text-[#2D3319]">{user.nickname}</h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#DDE5B6] text-[#4A5D23] font-bold border border-[#CCD5AE]">
                  {currentMountain.name} 리그
                </span>
              </div>
              <p className="text-xs text-[#8C8F7A]">{user.email}</p>
            </div>
          </div>

          <button
            onClick={() => { playSound('click'); onClose(); }}
            className="p-2 rounded-full bg-white border border-[#E8E4D9] text-[#6B705C] hover:text-[#2D3319] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Environmental Impact Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6 text-center">
          <div className="bg-white border border-[#E8E4D9] p-3 rounded-2xl shadow-xs">
            <span className="text-[10px] text-[#8C8F7A] block font-medium">총 심은 나무</span>
            <span className="text-lg font-bold text-[#4A7856] font-mono">
              {user.totalTreesGrownAllTime}그루
            </span>
          </div>
          <div className="bg-white border border-[#E8E4D9] p-3 rounded-2xl shadow-xs">
            <span className="text-[10px] text-[#8C8F7A] block font-medium">탄소 저감량</span>
            <span className="text-lg font-bold text-[#7A9D54] font-mono">
              {totalCarbonKg}kg
            </span>
          </div>
          <div className="bg-white border border-[#E8E4D9] p-3 rounded-2xl shadow-xs">
            <span className="text-[10px] text-[#8C8F7A] block font-medium">연속 인증</span>
            <span className="text-lg font-bold text-[#E2B842] font-mono flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-[#E2B842] text-[#E2B842]" /> {user.recyclingStreakDays}일
            </span>
          </div>
          <div className="bg-white border border-[#E8E4D9] p-3 rounded-2xl shadow-xs">
            <span className="text-[10px] text-[#8C8F7A] block font-medium">세척 성공률</span>
            <span className="text-lg font-bold text-[#4A7856] font-mono">
              {successRate}%
            </span>
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
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
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
                    {record.verdict === 'PLANT_SEEDLING' ? '+1 묘목' : '-1 벌목'}
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
