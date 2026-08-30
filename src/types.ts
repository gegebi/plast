export type MountainId = 'namsan' | 'hallasan' | 'jirisan' | 'seoraksan' | 'k2' | 'everest';

export interface MountainLeagueInfo {
  id: MountainId;
  name: string;
  nameEn: string;
  altitude: number; // in meters (e.g. 남산 270m, 한라산 1947m, 에베레스트 8848m)
  requiredTrees: number; // Trees needed to reach this mountain tier (50, 100, 200, 300, 500, 1000)
  level: number;
  color: string;
  badgeBg: string;
  description: string;
  bgTheme: string;
  landmark: string;
}

export type TreeStage = 'seedling' | 'sprout' | 'young_tree' | 'mature_tree' | 'golden_tree' | 'chopped';

export interface TreeItem {
  id: string;
  type: 'pine' | 'cherry' | 'oak' | 'ginkgo' | 'golden_baobab' | 'fir';
  name: string;
  stage: TreeStage;
  growthPercent: number; // 0 - 100
  plantedAt: number; // timestamp
  gridIndex: number; // 0..63 for 8x8 isometric forest
  choppedReason?: string;
  itemNameAtPlanting?: string;
}

export type ItemCategory = 
  | 'auto'                 // AI 자동 감지
  | 'tteokbokki_container' // 배달/엽떡 용기 (플라스틱)
  | 'plastic_cup'          // 투명 일회용 컵
  | 'plastic_bottle'       // 페트병 (라벨 제거)
  | 'beverage_can'         // 알루미늄 캔
  | 'paper_carton'         // 우유팩/종이류
  | 'glass_bottle'         // 유리병
  | 'general_plastic';     // 일반 플라스틱 용기

export interface RecyclingRecord {
  id: string;
  timestamp: number;
  category: ItemCategory;
  categoryName: string;
  cleanlinessScore: number;
  contaminationPercent: number; // 0..100 (Total contamination rate)
  status: 'PERFECT' | 'CLEAN' | 'SLIGHT_STAIN' | 'CONTAMINATED';
  verdict: 'PLANT_SEEDLING' | 'CHOP_TREE';
  redStainScore?: number;
  darkGrimeScore?: number;
  cleanRatio?: number;
  imageUri: string;
  notes: string;
  carbonSavedGrams: number;
}

export interface UserProfile {
  id: string;
  nickname: string;
  email: string;
  avatarUrl: string;
  currentLeagueId: MountainId;
  leagueRank: number;
  treesInCurrentMountain: number; // resets upon advancing league
  totalTreesGrownAllTime: number;
  totalTreesChopped: number;
  carbonSavedGrams: number;
  recyclingStreakDays: number;
  lastActiveTimestamp: number;
  hasCompletedTutorial: boolean;
  isGuest?: boolean;
  profileSetupCompleted?: boolean;
  history: RecyclingRecord[];
}

export interface AnalysisOutput {
  cleanlinessScore: number; // 0 to 100
  contaminationPercent: number; // 0 to 100 (총 오염도, e.g. 12%)
  status: 'PERFECT' | 'CLEAN' | 'SLIGHT_STAIN' | 'CONTAMINATED';
  verdict: 'PLANT_SEEDLING' | 'CHOP_TREE';
  redStainPercent?: number;
  darkGrimePercent?: number;
  surfaceUniformity: number;
  feedbackTitle: string;
  feedbackMessage: string;
  rewardText: string;
  penaltyText?: string;
  carbonSavedGrams: number;
  xpAwarded: number;
  heatmapDataUrl?: string;
  isAiAnalyzed?: boolean;
  detectedItem?: string;
  detectedCategory?: ItemCategory;
  isBackgroundSeparated?: boolean;
  hasLabelRemoved?: boolean;
}

export interface LeaderboardUser {
  id: string;
  nickname: string;
  avatar: string;
  leagueId: MountainId;
  leagueRank: number;
  treesInMountain: number;
  totalGrown: number;
  streak: number;
  isCurrentUser?: boolean;
}
