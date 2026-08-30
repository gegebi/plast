import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Camera, Mountain, Sparkles, CheckCircle2, ArrowRight, X, AlertTriangle, Trophy, HelpCircle } from 'lucide-react';
import { playSound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface TutorialModalProps {
  userNickname: string;
  onCompleteTutorial: () => void;
  onClose?: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  userNickname,
  onCompleteTutorial,
  onClose
}) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 4;

  const handleNext = () => {
    playSound('click');
    if (step < totalSteps) {
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

  const handleSkipOrClose = () => {
    playSound('click');
    if (onClose) {
      onClose();
    } else {
      onCompleteTutorial();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-[#F9F7F2] rounded-3xl border border-[#E8E4D9] p-6 sm:p-8 text-[#3C4030] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header with Title & Close/Skip Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#E9EDC9] text-[#4A5D23] font-bold text-xs flex items-center gap-1 border border-[#CCD5AE]">
              <HelpCircle className="w-3.5 h-3.5 text-[#4A7856]" />
              <span>Plast 이용 가이드</span>
            </span>
            <span className="text-xs font-semibold text-[#8C8F7A]">
              ({step}/{totalSteps})
            </span>
          </div>
          <button
            type="button"
            onClick={handleSkipOrClose}
            className="text-xs font-bold text-[#8C8F7A] hover:text-[#2D3319] px-2 py-1 rounded-lg hover:bg-[#E8E4D9] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>가이드 닫기</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center gap-2 mb-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-10 bg-[#7A9D54]' : 'w-2 bg-[#E8E4D9]'
              }`}
            />
          ))}
        </div>

        {/* Modal Body with Animated Step Contents */}
        <div className="flex-1 overflow-y-auto pr-1">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto rounded-3xl bg-[#E9EDC9] border border-[#CCD5AE] flex items-center justify-center text-4xl mb-4 shadow-sm select-none">
                  📸
                </div>
                <h3 className="text-xl font-sans font-extrabold text-[#2D3319] mb-2">
                  1. 실시간 분리수거 사진 인증
                </h3>
                <p className="text-xs sm:text-sm text-[#6B705C] leading-relaxed mb-4">
                  페트병, 배달용기, 일회용 컵을 깨끗하게 헹구고 비닐 라벨을 분리한 뒤 <strong className="text-[#2D3319]">카메라 스캐너</strong>로 촬영하세요.
                </p>
                <div className="bg-white p-3.5 rounded-2xl border border-[#E8E4D9] text-left text-xs text-[#556B2F] space-y-2 mb-2">
                  <div className="flex items-start gap-2">
                    <span className="text-sm">✨</span>
                    <span><strong>AI 자동 감지</strong>가 사진 속 품목을 스스로 파악하고 배경을 분리합니다.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm">🛡️</span>
                    <span>부정 인증 방지를 위해 <strong>실시간 카메라 촬영</strong>만 지원됩니다.</span>
                  </div>
                </div>
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
                <div className="w-20 h-20 mx-auto rounded-3xl bg-[#E9EDC9] border border-[#CCD5AE] flex items-center justify-center text-4xl mb-4 shadow-sm select-none">
                  ⚖️
                </div>
                <h3 className="text-xl font-sans font-extrabold text-[#2D3319] mb-2">
                  2. 총 오염도 판정 & 보상 시스템
                </h3>
                <p className="text-xs sm:text-sm text-[#6B705C] leading-relaxed mb-4">
                  AI가 잔여 얼룩과 이물질을 검사하여 <strong className="text-[#2D3319]">총 오염도(%)</strong>를 산출합니다.
                </p>
                <div className="grid grid-cols-2 gap-2.5 mb-2 text-left">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold text-xs mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>오염도 30% 이하</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 leading-tight">
                      <strong>합격!</strong> 새 묘목🌱 1그루 획득 & 숲 식재
                    </p>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl">
                    <div className="flex items-center gap-1.5 text-rose-800 font-extrabold text-xs mb-1">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>오염도 30% 초과</span>
                    </div>
                    <p className="text-[11px] text-rose-700 leading-tight">
                      <strong>벌목 페널티 🪓</strong> 기존 나무 1그루 밑동 벌목
                    </p>
                  </div>
                </div>
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
                <div className="w-20 h-20 mx-auto rounded-3xl bg-[#E9EDC9] border border-[#CCD5AE] flex items-center justify-center text-4xl mb-4 shadow-sm select-none">
                  🏔️
                </div>
                <h3 className="text-xl font-sans font-extrabold text-[#2D3319] mb-2">
                  3. 숲 가꾸기 & 6대 산 승급 랭킹
                </h3>
                <p className="text-xs sm:text-sm text-[#6B705C] leading-relaxed mb-4">
                  나무가 자라날수록 광합성 시너지로 숲의 성장 속도가 빨라집니다.
                </p>
                <div className="bg-white p-3 rounded-2xl border border-[#E8E4D9] text-left text-xs space-y-1.5 text-[#556B2F] mb-2">
                  <div className="font-bold text-[#2D3319] flex items-center gap-1 mb-1">
                    <Trophy className="w-3.5 h-3.5 text-[#E2B842]" />
                    <span>대한민국 6대 산 리그 로드맵:</span>
                  </div>
                  <p className="text-[11px] text-[#6B705C] leading-relaxed">
                    <strong>남산(50그루)</strong> ➡️ <strong>한라산(100그루)</strong> ➡️ <strong>지리산(200그루)</strong> ➡️ <strong>설악산(300그루)</strong> ➡️ <strong>K2</strong> ➡️ <strong>에베레스트</strong>
                  </p>
                  <p className="text-[11px] text-[#4A7856] font-medium pt-1">
                    💡 나무를 클릭하면 <strong>나무 애칭(이름)</strong>을 언제든 변경할 수 있습니다!
                  </p>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="text-center"
              >
                <div className="w-24 h-24 mx-auto rounded-3xl bg-[#7A9D54] border-4 border-white flex items-center justify-center text-5xl mb-3 shadow-xl animate-bounce text-white">
                  🌱
                </div>
                <span className="text-xs font-bold text-[#4A5D23] px-3.5 py-1 rounded-full bg-[#DDE5B6] border border-[#CCD5AE] inline-block mb-2 shadow-xs">
                  환영 선물 증정 🎁
                </span>
                <h3 className="text-xl font-sans font-extrabold text-[#2D3319] mb-2">
                  {userNickname}님, 환영합니다!
                </h3>
                <p className="text-xs sm:text-sm text-[#6B705C] leading-relaxed mb-4">
                  첫 번째 희망의 새싹 묘목이 풀밭에 심어졌습니다.
                  <br />
                  지금 바로 깨끗한 분리수거로 남산 정상에 도전해보세요!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Button Footer */}
        <div className="pt-4 border-t border-[#E8E4D9] flex items-center gap-2">
          {step > 1 && (
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setStep(step - 1);
              }}
              className="px-4 py-3 rounded-full bg-[#E8E4D9] hover:bg-[#DCD8CC] text-[#4A5D23] font-bold text-xs transition-colors"
            >
              이전
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 py-3.5 rounded-full bg-[#4A7856] hover:bg-[#3E6548] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(74,120,86,0.25)] active:scale-95 transition-all cursor-pointer"
          >
            <span>{step < totalSteps ? '다음 안내 보기' : '내 숲 시작하기 🌱'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

