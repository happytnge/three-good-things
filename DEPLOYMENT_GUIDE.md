# Vercelデプロイガイド

## デプロイ前の準備

### 1. 環境変数の確認

現在の`.env.local`ファイルに以下の環境変数が設定されていることを確認：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Gitリポジトリの準備

プロジェクトをGitHubにプッシュ（まだの場合）：

```bash
# Gitリポジトリを初期化（まだの場合）
git init

# .gitignoreの確認
cat .gitignore
# .env.local が含まれていることを確認

# すべてのファイルをステージング
git add .

# コミット
git commit -m "Initial commit: Three Good Things app"

# GitHubリポジトリを作成し、リモートを追加
git remote add origin https://github.com/your-username/three-good-things.git

# プッシュ
git branch -M main
git push -u origin main
```

## Vercelへのデプロイ手順

### ステップ1: Vercelアカウントの作成

1. [Vercel](https://vercel.com) にアクセス
2. 「Sign Up」をクリック
3. GitHubアカウントで登録（推奨）

### ステップ2: プロジェクトのインポート

1. Vercelダッシュボードで「Add New...」→ 「Project」をクリック
2. GitHubリポジトリを選択
3. 「three-good-things」リポジトリを探して「Import」をクリック

### ステップ3: プロジェクト設定

**Framework Preset:** Next.js（自動検出）

**Root Directory:** `./`（デフォルト）

**Build Command:** `npm run build`（デフォルト）

**Output Directory:** `.next`（デフォルト）

### ステップ4: 環境変数の設定

「Environment Variables」セクションで以下を追加：

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key` |

**重要:** 本番用の値を使用してください。開発環境と同じSupabaseプロジェクトを使用するか、本番用の別プロジェクトを作成することを推奨します。

### ステップ5: デプロイ

1. 「Deploy」ボタンをクリック
2. ビルドプロセスを監視（約1-3分）
3. デプロイ完了後、本番URLが表示される

## デプロイ後の設定

### 1. Supabaseの設定更新

Supabaseダッシュボードで：

1. **Authentication** → **URL Configuration**
2. **Site URL** を Vercel の本番 URL に変更
   - 例: `https://three-good-things.vercel.app`

3. **Redirect URLs** に以下を追加：
   - `https://three-good-things.vercel.app/auth/callback`
   - `https://three-good-things.vercel.app/**`

### 2. 本番環境でのテスト

デプロイされたURLにアクセスして、以下を確認：

- [ ] サインアップができる
- [ ] ログインができる
- [ ] エントリーの作成・編集・削除ができる
- [ ] カレンダービューが動作する
- [ ] タイムラインビューが動作する
- [ ] 検索機能が動作する
- [ ] データエクスポートが動作する

### 3. カスタムドメインの設定（オプション）

Vercelダッシュボードで：

1. プロジェクト → **Settings** → **Domains**
2. カスタムドメインを追加
3. DNSレコードを設定（CNAMEまたはAレコード）

## 継続的デプロイ（CI/CD）

GitHubリポジトリに変更をプッシュすると、Vercelが自動的に：

- プルリクエストごとにプレビューデプロイを作成
- `main` ブランチへのマージで本番環境を自動デプロイ

## トラブルシューティング

### ビルドエラー

**症状:** デプロイ時にビルドが失敗する

**解決策:**
1. ローカルで `npm run build` を実行して、ビルドエラーがないか確認
2. `package.json` の依存関係を確認
3. Vercelの環境変数が正しく設定されているか確認

### 環境変数エラー

**症状:** 「Supabase URL is required」などのエラー

**解決策:**
1. Vercel ダッシュボード → **Settings** → **Environment Variables**
2. すべての必要な環境変数が設定されているか確認
3. 変更後、再デプロイが必要

### 認証エラー

**症状:** ログインできない、リダイレクトエラー

**解決策:**
1. Supabaseの **Site URL** と **Redirect URLs** を確認
2. Vercelの本番URLが正しく設定されているか確認

## パフォーマンス最適化

デプロイ後、以下を確認：

1. **Lighthouse スコア**
   - Chrome DevTools → Lighthouse でスコアを確認
   - 目標: Performance 90+, Accessibility 90+

2. **Vercel Analytics**（オプション）
   - Vercel ダッシュボードで Analytics を有効化
   - ページ読み込み時間、Core Web Vitals を監視

## セキュリティチェックリスト

- [ ] `.env.local` が `.gitignore` に含まれている
- [ ] 本番環境でSupabase RLSが有効になっている
- [ ] すべてのAPIキーが環境変数として保護されている
- [ ] HTTPSが有効（Vercelはデフォルトで有効）

## 完了！

デプロイが成功したら：

1. 本番URLをチームやユーザーと共有
2. アプリケーションの使用状況を監視
3. フィードバックを収集して改善を継続

## コマンドクイックリファレンス

```bash
# ローカルでビルドテスト
npm run build

# ローカルで本番モードを起動
npm run start

# 型チェック
npm run type-check

# リント
npm run lint

# Vercel CLIを使用したデプロイ（オプション）
npm install -g vercel
vercel login
vercel
```

## リソース

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
