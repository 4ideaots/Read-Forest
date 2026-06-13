import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Book, Tree, User, Quest, Decoration, TreeType, Genre, DecorationType, MockForest, BiomeType } from '../types';
import confetti from 'canvas-confetti';
import { playPop, playCoin, playPlant, playLevelUp, playGrow } from '../utils/audio';
import { isAuthenticated } from '../api/token';
import * as treeApi from '../api/trees';

// Visual growth stages mirror the renderer's sprite tiers so the celebration
// fires at the exact moment the tree visibly changes shape.
// 0 = seed/soil, 1 = sprout (>=0.18), 2 = sapling (>=0.55), 3 = full canopy (>=0.99)
const growthStage = (growth: number): number => {
  if (growth >= 0.99) return 3;
  if (growth >= 0.55) return 2;
  if (growth >= 0.18) return 1;
  return 0;
};

// Shop prices for every placeable decoration (shared by the shop UI).
export const DECOR_COST: Record<DecorationType, number> = {
  stone_path: 15,
  flowerbed: 20,
  mushroom: 25,
  lantern: 30,
  fence: 35,
  bench: 40,
  signpost: 45,
  rabbit: 50,
  pond: 80,
  scarecrow: 90,
  deer: 100,
  well: 120,
  house: 250
};

// --- Daily / weekly quest generation ------------------------------------
// Quests refresh from a pool each day (and weekly for the big challenge), so
// there's always a fresh "today's to-do" reason to come back.
type QuestTemplate = Omit<Quest, 'id' | 'currentValue' | 'completed' | 'rewardClaimed'>;

const DAILY_POOL: QuestTemplate[] = [
  { title: '오늘의 책장 넘기기', description: '오늘 하루 10페이지 이상 읽으세요.', targetType: 'pages_today', targetValue: 10, rewardPoints: 50 },
  { title: '독서 마라톤', description: '오늘 30페이지 이상 읽으세요.', targetType: 'pages_today', targetValue: 30, rewardPoints: 90, rewardDecorationType: 'mushroom' },
  { title: '정원 돌보기', description: '독서 기록을 1회 갱신해 숲에 활력을 주세요.', targetType: 'log_progress', targetValue: 1, rewardPoints: 30, rewardDecorationType: 'lantern' },
  { title: '부지런한 정원사', description: '독서 기록을 3회 갱신하세요.', targetType: 'log_progress', targetValue: 3, rewardPoints: 60, rewardDecorationType: 'flowerbed' },
  { title: '완독의 하루', description: '오늘 책 한 권을 완독하세요.', targetType: 'complete_book', targetValue: 1, rewardPoints: 120, rewardDecorationType: 'fence' }
];

const WEEKLY_TEMPLATE: QuestTemplate = {
  title: '주간 챌린지: 책벌레',
  description: '이번 주에 책 2권을 완독하세요.',
  targetType: 'complete_book',
  targetValue: 2,
  rewardPoints: 200,
  rewardDecorationType: 'well'
};

const hashStr = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h >>> 0;
};

const weekKey = (d: Date): string => {
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86_400_000 + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
};

const makeDailyQuests = (dateStr: string): Quest[] => {
  const seed = hashStr(dateStr);
  const keyed = DAILY_POOL.map((_t, i) => ({ i, k: (seed ^ ((i + 1) * 2654435761)) >>> 0 }));
  keyed.sort((a, b) => a.k - b.k);
  return keyed.slice(0, 3).map((o, slot) => ({
    ...DAILY_POOL[o.i],
    id: `daily-${slot + 1}`,
    currentValue: 0,
    completed: false,
    rewardClaimed: false
  }));
};

const makeWeeklyQuest = (): Quest => ({
  ...WEEKLY_TEMPLATE,
  id: 'weekly-1',
  currentValue: 0,
  completed: false,
  rewardClaimed: false
});

