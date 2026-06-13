import { apiRequest } from './http';
import type { BookSearchResponse } from './types';

// GET /api/books/search — Kakao-backed book search (requires auth).
export async function searchBooks(
  query: string,
  page = 1,
  size = 10
): Promise<BookSearchResponse> {
  const params = new URLSearchParams({ query, page: String(page), size: String(size) });
  return apiRequest<BookSearchResponse>(`/books/search?${params.toString()}`);
}
