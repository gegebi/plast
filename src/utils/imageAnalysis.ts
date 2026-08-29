import { AnalysisOutput, ItemCategory } from '../types';

/**
 * Computer Vision Pixel Analysis (Non-AI algorithmic approach)
 * Evaluates cleanliness, food sauce/oil contamination (e.g. tteokbokki chili oil),
 * dark residues, and surface clarity using HTML5 Canvas pixel manipulation.
 */
export async function analyzeRecyclingImage(
  imageSource: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  category: ItemCategory
): Promise<AnalysisOutput> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Work on a standardized 320x320 processing dimension for speed and consistency
  const processWidth = 320;
  const processHeight = 320;
  canvas.width = processWidth;
  canvas.height = processHeight;

  ctx.drawImage(imageSource, 0, 0, processWidth, processHeight);
  const imgData = ctx.getImageData(0, 0, processWidth, processHeight);
  const data = imgData.data;

  // Heatmap canvas to highlight clean vs contaminated pixels
  const heatmapCanvas = document.createElement('canvas');
  heatmapCanvas.width = processWidth;
  heatmapCanvas.height = processHeight;
  const heatCtx = heatmapCanvas.getContext('2d');
  const heatData = heatCtx ? heatCtx.createImageData(processWidth, processHeight) : null;

  let totalSampledPixels = 0;
  let redChiliOilPixels = 0;
  let darkGrimePixels = 0;
  let cleanSurfacePixels = 0;
  let transparentOrWhitePixels = 0;

  // Focus on the central ROI (Region of Interest - inner 70% where the container is focused)
  const marginX = Math.floor(processWidth * 0.15);
  const marginY = Math.floor(processHeight * 0.15);

  for (let y = marginY; y < processHeight - marginY; y++) {
    for (let x = marginX; x < processWidth - marginX; x++) {
      const idx = (y * processWidth + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      // const a = data[idx + 3];

      totalSampledPixels++;

      // Convert RGB to HSV
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const d = max - min;
      const v = max / 255;
      const s = max === 0 ? 0 : d / max;
      let h = 0;

      if (d !== 0) {
        if (max === r) {
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        } else if (max === g) {
          h = ((b - r) / d + 2) / 6;
        } else {
          h = ((r - g) / d + 4) / 6;
        }
      }
      const hueDeg = h * 360;

      // 1. Red / Orange Chili Oil & Tteokbokki sauce detection:
      // Hue around 345° ~ 360° or 0° ~ 45° with notable saturation and brightness
      const isRedChiliStain = 
        ((hueDeg >= 340 || hueDeg <= 42) && s > 0.32 && v > 0.35 && r > g * 1.15 && r > b * 1.35) ||
        (r > 120 && g < 100 && b < 90 && (r - g > 30) && (r - b > 40));

      // 2. Dark Grime & Dried food residue (low brightness in central region)
      const isDarkGrime = v < 0.22 && !isRedChiliStain;

      // 3. Clean plastic / White container / Clear PET
      // Low saturation, moderate to high brightness
      const isClean = (s < 0.22 && v > 0.40) || (s < 0.30 && v > 0.70);

      if (isRedChiliStain) {
        redChiliOilPixels++;
        if (heatData) {
          // Heatmap: Bright Red / Orange
          heatData.data[idx] = 255;
          heatData.data[idx + 1] = 40;
          heatData.data[idx + 2] = 0;
          heatData.data[idx + 3] = 210;
        }
      } else if (isDarkGrime) {
        darkGrimePixels++;
        if (heatData) {
          // Heatmap: Deep Purple/Black warning
          heatData.data[idx] = 160;
          heatData.data[idx + 1] = 0;
          heatData.data[idx + 2] = 180;
          heatData.data[idx + 3] = 200;
        }
      } else if (isClean) {
        cleanSurfacePixels++;
        transparentOrWhitePixels++;
        if (heatData) {
          // Heatmap: Emerald Green for clean zone
          heatData.data[idx] = 16;
          heatData.data[idx + 1] = 185;
          heatData.data[idx + 2] = 129;
          heatData.data[idx + 3] = 90;
        }
      } else {
        if (heatData) {
          // Neutral background
          heatData.data[idx] = 100;
          heatData.data[idx + 1] = 116;
          heatData.data[idx + 2] = 139;
          heatData.data[idx + 3] = 40;
        }
      }
    }
  }

  if (heatCtx && heatData) {
    heatCtx.putImageData(heatData, 0, 0);
  }

  const redStainPercent = Math.min(100, Math.round((redChiliOilPixels / totalSampledPixels) * 100 * 3.5));
  const darkGrimePercent = Math.min(100, Math.round((darkGrimePixels / totalSampledPixels) * 100 * 2.8));
  const cleanRatio = Math.min(100, Math.round((cleanSurfacePixels / totalSampledPixels) * 100));

  // Category specific adjustments
  let categoryToleranceMultiplier = 1.0;
  if (category === 'tteokbokki_container') {
    categoryToleranceMultiplier = 1.2; // Tteokbokki containers are heavily scrutinized for red grease!
  } else if (category === 'plastic_cup') {
    categoryToleranceMultiplier = 1.0;
  } else if (category === 'beverage_can') {
    categoryToleranceMultiplier = 0.9;
  }

  // Calculate Base Cleanliness Score (0 - 100)
  const penalty = (redStainPercent * 2.2 + darkGrimePercent * 1.5) * categoryToleranceMultiplier;
  let cleanlinessScore = Math.max(0, Math.min(100, Math.round(100 - penalty + (cleanRatio * 0.15))));

  // Determine Verdict and Status
  let status: AnalysisOutput['status'];
  let verdict: AnalysisOutput['verdict'];
  let feedbackTitle = '';
  let feedbackMessage = '';
  let rewardText = '';
  let penaltyText: string | undefined = undefined;
  let carbonSavedGrams = 0;
  let xpAwarded = 0;

  if (cleanlinessScore >= 85) {
    status = 'PERFECT';
    verdict = 'PLANT_SEEDLING';
    feedbackTitle = '🌟 완벽한 무결점 분리수거!';
    feedbackMessage = category === 'tteokbokki_container' 
      ? '엽떡통에 붉은 기름때 하나 없이 뽀송뽀송하게 세척되었습니다! 완벽한 에코 마스터입니다.'
      : '이물질과 라벨이 전혀 없는 모범적인 분리수거 상태입니다.';
    rewardText = '새로운 묘목 1그루 심기 완료! (성장 속도 +15% 부스트)';
    carbonSavedGrams = 180;
    xpAwarded = 150;
  } else if (cleanlinessScore >= 70) {
    status = 'CLEAN';
    verdict = 'PLANT_SEEDLING';
    feedbackTitle = '🌱 깨끗하게 세척된 분리수거!';
    feedbackMessage = '오염물질이 허용치 이하로 양호하게 분리배출되었습니다. 숲에 새로운 생명이 자라납니다.';
    rewardText = '새로운 묘목 1그루 획득!';
    carbonSavedGrams = 120;
    xpAwarded = 100;
  } else if (cleanlinessScore >= 50) {
    status = 'SLIGHT_STAIN';
    verdict = 'CHOP_TREE'; // Warning or minor chop
    feedbackTitle = '⚠️ 미세 오염 및 기름때 잔여물 감지';
    feedbackMessage = category === 'tteokbokki_container'
      ? '용기 모서리에 고추기름 흔적이 남아있습니다. 주방세제로 1회 더 헹구거나 햇빛에 반나절 말려주세요.'
      : '내부에 음료 잔여물이나 스티커 흔적이 남아있어 재활용 공정에서 탈락될 수 있습니다.';
    penaltyText = '오염으로 인해 나무 1그루가 베어졌습니다. 🪓';
    rewardText = '다음엔 물과 세제로 한 번 더 헹궈주세요!';
    carbonSavedGrams = 20;
    xpAwarded = 20;
  } else {
    status = 'CONTAMINATED';
    verdict = 'CHOP_TREE';
    feedbackTitle = '🚨 심각한 음식물/기름 오염물 검출!';
    feedbackMessage = category === 'tteokbokki_container'
      ? '빨간 양념과 기름기가 그대로 남아있습니다! 오염된 플라스틱은 재활용되지 못하고 전량 소각/매립됩니다.'
      : '오염도가 너무 높아 재활용이 불가능합니다. 깨끗이 씻지 않은 쓰레기는 숲을 파괴합니다.';
    penaltyText = '오염된 쓰레기 배출로 나무 1그루가 벌목되었습니다! 🪓';
    rewardText = '베어진 나무는 밑동만 남게 됩니다.';
    carbonSavedGrams = 0;
    xpAwarded = 0;
  }

  const heatmapDataUrl = heatmapCanvas.toDataURL('image/png');

  return {
    cleanlinessScore,
    status,
    verdict,
    redStainPercent,
    darkGrimePercent,
    surfaceUniformity: Math.max(0, 100 - redStainPercent - darkGrimePercent),
    feedbackTitle,
    feedbackMessage,
    rewardText,
    penaltyText,
    carbonSavedGrams,
    xpAwarded,
    heatmapDataUrl
  };
}