// Build today's quest board, preserving in-progress quests when the day/week
// hasn't rolled over yet.
const loadQuests = (): Quest[] => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const week = weekKey(now);
  const savedRaw = localStorage.getItem('rf_quests');
  const savedDate = localStorage.getItem('rf_questDate');
  const savedWeek = localStorage.getItem('rf_questWeek');

  let saved: Quest[] = [];
  try {
    saved = savedRaw ? JSON.parse(savedRaw) : [];
  } catch {
    saved = [];
  }

  // Same day → keep everything as-is.
  if (savedRaw && savedDate === today) return saved;

  // New day → fresh dailies. Keep the weekly challenge unless the week rolled over.
  const daily = makeDailyQuests(today);
  const existingWeekly = saved.find((q) => q.id === 'weekly-1');
  const weekly = savedWeek === week && existingWeekly ? existingWeekly : makeWeeklyQuest();

  localStorage.setItem('rf_questDate', today);
  localStorage.setItem('rf_questWeek', week);
  return [...daily, weekly];
};

// Little burst of building tools when a decoration is placed.
const decorConfetti = () => {
  (confetti as any)({
    particleCount: 50,
    angle: 120,
    spread: 55,
    origin: { x: 1 },
    scalar: 1.8,
    shapes: ['emoji'],
    shapeOptions: { emoji: { value: ['🔨', '🪚', '🪵', '✨'] } }
  });
};

