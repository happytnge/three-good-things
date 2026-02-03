# 「今日のイメージ」機能 セットアップ手順

この機能を有効にするには、Supabaseで以下の手順を実行してください。

## 1. データベースマイグレーションの実行

Supabaseダッシュボードで以下の手順を実行:

### 手順:
1. [Supabase Dashboard](https://app.supabase.com) にアクセス
2. プロジェクトを選択
3. 左サイドバーから **SQL Editor** を選択
4. **New query** をクリック

### マイグレーション 1: 画像カラム追加

以下のSQLを実行:

```sql
-- Add image columns to entries table
ALTER TABLE entries
ADD COLUMN image_url TEXT,
ADD COLUMN image_path TEXT;

-- Add comment to explain the columns
COMMENT ON COLUMN entries.image_url IS 'Public URL of the uploaded image';
COMMENT ON COLUMN entries.image_path IS 'Storage path for the image file';
```

**実行後:** "Success. No rows returned" と表示されればOK

### マイグレーション 2: Storageバケット作成とポリシー設定

以下のSQLを実行:

```sql
-- Create storage bucket for entry images
INSERT INTO storage.buckets (id, name, public)
VALUES ('entry-images', 'entry-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'entry-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own images
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'entry-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'entry-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'entry-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to all images
CREATE POLICY "Public can read images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'entry-images');
```

**実行後:** "Success. No rows returned" と表示されればOK

## 2. Storageバケットの確認

1. 左サイドバーから **Storage** を選択
2. `entry-images` バケットが作成されていることを確認
3. バケット設定:
   - **Public**: ✅ Yes (画像の公開読み取りを許可)
   - **File size limit**: 5MB (デフォルトでOK)
   - **Allowed MIME types**: デフォルトでOK

## 3. 動作確認

### ローカル環境でテスト:

1. 開発サーバーが起動していることを確認: `npm run dev`
2. http://localhost:3000/dashboard にアクセス
3. エントリー作成フォームで「画像を選択」ボタンをクリック
4. 画像をアップロード
5. エントリーを保存
6. 画像が表示されることを確認

### 確認項目:

- [ ] エントリー作成時に画像をアップロードできる
- [ ] 画像プレビューが表示される
- [ ] 画像を削除できる
- [ ] エントリー保存後、ダッシュボードで画像が表示される
- [ ] タイムラインで画像が表示される
- [ ] エントリー編集時に既存の画像が表示される
- [ ] 画像を変更できる
- [ ] エントリー削除時に画像も削除される

## トラブルシューティング

### 画像がアップロードできない

**原因1:** Storageポリシーが正しく設定されていない
- **解決:** 上記のマイグレーション2を再実行

**原因2:** バケットが作成されていない
- **解決:** Storageダッシュボードで `entry-images` バケットを手動作成

**原因3:** ファイルサイズが大きすぎる
- **解決:** 5MB以下の画像を使用（アプリ側で自動リサイズされます）

### 画像が表示されない

**原因1:** バケットが公開設定されていない
- **解決:** Storage → entry-images → Settings → Public を有効化

**原因2:** 画像URLが正しくない
- **解決:** ブラウザのコンソールでエラーを確認

## セキュリティ確認

✅ **実装済みのセキュリティ機能:**

1. **RLS (Row Level Security)**: ユーザーは自分のフォルダにのみアップロード可能
2. **ファイルサイズ制限**: 5MB
3. **ファイル形式制限**: JPG, PNG, GIF, WEBP のみ
4. **画像リサイズ**: アップロード時に最大1200pxにリサイズ
5. **自動削除**: エントリー削除時に画像も自動削除

## 次のステップ

画像機能が正常に動作したら:

1. [ ] 本番環境（Vercel）にデプロイ
2. [ ] 本番のSupabaseでも同じマイグレーションを実行
3. [ ] 本番環境で動作確認

## 完了！

セットアップが完了したら、このファイルは削除してもOKです。
