export type Genre = 'novel' | 'science' | 'humanities' | 'business' | 'other';

export type TreeType = 'sakura' | 'pine' | 'oak' | 'maple' | 'birch';

export type BiomeType = 'spring' | 'autumn' | 'winter' | 'desert';

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: Genre;
  totalPages: number;
  currentPage: number;
  progress: number; // 0 to 100
  status: 'reading' | 'completed';
  startDate: string;
  lastUpdated: string;
  coverUrl: string;
  vitality: number; // 0 to 100
  treeType: TreeType;
  backendBookId?: number; // persisted Book id on the backend (when synced)
  backendTreeId?: number; // persisted Tree id on the backend (when synced)
}

export interface Tree {
  id: string;
  bookId: string;
  type: TreeType;
  growth: number; // 0.0 to 1.0 (corresponds to book progress)
  vitality: number; // 0.0 to 1.0 (corresponds to book vitality)
  x: number; // grid position x (-5 to 5)
  z: number; // grid position z (-5 to 5)
  plantedAt: string;
}

export type DecorationType =
  | 'lantern'
  | 'pond'
  | 'bench'
  | 'deer'
  | 'rabbit'
  | 'stone_path'
  | 'house'
  | 'fence'
  | 'flowerbed'
  | 'mushroom'
  | 'signpost'
  | 'well'
  | 'scarecrow';

export interface Decoration {
  id: string;
  type: DecorationType;
  x: number;
  z: number;
  placedAt: string;
}

export type QuestTargetType = 'pages_today' | 'streak' | 'log_progress' | 'complete_book';

export interface Quest {
  id: string;
  title: string;
  description: string;
  targetType: QuestTargetType;
  targetValue: number;
  currentValue: number;
  completed: boolean;
  rewardClaimed: boolean;
  rewardPoints: number;
  rewardDecorationType?: DecorationType;
  backendQuestId?: number; // backend QuestEntity id (when quests are backend-driven)
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface User {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  points: number;
  streak: number;
  lastReadDate?: string; // YYYY-MM-DD
  badges: Badge[];
}

export interface MockForest {
  id: string;
  userName: string;
  userTitle: string;
  treeCount: number;
  level: number;
  isPopular: boolean;
  trees: { type: TreeType; growth: number; vitality: number; x: number; z: number }[];
  ownerUserId?: number; // backend user id for real village forests (absent for sample mocks)
  cheerCount?: number;
}
