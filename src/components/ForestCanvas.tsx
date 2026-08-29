import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TreeItem, UserProfile } from '../types';
import { Sparkles, Droplets, Info, PlusCircle, AlertTriangle, ShieldCheck, Sun, Wind } from 'lucide-react';
import { playSound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface ForestCanvasProps {
  trees: TreeItem[];
  user: UserProfile;
  growthMultiplier: number;
  onWaterTree: (treeId: string) => void;
  onOpenScanner: () => void;
}

export const ForestCanvas: React.FC<ForestCanvasProps> = ({
  trees,
  user,
  growthMultiplier,
  onWaterTree,
  onOpenScanner
}) => {
  const [selectedTree, setSelectedTree] = useState<TreeItem | null>(null);
  const [waterEffectTreeId, setWaterEffectTreeId] = useState<string | null>(null);

  const activeTreesCount = trees.filter(t => t.stage !== 'chopped').length;
  const choppedTreesCount = trees.filter(t => t.stage === 'chopped').length;

  const handleTreeClick = (tree: TreeItem) => {
    playSound('click');
    setSelectedTree(tree);
  };

  const handleWaterClick = (e: React.MouseEvent, treeId: string) => {
    e.stopPropagation();
    playSound('water');
    setWaterEffectTreeId(treeId);
    onWaterTree(treeId);
    setTimeout(() => setWaterEffectTreeId(null), 1000);
  };

  // Render SVG tree graphic based on stage and type
  const renderTreeGraphic = (tree: TreeItem) => {
    if (tree.stage === 'chopped') {
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md">
          {/* Chopped stump */}
          <ellipse cx="50" cy="78" rx="26" ry="12" fill="#3f2e21" />
          <path d="M 24 78 L 28 60 L 72 60 L 76 78 Z" fill="#6b4c35" />
          <ellipse cx="50" cy="60" rx="22" ry="9" fill="#c49a6c" stroke="#8b5a2b" stroke-width="2" />
          {/* Annual rings */}
          <ellipse cx="50" cy="60" rx="14" ry="5.5" fill="none" stroke="#a07246" stroke-width="1.5" />
          <ellipse cx="50" cy="60" rx="6" ry="2.5" fill="none" stroke="#a07246" stroke-width="1.5" />
          {/* Axe or warning mark */}
          <text x="50" y="42" font-size="20" text-anchor="middle">🪓</text>
        </svg>
      );
    }

    if (tree.stage === 'seedling') {
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-md">
          {/* Soil mound */}
          <ellipse cx="50" cy="80" rx="20" ry="8" fill="#4a3728" />
          {/* Sprout stem */}
          <path d="M 50 80 Q 48 65 50 55" stroke="#48bb78" stroke-width="4" fill="none" stroke-linecap="round" />
          {/* Tiny green leaves */}
          <path d="M 50 55 Q 38 48 42 60 Q 48 60 50 55 Z" fill="#38a169" />
          <path d="M 50 55 Q 62 48 58 60 Q 52 60 50 55 Z" fill="#48bb78" />
          <circle cx="50" cy="50" r="3" fill="#9ae6b4" />
        </svg>
      );
    }

    if (tree.stage === 'sprout' || tree.stage === 'young_tree') {
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-lg">
          <ellipse cx="50" cy="84" rx="22" ry="8" fill="#3d2c1e" />
          <path d="M 46 84 L 48 56 L 52 56 L 54 84 Z" fill="#784d2f" />
          {/* Young tree foliage layers */}
          <circle cx="50" cy="52" r="18" fill="#2f855a" />
          <circle cx="42" cy="46" r="14" fill="#38a169" />
          <circle cx="58" cy="46" r="14" fill="#48bb78" />
          <circle cx="50" cy="36" r="15" fill="#68d391" />
        </svg>
      );
    }

    // Mature trees
    if (tree.type === 'cherry') {
      return (
        <svg viewBox="0 0 100 100" className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-xl animate-pulse" style={{ animationDuration: '4s' }}>
          <ellipse cx="50" cy="86" rx="26" ry="9" fill="#2c1e13" />
          <path d="M 44 86 Q 48 65 47 48 L 53 48 Q 52 65 56 86 Z" fill="#543729" />
          {/* Pink Sakura foliage */}
          <circle cx="50" cy="42" r="26" fill="#f687b3" />
          <circle cx="36" cy="48" r="18" fill="#fbb6ce" />
          <circle cx="64" cy="48" r="18" fill="#ed64a6" />
          <circle cx="50" cy="28" r="20" fill="#fed7e2" />
          <circle cx="42" cy="32" r="6" fill="#ffffff" opacity="0.6" />
        </svg>
      );
    }

    if (tree.type === 'golden_baobab') {
      return (
        <svg viewBox="0 0 100 100" className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-2xl">
          <ellipse cx="50" cy="86" rx="28" ry="10" fill="#3b2b10" />
          <path d="M 42 86 L 46 45 L 54 45 L 58 86 Z" fill="#92400e" />
          {/* Golden luminous tree */}
          <circle cx="50" cy="40" r="28" fill="#f59e0b" />
          <circle cx="34" cy="46" r="18" fill="#fbbf24" />
          <circle cx="66" cy="46" r="18" fill="#d97706" />
          <circle cx="50" cy="24" r="22" fill="#fef08a" />
          <polygon points="50,12 53,20 62,20 55,25 58,34 50,28 42,34 45,25 38,20 47,20" fill="#ffffff" />
        </svg>
      );
    }

    // Standard Lush Pine / Oak
    return (
      <svg viewBox="0 0 100 100" className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-xl">
        <ellipse cx="50" cy="86" rx="24" ry="8" fill="#1b281b" />
        <path d="M 45 86 L 47 52 L 53 52 L 55 86 Z" fill="#583c27" />
        {/* Layered Pine Canopy */}
        <polygon points="50,16 26,46 74,46" fill="#22543d" />
        <polygon points="50,32 20,62 80,62" fill="#276749" />
        <polygon points="50,48 14,76 86,76" fill="#2f855a" />
        <circle cx="50" cy="20" r="3" fill="#68d391" />
      </svg>
    );
  };

  return (
    <div className="relative w-full rounded-3xl bg-white/90 border border-[#E8E4D9] p-4 sm:p-6 lg:p-8 shadow-xl overflow-hidden backdrop-blur-md text-[#3C4030]">
      {/* Background Mountain Silhouette Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[340px] opacity-15 pointer-events-none">
        <svg viewBox="0 0 200 100" className="w-full h-full text-[#A3B18A] fill-current">
          <path d="M0,100 L40,60 L70,85 L120,20 L160,70 L200,100 Z" />
        </svg>
      </div>

      {/* Top Forest Header & Synergy Multiplier Card */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#E8E4D9]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-serif italic font-bold text-[#2D3319] tracking-tight">
              {user.nickname}의 에코 포레스트
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#6B705C] mt-1 flex items-center gap-2">
            <span>깨끗한 분리수거로 심은 건강한 나무들이 숲을 이루고 있습니다.</span>
          </p>
        </div>

        {/* Synergy Explanation Badge */}
        <div className="flex flex-wrap items-center gap-2.5 bg-[#E9EDC9]/80 backdrop-blur-xs border border-[#DDE5B6] px-4 py-2 rounded-full shadow-xs">
          <div className="flex items-center gap-1.5 text-[#4A5D23] text-xs font-bold">
            <Sun className="w-4 h-4 text-[#E2B842]" />
            <span>광합성 시너지 x{growthMultiplier.toFixed(1)}</span>
          </div>
          <span className="text-[#8C8F7A] text-xs">•</span>
          <span className="text-xs font-semibold text-[#4A7856]">
            나무 {activeTreesCount}그루 보유중
          </span>
          {choppedTreesCount > 0 && (
            <>
              <span className="text-[#8C8F7A] text-xs">•</span>
              <span className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                🪓 벌목 {choppedTreesCount}그루
              </span>
            </>
          )}
        </div>
      </div>

      {/* Interactive Forest Grid / Terrain View */}
      <div className="relative z-10 my-6 min-h-[380px] sm:min-h-[440px] rounded-3xl bg-gradient-to-b from-[#F5F7EE] to-[#E9EDC9]/50 border border-[#DDE5B6] p-4 sm:p-6 overflow-hidden flex flex-col items-center justify-center">
        {/* Soft Organic Aura Rings in Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <div className="w-[360px] h-[360px] bg-[#E9EDC9] rounded-full opacity-30 animate-pulse" />
          <div className="absolute w-[240px] h-[240px] bg-[#CCD5AE] rounded-full opacity-30" />
        </div>

        {/* Sky Ambient Elements */}
        <div className="absolute top-4 left-6 flex items-center gap-2 text-[11px] text-[#6B705C] font-semibold">
          <Wind className="w-4 h-4 text-[#7A9D54]" />
          <span>청정 에코 지수 99.4%</span>
        </div>

        {trees.length === 0 ? (
          /* Empty Forest State */
          <div className="text-center py-12 max-w-md px-4 relative z-10">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-white border border-[#E8E4D9] shadow-sm flex items-center justify-center text-3xl mb-4">
              🌱
            </div>
            <h3 className="text-lg font-bold text-[#2D3319] mb-1">
              아직 심어진 나무가 없습니다
            </h3>
            <p className="text-xs text-[#6B705C] mb-6 leading-relaxed">
              엽떡 용기나 플라스틱 컵을 깨끗하게 씻은 뒤, 실시간 카메라로 촬영해 첫 묘목을 심어보세요!
            </p>
            <button
              onClick={onOpenScanner}
              className="px-6 py-3 rounded-full bg-[#4A7856] text-white font-bold text-sm hover:bg-[#3E6548] shadow-[0_8px_20px_rgba(74,120,86,0.25)] active:scale-95 transition-all"
            >
              📷 첫 분리수거 인증하고 묘목 받기
            </button>
          </div>
        ) : (
          /* Tree Grid Visualization */
          <div className="w-full relative z-10">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 justify-items-center">
              {trees.map((tree) => {
                const isWatered = waterEffectTreeId === tree.id;

                return (
                  <motion.div
                    key={tree.id}
                    layout
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.08 }}
                    onClick={() => handleTreeClick(tree)}
                    className={`relative flex flex-col items-center justify-end p-3 sm:p-3.5 rounded-2xl cursor-pointer transition-all border shadow-xs ${
                      tree.stage === 'chopped'
                        ? 'bg-rose-50/70 border-rose-200 hover:border-rose-400'
                        : 'bg-white/85 hover:bg-white border-[#E8E4D9] hover:border-[#7A9D54]'
                    }`}
                  >
                    {/* Water Splash Effect */}
                    {isWatered && (
                      <motion.div
                        initial={{ y: -20, opacity: 1, scale: 0.5 }}
                        animate={{ y: -40, opacity: 0, scale: 1.5 }}
                        className="absolute top-0 text-[#4A7856] font-bold text-xs z-30 flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-full shadow-xs border border-[#CCD5AE]"
                      >
                        <Droplets className="w-3.5 h-3.5 fill-[#7A9D54] text-[#7A9D54]" /> +10% 성장!
                      </motion.div>
                    )}

                    {/* Tree Graphic */}
                    <div className="relative group">
                      {renderTreeGraphic(tree)}
                    </div>

                    {/* Name & Stage Tag */}
                    <div className="w-full text-center mt-1.5">
                      <p className="text-[11px] font-bold text-[#2D3319] truncate">
                        {tree.name}
                      </p>
                      
                      {tree.stage !== 'chopped' ? (
                        <div className="mt-1 w-full flex flex-col items-center">
                          {/* Growth Progress */}
                          <div className="w-full h-1.5 bg-[#F0EDE5] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#7A9D54] rounded-full transition-all duration-300"
                              style={{ width: `${Math.round(tree.growthPercent)}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-[#6B705C] font-semibold mt-0.5">
                            {tree.growthPercent >= 100 ? '완전 성장 🌳' : `${Math.round(tree.growthPercent)}%`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-rose-600 font-bold block mt-0.5">
                          오염 벌목 🪓
                        </span>
                      )}
                    </div>

                    {/* Quick Water Button (Only for growing trees) */}
                    {tree.stage !== 'chopped' && tree.growthPercent < 100 && (
                      <button
                        title="물 주기 (+10% 성장)"
                        onClick={(e) => handleWaterClick(e, tree.id)}
                        className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#7A9D54] hover:bg-[#4A7856] text-white flex items-center justify-center shadow-xs hover:scale-110 active:scale-95 transition-transform"
                      >
                        <Droplets className="w-3 h-3 fill-white" />
                      </button>
                    )}
                  </motion.div>
                );
              })}

              {/* Next Seedling Slot CTA */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                onClick={() => { playSound('click'); onOpenScanner(); }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-dashed border-[#A3B18A] hover:border-[#7A9D54] bg-[#E9EDC9]/40 hover:bg-[#E9EDC9]/70 cursor-pointer text-center min-h-[120px] w-full transition-all shadow-xs"
              >
                <PlusCircle className="w-6 h-6 text-[#4A7856] mb-1" />
                <span className="text-xs font-bold text-[#2D3319]">새 묘목 심기</span>
                <span className="text-[10px] text-[#6B705C] mt-0.5 font-medium">분리수거 인증</span>
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* Tree Detail Modal */}
      <AnimatePresence>
        {selectedTree && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
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
                <h4 className="text-xl font-bold text-[#2D3319] mb-1 font-serif">
                  {selectedTree.name}
                </h4>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${
                  selectedTree.stage === 'chopped' 
                    ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                    : 'bg-[#DDE5B6] text-[#4A5D23] border border-[#CCD5AE]'
                }`}>
                  {selectedTree.stage === 'chopped' ? '오염으로 베어진 나무' : `성장률: ${Math.round(selectedTree.growthPercent)}%`}
                </span>

                <div className="space-y-2 text-left bg-white rounded-2xl p-4 text-xs text-[#3C4030] mb-5 border border-[#E8E4D9] shadow-xs">
                  <div className="flex justify-between">
                    <span className="text-[#8C8F7A]">인증 품목</span>
                    <span className="font-bold text-[#4A7856]">{selectedTree.itemNameAtPlanting || '모범 분리수거'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C8F7A]">심은 일시</span>
                    <span className="font-medium text-[#2D3319]">{new Date(selectedTree.plantedAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                  {selectedTree.choppedReason && (
                    <div className="flex justify-between text-rose-600">
                      <span>벌목 사유</span>
                      <span className="font-bold">{selectedTree.choppedReason}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {selectedTree.stage !== 'chopped' && selectedTree.growthPercent < 100 && (
                    <button
                      onClick={(e) => {
                        handleWaterClick(e, selectedTree.id);
                        setSelectedTree({
                          ...selectedTree,
                          growthPercent: Math.min(100, selectedTree.growthPercent + 10)
                        });
                      }}
                      className="flex-1 py-2.5 rounded-full bg-[#4A7856] hover:bg-[#3E6548] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <Droplets className="w-4 h-4 fill-white" /> 물 주기 (+10%)
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedTree(null)}
                    className="flex-1 py-2.5 rounded-full bg-white hover:bg-[#F0EDE5] border border-[#E8E4D9] text-[#6B705C] font-bold text-xs transition-all"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
