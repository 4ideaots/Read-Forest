import { apiRequest } from './http';

// DELETE /api/accounts/me — permanently delete the logged-in user's account.
export function deleteAccount(): Promise<void> {
  return apiRequest<void>('/accounts/me', { method: 'DELETE' });
}
