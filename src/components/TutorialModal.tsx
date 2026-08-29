import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Camera, Mountain, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { playSound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface TutorialModalProps {
  userNickname: string;
  onCompleteTutorial: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  userNickname,
  onCompleteTutorial
}) => {
  const [step, setStep] = useState<number>(1);

  const handleNext = () => {
    playSound('click');
    if (step < 3) {
      setStep(step + 1);
    } else {
      playSound('fanfare');
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#10B981', '#34D399', '#6EE7B7', '#FBBF24']
      });
      onCompleteTutorial();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-[#F9F7F2] rounded-3xl border border-[#E8E4D9] p-6 sm:p-8 text-[#3C4030] shadow-2xl relative overflow-hidden"
      >
        {/* Step Indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-[#7A9D54]' : 'w-2 bg-[#E8E4D9]'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto rounded-3xl bg-[#E9EDC9] border border-[#CCD5AE] flex items-center justify-center text-4xl mb-4 shadow-sm">
                🍲 ➡️ 🌱
              </div>
              <h3 className="text-xl font-serif italic font-bold text-[#2D3319] mb-2">
                깨끗한 분리수거 = 나무가 자라요!
              </h3>
              <p className="text-xs sm:text-sm text-[#6B705C] leading-relaxed mb-6">
                엽떡통, 배달용기, 투명 페트병을 깨끗이 씻어서 <strong className="text-[#2D3319]">실시간 카메라</strong>로 인증하세요.
                <br /><br />
                <span className="text-[#4A7856] font-bold">오염 없이 깨끗하면 새 묘목이 심어지고</span>,
                <br />
                <span className="text-rose-600 font-bold">기름때가 남으면 나무가 베어집니다 🪓</span>.
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto rounded-3xl bg-[#E9EDC9] border border-[#CCD5AE] flex items-center justify-center text-4xl mb-4 shadow-sm">
                🏔️ 🌲
              </div>
              <h3 className="text-xl font-serif italic font-bold text-[#2D3319] mb-2">
                50그루가 모이면 남산 완성!
              </h3>
              <p className="text-xs sm:text-sm text-[#6B705C] leading-relaxed mb-6">
                나무를 모아 산을 형성해보세요.
                <br />
                <strong className="text-[#2D3319]">50그루(남산) ➡️ 100그루(한라산) ➡️ 200그루(지리산) ➡️ 300그루(설악산)</strong> 순으로 다음 산 리그로 승급합니다!
                <br /><br />
                <span className="text-[#7A9D54] font-medium text-xs">💡 나무가 많을수록 광합성 시너지로 나무가 더 빠르게 성장합니다!</span>
              </p>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="text-center"
            >
              <div className="w-24 h-24 mx-auto rounded-3xl bg-[#7A9D54] border-4 border-white flex items-center justify-center text-5xl mb-4 shadow-xl animate-bounce text-white">
                🌱
              </div>
              <span className="text-xs font-bold text-[#4A5D23] px-3.5 py-1 rounded-full bg-[#DDE5B6] border border-[#CCD5AE] inline-block mb-2 shadow-xs">
                환영 선물 증정 🎁
              </span>
              <h3 className="text-xl font-serif italic font-bold text-[#2D3319] mb-2">
                {userNickname}님께 첫 묘목을 드립니다!
              </h3>
              <p className="text-xs sm:text-sm text-[#6B705C] leading-relaxed mb-6">
                당신의 첫 번째 푸른 묘목이 숲에 심어졌습니다.
                지금 바로 깨끗한 분리수거를 실천하고 남산 정상을 향해 출발하세요!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleNext}
          className="w-full py-3.5 rounded-full bg-[#4A7856] hover:bg-[#3E6548] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(74,120,86,0.25)] active:scale-95 transition-all"
        >
          <span>{step < 3 ? '다음으로' : '내 숲 시작하기 🌱'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};
