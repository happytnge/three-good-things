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
  gratitude: string | null
  tags: string[]
  image_url: string | null
  image_path: string | null
  created_at: string
  updated_at: string
}

export interface EntryFormData {
  entry_date: string
  thing_one: string
  thing_two: string
  thing_three: string
  gratitude: string
  image?: File | null
  existing_image_url?: string | null
  existing_image_path?: string | null
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

// Social feature types

export interface ProfileWithStats extends Profile {
  follower_count?: number
  following_count?: number
  entry_count?: number
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface Like {
  id: string
  user_id: string
  entry_id: string
  created_at: string
}

export type NotificationType = 'like' | 'follow'

export interface Notification {
  id: string
  recipient_id: string
  actor_id: string
  type: NotificationType
  entry_id: string | null
  read: boolean
  created_at: string
  actor?: Profile
  entry?: Entry
}

export interface EntryWithSocialData extends Entry {
  profile?: Profile
  like_count?: number
  liked_by_user?: boolean
}

export interface UserSearchResult {
  id: string
  display_name: string | null
  email: string
  avatar_url: string | null
  is_following?: boolean
  is_followed_by?: boolean
}
