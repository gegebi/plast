import { MountainId, MountainLeagueInfo } from '../types';

export const MOUNTAIN_LEAGUES: Record<MountainId, MountainLeagueInfo> = {
  namsan: {
    id: 'namsan',
    name: '남산',
    nameEn: 'Mt. Namsan',
    altitude: 270,
    requiredTrees: 50,
    level: 1,
    color: '#4A7856',
    badgeBg: 'from-[#4A7856] to-[#3E6548]',
    description: '서울의 중심에서 시작하는 첫 번째 에코 마운틴! 50그루의 나무를 키워 남산 숲을 완성하세요.',
    bgTheme: 'from-[#E9EDC9] via-[#CCD5AE] to-[#DDE5B6]',
    landmark: 'N서울타워 & 푸른 도심 숲길'
  },
  hallasan: {
    id: 'hallasan',
    name: '한라산',
    nameEn: 'Mt. Hallasan',
    altitude: 1947,
    requiredTrees: 100,
    level: 2,
    color: '#7A9D54',
    badgeBg: 'from-[#7A9D54] to-[#4A7856]',
    description: '제주 백록담을 품은 신비로운 화산섬 숲. 100그루를 가꾸면 고산 식물 군락이 피어납니다.',
    bgTheme: 'from-[#DDE5B6] via-[#CCD5AE] to-[#A3B18A]',
    landmark: '백록담 분화구 & 구상나무 숲'
  },
  jirisan: {
    id: 'jirisan',
    name: '지리산',
    nameEn: 'Mt. Jirisan',
    altitude: 1915,
    requiredTrees: 200,
    level: 3,
    color: '#6B705C',
    badgeBg: 'from-[#6B705C] to-[#4A5D23]',
    description: '어머니의 산이라 불리는 웅장한 지리산 천왕봉. 200그루를 달성하여 야생 반달가슴곰의 터전을 지켜주세요.',
    bgTheme: 'from-[#CCD5AE] via-[#B5C99A] to-[#8C8F7A]',
    landmark: '천왕봉 일출 & 노고단 야생화'
  },
  seoraksan: {
    id: 'seoraksan',
    name: '설악산',
    nameEn: 'Mt. Seoraksan',
    altitude: 1708,
    requiredTrees: 300,
    level: 4,
    color: '#8C8F7A',
    badgeBg: 'from-[#8C8F7A] to-[#6B705C]',
    description: '기암괴석과 은은한 단풍이 어우러진 비경. 300그루의 나무로 울산바위까지 푸른 생명을 덮습니다.',
    bgTheme: 'from-[#DDE5B6] via-[#A3B18A] to-[#6B705C]',
    landmark: '대청봉 & 울산바위 암릉'
  },
  k2: {
    id: 'k2',
    name: 'K2',
    nameEn: 'K2 Peak',
    altitude: 8611,
    requiredTrees: 500,
    level: 5,
    color: '#D4A373',
    badgeBg: 'from-[#D4A373] to-[#B08968]',
    description: '죽음의 지대라 불리는 거친 설산. 500그루의 불굴의 나무로 카라코람 고원에 기적의 생태계를 건설합니다.',
    bgTheme: 'from-[#FAEDCD] via-[#D4A373] to-[#CCD5AE]',
    landmark: '카라코람 빙하 & 황금 설벽'
  },
  everest: {
    id: 'everest',
    name: '에베레스트산',
    nameEn: 'Mt. Everest',
    altitude: 8848,
    requiredTrees: 1000,
    level: 6,
    color: '#2D3319',
    badgeBg: 'from-[#4A5D23] via-[#2D3319] to-[#1E2310]',
    description: '지구의 지붕, 세계 최고봉 에베레스트! 1,000그루의 마스터 트리로 전 세계 1위 에코 레전드에 등극하세요.',
    bgTheme: 'from-[#E9EDC9] via-[#A3B18A] to-[#4A5D23]',
    landmark: '힐러리 스텝 & 세계 최고봉 피나클'
  }
};

export const LEAGUE_ORDER: MountainId[] = ['namsan', 'hallasan', 'jirisan', 'seoraksan', 'k2', 'everest'];

export function getNextLeague(currentId: MountainId): MountainLeagueInfo | null {
  const currentIndex = LEAGUE_ORDER.indexOf(currentId);
  if (currentIndex >= 0 && currentIndex < LEAGUE_ORDER.length - 1) {
    return MOUNTAIN_LEAGUES[LEAGUE_ORDER[currentIndex + 1]];
  }
  return null;
}
