import { apiRequest } from './http';

export interface ApiQuest {
  questId: number;
  title: string;
  description: string;
  questType: 'DAILY' | 'WEEKLY' | 'CHALLENGE';
  targetType: string;
  targetValue: number;
  progress: number;
  rewardPoints: number;
  rewardDecorationType: string | null;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'REWARD_CLAIMED';
}

export interface ApiRewardClaim {
  questId: number;
  message: string;
  rewardPoints: number;
  rewardDecorationType: string | null;
}

// GET /api/quests — backend-authoritative quests for the user (auto daily/weekly reset).
export function getQuests(): Promise<ApiQuest[]> {
  return apiRequest<ApiQuest[]>('/quests');
}

// POST /api/quests/progress — report a reading action toward quests.
export function reportProgress(targetType: string, amount: number, absolute = false): Promise<void> {
  return apiRequest<void>('/quests/progress', { method: 'POST', body: { targetType, amount, absolute } });
}

// POST /api/quests/{questId}/rewards/claim — claim a completed quest's reward.
export function claimReward(questId: number): Promise<ApiRewardClaim> {
  return apiRequest<ApiRewardClaim>(`/quests/${questId}/rewards/claim`, { method: 'POST' });
}
