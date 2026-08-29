import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Camera, RefreshCw, X, AlertCircle, Sparkles, CheckCircle2, ShieldAlert, Zap, Layers, HelpCircle } from 'lucide-react';
import { ItemCategory, AnalysisOutput } from '../types';
import { analyzeRecyclingImageWithAI } from '../utils/imageAnalysis';
import { SAMPLE_PRESETS, SampleItemPreset } from '../data/sampleScans';
import { playSound } from '../utils/sound';

interface CameraScannerProps {
  onClose: () => void;
  onScanComplete: (result: AnalysisOutput, capturedImageUri: string, category: ItemCategory) => void;
}

const CATEGORIES: { id: ItemCategory; label: string; icon: string; hint: string }[] = [
  { id: 'auto', label: 'AI 자동 감지', icon: '✨', hint: 'AI가 사진 속 품목(페트병, 배달용기, 캔 등)을 스스로 자동 인식합니다' },
  { id: 'tteokbokki_container', label: '엽떡/배달용기', icon: '🍲', hint: '붉은 고추기름 및 양념 얼룩을 집중 검사합니다' },
  { id: 'plastic_cup', label: '투명 일회용 컵', icon: '🥤', hint: '음료 잔여물 및 빨대/홀더 분리 여부 검사' },
  { id: 'plastic_bottle', label: '투명 페트병', icon: '🍾', hint: '비닐 라벨 제거 및 깨끗한 압착 상태 검사' },
  { id: 'beverage_can', label: '음료 캔/알루미늄', icon: '🥫', hint: '내부 음료 찌꺼기 및 이물질 혼입 검사' },
  { id: 'paper_carton', label: '우유팩/종이류', icon: '📦', hint: '물 세척 후 펼쳐서 건조된 상태 검사' },
  { id: 'glass_bottle', label: '유리병', icon: '🍶', hint: '담배꽁초 등 이물질 및 뚜껑 분리 검사' },
];

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onClose,
  onScanComplete
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('auto');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [showFlash, setShowFlash] = useState<boolean>(false);
  const [showSampleSelector, setShowSampleSelector] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize Real-time Camera Stream
  const startCamera = async () => {
    try {
      setCameraError(null);
      setCapturedPreview(null);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('이 브라우저는 실시간 카메라 API를 지원하지 않습니다.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
      setIsCameraActive(true);
    } catch (err: unknown) {
      console.warn('Camera stream error:', err);
      const errorMessage = err instanceof Error ? err.message : '카메라 권한이 거부되었거나 장치를 찾을 수 없습니다.';
      setCameraError(errorMessage);
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  // Spacebar trigger for taking photos
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        // Prevent default spacebar scrolling
        e.preventDefault();
        if (!isProcessing && isCameraActive && !showSampleSelector && !capturedPreview) {
          captureAndAnalyze();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProcessing, isCameraActive, showSampleSelector, capturedPreview, selectedCategory]);

  // Flip camera between back/front
  const toggleCamera = () => {
    if (isProcessing) return;
    playSound('click');
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture current live frame, FREEZE it immediately, and analyze only the static snapshot
  const captureAndAnalyze = async (sourceElement?: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement, customUri?: string) => {
    playSound('shutter');
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 200);

    try {
      let captureUri = '';
      let targetCanvas: HTMLCanvasElement;

      if (sourceElement instanceof HTMLImageElement) {
        captureUri = customUri || sourceElement.src;
        targetCanvas = document.createElement('canvas');
        targetCanvas.width = sourceElement.naturalWidth || sourceElement.width || 480;
        targetCanvas.height = sourceElement.naturalHeight || sourceElement.height || 480;
        const ctx = targetCanvas.getContext('2d');
        if (ctx) ctx.drawImage(sourceElement, 0, 0, targetCanvas.width, targetCanvas.height);
      } else if (videoRef.current) {
        const video = videoRef.current;
        // 1. Immediately pause the live camera video stream so no subsequent movement is captured
        try {
          video.pause();
        } catch (e) {
          console.warn('Video pause error', e);
        }

        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          captureUri = canvas.toDataURL('image/jpeg', 0.85);
        }
        targetCanvas = canvas;
      } else {
        throw new Error('촬영 대상 소스가 없습니다.');
      }

      // 2. Immediately freeze and display the exact captured still photo
      setCapturedPreview(captureUri);
      setIsProcessing(true);

      // 3. Send ONLY the frozen static canvas snapshot to AI
      const result = await analyzeRecyclingImageWithAI(targetCanvas, selectedCategory);

      // Determine finalized category (if AI auto-detected or specific)
      const finalCategory: ItemCategory = result.detectedCategory || (selectedCategory === 'auto' ? 'general_plastic' : selectedCategory);

      // Trigger scan completed callback
      setTimeout(() => {
        onScanComplete(result, captureUri, finalCategory);
      }, 300);

    } catch (err) {
      console.error('Analysis error:', err);
      alert('이미지 분석 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsProcessing(false);
      setCapturedPreview(null);
      if (videoRef.current) {
        try {
          videoRef.current.play();
        } catch (e) {}
      }
    }
  };

  // Handle Testing with Preset Sample items
  const handleSampleTest = (sample: SampleItemPreset) => {
    playSound('click');
    setSelectedCategory(sample.category);
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      captureAndAnalyze(img, img.src);
    };
    img.src = sample.renderSvg();
  };

  const currentCategoryInfo = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between text-white select-none">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Optical Flash overlay */}
      {showFlash && (
        <div className="absolute inset-0 z-50 bg-white opacity-80 pointer-events-none transition-opacity duration-200" />
      )}

      {/* Top Bar Navigation & Info */}
      <div className="relative z-20 px-4 py-4 sm:px-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between">
        <button
          onClick={() => { playSound('click'); onClose(); }}
          className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-[#2D3319] bg-[#DDE5B6] px-3.5 py-1 rounded-full border border-[#CCD5AE] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#4A7856] fill-[#4A7856]" />
            <span>Gemini Vision AI 초고속 판별</span>
          </div>
          <p className="text-[11px] text-white/80 mt-1">
            {capturedPreview ? '📸 촬영된 정지 사진 분석 중' : '실시간 프레임 캡처 & 배경 분리 판정'}
          </p>
        </div>

        <button
          onClick={toggleCamera}
          disabled={isProcessing}
          className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors disabled:opacity-30"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Main Viewfinder Section */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-slate-950">
        {/* If photo captured, freeze and show EXACT captured photo */}
        {capturedPreview ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img
              src={capturedPreview}
              alt="Captured Frame"
              className="w-full h-full object-cover"
            />
            {/* Laser Scan Line Overlay on captured still photo */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div
                initial={{ y: '0%' }}
                animate={{ y: ['0%', '100%', '0%'] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-full h-1 bg-gradient-to-r from-transparent via-[#80ED99] to-transparent shadow-[0_0_15px_#80ED99]"
              />
            </div>
          </div>
        ) : (
          /* Real-time Video Stream */
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
            onLoadedMetadata={() => setIsCameraActive(true)}
          />
        )}

        {/* Camera Permission / Error Fallback Screen */}
        {!isCameraActive && !capturedPreview && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#F9F7F2] text-[#3C4030]">
            <div className="w-16 h-16 rounded-3xl bg-[#E9EDC9] border border-[#DDE5B6] flex items-center justify-center text-[#4A7856] mb-3">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#2D3319] mb-1">
              실시간 카메라 준비 중
            </h3>
            <p className="text-xs text-[#6B705C] max-w-sm mb-4 leading-relaxed">
              {cameraError || '카메라 권한을 허용하시면 실시간 스트림이 활성화됩니다.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={startCamera}
                className="px-5 py-2.5 rounded-full bg-[#4A7856] hover:bg-[#3E6548] text-white font-bold text-xs shadow-xs"
              >
                카메라 다시 연결
              </button>
              <button
                onClick={() => setShowSampleSelector(true)}
                className="px-5 py-2.5 rounded-full bg-white hover:bg-[#F0EDE5] text-[#4A7856] font-bold text-xs border border-[#E8E4D9] shadow-xs"
              >
                🧪 샘플 아이템으로 즉시 테스트
              </button>
            </div>
          </div>
        )}

        {/* Viewfinder Target Frame with HUD Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl border-2 border-[#7A9D54] shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
            {/* Viewfinder Corner Brackets */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#7A9D54] rounded-tl-xl" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#7A9D54] rounded-tr-xl" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#7A9D54] rounded-bl-xl" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#7A9D54] rounded-br-xl" />

            {/* Central Crosshair */}
            <div className="absolute inset-0 flex items-center justify-center opacity-40">
              <div className="w-8 h-0.5 bg-[#CCD5AE]" />
              <div className="w-0.5 h-8 bg-[#CCD5AE] absolute" />
            </div>

            {/* Live Inspection Sensor HUD Label */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/85 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#7A9D54]/50 text-[11px] font-sans text-white flex items-center gap-1.5">
              <span>{currentCategoryInfo.icon}</span>
              <span>
                {capturedPreview
                  ? '📸 정지 사진 캡처 완료 • AI 판독 진행'
                  : (selectedCategory === 'auto' ? 'AI 품목 자동 감지 & 오염도 판별' : `${currentCategoryInfo.label} 감지 중`)}
              </span>
            </div>
          </div>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="w-14 h-14 rounded-full border-4 border-[#80ED99] border-t-transparent animate-spin" />
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Sparkles className="w-4 h-4 text-[#FDE047] animate-bounce" />
              <span>촬영된 사진을 AI가 정밀 분석 중입니다...</span>
            </div>
            <p className="text-xs text-white/80 max-w-xs leading-relaxed">
              방금 찍은 스냅샷에서 배경을 분리하고 용기 오염도를 평가하고 있습니다.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Category Selector & Shutter Control Bar */}
      <div className="relative z-20 bg-gradient-to-t from-black via-black/95 to-black/80 px-3 py-3 sm:px-6 pb-6 sm:pb-8 border-t border-white/10">
        {/* Category Horizontal Chips */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs text-white/70 font-medium">인증할 품목 선택</span>
            <button
              onClick={() => setShowSampleSelector(true)}
              className="text-[10px] sm:text-[11px] text-[#DDE5B6] hover:text-white underline font-semibold"
            >
              🧪 샘플 테스트 모드
            </button>
          </div>
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    playSound('click');
                    setSelectedCategory(cat.id);
                  }}
                  className={`flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-[#7A9D54] text-white font-bold shadow-md shadow-[#7A9D54]/40 scale-105'
                      : 'bg-white/15 text-white/90 hover:bg-white/25'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#DDE5B6] mt-1 text-center truncate">
            💡 {currentCategoryInfo.hint}
          </p>
        </div>

        {/* Shutter Button Action */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center justify-center gap-5 sm:gap-6">
            <button
              onClick={() => setShowSampleSelector(true)}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white text-xs border border-white/20 active:scale-95 transition-transform"
              title="샘플 이미지로 테스트"
            >
              🧪
            </button>

            {/* Big Mechanical Shutter Trigger */}
            <button
              disabled={isProcessing}
              onClick={() => captureAndAnalyze()}
              className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#E9EDC9]/30 p-1 flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
              title="촬영하기 (스페이스바)"
            >
              <div className="w-full h-full rounded-full bg-[#7A9D54] hover:bg-[#4A7856] flex items-center justify-center border-3 sm:border-4 border-white shadow-md">
                <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
            </button>

            <button
              onClick={toggleCamera}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white border border-white/20 active:scale-95 transition-transform"
              title="카메라 전환"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Spacebar hotkey hint badge */}
          <div className="flex items-center gap-1 text-[11px] text-white/60 font-sans mt-0.5">
            <kbd className="px-1.5 py-0.5 rounded-md bg-white/20 text-white font-mono text-[10px] border border-white/30 shadow-xs">Space</kbd>
            <span>키를 눌러 바로 촬영</span>
          </div>
        </div>
      </div>

      {/* Preset Sample Item Selector Drawer */}
      {showSampleSelector && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-lg bg-[#F9F7F2] rounded-3xl border border-[#E8E4D9] p-6 text-[#3C4030] shadow-2xl max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-[#2D3319] font-serif flex items-center gap-2">
                  🧪 알고리즘 검증 샘플 선택
                </h4>
                <p className="text-xs text-[#6B705C] mt-0.5">
                  실제 카메라가 없거나 오염도 판정 민감도를 즉시 테스트하고 싶을 때 선택하세요.
                </p>
              </div>
              <button
                onClick={() => setShowSampleSelector(false)}
                className="p-1.5 rounded-full bg-white border border-[#E8E4D9] text-[#6B705C] hover:text-[#2D3319]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {SAMPLE_PRESETS.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => {
                    setShowSampleSelector(false);
                    handleSampleTest(sample);
                  }}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-[#F0EDE5] border border-[#E8E4D9] cursor-pointer transition-all hover:border-[#7A9D54] shadow-xs group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={sample.renderSvg()}
                      alt={sample.name}
                      className="w-12 h-12 rounded-xl object-cover bg-[#F9F7F2] border border-[#E8E4D9]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#2D3319] group-hover:text-[#4A7856]">
                          {sample.name}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          sample.expectedScore === 'high' 
                            ? 'bg-[#DDE5B6] text-[#4A5D23]' 
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {sample.expectedScore === 'high' ? '깨끗함 (묘목 획득)' : '오염됨 (벌목 페널티)'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B705C] mt-0.5">
                        {sample.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-white font-bold px-3 py-1 rounded-full bg-[#4A7856] shadow-xs">
                    인식
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
