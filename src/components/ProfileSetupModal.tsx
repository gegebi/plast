import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { Sparkles, Check, Mountain, User, ShieldCheck } from 'lucide-react';
import { playSound } from '../utils/sound';
import { extractCleanNicknameAndAvatar } from '../utils/userUtils';

interface ProfileSetupModalProps {
  initialNickname: string;
  initialAvatarUrl?: string;
  userEmail: string;
  onSaveProfile: (nickname: string, avatarUrl: string) => void;
}

const AVATAR_PRESETS = [
  { id: 'sprout', label: '새싹 러너', emoji: '🌱', bg: 'bg-[#E9EDC9]', text: '#4A5D23' },
  { id: 'tree', label: '솔방울 지킴이', emoji: '🌲', bg: 'bg-[#DDE5B6]', text: '#2D6A4F' },
  { id: 'bear', label: '숲속 곰돌이', emoji: '🐻', bg: 'bg-[#FAEDCD]', text: '#8C5828' },
  { id: 'mountain', label: '산악대장', emoji: '🏔️', bg: 'bg-[#E0E7FF]', text: '#3730A3' },
  { id: 'leaf', label: '푸른 잎새', emoji: '🌿', bg: 'bg-[#DCFCE7]', text: '#15803D' },
  { id: 'fox', label: '에코 여우', emoji: '🦊', bg: 'bg-[#FFEDD5]', text: '#C2410C' },
  { id: 'clover', label: '행운 클로버', emoji: '🍀', bg: 'bg-[#E9EDC9]', text: '#3F6212' },
  { id: 'owl', label: '지혜 부엉이', emoji: '🦉', bg: 'bg-[#F3E8FF]', text: '#6B21A8' },
];

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({
  initialNickname,
  initialAvatarUrl = '',
  userEmail,
  onSaveProfile,
}) => {
  const cleanedInit = extractCleanNicknameAndAvatar(initialNickname, initialAvatarUrl);
  const [nickname, setNickname] = useState(cleanedInit.nickname || '에코러너');
  const [effectiveAvatarUrl] = useState<string>(cleanedInit.avatarUrl || initialAvatarUrl);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    effectiveAvatarUrl && effectiveAvatarUrl.startsWith('http') ? 'google' : 'sprout'
  );
  const [customAvatarEmoji, setCustomAvatarEmoji] = useState<string>('🌱');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = extractCleanNicknameAndAvatar(nickname, effectiveAvatarUrl);
    const trimmed = cleaned.nickname;
    if (!trimmed) {
      setErrorMsg('닉네임을 2자 이상 입력해주세요.');
      return;
    }
    if (trimmed.length < 2 || trimmed.length > 12) {
      setErrorMsg('닉네임은 2자 이상 12자 이하로 설정해주세요.');
      return;
    }

    playSound('fanfare');
    let finalAvatar = '';
    if (selectedAvatar === 'google' && effectiveAvatarUrl) {
      finalAvatar = effectiveAvatarUrl;
    } else {
      const preset = AVATAR_PRESETS.find(p => p.id === selectedAvatar);
      finalAvatar = preset ? preset.emoji : customAvatarEmoji;
    }

    onSaveProfile(trimmed, finalAvatar);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 15 }}
        className="w-full max-w-md bg-[#F9F7F2] rounded-3xl border border-[#E8E4D9] p-6 sm:p-8 text-[#3C4030] shadow-2xl relative overflow-hidden"
      >
        {/* Top Decorative Banner */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-3xl overflow-hidden bg-[#7A9D54] flex items-center justify-center shadow-lg border-2 border-white mb-3">
            <img src="/favicon.svg" alt="Plast Logo" className="w-full h-full object-cover" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9EDC9] text-[#2D6A4F] text-xs font-extrabold border border-[#DDE5B6] mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>Google 계정 연동 완료</span>
          </div>
          <h2 className="text-2xl font-sans font-black text-[#2D3319] tracking-tight">
            에코 프로필 설정
          </h2>
          <p className="text-xs text-[#6B705C] mt-1 max-w-xs mx-auto">
            풀밭과 산 리그 랭킹에서 활동할 나만의 닉네임과 대표 아바타를 선택해주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Google Account Info Box */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#E8E4D9] shadow-xs">
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5 ml-1"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[11px] text-[#8C8F7A] block font-medium">연동된 구글 계정</span>
              <span className="text-xs font-bold text-[#2D3319] truncate block">{userEmail}</span>
            </div>
          </div>

          {/* Nickname Input */}
          <div>
            <label className="block text-xs font-extrabold text-[#2D3319] mb-1.5">
              에코 닉네임 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nickname}
              maxLength={12}
              onChange={(e) => {
                setNickname(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="예: 푸른지킴이, 에코마스터"
              className="w-full px-4 py-3 rounded-2xl bg-white border border-[#DDE5B6] text-[#2D3319] font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#7A9D54] shadow-xs"
            />
            {errorMsg ? (
              <p className="text-[11px] text-rose-500 font-bold mt-1.5 ml-1">{errorMsg}</p>
            ) : (
              <p className="text-[11px] text-[#8C8F7A] mt-1 ml-1">
                2~12자 한글/영문/숫자 (언제든 설정에서 변경 가능)
              </p>
            )}
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-extrabold text-[#2D3319] mb-2">
              대표 아바타 캐릭터 선택
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2.5">
              {/* Google photo if available */}
              {initialAvatarUrl && (
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setSelectedAvatar('google');
                  }}
                  className={`relative p-2 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                    selectedAvatar === 'google'
                      ? 'border-[#7A9D54] bg-[#F4F7EE] ring-2 ring-[#7A9D54] shadow-md scale-102'
                      : 'border-[#E8E4D9] bg-white hover:border-[#CCD5AE]'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-[#DDE5B6]">
                    <img 
                      src={initialAvatarUrl} 
                      alt="Google Avatar" 
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#2D3319] truncate">구글 사진</span>
                  {selectedAvatar === 'google' && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#7A9D54] text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  )}
                </button>
              )}

              {/* Presets */}
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = selectedAvatar === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      playSound('click');
                      setSelectedAvatar(preset.id);
                      setCustomAvatarEmoji(preset.emoji);
                    }}
                    className={`relative p-2 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? 'border-[#7A9D54] bg-[#F4F7EE] ring-2 ring-[#7A9D54] shadow-md scale-102'
                        : 'border-[#E8E4D9] bg-white hover:border-[#CCD5AE]'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-2xl ${preset.bg} flex items-center justify-center text-xl shadow-xs`}>
                      {preset.emoji}
                    </div>
                    <span className="text-[10px] font-bold text-[#2D3319] truncate">{preset.label}</span>
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#7A9D54] text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Starting League Notice */}
          <div className="p-3.5 rounded-2xl bg-[#F0EDE5] border border-[#E8E4D9] flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7A9D54]/20 flex items-center justify-center text-lg text-[#2D6A4F]">
              🏔️
            </div>
            <div className="text-xs">
              <span className="font-extrabold text-[#2D3319] block">시작 산: 남산 리그 (50그루)</span>
              <span className="text-[#6B705C] text-[11px]">
                첫 분리수거 인증을 시작하면 남산 봉우리에 묘목이 심어집니다.
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-full bg-gradient-to-r from-[#4A7856] to-[#7A9D54] hover:from-[#3E6548] hover:to-[#6B8E47] text-white font-extrabold text-sm shadow-[0_8px_25px_rgba(74,120,86,0.3)] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>설정 완료하고 풀밭 시작하기</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
};
