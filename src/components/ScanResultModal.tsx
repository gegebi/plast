import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { AnalysisOutput, ItemCategory } from '../types';
import { CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, Droplets, Leaf, ArrowRight, Eye, ShieldCheck, Flame } from 'lucide-react';
import { playSound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface ScanResultModalProps {
  result: AnalysisOutput;
  capturedImageUri: string;
  category: ItemCategory;
  onClose: () => void;
}

export const ScanResultModal: React.FC<ScanResultModalProps> = ({
  result,
  capturedImageUri,
  category,
  onClose
}) => {
  const [viewMode, setViewMode] = useState<'photo' | 'heatmap' | 'split'>('photo');

  const isSuccess = result.verdict === 'PLANT_SEEDLING';

  useEffect(() => {
    if (isSuccess) {
      playSound('plant');
      if (result.status === 'PERFECT') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#34D399', '#6EE7B7', '#FBBF24']
        });
      }
    } else {
      playSound('chop');
    }
  }, [isSuccess, result.status]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-lg bg-[#F9F7F2] rounded-3xl border border-[#E8E4D9] p-6 sm:p-8 text-[#3C4030] shadow-2xl my-8 relative overflow-hidden"
      >
        {/* Top Glow Accent */}
        <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-24 rounded-full blur-3xl opacity-30 pointer-events-none ${
          isSuccess ? 'bg-[#7A9D54]' : 'bg-rose-400'
        }`} />

        {/* Verdict Badge */}
        <div className="text-center mb-5 relative z-10">
          <div className={`inline-flex items-center justify-center p-3 rounded-full mb-3 shadow-md border-2 border-white ${
            isSuccess ? 'bg-[#7A9D54] text-white' : 'bg-rose-600 text-white'
          }`}>
            {isSuccess ? (
              <Leaf className="w-8 h-8 fill-white text-[#7A9D54]" />
            ) : (
              <span className="text-3xl">🪓</span>
            )}
          </div>

          <h3 className="text-2xl font-sans font-extrabold text-[#2D3319] mb-1">
            {result.feedbackTitle}
          </h3>
          <p className="text-xs sm:text-sm text-[#6B705C] max-w-sm mx-auto leading-relaxed">
            {result.feedbackMessage}
          </p>
        </div>

        {/* Total Contamination Rate & Cleanliness Gauge */}
        <div className="bg-white border border-[#E8E4D9] rounded-2xl p-4 mb-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[#6B705C]">
                {result.isAiAnalyzed ? 'AI 정밀 측정 총 오염도' : '비전 센서 총 오염도'}
              </span>
              {result.isAiAnalyzed && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  배경 분리 분석
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-[#8C8F7A]">총 오염도</span>
              <span className={`text-xl font-extrabold font-mono ${
                (result.contaminationPercent ?? (100 - result.cleanlinessScore)) <= 15
                  ? 'text-[#4A7856]'
                  : (result.contaminationPercent ?? (100 - result.cleanlinessScore)) <= 30
                  ? 'text-[#608038]'
                  : (result.contaminationPercent ?? (100 - result.cleanlinessScore)) <= 50
                  ? 'text-[#E2B842]'
                  : 'text-rose-600'
              }`}>
                {result.contaminationPercent ?? (100 - result.cleanlinessScore)}%
              </span>
            </div>
          </div>

          {result.detectedItem && (
            <div className="mb-3 px-3.5 py-2 rounded-xl bg-[#E9EDC9]/80 border border-[#DDE5B6] text-[#2D3319] text-xs font-medium flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-base">✨</span>
                <span className="text-[#4A5D23] font-semibold">AI 자동 품목 식별:</span>
              </div>
              <span className="font-extrabold text-[#2D3319] bg-white px-2.5 py-0.5 rounded-lg border border-[#CCD5AE]">
                {result.detectedItem}
              </span>
            </div>
          )}

          {/* Progress Bar showing Contamination vs Cleanliness */}
          <div className="w-full h-3 bg-[#F0EDE5] rounded-full overflow-hidden p-0.5 border border-[#E8E4D9]">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                (result.contaminationPercent ?? (100 - result.cleanlinessScore)) <= 30
                  ? 'bg-[#7A9D54]' 
                  : (result.contaminationPercent ?? (100 - result.cleanlinessScore)) <= 50 
                  ? 'bg-[#E2B842]' 
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.max(4, 100 - (result.contaminationPercent ?? (100 - result.cleanlinessScore)))}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1.5 text-[10px] text-[#8C8F7A]">
            <span>기준: 30% 이하 시 통과 (새 묘목 획득)</span>
            <span className="font-bold text-[#4A5D23]">청결 점수 {result.cleanlinessScore}점</span>
          </div>
        </div>

        {/* Captured Visual & Algorithmic Heatmap Inspector */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6B705C] flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#7A9D54]" />
              <span>오염도 분석 뷰</span>
            </span>
            <div className="flex gap-1 bg-[#F0EDE5] p-1 rounded-full text-[11px]">
              <button
                onClick={() => setViewMode('photo')}
                className={`px-3 py-0.5 rounded-full font-semibold transition-colors ${
                  viewMode === 'photo' ? 'bg-[#7A9D54] text-white shadow-xs' : 'text-[#6B705C] hover:text-[#2D3319]'
                }`}
              >
                원본 사진
              </button>
              <button
                onClick={() => setViewMode('heatmap')}
                className={`px-3 py-0.5 rounded-full font-semibold transition-colors ${
                  viewMode === 'heatmap' ? 'bg-[#7A9D54] text-white shadow-xs' : 'text-[#6B705C] hover:text-[#2D3319]'
                }`}
              >
                오염 히트맵
              </button>
            </div>
          </div>

          {/* Image Display Area */}
          <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-white border border-[#E8E4D9] flex items-center justify-center shadow-xs">
            {capturedImageUri && (
              <img
                src={capturedImageUri}
                alt="Captured recycling item"
                className={`absolute inset-0 w-full h-full object-contain ${viewMode === 'heatmap' ? 'opacity-30' : 'opacity-100'}`}
              />
            )}
            {result.heatmapDataUrl && viewMode === 'heatmap' && (
              <img
                src={result.heatmapDataUrl}
                alt="Stain heatmap"
                className="absolute inset-0 w-full h-full object-contain mix-blend-multiply"
              />
            )}

            {/* Heatmap Legend Overlay */}
            {viewMode === 'heatmap' && (
              <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 flex items-center justify-around text-[10px] text-white">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                  <span className="text-red-200">잔여 오염/얼룩 영역</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7A9D54] inline-block" />
                  <span className="text-[#DDE5B6]">세척 완료 (깨끗한 영역)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Sensor Breakdown Metrics */}
        <div className="grid grid-cols-3 gap-2.5 mb-6 text-center text-xs">
          <div className="bg-white border border-[#E8E4D9] p-3 rounded-2xl shadow-xs">
            <span className="text-[#8C8F7A] block text-[10px] font-medium">총 오염도</span>
            <span className={`font-mono font-bold text-sm ${(result.contaminationPercent ?? (100 - result.cleanlinessScore)) > 30 ? 'text-rose-600' : 'text-[#4A7856]'}`}>
              {result.contaminationPercent ?? (100 - result.cleanlinessScore)}%
            </span>
          </div>
          <div className="bg-white border border-[#E8E4D9] p-3 rounded-2xl shadow-xs">
            <span className="text-[#8C8F7A] block text-[10px] font-medium">청결 적합도</span>
            <span className={`font-mono font-bold text-sm ${result.cleanlinessScore >= 70 ? 'text-[#4A7856]' : 'text-rose-600'}`}>
              {result.cleanlinessScore}점
            </span>
          </div>
          <div className="bg-white border border-[#E8E4D9] p-3 rounded-2xl shadow-xs">
            <span className="text-[#8C8F7A] block text-[10px] font-medium">분리배출 판정</span>
            <span className={`font-bold text-xs ${isSuccess ? 'text-[#4A7856]' : 'text-rose-600'}`}>
              {isSuccess ? '합격 (나무 심기🌱)' : '불합격 (벌목🪓)'}
            </span>
          </div>
        </div>

        {/* Result Action Impact Banner */}
        <div className={`p-4 rounded-2xl mb-6 border ${
          isSuccess 
            ? 'bg-[#E9EDC9]/80 border-[#DDE5B6] text-[#2D3319]' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{isSuccess ? '🌱' : '🪓'}</span>
              <div>
                <p className="text-xs font-bold">
                  {isSuccess ? result.rewardText : result.penaltyText}
                </p>
                {isSuccess && (
                  <p className="text-[11px] text-[#4A5D23] mt-0.5 font-medium">
                    탄소 배출 저감 +{result.carbonSavedGrams}g | 에코 경험치 +{result.xpAwarded}XP
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Return to Forest CTA */}
        <button
          onClick={() => {
            playSound('click');
            onClose();
          }}
          className="w-full py-3.5 rounded-full bg-[#4A7856] hover:bg-[#3E6548] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(74,120,86,0.25)] active:scale-98 transition-all"
        >
          <span>내 숲으로 돌아가기</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};
