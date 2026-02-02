# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: Three Good Things

シンプルでモダンな「Three Good Things」投稿サイト - 毎日3つの良いことを記録するWebアプリケーション

## Tech Stack

- **Frontend:** Next.js 15 (App Router) + TypeScript + React 19
- **Styling:** Tailwind CSS (ダークモード対応)
- **Backend:** Supabase (認証 + PostgreSQL)
- **Deployment:** Vercel

## Commands

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm run start

# リンター実行
npm run lint
```

## Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router (ページとルート)
│   ├── auth/              # 認証ページ (login, signup)
│   └── dashboard/         # メインアプリ (calendar, timeline, search, export)
├── components/            # Reactコンポーネント
│   ├── auth/             # 認証関連
│   ├── entries/          # エントリー管理
│   ├── calendar/         # カレンダービュー
│   ├── timeline/         # タイムラインビュー
│   ├── search/           # 検索・フィルター
│   ├── export/           # データエクスポート
│   ├── ui/               # 再利用可能UIコンポーネント
│   └── layout/           # レイアウトコンポーネント
├── lib/
│   ├── supabase/         # Supabaseクライアント
│   ├── hooks/            # カスタムフック
│   ├── utils/            # ユーティリティ関数
│   └── types/            # TypeScript型定義
└── contexts/             # Reactコンテキスト
```

### Database Schema (Supabase)

**profiles** - ユーザープロフィール
- id, email, display_name, avatar_url, created_at, updated_at

**entries** - エントリー (1日1エントリー制約)
- id, user_id, entry_date, thing_one, thing_two, thing_three, tags[], created_at, updated_at

**Row Level Security (RLS):** 全テーブルで有効化、ユーザーは自分のデータのみアクセス可能

## Key Patterns

### Authentication
- Supabase Authを使用
- クライアント: `useAuth` フック
- サーバー: `createClient()` from `lib/supabase/server.ts`
- ミドルウェアで保護ルートをチェック

### Data Fetching
- カスタムフック: `useEntries`, `useSearch`
- サーバーコンポーネントで初期データ取得
- クライアントコンポーネントでインタラクティブな操作

### State Management
- React Context (ThemeContext)
- カスタムフック (useEntries, useAuth, useSearch)
- URL検索パラメータ (検索フィルター)

### Styling
- Tailwind CSS (ユーティリティファースト)
- ダークモード: `dark:` プレフィックス
- `cn()` ヘルパー関数でクラス結合

## Environment Variables

必須の環境変数 (`.env.local`):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Features

1. **認証:** メール/パスワード認証、セッション管理
2. **エントリー管理:** CRUD操作、1日1エントリー
3. **カレンダービュー:** 月間カレンダーでエントリー閲覧
4. **タイムラインビュー:** 時系列でエントリー表示
5. **検索・フィルター:** テキスト検索、日付範囲、タグフィルター
6. **データエクスポート:** JSON/CSV形式でダウンロード
7. **ダークモード:** ライト/ダーク切替
8. **レスポンシブデザイン:** モバイル・タブレット・デスクトップ対応

## Development Notes

- すべてのデータベース操作でRLSポリシーを尊重
- エントリー作成時に `user_id` を必ず指定
- タグは `#hashtag` 形式で自動抽出
- 日付は `YYYY-MM-DD` 形式で統一
