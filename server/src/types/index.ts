import { Role } from '@prisma/client';

declare module 'express-session' {
  interface SessionData {
    userId: string;
    userRole: Role;
  }
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
