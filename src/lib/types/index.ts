// TypeScript型定義

export interface Profile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Entry {
  id: string
  user_id: string
  entry_date: string // ISO date string (YYYY-MM-DD)
  thing_one: string
  thing_two: string
  thing_three: string
  tags: string[]
  created_at: string
  updated_at: string
}

export interface EntryFormData {
  entry_date: string
  thing_one: string
  thing_two: string
  thing_three: string
}

export interface SearchFilters {
  query?: string
  dateFrom?: string
  dateTo?: string
  tags?: string[]
}

export interface ExportOptions {
  format: 'json' | 'csv'
  dateFrom?: string
  dateTo?: string
}

export type Theme = 'light' | 'dark'
