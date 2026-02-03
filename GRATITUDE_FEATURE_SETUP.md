# Three Good Things +1 機能追加ガイド

## 概要

「Three Good Things」から「Three Good Things +1」へコンセプトを変更しました。
「+1」は「感謝」を意味し、毎日3つの良いことに加えて、1つの感謝を記録できるようになりました。

---

## 実装された変更

### 1. エントリーフォーム
- 新しいフィールド: **「今日の感謝 (+1)」**
- 3つの良いことの後に表示
- 必須入力項目

### 2. エントリーカード表示
- 感謝が緑色のバッジ（+1）で表示されます
- 「今日の感謝」というラベル付き
- 3つの良いことと視覚的に区別

### 3. データエクスポート
- **JSON形式**: `gratitude` フィールドを含む
- **CSV形式**: "Gratitude" カラムを含む

### 4. サイト全体のタイトル更新
- ヘッダー: "Three Good Things +1"
- ランディングページ: "Three Good Things +1"
- ページタイトル: "Three Good Things +1"
- 説明文: "毎日3つの良いこと + 1つの感謝を記録するアプリ"

---

## セットアップ手順

### ステップ1: データベースマイグレーション実行

1. **Supabase Dashboard にアクセス**
   - https://supabase.com にログイン
   - プロジェクトを選択

2. **SQL Editor で実行**
   - 左サイドバーから「SQL Editor」を選択
   - 「New query」をクリック
   - 以下のSQLをコピー＆ペースト:

```sql
-- Add gratitude field to entries table
ALTER TABLE entries
ADD COLUMN gratitude TEXT;

-- Add comment to describe the new field
COMMENT ON COLUMN entries.gratitude IS 'Today''s gratitude - the +1 in Three Good Things +1';
```

3. **実行**
   - 「Run」ボタンをクリック
   - 成功メッセージを確認

### ステップ2: ローカルで動作確認

```bash
# 開発サーバー起動
npm run dev

# ブラウザで http://localhost:3000 にアクセス
```

### ステップ3: 機能テスト

1. **新しいエントリー作成**
   - ダッシュボードで新しいエントリーを作成
   - 3つの良いこと + 1つの感謝を入力
   - 保存

2. **表示確認**
   - エントリーカードで感謝が緑色のバッジ（+1）で表示されることを確認
   - カレンダーやタイムラインでも正しく表示されることを確認

3. **エクスポート確認**
   - エクスポートページでJSON/CSV形式でダウンロード
   - 感謝フィールドが含まれていることを確認

### ステップ4: Vercelにデプロイ

```bash
# ビルド確認
npm run build

# Vercelにプッシュ（自動デプロイ）
git add .
git commit -m "Add gratitude feature - Three Good Things +1"
git push
```

---

## データ構造

### 更新されたEntry型:

```typescript
interface Entry {
  id: string
  user_id: string
  entry_date: string
  thing_one: string
  thing_two: string
  thing_three: string
  gratitude: string | null  // 新規追加
  tags: string[]
  image_url: string | null
  image_path: string | null
  created_at: string
  updated_at: string
}
```

### JSON エクスポート例:

```json
[
  {
    "date": "2026-02-03",
    "things": [
      "朝のコーヒーが美味しかった",
      "プロジェクトが完成した",
      "友人と楽しく話せた"
    ],
    "gratitude": "家族の健康に感謝",
    "tags": []
  }
]
```

### CSV エクスポート例:

```csv
Date,Thing 1,Thing 2,Thing 3,Gratitude,Tags
2026-02-03,"朝のコーヒーが美味しかった","プロジェクトが完成した","友人と楽しく話せた","家族の健康に感謝",""
```

---

## 注意事項

### 既存データについて
- ✅ 既存のエントリーは影響を受けません
- ✅ 古いエントリーの `gratitude` フィールドは `NULL` になります
- ✅ EntryCard は `gratitude` が存在する場合のみ表示します（条件分岐済み）

### バリデーション
- ✅ 感謝フィールドは必須入力です（新規作成時）
- ✅ 空欄で保存しようとするとエラーメッセージが表示されます

### タグ機能
- ✅ 感謝フィールドでも `#タグ` が使用できます
- ✅ 3つの良いこと + 感謝の全てのテキストからタグが自動抽出されます

---

## トラブルシューティング

### 「gratitudeカラムが存在しません」エラー

**原因**: データベースマイグレーションが未実行

**解決方法**:
1. Supabase Dashboard → SQL Editor
2. マイグレーションSQLを実行（上記参照）

### 「gratitude is required」エラー

**原因**: 感謝フィールドが空欄

**解決方法**:
- 感謝フィールドに何か入力してください（必須項目です）

### 古いエントリーで感謝が表示されない

**原因**: 正常動作（古いエントリーには gratitude フィールドがありません）

**解決方法**:
- これは正常な動作です
- 古いエントリーを編集して感謝を追加することもできます

---

## 次のステップ

1. ✅ データベースマイグレーション実行
2. ✅ ローカルでテスト
3. ✅ Vercelにデプロイ
4. 📋 `VERCEL_URL_CHANGE.md` を参照してVercel URLを変更（オプション）

---

## 関連ドキュメント

- `VERCEL_URL_CHANGE.md` - Vercel URL変更ガイド
- `review.md` - 実装記録と技術詳細
