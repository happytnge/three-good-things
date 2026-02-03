http://localhost:3000/dashboard

## 新機能リクエスト

### 「今日のイメージ」機能

**要件:**
- 1日1ファイル、画像をアップロードできる
- 必須ではなく、アップロードがなくてもOK
- ダッシュボード、タイムラインでそのイメージが確認できる
- カレンダーで、そのイメージの縮小イメージが表示される（理想）
- まずは画像のみ対応（動画は将来的に）

**実装計画:**

1. **データベース変更**
   - `entries` テーブルに `image_url` カラムを追加（TEXT, nullable）
   - `entries` テーブルに `image_path` カラムを追加（TEXT, nullable）

2. **Supabase Storage設定**
   - `entry-images` バケットを作成
   - 認証済みユーザーのみアップロード可能
   - 公開読み取り可能（または認証済みのみ）
   - 画像サイズ制限: 5MB
   - 対応形式: JPG, PNG, GIF, WEBP

3. **EntryForm機能追加**
   - 画像アップロードボタン
   - プレビュー表示
   - 画像削除機能
   - アップロード中のローディング表示
   - エラーハンドリング

4. **表示機能**
   - EntryCard: 画像を表示（最大幅設定）
   - Dashboard: 今日のエントリーの画像を表示
   - Timeline: 各エントリーの画像を表示
   - Calendar: 画像がある日にアイコン/サムネイル表示

5. **画像最適化**
   - アップロード時にリサイズ（クライアント側）
   - サムネイル生成（Supabase Edge Functions または クライアント側）

**実装ステップ:**
1. データベーススキーマ更新
2. Supabase Storageバケット作成
3. 画像アップロード機能実装
4. EntryFormに画像アップロードUI追加
5. EntryCardに画像表示追加
6. カレンダーにサムネイル表示追加

## ✅ 実装完了

「今日のイメージ」機能の実装が完了しました！

### 実装内容:

1. **データベース**
   - `entries` テーブルに `image_url`, `image_path` カラムを追加
   - マイグレーションファイル作成: `002_add_image_to_entries.sql`

2. **Supabase Storage**
   - `entry-images` バケット設定用SQLを作成: `003_create_storage_bucket.sql`
   - RLSポリシーでセキュリティ確保

3. **画像処理**
   - `imageUtils.ts`: アップロード、削除、リサイズ、バリデーション
   - 最大5MB、JPG/PNG/GIF/WEBP対応
   - 自動リサイズ（最大1200px）

4. **UI更新**
   - **EntryForm**: 画像アップロードボタン、プレビュー、削除機能
   - **EntryCard**: 画像表示
   - **useEntries**: 画像アップロード/削除処理を統合

### 次の手順:

📖 **`IMAGE_FEATURE_SETUP.md`** を参照してSupabaseの設定を行ってください

1. Supabase SQL Editorで2つのマイグレーションを実行
2. Storageバケットが作成されていることを確認
3. ローカルで動作テスト

設定完了後、画像アップロード機能が使えるようになります！