# Vercel URLの変更方法

現在のURL: `https://three-good-things-rosy.vercel.app`
希望するURL: `https://3gt1-rosy.vercel.app`

## 方法1: Vercel Dashboardで直接変更（推奨）

### 手順:

1. **Vercelにログイン**
   - https://vercel.com にアクセス
   - ログイン

2. **プロジェクトを選択**
   - ダッシュボードから「three-good-things」プロジェクトをクリック

3. **Settings に移動**
   - プロジェクトページ上部の「Settings」タブをクリック

4. **Project Nameを変更**
   - 左サイドバーの「General」セクションを選択
   - 「Project Name」フィールドを見つける
   - `three-good-things` を `3gt1` に変更
   - 「Save」ボタンをクリック

5. **確認**
   - 数秒後、新しいURL `https://3gt1-rosy.vercel.app` でアクセス可能になります
   - 古いURL（three-good-things）も自動的にリダイレクトされます

## 方法2: カスタムドメインを設定（オプション）

もし `3gt1.com` や `3gt1.app` などの独自ドメインを使いたい場合:

### 手順:

1. **ドメインを購入**
   - お名前.com、Google Domains、Namecheap などでドメインを購入

2. **Vercel Dashboardで設定**
   - プロジェクトページで「Settings」→「Domains」を選択
   - 「Add Domain」をクリック
   - 購入したドメイン名を入力（例: `3gt1.com`）
   - 指示に従ってDNS設定を更新

3. **DNS設定**
   - ドメインレジストラのDNS設定画面で以下を追加:
     - Type: `CNAME`
     - Name: `@` または `www`
     - Value: `cname.vercel-dns.com`

## 注意事項

- ✅ プロジェクト名を変更しても、既存のデプロイメントには影響ありません
- ✅ 環境変数やビルド設定はそのまま維持されます
- ✅ 古いURLは自動的に新しいURLにリダイレクトされます
- ⚠️ プロジェクト名は一度変更すると、24時間は元に戻せません
- ⚠️ カスタムドメインを使う場合、年間費用（約$10-20）がかかります

## トラブルシューティング

### 「このプロジェクト名はすでに使われています」エラーが出る場合:
- 別のユーザーが既に `3gt1` を使用している可能性があります
- 代替案:
  - `3gt1-app`
  - `three-gt1`
  - `tgt1`
  - カスタムドメインを使用

### 変更後にアクセスできない場合:
- 数分待ってから再度アクセス
- ブラウザのキャッシュをクリア (Ctrl+Shift+R / Cmd+Shift+R)
- Vercel Dashboard で Deployments タブを確認し、最新のデプロイが成功しているか確認
