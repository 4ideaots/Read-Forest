import { apiRequest } from './http';

export interface Health {
  status: string;
  database: string;
}

// GET /api/health — backend + DB connection status (throws if 503/unreachable).
export function health(): Promise<Health> {
  return apiRequest<Health>('/health');
}
