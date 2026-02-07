# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: Three Good Things +1

A social journaling application where users record three good things + one gratitude daily, with social features like likes, follows, and public timelines.

## Tech Stack

- **Frontend:** Next.js 15 (App Router) + TypeScript + React 19
- **Styling:** Tailwind CSS + lucide-react icons
- **Backend:** Supabase (Auth + PostgreSQL + Storage + RLS)
- **Deployment:** Vercel

## Commands

```bash
# Development server
npm run dev

# Production build (TypeScript compilation + Next.js build)
npm run build

# Production server
npm run start

# Linter
npm run lint
```

## Architecture Overview

### Dual-Mode Application: Private + Social

This app operates in **two distinct modes** depending on the page:

1. **Private Pages** (user sees only their own data):
   - `/dashboard` - Dashboard
   - `/dashboard/calendar` - Calendar view
   - `/dashboard/search` - Search
   - `/dashboard/export` - Export

2. **Social Pages** (user sees all public data):
   - `/dashboard/timeline` - Public timeline (all users' entries)
   - `/dashboard/users/[userId]` - User profiles
   - `/dashboard/discover` - User discovery
   - `/dashboard/notifications` - Notifications

### Database Schema (Supabase PostgreSQL)

**Core Tables:**
- `profiles` - User profiles (display_name, avatar_url, email)
- `entries` - Daily entries (thing_one, thing_two, thing_three, gratitude, image_url, tags[])
  - UNIQUE constraint: (user_id, entry_date) - one entry per day per user

**Social Tables:**
- `follows` - Follow relationships
  - UNIQUE(follower_id, following_id), CHECK(follower_id != following_id)
- `likes` - Entry likes
  - UNIQUE(user_id, entry_id)
- `notifications` - Like/follow notifications
  - Type: ENUM('like', 'follow')
  - Auto-created/deleted via database triggers

**Storage Buckets:**
- `entry-images` - Entry images (auto-resized)
- `avatars` - Profile avatars (300x300px, cropped)

### Row Level Security (RLS) Design

**Critical RLS Pattern:**

```sql
-- Profiles & Entries:
SELECT: authenticated users can view ALL (public)
INSERT/UPDATE/DELETE: users can only modify THEIR OWN

-- Follows & Likes:
SELECT: authenticated users can view ALL
INSERT/DELETE: users can only manage THEIR OWN

-- Notifications:
SELECT/UPDATE: users can only access THEIR OWN
INSERT: system triggers only
```

**Key Implication:** Frontend must explicitly filter data by `user_id` for private pages, even though RLS allows viewing all data.

## Critical Data Fetching Patterns

### Private Data (Own Entries Only)

```typescript
// MUST filter by user_id explicitly
const { data } = await supabase
  .from('entries')
  .select('*')
  .eq('user_id', user.id)  // ← CRITICAL: filters to own data
```

Used in: `useEntries.fetchEntries()`, `useSearch.searchEntries()`

### Public Data (All Users)

```typescript
// Fetch all entries with profile/social data
const { data: entries } = await supabase
  .from('entries')
  .select('*')  // No user_id filter

// Then separately fetch profiles and join manually
// (Supabase foreign key syntax is unreliable)
```

Used in: `useEntries.fetchPublicTimeline()`

### Avoiding N+1 Queries

**Pattern:** Fetch related data in bulk, then map manually

```typescript
// Get unique user IDs
const userIds = [...new Set(entries.map(e => e.user_id))]

// Bulk fetch profiles
const { data: profiles } = await supabase
  .from('profiles')
  .select('*')
  .in('id', userIds)

// Map manually
const profileMap = new Map(profiles.map(p => [p.id, p]))
const enrichedEntries = entries.map(e => ({
  ...e,
  profile: profileMap.get(e.user_id)
}))
```

Used in: `fetchPublicTimeline()`, `fetchNotifications()`

## Custom Hooks Architecture

### Data Management Hooks
- `useEntries` - Entry CRUD + `fetchPublicTimeline()`
- `useSearch` - Search/filter entries
- `useProfile` - Profile management + `fetchPublicProfile()`

### Social Hooks
- `useLikes` - Like/unlike + counts (optimistic UI)
- `useFollows` - Follow/unfollow + counts (optimistic UI)
- `useNotifications` - Notification list + unread count (30s polling)
- `useUsers` - User search + suggested users

### Pattern: Optimistic UI Updates

```typescript
const toggleLike = async (entryId, currentlyLiked) => {
  // 1. Update UI immediately (optimistic)
  setLiked(!currentlyLiked)
  setCount(currentlyLiked ? count - 1 : count + 1)

  // 2. Update server
  const result = await supabase.from('likes').insert(...)

  // 3. Rollback on failure
  if (!result.success) {
    setLiked(currentlyLiked)
    setCount(count)
  }
}
```

## Key Features & Implementation

### Entry Uniqueness Constraint
- Database: UNIQUE(user_id, entry_date)
- UI: Calendar shows existing entry, dashboard prevents duplicate dates
- Forms: Auto-populate if entry exists for selected date

### Tag Extraction
- Auto-extract from all text fields (thing_one, thing_two, thing_three, gratitude)
- Pattern: `#hashtag` → stored in `tags[]` array
- Utility: `extractTagsFromTexts()` in `lib/utils/tagUtils.ts`

### Image Upload Flow
1. User selects image → auto-resize to max 1200x1200px
2. Upload to `entry-images` bucket with path: `{user_id}/{timestamp}.jpg`
3. Store `image_url` (public URL) and `image_path` (storage path)
4. Calendar: Show 32x32px thumbnail on days with images
5. On delete: Remove from storage using `image_path`

### Notification System
- **Database triggers** auto-create/delete notifications
- **Frontend polling** every 30s for unread count (Header bell icon)
- Click notification → mark as read → navigate to entry/profile

## Common Gotchas & Solutions

### 1. Supabase Foreign Key Joins
**Problem:** `.select('*, profiles!fkey_name(*)')` syntax is unreliable

**Solution:** Always fetch separately and join manually (see "Avoiding N+1 Queries")

### 2. TypeScript: `.single()` vs `.maybeSingle()`
**Problem:** `.single().catch()` causes TypeScript errors

**Solution:** Use `.maybeSingle()` when record might not exist
```typescript
// ❌ Bad
.single().then(({ data }) => !!data).catch(() => false)

// ✅ Good
.maybeSingle().then(({ data }) => !!data)
```

### 3. Private vs Public Data Fetching
**Problem:** All authenticated users can SELECT all entries (RLS allows it)

**Solution:** Frontend explicitly filters:
- Private pages: `.eq('user_id', user.id)`
- Public pages: No filter (show all)

### 4. Calendar Image Display
**Problem:** `entry.image_url` can be null

**Solution:** Always check existence before rendering:
```typescript
{hasImage && entry.image_url && (
  <img src={entry.image_url} alt="..." />
)}
```

## Environment Variables

Required in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Migration Strategy

Migrations in `supabase/migrations/`:
- 001-005: Core schema
- 006-010: Social features (follows, likes, notifications, RLS updates, triggers)

**v2 files** (`*_v2.sql`): Safe versions with `DROP IF EXISTS` for re-running

Execute in Supabase Dashboard → SQL Editor in order (001 → 010)

## Development Workflow

1. **Local dev:** `npm run dev` (http://localhost:3000)
2. **Database changes:** Create migration SQL → run in Supabase Dashboard
3. **Type safety:** Update `src/lib/types/index.ts` after schema changes
4. **Git push:** Auto-deploys to Vercel (builds must pass TypeScript checks)

## Privacy & Security Notes

- **Email addresses:** Never display to other users (only display_name or "ユーザー")
- **Own profile exception:** User can see their own email in `/dashboard/profile`
- **RLS enforcement:** All DB operations respect RLS automatically
- **Image uploads:** Limited to 2MB, auto-resize, stored in Supabase Storage
