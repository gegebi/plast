import { ItemCategory } from '../types';

export interface SampleItemPreset {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  expectedScore: 'high' | 'medium' | 'low';
  renderSvg: () => string; // Returns data URL or SVG string
}

// Generate realistic simulated SVG data URIs for real-time algorithm verification
function createSvgDataUrl(svgContent: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
}

export const SAMPLE_PRESETS: SampleItemPreset[] = [
  {
    id: 'clean_tteokbokki',
    name: '뽀송하게 씻은 엽떡 용기',
    category: 'tteokbokki_container',
    description: '주방세제와 햇빛 건조로 고추기름을 완벽히 제거한 하얀 플라스틱 용기',
    expectedScore: 'high',
    renderSvg: () => createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <rect width="400" height="400" fill="#2d3748"/>
        <!-- Clean White Round Container -->
        <circle cx="200" cy="200" r="140" fill="#f7fafc" stroke="#e2e8f0" stroke-width="8"/>
        <circle cx="200" cy="200" r="120" fill="#edf2f7" stroke="#cbd5e0" stroke-width="4"/>
        <circle cx="200" cy="200" r="85" fill="#f8fafc" />
        <!-- Clean plastic highlight reflections -->
        <path d="M 120 140 Q 200 90 280 140" stroke="#ffffff" stroke-width="12" fill="none" opacity="0.8" stroke-linecap="round"/>
        <text x="200" y="208" font-size="16" fill="#718096" text-anchor="middle" font-family="sans-serif" font-weight="bold">PP 05 RECYCLABLE</text>
      </svg>
    `)
  },
  {
    id: 'oily_tteokbokki',
    name: '고추기름 범벅 엽떡 용기',
    category: 'tteokbokki_container',
    description: '물로만 대충 헹궈 붉은 기름과 양념 찌꺼기가 남아있는 불량 배출 상태',
    expectedScore: 'low',
    renderSvg: () => createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <rect width="400" height="400" fill="#1a202c"/>
        <!-- Container with Heavy Red/Orange Chili Sauce Stains -->
        <circle cx="200" cy="200" r="140" fill="#fed7d7" stroke="#e53e3e" stroke-width="6"/>
        <circle cx="200" cy="200" r="120" fill="#feebc8"/>
        <!-- Chili oil grease pools and red spice flakes -->
        <path d="M 130 160 Q 180 260 270 210 Q 240 140 130 160 Z" fill="#dd6b20" opacity="0.85"/>
        <path d="M 160 180 Q 220 280 240 200 Q 210 160 160 180 Z" fill="#c53030" opacity="0.9"/>
        <circle cx="150" cy="230" r="16" fill="#9b2c2c"/>
        <circle cx="220" cy="150" r="22" fill="#c53030"/>
        <circle cx="250" cy="240" r="18" fill="#dd6b20"/>
        <path d="M 120 200 Q 140 280 260 270" stroke="#9b2c2c" stroke-width="8" fill="none" opacity="0.8"/>
      </svg>
    `)
  },
  {
    id: 'clean_pet_bottle',
    name: '라벨 제거된 투명 페트병',
    category: 'plastic_bottle',
    description: '비닐 라벨을 떼고 압착하여 뚜껑을 닫은 고품질 투명 페트',
    expectedScore: 'high',
    renderSvg: () => createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <rect width="400" height="400" fill="#1e293b"/>
        <!-- Transparent Clean PET -->
        <rect x="140" y="80" width="120" height="240" rx="40" fill="#e2e8f0" fill-opacity="0.25" stroke="#94a3b8" stroke-width="4"/>
        <rect x="170" y="50" width="60" height="30" rx="6" fill="#38bdf8" stroke="#0284c7" stroke-width="3"/>
        <!-- Plastic reflection curves -->
        <line x1="165" y1="110" x2="165" y2="290" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity="0.6"/>
        <line x1="180" y1="120" x2="180" y2="270" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
        <text x="200" y="210" font-size="14" fill="#38bdf8" text-anchor="middle" font-family="sans-serif" font-weight="bold">투명 PET 1등급</text>
      </svg>
    `)
  },
  {
    id: 'unwashed_can',
    name: '음료 찌꺼기 남은 캔',
    category: 'beverage_can',
    description: '내부에 검은 콜라/커피 액체 얼룩과 담배꽁초 흔적이 남은 캔',
    expectedScore: 'low',
    renderSvg: () => createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <rect width="400" height="400" fill="#0f172a"/>
        <!-- Dirty aluminum can with black liquid residue -->
        <ellipse cx="200" cy="120" rx="90" ry="30" fill="#475569" stroke="#94a3b8" stroke-width="4"/>
        <rect x="110" y="120" width="180" height="180" fill="#334155" stroke="#94a3b8" stroke-width="4"/>
        <ellipse cx="200" cy="300" rx="90" ry="30" fill="#1e293b" stroke="#94a3b8" stroke-width="4"/>
        <!-- Dark stained top hole -->
        <ellipse cx="200" cy="120" rx="50" ry="18" fill="#020617"/>
        <path d="M 180 120 Q 190 220 185 280" stroke="#451a03" stroke-width="14" fill="none" opacity="0.85"/>
        <circle cx="210" cy="180" r="15" fill="#1c1917"/>
        <circle cx="160" cy="220" r="12" fill="#7f1d1d"/>
      </svg>
    `)
  }
];
