# Three Good Things

毎日3つの良いことを記録するシンプルでモダンなWebアプリケーション

![Three Good Things](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)

## 特徴

ポジティブ心理学の実践手法「Three Good Things」を実装したWebアプリケーションです。

### 主要機能

- ✅ **エントリー管理** - 毎日3つの良いことを投稿・編集・削除
- ✅ **カレンダービュー** - 月間カレンダーでエントリーを視覚的に確認
- ✅ **タイムラインビュー** - 時系列でエントリーを閲覧
- ✅ **検索・フィルター** - テキスト検索、日付範囲、タグでフィルタリング
- ✅ **データエクスポート** - JSON/CSV形式でデータをダウンロード
- ✅ **ダークモード** - ライト/ダークテーマの切り替え
- ✅ **レスポンシブデザイン** - モバイル・タブレット・デスクトップ対応
- ✅ **タグ機能** - `#hashtag` 形式で自動タグ抽出

## 技術スタック

- **Frontend:** Next.js 15 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS (ダークモード対応)
- **Backend:** Supabase (認証 + PostgreSQL)
- **Date Handling:** date-fns
- **Icons:** lucide-react
- **Deployment:** Vercel

## スクリーンショット

### ダッシュボード
今日のエントリーを作成・編集できます。

### カレンダービュー
月間カレンダーでエントリーのある日を一目で確認。

### タイムラインビュー
すべてのエントリーを時系列で閲覧。

### 検索
テキスト検索、日付範囲、タグでフィルタリング。

## セットアップ

### 前提条件

- Node.js 18以上
- npm または yarn
- Supabaseアカウント

### 1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/three-good-things.git
cd three-good-things
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセス
2. 新しいプロジェクトを作成
3. Project Settings > API から以下を取得:
   - Project URL
   - Anon (public) key

### 4. 環境変数の設定

`.env.local.example`をコピーして`.env.local`を作成:

```bash
cp .env.local.example .env.local
```

`.env.local`を編集:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. データベーススキーマの作成

Supabase Dashboard > SQL Editor で以下を実行:

```bash
cat supabase/migrations/001_initial_schema.sql
```

このSQLスクリプトは以下を作成します:
- `profiles` テーブル (ユーザープロフィール)
- `entries` テーブル (エントリー)
- インデックス
- Row Level Security (RLS) ポリシー
- トリガー

### 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く

## 使い方

1. **新規登録** - メールアドレスとパスワードでアカウント作成
2. **ログイン** - 登録したアカウントでログイン
3. **エントリー作成** - ダッシュボードで今日の3つの良いことを記録
4. **閲覧** - カレンダーやタイムラインで過去のエントリーを確認
5. **検索** - キーワードやタグで特定のエントリーを検索
6. **エクスポート** - データをJSON/CSV形式でバックアップ

## プロジェクト構造

```
tgt/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── auth/                # 認証ページ
│   │   └── dashboard/           # メインアプリ
│   │       ├── calendar/        # カレンダービュー
│   │       ├── timeline/        # タイムラインビュー
│   │       ├── search/          # 検索
│   │       └── export/          # データエクスポート
│   ├── components/              # Reactコンポーネント
│   │   ├── auth/               # 認証関連
│   │   ├── entries/            # エントリー管理
│   │   ├── calendar/           # カレンダー
│   │   ├── timeline/           # タイムライン
│   │   ├── search/             # 検索
│   │   ├── export/             # エクスポート
│   │   ├── ui/                 # 再利用可能UI
│   │   └── layout/             # レイアウト
│   ├── lib/
│   │   ├── supabase/           # Supabaseクライアント
│   │   ├── hooks/              # カスタムフック
│   │   ├── utils/              # ユーティリティ
│   │   └── types/              # TypeScript型定義
│   └── contexts/               # Reactコンテキスト
├── supabase/
│   └── migrations/             # データベースマイグレーション
└── public/                     # 静的ファイル
```

## デプロイ

### Vercelへのデプロイ

1. GitHubリポジトリにプッシュ
2. [Vercel](https://vercel.com)でプロジェクトをインポート
3. 環境変数を設定:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. デプロイ

### Supabase本番設定

- 本番用Supabaseプロジェクトを作成
- RLSポリシーを再確認
- メール認証設定を確認

## 開発

### コマンド

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

### 主要な技術的決定

- **1日1エントリー制約:** データベースの UNIQUE 制約で保証
- **タグ自動抽出:** `#hashtag` 形式を自動検出して配列に保存
- **Row Level Security:** すべてのテーブルでRLS有効、ユーザーは自分のデータのみアクセス可能
- **楽観的UI更新:** ユーザー体験向上のため、DB更新前にUIを即座に更新

## ライセンス

MIT

## クレジット

Claude Code (claude.ai/code) を使用して開発されました。
