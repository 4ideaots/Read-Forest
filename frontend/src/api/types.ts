// Shapes mirrored from the Read-Forest backend DTOs.

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface SignupResponse {
  id: number;
  username: string;
  nickname: string;
}

export interface ApiBook {
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  contents: string;
  coverImageUrl: string;
}

export interface BookSearchResponse {
  books: ApiBook[];
  totalCount: number;
  end: boolean; // serialized from `isEnd` (Jackson drops the "is" prefix)
}

// Raised when the backend returns a non-2xx response.
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
