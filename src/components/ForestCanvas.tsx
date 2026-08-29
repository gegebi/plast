import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TreeItem, UserProfile } from '../types';
import { Sparkles, PlusCircle, Sun, Wind, Clock, Zap, Leaf, Trash2 } from 'lucide-react';
import { playSound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface ForestCanvasProps {
  trees: TreeItem[];
  user: UserProfile;
  growthMultiplier: number;
  onOpenScanner: () => void;
  onDeleteTree: (treeId: string) => void;
  onClearChoppedTrees?: () => void;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  emoji: string;
  vx: number;
  vy: number;
}

interface FloatingToast {
  id: string;
  x: number;
  y: number;
  text: string;
}

export const ForestCanvas: React.FC<ForestCanvasProps> = ({
  trees,
  user,
  growthMultiplier,
  onOpenScanner,
  onDeleteTree,
  onClearChoppedTrees
}) => {
  const [selectedTree, setSelectedTree] = useState<TreeItem | null>(null);
  const [bouncingTreeId, setBouncingTreeId] = useState<string | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingToasts, setFloatingToasts] = useState<FloatingToast[]>([]);

  const activeTreesCount = trees.filter(t => t.stage !== 'chopped').length;
  const matureTreesCount = trees.filter(t => t.stage === 'mature_tree' || t.stage === 'golden_tree').length;
  const growingTreesCount = trees.filter(t => t.stage !== 'chopped' && t.growthPercent < 100).length;
  const choppedTreesCount = trees.filter(t => t.stage === 'chopped').length;

  // Base growth time: 5 hours (in seconds)
  const BASE_GROWTH_SECONDS = 5 * 3600;

  // Calculate estimated remaining time in seconds based on multiplier and current percent
  const getRemainingTimeText = (growthPercent: number) => {
    if (growthPercent >= 100) return '완전 성장 완료 🌳';
    const remainingPercent = (100 - growthPercent) / 100;
    const adjustedTotalSeconds = BASE_GROWTH_SECONDS / Math.max(1, growthMultiplier);
    const remainingSeconds = Math.max(0, Math.round(remainingPercent * adjustedTotalSeconds));

    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);

    if (hours > 0) {
      return `약 ${hours}시간 ${minutes}분 남음`;
    }
    if (minutes > 0) {
      return `약 ${minutes}분 남음`;
    }
    return '곧 완성됩니다!';
  };

  // Trigger reactive burst animation when clicking a tree
  const handleTreeInteract = (e: React.MouseEvent, tree: TreeItem) => {
    playSound('click');
    setBouncingTreeId(tree.id);
    setTimeout(() => setBouncingTreeId(null), 600);

    // Get click location relative to container
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX;
    const clickY = e.clientY;

    // Mini confetti burst around the clicked tree
    confetti({
      particleCount: 18,
      spread: 60,
      startVelocity: 25,
      origin: {
        x: clickX / window.innerWidth,
        y: clickY / window.innerHeight
      },
      colors: tree.stage === 'chopped' 
        ? ['#EF4444', '#F87171', '#B91C1C'] 
        : ['#4ADE80', '#22C55E', '#16A34A', '#FBBF24', '#F472B6']
    });

    // Spawn floating particle emojis
    const burstEmojis = tree.stage === 'chopped' 
      ? ['🪓', '⚠️', '🪵'] 
      : ['🍃', '✨', '🌿', '🌱', '☀️', '🌸', '💚'];
    
    const newParticles: Particle[] = Array.from({ length: 6 }).map((_, i) => ({
      id: `${Date.now()}_${i}`,
      x: rect.left + rect.width / 2 + (Math.random() - 0.5) * 40,
      y: rect.top + rect.height / 3 + (Math.random() - 0.5) * 20,
      emoji: burstEmojis[Math.floor(Math.random() * burstEmojis.length)],
      vx: (Math.random() - 0.5) * 60,
      vy: -30 - Math.random() * 40
    }));

    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 900);

    // Spawn floating encouragement toast
    const toastMessages = [
      '✨ 숲의 활력 UP!',
      '🍃 신선한 산소 방출!',
      '☀️ 광합성 에너지 흡수 중!',
      '🌱 무럭무럭 자라는 중!',
      '💚 깨끗한 지구 만들기!'
    ];
    const newToast: FloatingToast = {
      id: `toast_${Date.now()}`,
      x: rect.left + rect.width / 2,
      y: rect.top,
      text: tree.stage === 'chopped' ? '⚠️ 오염 배출로 베어짐' : toastMessages[Math.floor(Math.random() * toastMessages.length)]
    };
    setFloatingToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setFloatingToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 1200);

    // Select tree to view details
    setSelectedTree(tree);
  };

  // Render SVG tree graphic based on stage and type
  const renderTreeGraphic = (tree: TreeItem) => {
    if (tree.stage === 'chopped') {
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md">
          <ellipse cx="50" cy="78" rx="26" ry="12" fill="#3f2e21" />
          <path d="M 24 78 L 28 60 L 72 60 L 76 78 Z" fill="#6b4c35" />
          <ellipse cx="50" cy="60" rx="22" ry="9" fill="#c49a6c" stroke="#8b5a2b" strokeWidth="2" />
          <ellipse cx="50" cy="60" rx="14" ry="5.5" fill="none" stroke="#a07246" strokeWidth="1.5" />
          <ellipse cx="50" cy="60" rx="6" ry="2.5" fill="none" stroke="#a07246" strokeWidth="1.5" />
          <text x="50" y="42" fontSize="22" textAnchor="middle">🪓</text>
        </svg>
      );
    }

    if (tree.stage === 'seedling') {
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-md">
          {/* Natural soil patch */}
          <ellipse cx="50" cy="82" rx="22" ry="9" fill="#3E2B1D" />
          <ellipse cx="50" cy="80" rx="18" ry="6" fill="#5C4028" />
          {/* Sprout stem */}
          <path d="M 50 80 Q 48 65 50 55" stroke="#48bb78" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          {/* Leaves */}
          <path d="M 50 55 Q 36 46 42 60 Q 48 60 50 55 Z" fill="#38a169" />
          <path d="M 50 55 Q 64 46 58 60 Q 52 60 50 55 Z" fill="#48bb78" />
          <circle cx="50" cy="50" r="3.5" fill="#9ae6b4" />
        </svg>
      );
    }

    if (tree.stage === 'sprout' || tree.stage === 'young_tree') {
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-lg">
          <ellipse cx="50" cy="85" rx="24" ry="9" fill="#3A281A" />
          <ellipse cx="50" cy="83" rx="19" ry="6" fill="#553A23" />
          <path d="M 46 84 L 48 56 L 52 56 L 54 84 Z" fill="#784d2f" />
          <circle cx="50" cy="52" r="19" fill="#2f855a" />
          <circle cx="41" cy="45" r="15" fill="#38a169" />
          <circle cx="59" cy="45" r="15" fill="#48bb78" />
          <circle cx="50" cy="35" r="16" fill="#68d391" />
        </svg>
      );
    }

    // Mature Cherry Tree
    if (tree.type === 'cherry') {
      return (
        <svg viewBox="0 0 100 100" className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-xl animate-pulse" style={{ animationDuration: '4s' }}>
          <ellipse cx="50" cy="87" rx="28" ry="10" fill="#2D1D12" />
          <path d="M 44 86 Q 48 65 47 48 L 53 48 Q 52 65 56 86 Z" fill="#543729" />
          <circle cx="50" cy="42" r="27" fill="#f687b3" />
          <circle cx="35" cy="48" r="19" fill="#fbb6ce" />
          <circle cx="65" cy="48" r="19" fill="#ed64a6" />
          <circle cx="50" cy="27" r="21" fill="#fed7e2" />
          <circle cx="42" cy="32" r="6" fill="#ffffff" opacity="0.6" />
        </svg>
      );
    }

    // Golden Baobab (Legendary)
    if (tree.type === 'golden_baobab') {
      return (
        <svg viewBox="0 0 100 100" className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-2xl">
          <ellipse cx="50" cy="87" rx="30" ry="11" fill="#312209" />
          <path d="M 42 86 L 46 45 L 54 45 L 58 86 Z" fill="#92400e" />
          <circle cx="50" cy="40" r="29" fill="#f59e0b" />
          <circle cx="33" cy="46" r="19" fill="#fbbf24" />
          <circle cx="67" cy="46" r="19" fill="#d97706" />
          <circle cx="50" cy="23" r="23" fill="#fef08a" />
          <polygon points="50,11 53,19 62,19 55,24 58,33 50,27 42,33 45,24 38,19 47,19" fill="#ffffff" />
        </svg>
      );
    }

    // Standard Lush Pine / Oak
    return (
      <svg viewBox="0 0 100 100" className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-xl">
        <ellipse cx="50" cy="87" rx="26" ry="9" fill="#1b281b" />
        <path d="M 45 86 L 47 52 L 53 52 L 55 86 Z" fill="#583c27" />
        <polygon points="50,15 24,46 76,46" fill="#22543d" />
        <polygon points="50,31 18,63 82,63" fill="#276749" />
        <polygon points="50,47 12,77 88,77" fill="#2f855a" />
        <circle cx="50" cy="19" r="3.5" fill="#68d391" />
      </svg>
    );
  };

  return (
    <div className="relative w-full rounded-3xl bg-white/95 border border-[#E8E4D9] p-4 sm:p-6 lg:p-8 shadow-xl overflow-hidden backdrop-blur-md text-[#3C4030]">
      {/* Top Forest Header & Synergy Multiplier Card */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-[#E8E4D9]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-sans font-extrabold text-[#2D3319] tracking-tight">
              {user.nickname}의 에코 포레스트 풀밭
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E9EDC9] text-[#4A5D23] font-bold border border-[#DDE5B6]">
              생태 풀밭 잔디원 🌿
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B705C] mt-1 font-medium flex items-center gap-2">
            <span>깨끗이 분리수거된 묘목들이 따스한 풀밭 위에서 자연 성장하고 있습니다.</span>
          </p>
        </div>

        {/* Dynamic Growth Speed & Synergy Indicator */}
        <div className="flex flex-wrap items-center gap-2 bg-[#F4F6EC] border border-[#DDE5B6] px-3.5 py-2 rounded-2xl shadow-xs">
          <div className="flex items-center gap-1.5 text-[#4A5D23] text-xs font-bold">
            <Sun className="w-4 h-4 text-[#E2B842] animate-spin" style={{ animationDuration: '15s' }} />
            <span>광합성 시너지 x{growthMultiplier.toFixed(1)}배</span>
          </div>
          <span className="text-[#A3B18A] text-xs">|</span>
          <div className="flex items-center gap-1 text-xs font-bold text-[#4A7856]">
            <Clock className="w-3.5 h-3.5" />
            <span>성장 기준 5시간</span>
          </div>
          <span className="text-[#A3B18A] text-xs">|</span>
          <span className="text-xs font-bold text-[#2D3319]">
            총 {activeTreesCount}그루
          </span>
          {choppedTreesCount > 0 && (
            <div className="flex items-center gap-1.5 ml-1">
              <span className="text-xs text-rose-600 font-bold">
                (벌목 {choppedTreesCount}그루 🪓)
              </span>
              {onClearChoppedTrees && (
                <button
                  onClick={() => {
                    playSound('click');
                    if (window.confirm(`벌목된 나무 ${choppedTreesCount}그루를 풀밭에서 모두 정리하시겠습니까?\n(프로필의 누적 벌목 기록은 그대로 보존됩니다)`)) {
                      onClearChoppedTrees();
                    }
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[11px] font-bold transition-all shadow-xs"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>일괄 정리</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIBRANT GRASSLAND MEADOW FIELD (풀밭 지형)                               */}
      {/* ========================================================================= */}
      <div className="relative z-10 my-5 min-h-[420px] sm:min-h-[480px] rounded-3xl overflow-hidden border-4 border-[#8EB05B]/30 shadow-inner bg-gradient-to-b from-[#7CA452] via-[#66903D] to-[#4F772D] p-5 sm:p-7 flex flex-col justify-between select-none">
        
        {/* Layer 1: Meadow Atmosphere & Rolling Hill Contours */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Subtle Organic Rolling Grass Hills SVG */}
          <svg className="absolute bottom-0 left-0 w-full h-48 opacity-35" viewBox="0 0 1200 300" preserveAspectRatio="none">
            <path d="M0,160 C300,260 600,60 900,180 C1050,240 1150,150 1200,160 L1200,300 L0,300 Z" fill="#3D5F22" />
            <path d="M0,200 C200,120 500,240 800,140 C1000,80 1100,180 1200,200 L1200,300 L0,300 Z" fill="#2E4A19" />
          </svg>

          {/* Sunlight Rays Glint */}
          <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-gradient-to-br from-[#FFEAA7]/40 via-[#FDCB6E]/15 to-transparent blur-2xl" />

          {/* Dandelion Fluffs / Pollen Drift in Gentle Breeze */}
          <motion.div
            animate={{ x: [0, 80, 0], y: [0, -15, 0], opacity: [0.6, 0.9, 0.6] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className="absolute top-12 left-10 text-white/50 text-xs"
          >
            🌾 • °
          </motion.div>
          <motion.div
            animate={{ x: [0, -60, 0], y: [0, 20, 0], opacity: [0.4, 0.8, 0.4] }}
            transition={{ repeat: Infinity, duration: 11, ease: "easeInOut" }}
            className="absolute top-36 right-20 text-white/40 text-xs"
          >
            ✨ 🍃
          </motion.div>
          <motion.div
            animate={{ x: [0, 100, 0], y: [0, -25, 0], opacity: [0.5, 0.85, 0.5] }}
            transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }}
            className="absolute bottom-16 left-1/3 text-white/45 text-xs"
          >
            • ° 🌸
          </motion.div>

          {/* Meadow Wild Flowers & Grass Tufts scattered along the grass canvas */}
          <span className="absolute top-6 left-1/4 text-sm opacity-75">🌼</span>
          <span className="absolute top-16 right-1/3 text-xs opacity-60">🌸</span>
          <span className="absolute top-28 left-12 text-xs opacity-70">🍀</span>
          <span className="absolute bottom-8 right-16 text-sm opacity-80">🌼</span>
          <span className="absolute bottom-12 left-20 text-xs opacity-75">🌸</span>
          <span className="absolute bottom-24 right-1/4 text-xs opacity-65">🍀</span>
          <span className="absolute top-1/2 left-8 text-xs opacity-60">🌼</span>
          <span className="absolute top-1/2 right-10 text-xs opacity-70">🌸</span>
        </div>

        {/* Layer 2: Grassland Weather Bar */}
        <div className="relative z-10 flex items-center justify-between text-xs text-white/90 font-bold mb-3 px-1">
          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
            <Wind className="w-3.5 h-3.5 text-[#A3E635]" />
            <span>푸른 풀밭 생태 지수 99.8% (신선한 피톤치드 맑음)</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-black/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-[#FDE047]" />
            <span>나무를 탭하면 피어나는 에코 파티클!</span>
          </div>
        </div>

        {/* Layer 3: Main Grassland Content Area */}
        {trees.length === 0 ? (
          /* Empty Grassland State */
          <div className="relative z-10 my-auto text-center py-12 px-4 max-w-md mx-auto bg-black/25 backdrop-blur-md rounded-3xl border border-white/20 text-white shadow-xl">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-[#7CA452] border-2 border-white/40 shadow-md flex items-center justify-center text-4xl mb-4 animate-bounce">
              🌱
            </div>
            <h3 className="text-xl font-extrabold mb-1 font-sans">
              푸른 풀밭이 비어있습니다
            </h3>
            <p className="text-xs text-white/85 mb-6 leading-relaxed font-medium">
              엽떡 배달용기나 플라스틱 컵을 깨끗하게 세척해 촬영하면, 이 촉촉한 풀밭에 첫 묘목이 심어집니다!
            </p>
            <button
              onClick={onOpenScanner}
              className="px-7 py-3.5 rounded-full bg-[#FACC15] hover:bg-[#EAB308] text-[#365314] font-extrabold text-sm shadow-[0_10px_25px_rgba(234,179,8,0.4)] active:scale-95 transition-all"
            >
              📷 깨끗한 분리수거 인증하고 묘목 심기
            </button>
          </div>
        ) : (
          /* Grid of Trees Planted directly on the Grassland */
          <div className="relative z-10 w-full py-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4.5 justify-items-center">
              {trees.map((tree) => {
                const isBouncing = bouncingTreeId === tree.id;
                const isGrowing = tree.stage !== 'chopped' && tree.growthPercent < 100;
                const remainingTimeStr = getRemainingTimeText(tree.growthPercent);

                return (
                  <motion.div
                    key={tree.id}
                    layout
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.06, y: -4 }}
                    onClick={(e) => handleTreeInteract(e, tree)}
                    className="relative group flex flex-col items-center justify-end w-full cursor-pointer transition-all"
                  >
                    {/* Natural Earth/Soil Mound & Grass Ring Base on the Grassland */}
                    <div className={`w-full rounded-2xl p-2.5 sm:p-3 flex flex-col items-center border backdrop-blur-md transition-all ${
                      tree.stage === 'chopped'
                        ? 'bg-[#451A03]/60 border-rose-400/50 shadow-md'
                        : 'bg-[#2E4A19]/55 hover:bg-[#2E4A19]/75 border-[#A3E635]/30 hover:border-[#FACC15] shadow-lg shadow-black/20'
                    }`}>

                      {/* Tree Graphic with interactive spring squash & stretch on click */}
                      <motion.div
                        animate={isBouncing ? {
                          scale: [1, 1.35, 0.85, 1.15, 1],
                          rotate: [0, -8, 8, -4, 0],
                          y: [0, -12, 4, -4, 0]
                        } : {
                          y: [0, -2, 0]
                        }}
                        transition={isBouncing ? { duration: 0.5, ease: "easeOut" } : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                        className="relative z-10 my-1 flex items-center justify-center filter drop-shadow-md"
                      >
                        {renderTreeGraphic(tree)}
                      </motion.div>

                      {/* Grass/Soil Base Highlight */}
                      <div className="w-16 h-2 rounded-full bg-[#1F3311]/70 -mt-2 mb-1.5 blur-[1px]" />

                      {/* Wooden Tree Name Badge */}
                      <div className="w-full text-center px-1">
                        <p className="text-[12px] font-extrabold text-white truncate drop-shadow-sm font-sans">
                          {tree.name}
                        </p>

                        {tree.stage !== 'chopped' ? (
                          <div className="mt-1 w-full flex flex-col items-center">
                            {/* Growth Progress Bar */}
                            <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/20">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  tree.growthPercent >= 100 
                                    ? 'bg-gradient-to-r from-[#FDE047] to-[#84CC16]' 
                                    : 'bg-gradient-to-r from-[#4ADE80] to-[#22C55E]'
                                }`}
                                style={{ width: `${Math.max(8, Math.round(tree.growthPercent))}%` }}
                              />
                            </div>

                            {/* Remaining Time or Mature Status */}
                            <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-white/90 font-bold">
                              {tree.growthPercent >= 100 ? (
                                <span className="text-[#FDE047] flex items-center gap-0.5">
                                  <span>🌳 완전 성장 ({Math.round(tree.growthPercent)}%)</span>
                                </span>
                              ) : (
                                <span className="text-[#E2E8F0] flex items-center gap-1 bg-black/25 px-1.5 py-0.5 rounded-md border border-white/10">
                                  <Clock className="w-2.5 h-2.5 text-[#FDE047]" />
                                  <span>{remainingTimeStr}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1 flex flex-col items-center gap-1">
                            <span className="text-[10px] text-rose-300 font-extrabold block bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-500/30">
                              오염 벌목 🪓
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playSound('click');
                                onDeleteTree(tree.id);
                              }}
                              className="flex items-center justify-center gap-1 text-[10px] font-bold text-rose-100 bg-rose-700/80 hover:bg-rose-600 px-2.5 py-0.5 rounded-full border border-rose-400/50 shadow-xs transition-all active:scale-95"
                              title="벌목된 묘목 삭제"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                              <span>삭제</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Next Planting Slot on the Grassland */}
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                onClick={() => { playSound('click'); onOpenScanner(); }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-[#FDE047]/60 hover:border-[#FDE047] bg-[#2E4A19]/40 hover:bg-[#2E4A19]/70 cursor-pointer text-center min-h-[140px] w-full transition-all shadow-md group backdrop-blur-xs"
              >
                <div className="w-11 h-11 rounded-full bg-[#FACC15] group-hover:scale-110 text-[#365314] flex items-center justify-center mb-2 shadow-lg transition-transform">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <span className="text-xs font-extrabold text-white">풀밭에 새 묘목 심기</span>
                <span className="text-[10px] text-white/80 mt-0.5 font-medium">실시간 분리수거 인증</span>
              </motion.div>
            </div>
          </div>
        )}

        {/* Grassland Bottom Info Strip */}
        <div className="relative z-10 mt-3 pt-3 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between text-xs text-white/85 gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🌱</span>
            <span>
              <strong>5시간 자연 성장 법칙</strong>: 묘목은 5시간에 걸쳐 자라나며, 풀밭의 나무가 많을수록 광합성 시너지로 시간이 대폭 단축됩니다!
            </span>
          </div>
          <span className="text-[11px] text-[#FDE047] font-bold">
            성장 중인 묘목: {growingTreesCount}그루 / 완전 성장: {matureTreesCount}그루
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* REACTIVE BURST PARTICLES & FLOATING TOASTS                                */}
      {/* ========================================================================= */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, scale: 0.8, x: p.x, y: p.y }}
          animate={{
            opacity: 0,
            scale: 1.6,
            x: p.x + p.vx,
            y: p.y + p.vy,
            rotate: (Math.random() - 0.5) * 120
          }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          className="fixed z-50 pointer-events-none text-xl select-none"
        >
          {p.emoji}
        </motion.div>
      ))}

      {floatingToasts.map((toast) => (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: toast.y, x: toast.x - 70, scale: 0.8 }}
          animate={{ opacity: 1, y: toast.y - 45, scale: 1.05 }}
          exit={{ opacity: 0, y: toast.y - 70 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="fixed z-50 pointer-events-none bg-[#2D3319]/90 text-[#FDE047] text-xs font-black px-3 py-1.5 rounded-full shadow-xl border border-[#FDE047]/40 flex items-center gap-1.5 backdrop-blur-md select-none"
        >
          <span>{toast.text}</span>
        </motion.div>
      ))}

      {/* ========================================================================= */}
      {/* TREE DETAIL POPUP MODAL (NO WATER BUTTON, TIME-BASED DETAILS)             */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedTree && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl bg-[#F9F7F2] border border-[#E8E4D9] p-6 shadow-2xl text-[#3C4030] relative"
            >
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-2 flex items-center justify-center">
                  {renderTreeGraphic(selectedTree)}
                </div>
                <h4 className="text-2xl font-extrabold text-[#2D3319] mb-1 font-sans">
                  {selectedTree.name}
                </h4>
                <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold mb-3 ${
                  selectedTree.stage === 'chopped' 
                    ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                    : 'bg-[#DDE5B6] text-[#4A5D23] border border-[#CCD5AE]'
                }`}>
                  {selectedTree.stage === 'chopped' ? '오염으로 베어진 나무 🪓' : `성장 진행률: ${Math.round(selectedTree.growthPercent)}%`}
                </span>

                {/* Growth Stage Progress Bar */}
                {selectedTree.stage !== 'chopped' && (
                  <div className="mb-4 bg-white p-3 rounded-2xl border border-[#E8E4D9]">
                    <div className="flex justify-between text-xs font-bold mb-1.5 text-[#2D3319]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#7A9D54]" />
                        <span>성장 상태</span>
                      </span>
                      <span className="text-[#4A7856] font-extrabold">
                        {getRemainingTimeText(selectedTree.growthPercent)}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[#F0EDE5] rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-[#7A9D54] to-[#4A7856] rounded-full transition-all duration-300"
                        style={{ width: `${Math.round(selectedTree.growthPercent)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[#8C8F7A] mt-1.5 text-left">
                      💡 기본 5시간 소요되며, 현재 보유한 나무들의 <strong>광합성 시너지(x{growthMultiplier.toFixed(1)})</strong>로 시간이 단축되어 성장합니다.
                    </p>
                  </div>
                )}

                <div className="space-y-2 text-left bg-white rounded-2xl p-4 text-xs text-[#3C4030] mb-5 border border-[#E8E4D9] shadow-xs">
                  <div className="flex justify-between">
                    <span className="text-[#8C8F7A]">인증 품목</span>
                    <span className="font-bold text-[#4A7856]">{selectedTree.itemNameAtPlanting || '모범 분리수거'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C8F7A]">심은 일시</span>
                    <span className="font-medium text-[#2D3319]">{new Date(selectedTree.plantedAt).toLocaleDateString('ko-KR')} {new Date(selectedTree.plantedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {selectedTree.choppedReason && (
                    <div className="flex justify-between text-rose-600">
                      <span>벌목 사유</span>
                      <span className="font-bold">{selectedTree.choppedReason}</span>
                    </div>
                  )}
                </div>

                {selectedTree.stage === 'chopped' ? (
                  <div className="space-y-2">
                    <p className="text-[11px] text-[#8C8F7A] text-center mb-1">
                      ℹ️ 풀밭에서 삭제해도 <strong>프로필 에코 통계</strong>에 누적 벌목 기록({user.totalTreesChopped}그루)이 안전하게 보존됩니다.
                    </p>
                    <button
                      onClick={() => {
                        playSound('click');
                        onDeleteTree(selectedTree.id);
                        setSelectedTree(null);
                      }}
                      className="w-full py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>벌목된 그루터기 풀밭에서 삭제하기</span>
                    </button>
                    <button
                      onClick={() => setSelectedTree(null)}
                      className="w-full py-2.5 rounded-full bg-white border border-[#E8E4D9] text-[#6B705C] hover:text-[#2D3319] font-bold text-xs transition-colors"
                    >
                      닫기
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedTree(null)}
                    className="w-full py-3 rounded-full bg-[#4A7856] hover:bg-[#3E6548] text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
                  >
                    확인 완료
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
