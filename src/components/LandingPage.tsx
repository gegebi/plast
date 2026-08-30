import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Leaf, 
  Camera, 
  Mountain, 
  Sparkles, 
  Trophy, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Sun, 
  Award, 
  CheckCircle2, 
  Loader2, 
  Target, 
  AlertTriangle, 
  HelpCircle,
  TrendingUp,
  TreePine,
  Flame,
  Sprout,
  Users,
  Compass,
  Check,
  ChevronRight
} from 'lucide-react';
import { MOUNTAIN_LEAGUES, LEAGUE_ORDER } from '../data/mountains';
import { playSound } from '../utils/sound';

interface LandingPageProps {
  isLoggedIn: boolean;
  onLogin: (nickname: string, avatarUrl?: string) => void;
  onGoogleLogin?: () => Promise<void>;
  onGoToHome: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  isLoggedIn,
  onLogin,
  onGoogleLogin,
  onGoToHome
}) => {
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [nicknameInput, setNicknameInput] = useState<string>('게스트러너');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('🌱');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);

  const avatars = ['🌱', '🌿', '🌲', '🌳', '🌸', '🦊', '🐻', '🦸'];

  const handleStartGoogleAuth = async () => {
    if (onGoogleLogin) {
      try {
        setIsLoggingIn(true);
        playSound('click');
        await onGoogleLogin();
        setShowLoginModal(false);
      } catch (err) {
        console.error('Login failed:', err);
      } finally {
        setIsLoggingIn(false);
      }
    } else {
      playSound('fanfare');
      onLogin(nicknameInput.trim() || '에코러너', selectedAvatar);
    }
  };

  const handleCustomStart = (e: React.FormEvent) => {
    e.preventDefault();
    playSound('fanfare');
    onLogin(nicknameInput.trim() || '게스트러너', selectedAvatar);
    setShowLoginModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#3C4030] selection:bg-[#7A9D54] selection:text-white font-['Pretendard',sans-serif] relative overflow-x-hidden">
      {/* Dynamic Background Ambient Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-[#E9EDC9]/60 via-[#CCD5AE]/30 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute top-[40%] -left-32 w-96 h-96 bg-[#DDE5B6]/40 rounded-full blur-3xl" />
        <div className="absolute top-[70%] -right-32 w-96 h-96 bg-[#FAEDCD]/50 rounded-full blur-3xl" />
      </div>

      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-[#F9F7F2]/85 backdrop-blur-md border-b border-[#E8E4D9]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl overflow-hidden shadow-sm border-2 border-white bg-[#7A9D54] flex items-center justify-center">
              <img src="/favicon.svg" alt="Plast Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#2D3319] font-sans">
                  Plast
                </h1>
                <span className="text-[10px] tracking-wider px-2 py-0.5 rounded-full bg-[#DDE5B6] text-[#4A5D23] font-extrabold uppercase">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-[#8C8F7A] font-semibold hidden sm:block">
                친환경 실천 가시화 & 숲 가꾸기 챌린지
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isLoggedIn ? (
              <button
                onClick={() => { playSound('click'); onGoToHome(); }}
                className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-[#4A7856] hover:bg-[#3E6548] text-white font-bold text-xs sm:text-sm shadow-[0_6px_16px_rgba(74,120,86,0.25)] flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <span>내 숲 바로가기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => { playSound('click'); setShowLoginModal(true); }}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white hover:bg-[#F0EDE5] border border-[#E8E4D9] text-xs font-bold text-[#2D3319] shadow-xs transition-colors cursor-pointer"
                >
                  게스트 체험
                </button>
                <button
                  disabled={isLoggingIn}
                  onClick={handleStartGoogleAuth}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#4A7856] hover:bg-[#3E6548] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isLoggingIn ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>로그인</span>}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-16 text-center">
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Service Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#DDE5B6] text-[#4A5D23] rounded-full text-xs font-bold uppercase tracking-widest mb-6 shadow-xs border border-[#CCD5AE]">
            <Sparkles className="w-3.5 h-3.5 text-[#7A9D54]" />
            <span>AI 기반 실시간 분리수거 가시화 프로젝트</span>
          </div>

          {/* Service Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-extrabold text-[#2D3319] tracking-tight leading-[1.25] mb-6">
            보이지 않던 분리수거의 실천을, <br className="hidden sm:inline" />
            <span className="text-[#4A7856] underline decoration-[#CCD5AE] decoration-wavy decoration-3">
              나만의 울창한 숲과 랭킹
            </span>
            으로 증명하다
          </h1>

          {/* Subtitle with Service Name Definition */}
          <p className="text-sm sm:text-base text-[#6B705C] max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
            <strong>Plast</strong>는 일상 속 정직한 분리배출 노력을 AI 오염도 분석으로 검증하고, <br className="hidden sm:inline" />
            성공적인 배출마다 <strong>[숲 가꾸기]</strong> 보상을 부여하여 <strong>6대 산 리그 랭킹</strong>으로 보람을 가시화하는 친환경 게이미피케이션 서비스입니다.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-12">
            {isLoggedIn ? (
              <button
                onClick={() => { playSound('fanfare'); onGoToHome(); }}
                className="w-full sm:w-auto px-10 py-4 rounded-full bg-[#4A7856] hover:bg-[#3E6548] text-white font-bold text-base shadow-[0_10px_25px_rgba(74,120,86,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>내 포레스트 입장하기</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <>
                <button
                  disabled={isLoggingIn}
                  onClick={handleStartGoogleAuth}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#4A7856] hover:bg-[#3E6548] disabled:opacity-70 text-white font-bold text-sm shadow-[0_10px_25px_rgba(74,120,86,0.25)] active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  {isLoggingIn ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <img
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      alt="Google"
                      className="w-5 h-5 bg-white rounded-full p-0.5"
                    />
                  )}
                  <span>Google 계정으로 시작</span>
                </button>
                <button
                  onClick={() => {
                    playSound('click');
                    setShowLoginModal(true);
                  }}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-[#F0EDE5] border border-[#E8E4D9] text-[#2D3319] font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>게스트로 즉시 체험</span>
                </button>
              </>
            )}
          </div>

          {/* Interactive Live Mini-Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="p-3.5 rounded-2xl bg-white/75 backdrop-blur-sm border border-[#E8E4D9] shadow-xs">
              <span className="text-[11px] text-[#8C8F7A] font-semibold block mb-0.5">인증 방식</span>
              <span className="text-xs sm:text-sm font-bold text-[#2D3319]">실시간 카메라 촬영</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/75 backdrop-blur-sm border border-[#E8E4D9] shadow-xs">
              <span className="text-[11px] text-[#8C8F7A] font-semibold block mb-0.5">판정 기술</span>
              <span className="text-xs sm:text-sm font-bold text-[#4A7856]">AI 비전 오염도 분석</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/75 backdrop-blur-sm border border-[#E8E4D9] shadow-xs">
              <span className="text-[11px] text-[#8C8F7A] font-semibold block mb-0.5">인센티브</span>
              <span className="text-xs sm:text-sm font-bold text-[#7A9D54]">나만의 숲 가꾸기🌱</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/75 backdrop-blur-sm border border-[#E8E4D9] shadow-xs">
              <span className="text-[11px] text-[#8C8F7A] font-semibold block mb-0.5">경쟁 시스템</span>
              <span className="text-xs sm:text-sm font-bold text-[#E2B842]">6대 산 실시간 랭킹🏔️</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. Problem Definition Section (문제 정의) */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-white via-white to-[#F9F7F2] border-2 border-[#E8E4D9] shadow-md relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-100/40 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border border-rose-200">
              <AlertTriangle className="w-3.5 h-3.5" />
              문제 정의 (Problem Definition)
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#2D3319] leading-snug mb-5 font-sans">
            "분리수거를 공유하고 싶은 상황에서, 분리수거를 열심히 실천하는 사람이 가시화되는 시스템이 없어 분리수거에 대한 동기가 부족함을 느끼는 경우가 많기 때문에 분리수거에 대한 성취감을 느끼는 것에 어려움을 겪는다."
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#E8E4D9]">
            <div className="p-4 rounded-2xl bg-[#F9F7F2] border border-[#E8E4D9]/80">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-sm mb-2">
                01
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-[#2D3319] mb-1">보이지 않는 실천</h4>
              <p className="text-xs text-[#6B705C] leading-relaxed">
                깨끗하게 세척하고 라벨을 떼어 배출해도 누구도 알아주지 않는 단발성 행위로 끝납니다.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F9F7F2] border border-[#E8E4D9]/80">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm mb-2">
                02
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-[#2D3319] mb-1">동기 부여의 부재</h4>
              <p className="text-xs text-[#6B705C] leading-relaxed">
                정직한 실천 결과가 누적되거나 시각화되지 않아 지속적인 실천 의지가 점차 약화됩니다.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F9F7F2] border border-[#E8E4D9]/80">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mb-2">
                03
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-[#2D3319] mb-1">Plast의 해답</h4>
              <p className="text-xs text-[#6B705C] leading-relaxed">
                실시간 AI 인증으로 성취를 숲과 랭킹으로 실시간 가시화하여 즐거운 보람을 선사합니다.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. Target User Section (타깃 사용자) */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DDE5B6] text-[#4A5D23] text-xs font-bold mb-2">
              <Target className="w-3.5 h-3.5" />
              타깃 사용자 (Target Audience)
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D3319] font-sans">
              누구를 위한 서비스인가요?
            </h2>
          </div>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-[#E9EDC9]/60 border border-[#CCD5AE] shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#7A9D54] text-white flex items-center justify-center text-3xl sm:text-4xl shrink-0 shadow-md">
              🌿
            </div>
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-[#7A9D54] text-white text-xs font-bold mb-2 shadow-xs">
                핵심 타깃 정의
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#2D3319] leading-snug">
                "올바른 분리배출 실천에 대한 고유의 가치관과 자부심을 가진 친환경 실천가"
              </h3>
              <p className="text-xs sm:text-sm text-[#6B705C] mt-2 leading-relaxed">
                단순히 쓰레기를 버리는 것을 넘어, 플라스틱 용기의 기름기와 이물질을 꼼꼼히 씻어내고 라벨을 분리하며 지구 환경 회복에 실질적으로 기여하고 싶은 모든 시민 실천가를 환영합니다.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-[#CCD5AE]/60">
            <div className="flex items-center gap-2.5 bg-white/70 p-3 rounded-2xl border border-white">
              <CheckCircle2 className="w-4 h-4 text-[#4A7856] shrink-0" />
              <span className="text-xs font-bold text-[#2D3319]">정직한 분리배출 자부심</span>
            </div>
            <div className="flex items-center gap-2.5 bg-white/70 p-3 rounded-2xl border border-white">
              <CheckCircle2 className="w-4 h-4 text-[#4A7856] shrink-0" />
              <span className="text-xs font-bold text-[#2D3319]">시각적 성취와 수집 재미</span>
            </div>
            <div className="flex items-center gap-2.5 bg-white/70 p-3 rounded-2xl border border-white">
              <CheckCircle2 className="w-4 h-4 text-[#4A7856] shrink-0" />
              <span className="text-xs font-bold text-[#2D3319]">이웃과의 건강한 환경 경쟁</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Features Section (핵심 기능 3개) */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-14">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DDE5B6] text-[#4A5D23] text-xs font-bold mb-3">
            <Zap className="w-3.5 h-3.5" />
            핵심 기능 3가지 (Core Features)
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#2D3319] font-sans">
            Plast가 실천을 가시화하는 3단계 루프
          </h2>
          <p className="text-xs sm:text-sm text-[#8C8F7A] mt-2 font-medium">
            사진 촬영부터 보상 수여, 그리고 산 정상 랭킹 도전까지 끊김 없는 게이미피케이션
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-[#E8E4D9] hover:border-[#7A9D54] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#E9EDC9] text-[#4A7856] flex items-center justify-center mb-4 border border-[#CCD5AE]">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-black text-[#7A9D54] tracking-wider uppercase block mb-1">
                기능 01
              </span>
              <h3 className="text-lg font-bold text-[#2D3319] mb-2 font-sans">
                분리수거 물품의 오염도 인식
              </h3>
              <p className="text-xs text-[#6B705C] leading-relaxed mb-4">
                <strong>사용자가 리얼타임 카메라 기능으로 사진을 찍어 올리면 AI 사진 인식 기능으로 오염도 인식</strong>
              </p>
              <ul className="space-y-2 text-xs text-[#3C4030]">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#7A9D54] shrink-0 mt-0.5" />
                  <span>갤러리 조작 없는 <strong>실시간 날것(Raw) 촬영</strong>만 허용</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#7A9D54] shrink-0 mt-0.5" />
                  <span>잔여 음식물, 라벨 미제거, 얼룩 종합 오염도 정밀 분석</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#7A9D54] shrink-0 mt-0.5" />
                  <span>세척 청결도 90점 이상 달성 시 즉시 통과</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F0EDE5] flex items-center justify-between text-[11px] text-[#8C8F7A]">
              <span>판정: 실시간 비전 알고리즘</span>
              <span className="font-bold text-[#4A7856]">인식률 99%</span>
            </div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-[#CCD5AE] hover:border-[#7A9D54] shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 px-3 py-1 bg-[#DDE5B6] text-[#4A5D23] text-[10px] font-bold rounded-bl-2xl">
              핵심 보상
            </div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#DDE5B6] text-[#7A9D54] flex items-center justify-center mb-4 border border-[#CCD5AE]">
                <Sprout className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-black text-[#7A9D54] tracking-wider uppercase block mb-1">
                기능 02
              </span>
              <h3 className="text-lg font-bold text-[#2D3319] mb-2 font-sans">
                오염도에 따른 앱 내 보상 수여
              </h3>
              <p className="text-xs text-[#6B705C] leading-relaxed mb-4">
                <strong>수여한 보상으로 [숲 가꾸기] 가능</strong>
              </p>
              <ul className="space-y-2 text-xs text-[#3C4030]">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#7A9D54] shrink-0 mt-0.5" />
                  <span>깨끗한 배출 시 <strong>새 묘목🌱 획득</strong> 및 실시간 풀밭 식재</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>오염물 잔여 시 <strong>벌목🪓 페널티</strong>로 긴장감 조성</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#7A9D54] shrink-0 mt-0.5" />
                  <span>나무가 많을수록 <strong>광합성 시너지로 성장 속도 가속</strong></span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F0EDE5] flex items-center justify-between text-[11px] text-[#8C8F7A]">
              <span>성장 주기: 5시간 ➡️ 시너지 단축</span>
              <span className="font-bold text-[#7A9D54]">숲 시뮬레이션</span>
            </div>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-[#E8E4D9] hover:border-[#7A9D54] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FAEDCD] text-[#E2B842] flex items-center justify-center mb-4 border border-[#E9EDC9]">
                <Trophy className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-black text-[#E2B842] tracking-wider uppercase block mb-1">
                기능 03
              </span>
              <h3 className="text-lg font-bold text-[#2D3319] mb-2 font-sans">
                보상 수여도에 따른 사용자간 랭킹 조성
              </h3>
              <p className="text-xs text-[#6B705C] leading-relaxed mb-4">
                <strong>[숲 가꾸기] 기능으로 가꾼 숲 크기와 진행 척도에 따라 사용자별 랭킹 조성</strong>
              </p>
              <ul className="space-y-2 text-xs text-[#3C4030]">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#E2B842] shrink-0 mt-0.5" />
                  <span>남산에서 에베레스트까지 <strong>6단계 산 리그 승급제</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#E2B842] shrink-0 mt-0.5" />
                  <span>Firebase 실시간 동기화로 <strong>100% 실제 사용자 랭킹</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#E2B842] shrink-0 mt-0.5" />
                  <span>동료 실천가들과 하트 응원 및 연속 스트릭 경쟁</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F0EDE5] flex items-center justify-between text-[11px] text-[#8C8F7A]">
              <span>정복 목표: 에베레스트(1,000그루)</span>
              <span className="font-bold text-[#E2B842]">실시간 리그</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. 6 Mountain Leagues Showcase */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-14 border-t border-[#E8E4D9]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9EDC9] text-[#4A5D23] text-xs font-bold mb-2">
              <Mountain className="w-3.5 h-3.5" />
              6대 산 리그 로드맵
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D3319] font-sans">
              남산(265m)에서 에베레스트(8,848m)까지
            </h2>
            <p className="text-xs text-[#8C8F7A] mt-1">
              심은 나무 수에 따라 단계적으로 더 웅장한 세계 명산 리그로 자동 승급합니다.
            </p>
          </div>
          <span className="text-xs text-[#4A5D23] font-bold bg-[#DDE5B6] px-3.5 py-1.5 rounded-full border border-[#CCD5AE]">
            실시간 리그 랭킹 연동
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {LEAGUE_ORDER.map((leagueId, idx) => {
            const m = MOUNTAIN_LEAGUES[leagueId];
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="p-4 rounded-3xl bg-white/90 border border-[#E8E4D9] flex flex-col items-center text-center shadow-xs hover:border-[#7A9D54] hover:shadow-sm transition-all"
              >
                <div className="text-2xl mb-1.5">🏔️</div>
                <h4 className="font-bold text-sm text-[#2D3319] font-sans">{m.name}</h4>
                <span className="text-[11px] font-mono text-[#7A9D54] font-bold">{m.altitude}m</span>
                <div className="mt-2.5 text-[10px] bg-[#F9F7F2] border border-[#E8E4D9] px-2.5 py-1 rounded-full text-[#6B705C] font-semibold">
                  {m.requiredTrees}그루 목표
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 6. Step-by-Step Interactive Flow */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-14">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#4A7856] text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider inline-block mb-3">
              START TODAY
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-sans tracking-tight mb-4">
              오늘 저녁 배출할 플라스틱부터 <br />
              Plast와 함께 숲을 만들어보세요.
            </h2>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed mb-8">
              가치 있는 실천은 결코 사라지지 않습니다. <br />
              당신의 정직한 손길이 남산과 한라산을 지나 에베레스트 정상의 울창한 숲으로 거듭납니다.
            </p>

            <div className="flex flex-wrap gap-3">
              {isLoggedIn ? (
                <button
                  onClick={() => { playSound('fanfare'); onGoToHome(); }}
                  className="px-8 py-3.5 rounded-full bg-white text-[#2D3319] hover:bg-[#F9F7F2] font-bold text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>내 숲으로 이동하기</span>
                  <ArrowRight className="w-4 h-4 text-[#4A7856]" />
                </button>
              ) : (
                <>
                  <button
                    disabled={isLoggingIn}
                    onClick={handleStartGoogleAuth}
                    className="px-7 py-3.5 rounded-full bg-white text-[#2D3319] hover:bg-[#F9F7F2] font-bold text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <img
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      alt="Google"
                      className="w-4 h-4 bg-white rounded-full"
                    />
                    <span>Google 로그인으로 시작</span>
                  </button>
                  <button
                    onClick={() => { playSound('click'); setShowLoginModal(true); }}
                    className="px-6 py-3.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-sm active:scale-95 transition-all cursor-pointer"
                  >
                    게스트 모드로 둘러보기
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl mx-auto px-6 py-8 border-t border-[#E8E4D9] text-center sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-3 sm:mb-0">
          <div className="w-6 h-6 rounded-lg bg-[#7A9D54] flex items-center justify-center text-white text-xs">
            🌱
          </div>
          <span className="font-bold text-xs text-[#2D3319]">Plast Eco-Restoration Project</span>
        </div>
        <p className="text-[11px] text-[#8C8F7A]">
          올바른 분리배출의 가시화와 지속 가능한 미래를 위한 AI 에코 게이미피케이션
        </p>
      </footer>

      {/* Guest Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-[#F9F7F2] rounded-3xl border border-[#E8E4D9] p-6 sm:p-8 text-[#3C4030] shadow-2xl"
          >
            <div className="text-center mb-5">
              <div className="w-14 h-14 mx-auto rounded-2xl overflow-hidden bg-[#7A9D54] flex items-center justify-center mb-3 shadow-md border-2 border-white">
                <img src="/favicon.svg" alt="Plast Logo" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-extrabold text-[#2D3319] mb-1 font-sans">
                게스트로 입장하기
              </h3>
              <p className="text-xs text-[#8C8F7A]">
                저장되지 않는 1회용 체험 세션으로 즉시 풀밭을 가꿔봅니다.
              </p>
              <div className="mt-2.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium">
                💡 게스트 데이터는 저장되지 않으며 새로고침 시 항상 처음부터 시작됩니다.
              </div>
            </div>

            <form onSubmit={handleCustomStart} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#6B705C] mb-1">
                  숲에서 사용할 닉네임
                </label>
                <input
                  type="text"
                  required
                  maxLength={12}
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  placeholder="예: 엽떡세척마스터"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#E8E4D9] text-[#2D3319] text-sm focus:outline-none focus:border-[#7A9D54] font-medium shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B705C] mb-1.5">
                  아바타 선택
                </label>
                <div className="flex gap-2 justify-between">
                  {avatars.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => { playSound('click'); setSelectedAvatar(av); }}
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center text-lg transition-all border ${
                        selectedAvatar === av
                          ? 'bg-[#DDE5B6] border-[#7A9D54] scale-110 shadow-xs'
                          : 'bg-white border-[#E8E4D9] hover:bg-[#F0EDE5]'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#4A7856] hover:bg-[#3E6548] text-white font-bold text-sm shadow-[0_10px_25px_rgba(74,120,86,0.25)] active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                <span>이 닉네임으로 Plast 시작</span>
              </button>

              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="w-full py-2.5 text-xs text-[#8C8F7A] hover:text-[#2D3319] transition-colors cursor-pointer"
              >
                취소
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

