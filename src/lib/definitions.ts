import type { ReactNode } from 'react'

import type AppRoute from '@/lib/app-route'

export interface AppEnv {
  NODE_ENV: 'development' | 'production'
  VITE_API_BASENAME: string
  VITE_API_FILE_BASENAME: string
}

export interface Link {
  content: ReactNode
  href?: string | AppRoute
}

export interface PaginationData {
  page: number
  count: number
  size: number
  items: number
}

export type Nullable<T> = {
  [P in keyof T]: T[P] | null
}

export interface PaginatedResponse<T> {
  items: T[]
  totalItems: number
}

export interface Pagination {
  page?: number
  take?: number
}

export interface FileDto {
  fileName: string
  base64Body: string
}

export interface ImageFile {
  file: File
  body: string
}
