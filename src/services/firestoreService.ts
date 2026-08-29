import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Unsubscribe,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, TreeItem, RecyclingRecord, LeaderboardUser, MountainId } from '../types';

export const firestoreService = {
  // --- User Profile ---
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const path = `users/${userId}`;
    try {
      const docSnap = await getDoc(doc(db, 'users', userId));
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveUserProfile(user: UserProfile): Promise<void> {
    const path = `users/${user.id}`;
    try {
      const sanitizedUser = {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        avatarUrl: user.avatarUrl || '',
        currentLeagueId: user.currentLeagueId,
        leagueRank: user.leagueRank,
        treesInCurrentMountain: user.treesInCurrentMountain,
        totalTreesGrownAllTime: user.totalTreesGrownAllTime,
        totalTreesChopped: user.totalTreesChopped,
        carbonSavedGrams: user.carbonSavedGrams,
        recyclingStreakDays: user.recyclingStreakDays,
        lastActiveTimestamp: user.lastActiveTimestamp,
        hasCompletedTutorial: user.hasCompletedTutorial,
      };

      await setDoc(doc(db, 'users', user.id), sanitizedUser, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  subscribeUserProfile(userId: string, onUpdate: (user: UserProfile | null) => void): Unsubscribe {
    const path = `users/${userId}`;
    return onSnapshot(
      doc(db, 'users', userId),
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate(docSnap.data() as UserProfile);
        } else {
          onUpdate(null);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  // --- Trees Collection ---
  async saveTree(userId: string, tree: TreeItem): Promise<void> {
    const path = `users/${userId}/trees/${tree.id}`;
    try {
      const treeData = {
        id: tree.id,
        userId,
        type: tree.type,
        name: tree.name,
        stage: tree.stage,
        growthPercent: Math.round(tree.growthPercent),
        plantedAt: tree.plantedAt,
        gridIndex: tree.gridIndex,
        choppedReason: tree.choppedReason || '',
        itemNameAtPlanting: tree.itemNameAtPlanting || '',
      };
      await setDoc(doc(db, 'users', userId, 'trees', tree.id), treeData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateTree(userId: string, treeOrId: TreeItem | string, partial?: Partial<TreeItem>): Promise<void> {
    const treeId = typeof treeOrId === 'string' ? treeOrId : treeOrId.id;
    const path = `users/${userId}/trees/${treeId}`;
    try {
      const updateData: Record<string, any> = {};
      if (typeof treeOrId === 'object') {
        updateData.stage = treeOrId.stage;
        updateData.growthPercent = Math.round(treeOrId.growthPercent);
        if (treeOrId.choppedReason !== undefined) updateData.choppedReason = treeOrId.choppedReason;
      } else if (partial) {
        if (partial.stage !== undefined) updateData.stage = partial.stage;
        if (partial.growthPercent !== undefined) updateData.growthPercent = Math.round(partial.growthPercent);
        if (partial.choppedReason !== undefined) updateData.choppedReason = partial.choppedReason;
      }
      await updateDoc(doc(db, 'users', userId, 'trees', treeId), updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async batchSyncTrees(userId: string, trees: TreeItem[]): Promise<void> {
    try {
      const promises = trees.map((tree) => {
        const path = `users/${userId}/trees/${tree.id}`;
        const treeData = {
          id: tree.id,
          userId,
          type: tree.type,
          name: tree.name,
          stage: tree.stage,
          growthPercent: Math.round(tree.growthPercent),
          plantedAt: tree.plantedAt,
          gridIndex: tree.gridIndex,
          choppedReason: tree.choppedReason || '',
          itemNameAtPlanting: tree.itemNameAtPlanting || '',
        };
        return setDoc(doc(db, 'users', userId, 'trees', tree.id), treeData);
      });
      await Promise.all(promises);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}/trees`);
    }
  },

  subscribeTrees(userId: string, onUpdate: (trees: TreeItem[]) => void): Unsubscribe {
    const path = `users/${userId}/trees`;
    return onSnapshot(
      collection(db, 'users', userId, 'trees'),
      (snapshot) => {
        const loadedTrees: TreeItem[] = [];
        snapshot.forEach((docSnap) => {
          loadedTrees.push(docSnap.data() as TreeItem);
        });
        loadedTrees.sort((a, b) => a.gridIndex - b.gridIndex);
        onUpdate(loadedTrees);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  // --- Recycling Records ---
  async addRecord(userId: string, record: RecyclingRecord): Promise<void> {
    const path = `users/${userId}/records/${record.id}`;
    try {
      const data = {
        id: record.id,
        userId,
        timestamp: record.timestamp,
        category: record.category,
        categoryName: record.categoryName,
        cleanlinessScore: record.cleanlinessScore,
        status: record.status,
        verdict: record.verdict,
        redStainScore: record.redStainScore,
        darkGrimeScore: record.darkGrimeScore,
        cleanRatio: record.cleanRatio,
        imageUri: record.imageUri || '',
        notes: record.notes || '',
        carbonSavedGrams: record.carbonSavedGrams,
      };
      await setDoc(doc(db, 'users', userId, 'records', record.id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  subscribeRecords(userId: string, onUpdate: (records: RecyclingRecord[]) => void): Unsubscribe {
    const path = `users/${userId}/records`;
    return onSnapshot(
      collection(db, 'users', userId, 'records'),
      (snapshot) => {
        const loaded: RecyclingRecord[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as RecyclingRecord);
        });
        loaded.sort((a, b) => b.timestamp - a.timestamp);
        onUpdate(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  // --- Mountain League Leaderboards ---
  async updateLeaderboard(leagueOrUser: MountainId | UserProfile, maybeUser?: UserProfile): Promise<void> {
    const user = typeof leagueOrUser === 'string' ? maybeUser : leagueOrUser;
    if (!user) return;
    const leagueId = typeof leagueOrUser === 'string' ? leagueOrUser : user.currentLeagueId;
    const path = `leaderboards/${leagueId}/entries/${user.id}`;
    try {
      await setDoc(doc(db, 'leaderboards', leagueId, 'entries', user.id), {
        userId: user.id,
        nickname: user.nickname,
        avatar: user.avatarUrl || '🌱',
        leagueId: leagueId,
        leagueRank: user.leagueRank,
        treesInMountain: user.treesInCurrentMountain,
        totalGrown: user.totalTreesGrownAllTime,
        streak: user.recyclingStreakDays,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  subscribeLeaderboard(leagueId: MountainId, onUpdate: (entries: LeaderboardUser[]) => void): Unsubscribe {
    const path = `leaderboards/${leagueId}/entries`;
    return onSnapshot(
      collection(db, 'leaderboards', leagueId, 'entries'),
      (snapshot) => {
        const entries: LeaderboardUser[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          entries.push({
            id: data.userId || docSnap.id,
            nickname: data.nickname,
            avatar: data.avatar || '🌱',
            leagueId: data.leagueId,
            leagueRank: data.leagueRank || 1,
            treesInMountain: data.treesInMountain || 0,
            totalGrown: data.totalGrown || 0,
            streak: data.streak || 1,
          });
        });
        // Sort descending by trees in current mountain, then total grown
        entries.sort((a, b) => b.treesInMountain - a.treesInMountain || b.totalGrown - a.totalGrown);
        // Assign ranks
        entries.forEach((e, idx) => {
          e.leagueRank = idx + 1;
        });
        onUpdate(entries);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  },
};