interface AppContextType {
  books: Book[];
  trees: Tree[];
  decorations: Decoration[];
  user: User;
  quests: Quest[];
  timeOfDay: 'day' | 'night';
  weather: 'clear' | 'rainy' | 'snowy';
  selectedBookId: string | null;
  socialForests: MockForest[];
  viewingSocialForest: MockForest | null;
  addBook: (title: string, author: string, genre: Genre, totalPages: number, coverUrl?: string) => void;
  updateBookProgress: (bookId: string, page: number) => void;
  deleteBook: (bookId: string) => void;
  claimQuestReward: (questId: string) => void;
  placeDecoration: (type: DecorationType) => void;
  placeDecorationAt: (type: DecorationType, x: number, z: number) => void;
  pendingPlacement: DecorationType | null;
  beginPlacement: (type: DecorationType) => void;
  cancelPlacement: () => void;
  removeDecoration: (id: string) => void;
  moveTree: (id: string, x: number, z: number) => void;
  moveDecoration: (id: string, x: number, z: number) => void;
  setTimeOfDay: (time: 'day' | 'night') => void;
  setWeather: (weather: 'clear' | 'rainy' | 'snowy') => void;
  setSelectedBookId: (id: string | null) => void;
  setViewingSocialForest: (forest: MockForest | null) => void;
  triggerReviveQuest: (bookId: string) => void;
  biome: BiomeType;
  setBiome: (biome: BiomeType) => void;
  notice: string | null;
  dismissNotice: () => void;
  autoEnv: boolean;
  setAutoEnv: (v: boolean) => void;
  waterFriendForest: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_BOOKS: Book[] = [
  {
    id: 'book-1',
    title: '아기 곰의 독서 모험',
    author: '홍길동',
    genre: 'novel',
    totalPages: 200,
    currentPage: 200,
    progress: 100,
    status: 'completed',
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=200&q=80',
    vitality: 100,
    treeType: 'sakura'
  },
  {
    id: 'book-2',
    title: '클린 아키텍처',
    author: '로버트 C. 마틴',
    genre: 'science',
    totalPages: 400,
    currentPage: 180,
    progress: 45,
    status: 'reading',
    startDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=200&q=80',
    vitality: 80,
    treeType: 'pine'
  },
  {
    id: 'book-3',
    title: '사피엔스',
    author: '유발 하라리',
    genre: 'humanities',
    totalPages: 600,
    currentPage: 180,
    progress: 30,
    status: 'reading',
    startDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    // Updated 6 days ago, so it has withered (6 days ago -> 6 - 2 = 4 days overdue -> 4 * 20 = 80% drop -> 20% vitality)
    lastUpdated: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=200&q=80',
    vitality: 20,
    treeType: 'oak'
  }
];

const INITIAL_TREES: Tree[] = [
  {
    id: 'tree-1',
    bookId: 'book-1',
    type: 'sakura',
    growth: 1.0,
    vitality: 1.0,
    x: -2.0,
    z: -1.5,
    plantedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tree-2',
    bookId: 'book-2',
    type: 'pine',
    growth: 0.45,
    vitality: 0.8,
    x: 1.5,
    z: 1.2,
    plantedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tree-3',
    bookId: 'book-3',
    type: 'oak',
    growth: 0.3,
    vitality: 0.2,
    x: -1.5,
    z: 2.0,
    plantedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_DECORATIONS: Decoration[] = [
  {
    id: 'decor-1',
    type: 'bench',
    x: 0,
    z: -2,
    placedAt: new Date().toISOString()
  },
  {
    id: 'decor-2',
    type: 'lantern',
    x: 2.5,
    z: -1,
    placedAt: new Date().toISOString()
  }
];

const INITIAL_USER: User = {
  name: '지식 정원사',
  level: 2,
  xp: 180,
  xpToNextLevel: 300,
  points: 120,
  streak: 3,
  lastReadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  badges: [
    {
      id: 'badge-1',
      name: '첫 걸음',
      description: '정원에 첫 번째 나무를 심었습니다.',
      icon: '🌱',
      unlockedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'badge-2',
      name: '성실한 독서가',
      description: '독서 스트릭 3일을 유지했습니다.',
      icon: '🔥',
      unlockedAt: new Date().toISOString()
    }
  ]
};

const MOCK_SOCIAL_FORESTS: MockForest[] = [
  {
    id: 'social-1',
    userName: '김영희',
    userTitle: '낭만 소설가',
    treeCount: 5,
    level: 5,
    isPopular: true,
    trees: [
      { type: 'sakura', growth: 1.0, vitality: 1.0, x: -2, z: -1 },
      { type: 'sakura', growth: 1.0, vitality: 0.9, x: 2, z: 2 },
      { type: 'maple', growth: 0.8, vitality: 1.0, x: -1, z: 3 },
      { type: 'birch', growth: 0.5, vitality: 0.7, x: 3, z: -2 },
      { type: 'pine', growth: 1.0, vitality: 1.0, x: 0, z: -3 }
    ]
  },
  {
    id: 'social-2',
    userName: '이철수',
    userTitle: '기술의 선구자',
    treeCount: 4,
    level: 4,
    isPopular: false,
    trees: [
      { type: 'pine', growth: 1.0, vitality: 1.0, x: -1, z: -2 },
      { type: 'pine', growth: 0.7, vitality: 0.8, x: 2, z: -1 },
      { type: 'oak', growth: 1.0, vitality: 1.0, x: -3, z: 1 },
      { type: 'birch', growth: 0.9, vitality: 0.9, x: 1, z: 2 }
    ]
  },
  {
    id: 'social-3',
    userName: '박민수',
    userTitle: '자연의 수호자',
    treeCount: 7,
    level: 7,
    isPopular: true,
    trees: [
      { type: 'oak', growth: 1.0, vitality: 1.0, x: -2, z: -2 },
      { type: 'oak', growth: 1.0, vitality: 1.0, x: 2, z: 2 },
      { type: 'pine', growth: 1.0, vitality: 0.8, x: 0, z: 3 },
      { type: 'maple', growth: 1.0, vitality: 1.0, x: -3, z: 1 },
      { type: 'maple', growth: 0.6, vitality: 0.9, x: 3, z: -1 },
      { type: 'sakura', growth: 1.0, vitality: 1.0, x: 1, z: -3 },
      { type: 'birch', growth: 0.4, vitality: 1.0, x: -1, z: 0 }
    ]
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('rf_books');
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  const [trees, setTrees] = useState<Tree[]>(() => {
    const saved = localStorage.getItem('rf_trees');
    return saved ? JSON.parse(saved) : INITIAL_TREES;
  });

  const [decorations, setDecorations] = useState<Decoration[]>(() => {
    const saved = localStorage.getItem('rf_decorations');
    return saved ? JSON.parse(saved) : INITIAL_DECORATIONS;
  });

  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('rf_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [quests, setQuests] = useState<Quest[]>(() => loadQuests());

  const [timeOfDay, setTimeOfDay] = useState<'day' | 'night'>('day');
  const [weather, setWeather] = useState<'clear' | 'rainy' | 'snowy'>('clear');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [viewingSocialForest, setViewingSocialForest] = useState<MockForest | null>(null);
  const [pendingPlacement, setPendingPlacement] = useState<DecorationType | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [autoEnv, setAutoEnv] = useState<boolean>(() => localStorage.getItem('rf_autoEnv') === '1');
  const dismissNotice = () => setNotice(null);
  const [wateredForests, setWateredForests] = useState<Set<string>>(new Set());
  const [biome, setBiome] = useState<BiomeType>(() => {
    const saved = localStorage.getItem('rf_biome');
    return saved ? (saved as BiomeType) : 'spring';
  });

  // Synchronize storage
  useEffect(() => {
    localStorage.setItem('rf_books', JSON.stringify(books));
    localStorage.setItem('rf_trees', JSON.stringify(trees));
    localStorage.setItem('rf_decorations', JSON.stringify(decorations));
    localStorage.setItem('rf_user', JSON.stringify(user));
    localStorage.setItem('rf_quests', JSON.stringify(quests));
    localStorage.setItem('rf_biome', biome);
  }, [books, trees, decorations, user, quests, biome]);

  // Vitality Degradation Check on mount
  useEffect(() => {
    const now = Date.now();
    let updatedAny = false;

    const nextBooks = books.map((book) => {
      if (book.status === 'completed') return book;

      const lastUpdatedMs = new Date(book.lastUpdated).getTime();
      const diffDays = Math.floor((now - lastUpdatedMs) / (1000 * 60 * 60 * 24));

      let newVitality = 100;
      if (diffDays >= 3) {
        // Drop 20% for each day after the 2nd day of inactivity
        // Day 3: 100 - (3 - 2)*20 = 80
        // Day 4: 100 - (4 - 2)*20 = 60
        // ...
        // Day 7+: 0
        newVitality = Math.max(0, 100 - (diffDays - 2) * 20);
      }

      if (newVitality !== book.vitality) {
        updatedAny = true;
        return { ...book, vitality: newVitality };
      }
      return book;
    });

    if (updatedAny) {
      setBooks(nextBooks);
      // Sync trees vitality too
      setTrees((prevTrees) =>
        prevTrees.map((tree) => {
          const matchBook = nextBooks.find((b) => b.id === tree.bookId);
          if (matchBook) {
            return { ...tree, vitality: matchBook.vitality / 100 };
          }
          return tree;
        })
      );
    }
  }, []);

  // Offline / passive reward: the garden "lives on" while you're away. On return
  // after a few hours, a critter leaves a little gold behind (runs once on mount).
  useEffect(() => {
    const now = Date.now();
    const lastVisitStr = localStorage.getItem('rf_lastVisit');
    if (lastVisitStr) {
      const hours = (now - parseInt(lastVisitStr)) / 3_600_000;
      if (hours >= 4) {
        const reward = Math.min(60, Math.floor(hours / 4) * 5);
        if (reward > 0) {
          setUser((prev) => ({ ...prev, points: prev.points + reward }));
          const msgs = [
            `🐇 토끼가 밤새 정원을 돌보고 골드를 남겼어요!  +${reward} G`,
            `🦌 사슴이 다녀가며 이슬을 모아 주었어요.  +${reward} G`,
            `✨ 자는 동안 꽃들이 꿀을 맺었어요.  +${reward} G`,
            `🍄 버섯이 쑥 자라 골드로 바뀌었어요.  +${reward} G`
          ];
          setNotice(msgs[Math.floor(Math.random() * msgs.length)]);
          playCoin();
        }
      }
    }
    localStorage.setItem('rf_lastVisit', String(now));
    const heartbeat = setInterval(() => localStorage.setItem('rf_lastVisit', String(Date.now())), 60_000);
    return () => clearInterval(heartbeat);
  }, []);

  // Auto environment: tie day/night to the real-world clock when enabled.
  useEffect(() => {
    localStorage.setItem('rf_autoEnv', autoEnv ? '1' : '0');
    if (!autoEnv) return;
    const apply = () => {
      const h = new Date().getHours();
      setTimeOfDay(h >= 19 || h < 6 ? 'night' : 'day');
    };
    apply();
    const id = setInterval(apply, 60_000);
    return () => clearInterval(id);
  }, [autoEnv]);

  // Check quests completion when currentValue updates
  const checkQuests = (updatedQuests: Quest[]) => {
    return updatedQuests.map((q) => {
      if (!q.completed && q.currentValue >= q.targetValue) {
        return { ...q, completed: true };
      }
      return q;
    });
  };

  // Helper to add XP and Level Up
  const addXP = (amount: number, currentUser: User): User => {
    let newXp = currentUser.xp + amount;
    let newLevel = currentUser.level;
    let xpToNext = currentUser.xpToNextLevel;

    while (newXp >= xpToNext) {
      newXp -= xpToNext;
      newLevel += 1;
      xpToNext = Math.floor(xpToNext * 1.5);
      // Trigger confetti on level up!
      playLevelUp();
      (confetti as any)({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        scalar: 2.0,
        shapes: ['emoji'],
        shapeOptions: {
          emoji: {
            value: ['🌟', '👑', '🌱', '💖']
          }
        }
      });
    }

    // Badge Check
    const badges = [...currentUser.badges];
    if (newLevel >= 3 && !badges.find((b) => b.id === 'badge-level-3')) {
      badges.push({
        id: 'badge-level-3',
        name: '정련된 정원사',
        description: '가드너 레벨 3을 달성하였습니다.',
        icon: '👑',
        unlockedAt: new Date().toISOString()
      });
    }

    return {
      ...currentUser,
      level: newLevel,
      xp: newXp,
      xpToNextLevel: xpToNext,
      badges
    };
  };

  // Helper to assign a tree coordinate
  const getRandomGridCoord = (existingTrees: Tree[], existingDecors: Decoration[]) => {
    // Dynamic radius based on total number of objects in the forest (expands as it gets crowded)
    const totalCount = existingTrees.length + existingDecors.length;
    const radius = Math.max(4.2, 4.2 + Math.floor((totalCount - 4) / 3) * 0.8);
    let bestX = 0;
    let bestZ = 0;
    let maxMinDist = 0;

    // 20 trials to find a good position
    for (let i = 0; i < 30; i++) {
      // Polar coordinates
      const r = Math.random() * (radius - 1.0) + 0.8; // Avoid placing exactly in center
      const theta = Math.random() * Math.PI * 2;
      const x = Math.round((r * Math.cos(theta)) * 10) / 10;
      const z = Math.round((r * Math.sin(theta)) * 10) / 10;

      let minDist = 100;
      existingTrees.forEach((t) => {
        const d = Math.sqrt((t.x - x) ** 2 + (t.z - z) ** 2);
        if (d < minDist) minDist = d;
      });
      existingDecors.forEach((d) => {
        const dist = Math.sqrt((d.x - x) ** 2 + (d.z - z) ** 2);
        if (dist < minDist) minDist = dist;
      });

      if (minDist > maxMinDist) {
        maxMinDist = minDist;
        bestX = x;
        bestZ = z;
      }
    }

    return { x: bestX, z: bestZ };
  };

  // Add Book
  const addBook = (title: string, author: string, genre: Genre, totalPages: number, coverUrl?: string) => {
    const bookId = `book-${Date.now()}`;
    const treeId = `tree-${Date.now()}`;

    // Map genre to tree type
    let treeType: TreeType = 'birch';
    if (genre === 'novel') treeType = 'sakura';
    else if (genre === 'science') treeType = 'pine';
    else if (genre === 'humanities') treeType = 'oak';
    else if (genre === 'business') treeType = 'maple';

    const newBook: Book = {
      id: bookId,
      title,
      author,
      genre,
      totalPages,
      currentPage: 0,
      progress: 0,
      status: 'reading',
      startDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      coverUrl: coverUrl || `https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=200&q=80`,
      vitality: 100,
      treeType
    };

    const coord = getRandomGridCoord(trees, decorations);
    const newTree: Tree = {
      id: treeId,
      bookId,
      type: treeType,
      growth: 0.0,
      vitality: 1.0,
      x: coord.x,
      z: coord.z,
      plantedAt: new Date().toISOString()
    };

    setBooks((prev) => [newBook, ...prev]);
    setTrees((prev) => [...prev, newTree]);

    // Best-effort backend sync: persist the book and plant a tree, then store
    // the returned ids on the local book. Failures are ignored (offline-first).
    if (isAuthenticated()) {
      void (async () => {
        try {
          const created = await treeApi.createBook({ title, author, genre, totalPage: totalPages, coverImageUrl: coverUrl });
          const tree = await treeApi.plantTree(created.id);
          setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, backendBookId: created.id, backendTreeId: tree.id } : b)));
        } catch {
          // backend unavailable — local state remains the source of truth
        }
      })();
    }

    // Play plant sound
    playPlant();

    // Update quest "Add book" or log progress
    const updatedQuests = quests.map((q) => {
      if (q.targetType === 'log_progress') {
        return { ...q, currentValue: q.currentValue + 1 };
      }
      return q;
    });
    setQuests(checkQuests(updatedQuests));

    // XP award
    setUser((prev) => addXP(50, { ...prev, points: prev.points + 10 }));
  };

  // Update Reading Progress (Revitalizes tree automatically)
  const updateBookProgress = (bookId: string, page: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const prevBook = books.find((b) => b.id === bookId);
    if (!prevBook) return;

    const pageDiff = Math.max(0, page - prevBook.currentPage);
    const newProgress = Math.min(100, Math.round((page / prevBook.totalPages) * 100));
    const newStatus = newProgress === 100 ? 'completed' : 'reading';

    // Best-effort backend sync of the reading record (when signed in & synced).
    if (isAuthenticated() && prevBook.backendTreeId && pageDiff > 0) {
      void treeApi.addReadingRecord(prevBook.backendTreeId, Math.min(prevBook.totalPages, page)).catch(() => {});
    }

    // Heartbeat/Revive check: If it was withered (<50% vitality) and is now updated, it's revived!
    const wasWithered = prevBook.vitality < 50;

    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          return {
            ...b,
            currentPage: Math.min(b.totalPages, page),
            progress: newProgress,
            status: newStatus,
            vitality: 100, // Restored to full vitality (Resuscitation)
            lastUpdated: new Date().toISOString()
          };
        }
        return b;
      })
    );

    setTrees((prev) =>
      prev.map((t) => {
        if (t.bookId === bookId) {
          return {
            ...t,
            growth: newProgress / 100,
            vitality: 1.0
          };
        }
        return t;
      })
    );

    // Streaks calculations
    let newStreak = user.streak;
    if (pageDiff > 0) {
      if (user.lastReadDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (user.lastReadDate === yesterdayStr) {
          newStreak += 1;
        } else if (user.lastReadDate !== todayStr) {
          // Restart streak
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }
    }

    // Badge Check on Complete
    const userBadges = [...user.badges];
    if (newProgress === 100 && prevBook.progress < 100) {
      // Trigger confetti!
      playLevelUp();
      (confetti as any)({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        scalar: 2.2,
        shapes: ['emoji'],
        shapeOptions: {
          emoji: {
            value: ['🌸', '🌱', '🍂', '💖', '🌟']
          }
        }
      });

      if (!userBadges.find((b) => b.id === 'badge-first-complete')) {
        userBadges.push({
          id: 'badge-first-complete',
          name: '완독의 기쁨',
          description: '처음으로 책 한 권을 완독하였습니다.',
          icon: '📚',
          unlockedAt: new Date().toISOString()
        });
      }
    } else if (pageDiff > 0) {
      // Did this update push the tree into a new visible growth stage?
      const prevStage = growthStage(prevBook.progress / 100);
      const newStage = growthStage(newProgress / 100);
      if (newStage > prevStage) {
        // A milestone! Sprout breaking soil or sapling becoming a full tree.
        playGrow();
        (confetti as any)({
          particleCount: 45,
          spread: 55,
          startVelocity: 28,
          origin: { y: 0.62 },
          scalar: 1.4,
          shapes: ['emoji'],
          shapeOptions: {
            emoji: { value: newStage === 1 ? ['🌱', '✨'] : ['🌿', '🍃', '✨'] }
          }
        });
      } else {
        // Regular reading update sound
        playPop();
      }
    }

    // Revived badge
    if (wasWithered && !userBadges.find((b) => b.id === 'badge-reviver')) {
      userBadges.push({
        id: 'badge-reviver',
        name: '피닉스 가드너',
        description: '시들어가는 나무를 정성스레 심폐소생하였습니다.',
        icon: '💖',
        unlockedAt: new Date().toISOString()
      });
    }

    // Update Quests
    const updatedQuests = quests.map((q) => {
      let val = q.currentValue;
      if (q.targetType === 'pages_today') {
        val += pageDiff;
      } else if (q.targetType === 'log_progress') {
        val += 1;
      } else if (q.targetType === 'streak') {
        val = newStreak;
      } else if (q.targetType === 'complete_book' && newProgress === 100 && prevBook.progress < 100) {
        val += 1;
      }
      return { ...q, currentValue: val };
    });

    setQuests(checkQuests(updatedQuests));

    // Award XP
    const xpEarned = pageDiff * 2 + (newProgress === 100 && prevBook.progress < 100 ? 150 : 0);
    const pointsEarned = Math.floor(pageDiff / 5) + (newProgress === 100 && prevBook.progress < 100 ? 50 : 0);

    setUser((prev) => {
      const nextUser = addXP(xpEarned, {
        ...prev,
        streak: newStreak,
        lastReadDate: todayStr,
        points: prev.points + pointsEarned,
        badges: userBadges
      });

      // Streak badge check
      const finalBadges = [...nextUser.badges];
      if (newStreak >= 5 && !finalBadges.find((b) => b.id === 'badge-streak-5')) {
        finalBadges.push({
          id: 'badge-streak-5',
          name: '독서 불꽃',
          description: '5일 연속으로 독서를 기록했습니다.',
          icon: '🔥',
          unlockedAt: new Date().toISOString()
        });
        nextUser.badges = finalBadges;
      }

      return nextUser;
    });
  };

  // Delete Book
  const deleteBook = (bookId: string) => {
    const target = books.find((b) => b.id === bookId);
    if (isAuthenticated() && target?.backendTreeId) {
      void treeApi.removeTree(target.backendTreeId).catch(() => {});
    }
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    setTrees((prev) => prev.filter((t) => t.bookId !== bookId));
    if (selectedBookId === bookId) setSelectedBookId(null);
  };

  // Claim Quest Reward
  const claimQuestReward = (questId: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest || !quest.completed || quest.rewardClaimed) return;

    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, rewardClaimed: true } : q))
    );

    // Play coin sound
    playCoin();

    setUser((prev) => ({
      ...prev,
      points: prev.points + quest.rewardPoints
    }));

    if (quest.rewardDecorationType) {
      // Auto place decoration at a random free spot on the board
      const coord = getRandomGridCoord(trees, decorations);
      const newDecor: Decoration = {
        id: `decor-${Date.now()}`,
        type: quest.rewardDecorationType,
        x: coord.x,
        z: coord.z,
        placedAt: new Date().toISOString()
      };
      setDecorations((prev) => [...prev, newDecor]);

      // Pop visual confetti for getting a decor!
      playCoin();
      (confetti as any)({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        scalar: 2.0,
        shapes: ['emoji'],
        shapeOptions: {
          emoji: {
            value: ['🎁', '🌟', '💖']
          }
        }
      });
    }
  };

  // Buy and Place decoration using points
  const placeDecoration = (type: DecorationType) => {
    const cost = DECOR_COST[type];
    if (user.points < cost) return;

    const coord = getRandomGridCoord(trees, decorations);
    const newDecor: Decoration = {
      id: `decor-${Date.now()}`,
      type,
      x: coord.x,
      z: coord.z,
      placedAt: new Date().toISOString()
    };

    setDecorations((prev) => [...prev, newDecor]);
    setUser((prev) => ({ ...prev, points: prev.points - cost }));

    playPlant();
    decorConfetti();
  };

  // Buy a decoration and drop it at a player-chosen tile (manual placement mode).
  const placeDecorationAt = (type: DecorationType, x: number, z: number) => {
    const cost = DECOR_COST[type];
    if (user.points < cost) return;

    const newDecor: Decoration = {
      id: `decor-${Date.now()}`,
      type,
      x,
      z,
      placedAt: new Date().toISOString()
    };

    setDecorations((prev) => [...prev, newDecor]);
    setUser((prev) => ({ ...prev, points: prev.points - cost }));
    setPendingPlacement(null);

    playPlant();
    decorConfetti();
  };

  const beginPlacement = (type: DecorationType) => {
    if (user.points < DECOR_COST[type]) return;
    setPendingPlacement(type);
  };

  const cancelPlacement = () => setPendingPlacement(null);

  // Remove decoration
  const removeDecoration = (id: string) => {
    setDecorations((prev) => prev.filter((d) => d.id !== id));
  };

  // Reposition a tree (drag & drop in the garden). Biome rules are enforced by the renderer.
  const moveTree = (id: string, x: number, z: number) => {
    setTrees((prev) => prev.map((t) => (t.id === id ? { ...t, x, z } : t)));
  };

  // Reposition a decoration (drag & drop in the garden).
  const moveDecoration = (id: string, x: number, z: number) => {
    setDecorations((prev) => prev.map((d) => (d.id === id ? { ...d, x, z } : d)));
  };

  // Water a friend's forest while visiting — a small social reward loop. Each
  // garden can be watered once per session to keep it from becoming a gold farm.
  const waterFriendForest = () => {
    if (!viewingSocialForest) return;
    const id = viewingSocialForest.id;
    if (wateredForests.has(id)) {
      setNotice(`이미 ${viewingSocialForest.userName} 님의 정원에 물을 주었어요 💧`);
      return;
    }
    setWateredForests((prev) => new Set(prev).add(id));
    setUser((prev) => ({ ...prev, points: prev.points + 10 }));
    playCoin();
    setNotice(`💧 ${viewingSocialForest.userName} 님의 정원에 물을 주었어요!  +10 G`);
  };

  // Trigger Revive Quest (for testing / demo purposes)
  const triggerReviveQuest = (bookId: string) => {
    // Simulates a manual mock update to trigger revival on demand if needed
    updateBookProgress(bookId, books.find((b) => b.id === bookId)!.currentPage + 1);
  };

  return (
    <AppContext.Provider
      value={{
        books,
        trees,
        decorations,
        user,
        quests,
        timeOfDay,
        weather,
        selectedBookId,
        socialForests: MOCK_SOCIAL_FORESTS,
        viewingSocialForest,
        addBook,
        updateBookProgress,
        deleteBook,
        claimQuestReward,
        placeDecoration,
        placeDecorationAt,
        pendingPlacement,
        beginPlacement,
        cancelPlacement,
        removeDecoration,
        moveTree,
        moveDecoration,
        setTimeOfDay,
        setWeather,
        setSelectedBookId,
        setViewingSocialForest,
        triggerReviveQuest,
        biome,
        setBiome,
        notice,
        dismissNotice,
        autoEnv,
        setAutoEnv,
        waterFriendForest
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
