import { apiRequest } from './http';

// Mirrors the Read-Forest tree/reading endpoints. These are used to sync the
// reading loop (plant → log pages → remove) to the backend when signed in.

export interface ApiBookCreate {
  title: string;
  author: string;
  genre?: string;
  totalPage: number;
  coverImageUrl?: string;
  isbn?: string;
}

export interface ApiBookResponse {
  id: number;
  title: string;
  author: string;
  genre: string | null;
  totalPage: number;
  coverImageUrl: string | null;
  isbn: string | null;
}

export interface ApiTree {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  bookGenre: string | null;
  bookTotalPage: number;
  currentPage: number;
  growthRate: number; // 0..100
  vitality: 'HEALTHY' | 'WITHERED' | 'DEAD';
  isCompleted: boolean;
}

// POST /api/books — persist a book, returns it with an id.
export function createBook(body: ApiBookCreate): Promise<ApiBookResponse> {
  return apiRequest<ApiBookResponse>('/books', { method: 'POST', body });
}

// POST /api/trees — plant a tree for the given (persisted) book id.
export function plantTree(bookId: number): Promise<ApiTree> {
  return apiRequest<ApiTree>('/trees', { method: 'POST', body: { bookId } });
}

// POST /api/trees/{treeId}/records — log reading progress (new current page).
export function addReadingRecord(treeId: number, currentPage: number): Promise<unknown> {
  return apiRequest(`/trees/${treeId}/records`, { method: 'POST', body: { currentPage } });
}

// GET /api/trees — list my trees.
export function listMyTrees(): Promise<ApiTree[]> {
  return apiRequest<ApiTree[]>('/trees');
}

// DELETE /api/trees/{treeId}
export function removeTree(treeId: number): Promise<unknown> {
  return apiRequest(`/trees/${treeId}`, { method: 'DELETE' });
}
