import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Leaf, Camera, Mountain, Sparkles, Trophy, ArrowRight, ShieldCheck, Zap, Sun, Award, CheckCircle2, Loader2 } from 'lucide-react';
import { MOUNTAIN_LEAGUES, LEAGUE_ORDER } from '../data/mountains';
import { playSound } from '../utils/sound';

interface LandingPageProps {
  isLoggedIn: boolean;
  onLogin: (nickname: string, email: string) => void;
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
  const [nicknameInput, setNicknameInput] = useState<string>('에코러너');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('🌱');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

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
      onLogin(nicknameInput.trim() || '에코러너', `${nicknameInput.trim()}@gmail.com`);
    }
  };

  const handleCustomStart = (e: React.FormEvent) => {
    e.preventDefault();
    playSound('fanfare');
    onLogin(nicknameInput.trim() || '에코러너', `${nicknameInput.trim()}@plast.eco`);
    setShowLoginModal(false);
  };


  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#3C4030] selection:bg-[#7A9D54] selection:text-white font-['Pretendard',sans-serif] relative overflow-hidden">
      {/* Hero Ambient Background SVG Mountain & Aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[580px] pointer-events-none opacity-20 overflow-hidden">
        <svg viewBox="0 0 200 100" className="w-full h-full text-[#A3B18A] fill-current">
          <path d="M0,100 L40,60 L70,85 L120,20 L160,70 L200,100 Z" />
        </svg>
      </div>

      {/* Top Header */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md border-2 border-white bg-[#7A9D54] flex items-center justify-center">
            <img src="/favicon.svg" alt="Plast Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-[#2D3319] font-sans">
                Plast
              </h1>
              <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#DDE5B6] text-[#4A5D23] font-bold">
                Eco-Forest
              </span>
            </div>
            <p className="text-xs uppercase tracking-widest text-[#8C8F7A] font-semibold">
              Eco-Restoration Project
            </p>
          </div>
        </div>

        <div>
          {isLoggedIn ? (
            <button
              onClick={() => { playSound('click'); onGoToHome(); }}
              className="px-6 py-3 rounded-full bg-[#4A7856] hover:bg-[#3E6548] text-white font-bold text-xs sm:text-sm shadow-[0_8px_20px_rgba(74,120,86,0.25)] flex items-center gap-2 transition-all"
            >
              <span>내 숲 바로가기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => { playSound('click'); setShowLoginModal(true); }}
              className="px-5 py-2.5 rounded-full bg-white/80 hover:bg-white border border-[#E8E4D9] text-xs font-bold text-[#2D3319] shadow-xs transition-colors"
            >
              간편 로그인
            </button>
          )}
        </div>
      </header>

      {/* Main Hero Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-12 pb-16 text-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#DDE5B6] text-[#4A5D23] rounded-full text-xs font-bold uppercase tracking-widest mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#7A9D54]" />
            <span>실시간 카메라 분리수거 에코 포레스트</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-extrabold text-[#2D3319] tracking-tight leading-[1.25] mb-6">
            깨끗한 분리수거로 <br />
            <span className="text-[#4A7856] underline decoration-[#DDE5B6] decoration-wavy decoration-2">
              남산에서 에베레스트까지
            </span> <br />
            나만의 산을 일구세요
          </h1>

          <p className="text-sm sm:text-base text-[#6B705C] max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
            엽떡통과 플라스틱을 깨끗이 씻어 <strong>실시간 카메라</strong>로 인증하세요.
            <br />
            무결점 세척 시 <strong>새 묘목🌱</strong>이 심어지고, 오염물이 남으면 <strong>나무가 베어집니다🪓</strong>.
            <br />
            나무가 많을수록 광합성 시너지로 숲이 더 빠르게 번창합니다!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            {isLoggedIn ? (
              <button
                onClick={() => { playSound('fanfare'); onGoToHome(); }}
                className="w-full sm:w-auto px-10 py-4 rounded-full bg-[#4A7856] hover:bg-[#3E6548] text-white font-bold text-base shadow-[0_10px_30px_rgba(74,120,86,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>내 포레스트 입장하기</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <>
                <button
                  disabled={isLoggingIn}
                  onClick={handleStartGoogleAuth}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#4A7856] hover:bg-[#3E6548] disabled:opacity-70 text-white font-bold text-sm shadow-[0_10px_25px_rgba(74,120,86,0.25)] active:scale-95 transition-all flex items-center justify-center gap-2.5"
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
                  <span>Google 계정으로 시작하기</span>
                </button>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/90 hover:bg-white border border-[#E8E4D9] text-[#2D3319] font-bold text-sm shadow-xs transition-all"
                >
                  닉네임 설정하여 시작
                </button>
              </>
            )}
          </div>
        </motion.div>
      </section>


      {/* 4 Core Pillars Grid */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-sans font-extrabold text-[#2D3319]">Plast 게임 핵심 메커니즘</h2>
          <p className="text-xs sm:text-sm text-[#8C8F7A] mt-1 font-medium">친환경 실천과 게임의 유기적 결합</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-[#E8E4D9] shadow-xs hover:border-[#7A9D54] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#E9EDC9] flex items-center justify-center text-[#4A7856] mb-3 border border-[#DDE5B6]">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-[#2D3319] mb-1 font-sans">실시간 날것(Raw) 촬영</h3>
            <p className="text-xs text-[#6B705C] leading-relaxed">
              갤러리 예전 사진 업로드를 방지하고, 지금 이 순간의 날것 그대로 즉시 촬영하여 정직하게 인증합니다.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-[#E8E4D9] shadow-xs hover:border-[#7A9D54] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#CCD5AE] flex items-center justify-center text-[#4A5D23] mb-3 border border-[#B5C99A]">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-[#2D3319] mb-1 font-sans">픽셀 비전 오염도 측정</h3>
            <p className="text-xs text-[#6B705C] leading-relaxed">
              외부 무거운 AI 대신 브라우저 캔버스 픽셀 알고리즘으로 엽떡 고추기름과 이물질을 즉시 감지합니다.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-[#E8E4D9] shadow-xs hover:border-[#7A9D54] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#DDE5B6] flex items-center justify-center text-[#7A9D54] mb-3 border border-[#CCD5AE]">
              <Sun className="w-6 h-6 text-[#E2B842]" />
            </div>
            <h3 className="font-extrabold text-sm text-[#2D3319] mb-1 font-sans">광합성 시너지 가속</h3>
            <p className="text-xs text-[#6B705C] leading-relaxed">
              숲에 건강한 나무가 많을수록 광합성 시너지가 발동되어 묘목 성장 속도가 배수로 빨라집니다.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-[#E8E4D9] shadow-xs hover:border-[#7A9D54] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#E9EDC9] flex items-center justify-center text-[#4A7856] mb-3 border border-[#DDE5B6]">
              <Mountain className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-[#2D3319] mb-1 font-sans">산 형성 & 리그 랭킹</h3>
            <p className="text-xs text-[#6B705C] leading-relaxed">
              50그루 남산 ➡️ 100그루 한라산 ➡️ 200그루 지리산 ➡️ 300그루 설악산 순서로 리그를 승급하며 랭킹 1위에 도전하세요!
            </p>
          </div>
        </div>
      </section>

      {/* Mountain Leagues Preview Showcase */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-12 border-t border-[#E8E4D9]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-2xl font-sans font-extrabold text-[#2D3319]">🏔️ 정복 가능한 6대 산 리그</h2>
            <p className="text-xs text-[#8C8F7A] mt-0.5 font-medium">나무를 가꿔 더 높은 봉우리로 도약하세요</p>
          </div>
          <span className="text-xs text-[#4A5D23] font-bold bg-[#DDE5B6] px-3.5 py-1.5 rounded-full border border-[#CCD5AE]">
            총 6단계 리그 시스템
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {LEAGUE_ORDER.map((leagueId) => {
            const m = MOUNTAIN_LEAGUES[leagueId];
            return (
              <div
                key={m.id}
                className="p-4 rounded-3xl bg-white/80 border border-[#E8E4D9] flex flex-col items-center text-center shadow-xs hover:border-[#7A9D54] transition-all"
              >
                <div className="text-2xl mb-1.5">🏔️</div>
                <h4 className="font-bold text-sm text-[#2D3319] font-sans">{m.name}</h4>
                <span className="text-[11px] font-mono text-[#7A9D54] font-bold">{m.altitude}m</span>
                <div className="mt-2 text-[10px] bg-[#F9F7F2] border border-[#E8E4D9] px-2 py-0.5 rounded-full text-[#6B705C] font-semibold">
                  {m.requiredTrees}그루 달성
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Google Login / Nickname Customizer Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-[#F9F7F2] rounded-3xl border border-[#E8E4D9] p-6 sm:p-8 text-[#3C4030] shadow-2xl"
          >
            <div className="text-center mb-5">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#7A9D54] text-white flex items-center justify-center text-2xl mb-3 shadow-md border-2 border-white">
                <span className="font-black font-sans">P</span>
              </div>
              <h3 className="text-xl font-extrabold text-[#2D3319] mb-1 font-sans">
                Plast 계정 시작하기
              </h3>
              <p className="text-xs text-[#8C8F7A]">
                구글 계정으로 간편하게 시작하고 나만의 숲을 만드세요.
              </p>
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
                className="w-full py-3.5 rounded-full bg-[#4A7856] hover:bg-[#3E6548] text-white font-bold text-sm shadow-[0_10px_25px_rgba(74,120,86,0.25)] active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
              >
                <span>이 닉네임으로 Plast 시작</span>
              </button>

              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="w-full py-2.5 text-xs text-[#8C8F7A] hover:text-[#2D3319] transition-colors"
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
