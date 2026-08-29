import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, TreeItem, AnalysisOutput, ItemCategory, RecyclingRecord, MountainId } from './types';
import { MOUNTAIN_LEAGUES, LEAGUE_ORDER, getNextLeague } from './data/mountains';
import { Navbar } from './components/Navbar';
import { ForestCanvas } from './components/ForestCanvas';
import { CameraScanner } from './components/CameraScanner';
import { ScanResultModal } from './components/ScanResultModal';
import { MountainLeagueView } from './components/MountainLeagueView';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ForestStatsModal } from './components/ForestStatsModal';
import { LandingPage } from './components/LandingPage';
import { TutorialModal } from './components/TutorialModal';
import { ProfileSetupModal } from './components/ProfileSetupModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { playSound } from './utils/sound';
import { useAuth } from './context/AuthContext';
import { firestoreService } from './services/firestoreService';

const STORAGE_KEY_USER = 'plast_eco_user_v1';
const STORAGE_KEY_TREES = 'plast_eco_trees_v1';

export default function App() {
  const { firebaseUser, loading: authLoading, signInWithGoogle, logout } = useAuth();

  // Local/synced user profile state - Never restore guest from storage
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      return parsed && !parsed.isGuest ? parsed : null;
    } catch {
      return null;
    }
  });

  const [trees, setTrees] = useState<TreeItem[]>(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (!savedUser) return [];
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser?.isGuest) return [];
      const saved = localStorage.getItem(STORAGE_KEY_TREES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Navigation and Modal States
  const [currentView, setCurrentView] = useState<'LANDING' | 'HOME'>('LANDING');

  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{
    output: AnalysisOutput;
    imageUri: string;
    category: ItemCategory;
  } | null>(null);

  const [isMountainsOpen, setIsMountainsOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState<boolean>(false);

  const isInitialAuthRef = useRef(false);

  // Sync with Firestore when Firebase user changes
  useEffect(() => {
    if (!firebaseUser) {
      if (!user || user.isGuest) {
        if (!user) setCurrentView('LANDING');
      }
      return;
    }

    const userId = firebaseUser.uid;
    let isSubscribed = true;

    // Subscribe to Firestore user profile
    const unsubUser = firestoreService.subscribeUserProfile(userId, (remoteUser) => {
      if (!isSubscribed) return;

      if (remoteUser) {
        setUser(remoteUser);
        if (remoteUser.profileSetupCompleted) {
          firestoreService.updateLeaderboard(remoteUser.currentLeagueId, remoteUser);
        }
        if (!remoteUser.profileSetupCompleted) {
          // Open profile / nickname setup screen for Google login
          setIsProfileSetupOpen(true);
        } else if (!isInitialAuthRef.current) {
          isInitialAuthRef.current = true;
          setCurrentView('HOME');
        }
      } else {
        // First-time Google user initialization -> Show Profile/Nickname setup modal
        const newUser: UserProfile = {
          id: userId,
          nickname: firebaseUser.displayName || '에코러너',
          email: firebaseUser.email || 'user@gmail.com',
          avatarUrl: firebaseUser.photoURL || '',
          currentLeagueId: 'namsan',
          leagueRank: 1,
          treesInCurrentMountain: 0,
          totalTreesGrownAllTime: 0,
          totalTreesChopped: 0,
          carbonSavedGrams: 0,
          recyclingStreakDays: 1,
          lastActiveTimestamp: Date.now(),
          hasCompletedTutorial: false,
          isGuest: false,
          profileSetupCompleted: false,
          history: []
        };

        setUser(newUser);
        setIsProfileSetupOpen(true);
      }
    });

    // Subscribe to Firestore trees
    const unsubTrees = firestoreService.subscribeTrees(userId, (remoteTrees) => {
      if (!isSubscribed) return;
      if (remoteTrees) {
        setTrees(remoteTrees);
      }
    });

    return () => {
      isSubscribed = false;
      unsubUser();
      unsubTrees();
    };
  }, [firebaseUser]);

  // Local caching: ONLY persist for logged-in non-guest users
  useEffect(() => {
    if (user && !user.isGuest && firebaseUser) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [user, firebaseUser]);

  useEffect(() => {
    if (user && !user.isGuest && firebaseUser) {
      localStorage.setItem(STORAGE_KEY_TREES, JSON.stringify(trees));
    } else {
      localStorage.removeItem(STORAGE_KEY_TREES);
    }
  }, [trees, user, firebaseUser]);

  // Active tree calculations
  const activeTrees = trees.filter(t => t.stage !== 'chopped');
  // Photosynthesis Synergy Multiplier (More trees = faster growth!)
  const growthMultiplier = 1.0 + Math.min(5.0, (activeTrees.length * 0.15));

  // Passive Natural Growth Loop (accelerated by photosynthesis synergy)
  useEffect(() => {
    if (!user || trees.length === 0) return;

    // Tick every 3 seconds
    const interval = setInterval(() => {
      setTrees(prevTrees => {
        let hasChanges = false;
        const updated = prevTrees.map(tree => {
          if (tree.stage === 'chopped' || tree.growthPercent >= 100) {
            return tree;
          }

          hasChanges = true;
          const increment = 0.25 * growthMultiplier;
          const newPercent = Math.min(100, tree.growthPercent + increment);

          let newStage = tree.stage;
          if (newPercent >= 100) {
            newStage = tree.type === 'golden_baobab' ? 'golden_tree' : 'mature_tree';
          } else if (newPercent >= 50 && tree.stage === 'seedling') {
            newStage = 'sprout';
          }

          const modifiedTree = {
            ...tree,
            growthPercent: newPercent,
            stage: newStage
          };

          // If connected to Firebase and not a guest, update tree in Firestore
          if (user.id && firebaseUser && !user.isGuest) {
            firestoreService.updateTree(user.id, tree.id, {
              growthPercent: newPercent,
              stage: newStage
            });
          }

          return modifiedTree;
        });

        return hasChanges ? updated : prevTrees;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [user, trees.length, growthMultiplier, firebaseUser]);

  // Guest Mode Login Handler (Always fresh start, no persistence)
  const handleLogin = (nickname: string, avatarUrl?: string) => {
    // Clear any previous storage to guarantee a fresh start
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TREES);

    const initialSeedling: TreeItem = {
      id: `tree_${Date.now()}`,
      type: 'pine',
      name: '게스트 환영 묘목',
      stage: 'seedling',
      growthPercent: 20,
      plantedAt: Date.now(),
      gridIndex: 0,
      itemNameAtPlanting: '게스트 체험 시작 묘목'
    };

    const guestUser: UserProfile = {
      id: `guest_${Date.now()}`,
      nickname: nickname || '게스트러너',
      email: 'guest@plast.kr',
      avatarUrl: avatarUrl || '🌱',
      currentLeagueId: 'namsan',
      leagueRank: 1,
      treesInCurrentMountain: 1,
      totalTreesGrownAllTime: 1,
      totalTreesChopped: 0,
      carbonSavedGrams: 0,
      recyclingStreakDays: 1,
      lastActiveTimestamp: Date.now(),
      hasCompletedTutorial: true,
      isGuest: true,
      profileSetupCompleted: true,
      history: []
    };

    setUser(guestUser);
    setTrees([initialSeedling]);
    setCurrentView('HOME');
  };

  // Google Login Handler
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google login error:', err);
    }
  };

  // Save Google User Profile (Nickname & Avatar)
  const handleSaveGoogleProfile = (nickname: string, avatarUrl: string) => {
    if (!user) return;

    const updatedUser: UserProfile = {
      ...user,
      nickname,
      avatarUrl,
      isGuest: false,
      profileSetupCompleted: true,
    };

    setUser(updatedUser);
    setIsProfileSetupOpen(false);

    if (firebaseUser) {
      firestoreService.saveUserProfile(updatedUser);
      firestoreService.updateLeaderboard(updatedUser.currentLeagueId, updatedUser);
    }

    if (!updatedUser.hasCompletedTutorial) {
      setIsTutorialOpen(true);
    } else {
      setCurrentView('HOME');
    }
  };

  // Complete Tutorial & Grant First Seedling
  const handleCompleteTutorial = () => {
    if (!user) return;

    const initialSeedling: TreeItem = {
      id: `tree_${Date.now()}`,
      type: 'pine',
      name: '첫 희망의 새싹 묘목',
      stage: 'seedling',
      growthPercent: 20,
      plantedAt: Date.now(),
      gridIndex: 0,
      itemNameAtPlanting: '신규 가입 환영 묘목'
    };

    setTrees([initialSeedling]);

    const updatedUser: UserProfile = {
      ...user,
      hasCompletedTutorial: true,
      treesInCurrentMountain: 1,
      totalTreesGrownAllTime: 1
    };

    setUser(updatedUser);

    // Save to Firestore if not guest
    if (firebaseUser && !user.isGuest) {
      firestoreService.saveUserProfile(updatedUser);
      firestoreService.saveTree(user.id, initialSeedling);
      firestoreService.updateLeaderboard(user.currentLeagueId, updatedUser);
    }

    setIsTutorialOpen(false);
    setCurrentView('HOME');
  };

  // Handle Scan Completed
  const handleScanComplete = (result: AnalysisOutput, capturedImageUri: string, category: ItemCategory) => {
    setIsScannerOpen(false);
    setScanResult({
      output: result,
      imageUri: capturedImageUri,
      category
    });

    const categoryNames: Record<ItemCategory, string> = {
      tteokbokki_container: '엽떡/배달용기',
      plastic_cup: '투명 일회용 컵',
      plastic_bottle: '투명 페트병',
      beverage_can: '음료 캔',
      paper_carton: '우유팩/종이류',
      glass_bottle: '유리병',
      general_plastic: '일반 플라스틱'
    };

    const newRecord: RecyclingRecord = {
      id: `rec_${Date.now()}`,
      timestamp: Date.now(),
      category,
      categoryName: categoryNames[category],
      cleanlinessScore: result.cleanlinessScore,
      status: result.status,
      verdict: result.verdict,
      redStainScore: result.redStainPercent,
      darkGrimeScore: result.darkGrimePercent,
      cleanRatio: result.surfaceUniformity,
      imageUri: capturedImageUri,
      notes: result.feedbackMessage,
      carbonSavedGrams: result.carbonSavedGrams
    };

    if (result.verdict === 'PLANT_SEEDLING') {
      // Plant new seedling in forest!
      const treeTypes: TreeItem['type'][] = ['pine', 'cherry', 'oak', 'ginkgo', 'fir'];
      const randomType = result.status === 'PERFECT' && Math.random() > 0.6 
        ? 'golden_baobab' 
        : treeTypes[Math.floor(Math.random() * treeTypes.length)];

      const newTree: TreeItem = {
        id: `tree_${Date.now()}`,
        type: randomType,
        name: randomType === 'golden_baobab' ? '황금 에코 거목' : `${categoryNames[category]} 묘목`,
        stage: 'seedling',
        growthPercent: result.status === 'PERFECT' ? 35 : 10,
        plantedAt: Date.now(),
        gridIndex: trees.length,
        itemNameAtPlanting: `${categoryNames[category]} (${result.cleanlinessScore}점 세척)`
      };

      setTrees(prev => [...prev, newTree]);

      if (user) {
        const updatedUser: UserProfile = {
          ...user,
          treesInCurrentMountain: user.treesInCurrentMountain + 1,
          totalTreesGrownAllTime: user.totalTreesGrownAllTime + 1,
          carbonSavedGrams: user.carbonSavedGrams + result.carbonSavedGrams,
          history: [newRecord, ...user.history]
        };

        setUser(updatedUser);

        // Firestore sync if not a guest
        if (firebaseUser && !user.isGuest) {
          firestoreService.saveTree(user.id, newTree);
          firestoreService.addRecord(user.id, newRecord);
          firestoreService.saveUserProfile(updatedUser);
          firestoreService.updateLeaderboard(user.currentLeagueId, updatedUser);
        }
      }
    } else {
      // Penalty: Chop a tree!
      let choppedTreeId: string | null = null;
      setTrees(prev => {
        let choppedOne = false;
        return prev.map(t => {
          if (!choppedOne && t.stage !== 'chopped') {
            choppedOne = true;
            choppedTreeId = t.id;
            return {
              ...t,
              stage: 'chopped' as const,
              choppedReason: `${categoryNames[category]} 오염 배출 (${result.cleanlinessScore}점)`
            };
          }
          return t;
        });
      });

      if (user) {
        const updatedUser: UserProfile = {
          ...user,
          treesInCurrentMountain: Math.max(0, user.treesInCurrentMountain - 1),
          totalTreesChopped: user.totalTreesChopped + 1,
          history: [newRecord, ...user.history]
        };

        setUser(updatedUser);

        // Firestore sync if not guest
        if (firebaseUser && !user.isGuest) {
          if (choppedTreeId) {
            firestoreService.updateTree(user.id, choppedTreeId, {
              stage: 'chopped',
              choppedReason: `${categoryNames[category]} 오염 배출 (${result.cleanlinessScore}점)`
            });
          }
          firestoreService.addRecord(user.id, newRecord);
          firestoreService.saveUserProfile(updatedUser);
          firestoreService.updateLeaderboard(user.currentLeagueId, updatedUser);
        }
      }
    }
  };

  // Mountain League Upgrade
  const handleUpgradeMountain = () => {
    if (!user) return;
    const next = getNextLeague(user.currentLeagueId);
    if (!next) return;

    const prevLeagueId = user.currentLeagueId;
    const updatedUser: UserProfile = {
      ...user,
      currentLeagueId: next.id,
      treesInCurrentMountain: 0,
      leagueRank: 1
    };

    setUser(updatedUser);

    if (firebaseUser && !user.isGuest) {
      firestoreService.saveUserProfile(updatedUser);
      firestoreService.removeLeaderboardEntry(prevLeagueId, user.id);
      firestoreService.updateLeaderboard(next.id, updatedUser);
    }

    setIsMountainsOpen(false);
  };

  // Delete individual tree
  const handleDeleteTree = (treeId: string) => {
    setTrees(prev => prev.filter(t => t.id !== treeId));
    if (user && firebaseUser && !user.isGuest) {
      firestoreService.deleteTree(user.id, treeId);
    }
  };

  // Clean up all chopped tree stumps at once from forest meadow
  const handleClearChoppedTrees = () => {
    const choppedIds = trees.filter(t => t.stage === 'chopped').map(t => t.id);
    setTrees(prev => prev.filter(t => t.stage !== 'chopped'));
    if (user && firebaseUser && !user.isGuest && choppedIds.length > 0) {
      firestoreService.deleteMultipleTrees(user.id, choppedIds);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setTrees([]);
    setCurrentView('LANDING');
    setIsStatsOpen(false);
    setIsLeaderboardOpen(false);
    setIsMountainsOpen(false);
    setIsProfileSetupOpen(false);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TREES);
  };

  // If user is not logged in or in Landing view
  if (currentView === 'LANDING' || !user) {
    return (
      <div className="min-h-screen bg-[#F9F7F2]">
        <LandingPage
          isLoggedIn={!!user}
          onLogin={handleLogin}
          onGoogleLogin={handleGoogleLogin}
          onGoToHome={() => setCurrentView('HOME')}
        />

        {/* Google Nickname & Profile Setup Modal */}
        {isProfileSetupOpen && user && (
          <ProfileSetupModal
            initialNickname={user.nickname || firebaseUser?.displayName || '에코러너'}
            initialAvatarUrl={user.avatarUrl || firebaseUser?.photoURL || ''}
            userEmail={user.email || firebaseUser?.email || ''}
            onSaveProfile={handleSaveGoogleProfile}
          />
        )}

        {/* Onboarding Tutorial Modal */}
        {isTutorialOpen && user && (
          <TutorialModal
            userNickname={user.nickname}
            onCompleteTutorial={handleCompleteTutorial}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#3C4030] flex flex-col selection:bg-[#7A9D54] selection:text-white font-['Pretendard',sans-serif]">
      {/* Top App Bar with Mountain Badge & Fast Actions */}
      <Navbar
        user={user}
        treesCount={activeTrees.length}
        growthMultiplier={growthMultiplier}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenMountains={() => setIsMountainsOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Game Screen */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 pb-24 sm:pb-8 flex flex-col gap-4 sm:gap-6">
        {/* Interactive Forest Canvas */}
        <ForestCanvas
          trees={trees}
          user={user}
          growthMultiplier={growthMultiplier}
          onOpenScanner={() => setIsScannerOpen(true)}
          onDeleteTree={handleDeleteTree}
          onClearChoppedTrees={handleClearChoppedTrees}
        />

        {/* Quick Action Navigation Bar on Desktop / Tablet (mobile uses sticky bottom nav) */}
        <div className="hidden sm:grid sm:grid-cols-4 gap-3.5">
          <button
            onClick={() => { playSound('click'); setIsScannerOpen(true); }}
            className="p-4 rounded-2xl bg-[#4A7856] hover:bg-[#3E6548] text-white font-bold text-sm shadow-[0_10px_25px_rgba(74,120,86,0.22)] active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span>📷 실시간 분리수거 촬영</span>
          </button>

          <button
            onClick={() => { playSound('click'); setIsMountainsOpen(true); }}
            className="p-4 rounded-2xl bg-white/80 hover:bg-white border border-[#E8E4D9] hover:border-[#7A9D54] text-[#2D3319] font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <span>🏔️ 산 리그 현황 (
              {user.treesInCurrentMountain}/{MOUNTAIN_LEAGUES[user.currentLeagueId]?.requiredTrees}
            )</span>
          </button>

          <button
            onClick={() => { playSound('click'); setIsLeaderboardOpen(true); }}
            className="p-4 rounded-2xl bg-white/80 hover:bg-white border border-[#E8E4D9] hover:border-[#7A9D54] text-[#2D3319] font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <span>🏆 {MOUNTAIN_LEAGUES[user.currentLeagueId]?.name} 랭킹</span>
          </button>

          <button
            onClick={() => { playSound('click'); setIsStatsOpen(true); }}
            className="p-4 rounded-2xl bg-white/80 hover:bg-white border border-[#E8E4D9] hover:border-[#7A9D54] text-[#2D3319] font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <span>📊 에코 통계 & 기록</span>
          </button>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        user={user}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenMountains={() => setIsMountainsOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
      />

      {/* Real-time Camera Scanner Modal */}
      {isScannerOpen && (
        <CameraScanner
          onClose={() => setIsScannerOpen(false)}
          onScanComplete={handleScanComplete}
        />
      )}

      {/* Verification Result & Reward Modal */}
      {scanResult && (
        <ScanResultModal
          result={scanResult.output}
          capturedImageUri={scanResult.imageUri}
          category={scanResult.category}
          onClose={() => setScanResult(null)}
        />
      )}

      {/* Mountain Progression & League Map Modal */}
      {isMountainsOpen && (
        <MountainLeagueView
          user={user}
          onClose={() => setIsMountainsOpen(false)}
          onUpgradeMountain={handleUpgradeMountain}
        />
      )}

      {/* Mountain Leaderboard Modal */}
      {isLeaderboardOpen && (
        <LeaderboardModal
          user={user}
          onClose={() => setIsLeaderboardOpen(false)}
        />
      )}

      {/* User Stats & Activity History Modal */}
      {isStatsOpen && (
        <ForestStatsModal
          user={user}
          trees={trees}
          onClose={() => setIsStatsOpen(false)}
          onLogout={handleLogout}
          onEditProfile={!user.isGuest ? () => setIsProfileSetupOpen(true) : undefined}
        />
      )}

      {/* Profile Setup Modal (Accessible for Google users) */}
      {isProfileSetupOpen && user && (
        <ProfileSetupModal
          initialNickname={user.nickname || firebaseUser?.displayName || '에코러너'}
          initialAvatarUrl={user.avatarUrl || firebaseUser?.photoURL || ''}
          userEmail={user.email || firebaseUser?.email || ''}
          onSaveProfile={handleSaveGoogleProfile}
        />
      )}

      {/* Onboarding Tutorial Modal */}
      {isTutorialOpen && user && (
        <TutorialModal
          userNickname={user.nickname}
          onCompleteTutorial={handleCompleteTutorial}
        />
      )}
    </div>
  );
}
