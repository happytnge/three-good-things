# Three Good Things +1 - レビュー・改善記録

## ✅ 完了した機能

---

## SNS機能実装（ソーシャルネットワーク化）
**実装日**: 2026-02-03

### 概要
個人用ジャーナリングアプリを、SNS（ソーシャルネットワーク）機能を持つアプリに変更しました。

### 主な機能
1. **パブリックタイムライン**: 全ユーザーの公開エントリーを表示（Twitter風）
2. **いいね機能**: エントリーにいいねできる
3. **フォロー機能**: ユーザーをフォローできる
4. **ユーザー検索**: 名前やメールでユーザーを検索
5. **通知機能**: いいね・フォローの通知
6. **プライバシー**: すべてのエントリーはデフォルトで公開

### ページ別の挙動

#### 1. 自分の投稿のみにアクセスできるページ
- `/dashboard` - ダッシュボード（自分のエントリー管理）
- `/dashboard/calendar` - カレンダービュー（自分のエントリー）
- `/dashboard/search` - 検索（自分のエントリー）
- `/dashboard/export` - エクスポート（自分のエントリー）

#### 2. 他のユーザーの投稿も、自分の投稿も見れるページ
- `/dashboard/timeline` - パブリックタイムライン（全ユーザーの公開エントリー）
- `/dashboard/users/[userId]` - ユーザープロフィール（そのユーザーのエントリー）
- `/dashboard/discover` - ユーザー発見（おすすめユーザー一覧）
- `/dashboard/notifications` - 通知ページ

---

### 実装内容詳細

#### Phase 1: データベーススキーマ（5つのマイグレーション）

**Migration 006: Follows テーブル**
- ユーザー間のフォロー関係を管理
- UNIQUE(follower_id, following_id) で重複防止
- CHECK制約で自己フォロー防止
- CASCADE DELETE でユーザー削除時に関連データも削除

**Migration 007: Likes テーブル**
- エントリーへのいいねを管理
- UNIQUE(user_id, entry_id) で重複いいね防止
- CASCADE DELETE でエントリー削除時にいいねも削除

**Migration 008: Notifications テーブル**
- いいね・フォロー通知を管理
- notification_type ENUM ('like', 'follow')
- 既読/未読状態を管理

**Migration 009: RLSポリシー更新（⚠️ 最重要）**
- **既存のプライベートポリシーを削除**
- **全エントリーとプロフィールを全認証ユーザーに公開**
- SELECT: 全員閲覧可能
- INSERT/UPDATE/DELETE: 所有者のみ（変更なし）

**Migration 010: 通知トリガー**
- いいね追加時に通知自動作成
- いいね削除時に通知自動削除
- フォロー時に通知自動作成
- アンフォロー時に通知自動削除

#### Phase 2: TypeScript型定義

新規追加された型:
- `ProfileWithStats` - 統計付きプロフィール（フォロワー数、フォロー中数、エントリー数）
- `Follow` - フォロー関係
- `Like` - いいね
- `Notification` - 通知
- `EntryWithSocialData` - ソーシャルデータ付きエントリー（いいね数、いいね状態、プロフィール情報）
- `UserSearchResult` - ユーザー検索結果

#### Phase 3-4: フック実装（8ファイル）

**新規作成されたフック:**
1. `useLikes.ts`
   - `fetchLikeCount()` - いいね数取得
   - `checkUserLiked()` - いいね済みかチェック
   - `likeEntry()` - いいねする
   - `unlikeEntry()` - いいね解除
   - `toggleLike()` - いいねトグル

2. `useFollows.ts`
   - `fetchFollowers()` - フォロワー一覧取得
   - `fetchFollowing()` - フォロー中一覧取得
   - `fetchFollowerCount()` - フォロワー数取得
   - `fetchFollowingCount()` - フォロー中数取得
   - `checkIsFollowing()` - フォロー中かチェック
   - `followUser()` - フォローする
   - `unfollowUser()` - フォロー解除
   - `toggleFollow()` - フォロートグル

3. `useNotifications.ts`
   - `fetchNotifications()` - 通知一覧取得
   - `fetchUnreadCount()` - 未読通知数取得
   - `markAsRead()` - 既読にする
   - `markAllAsRead()` - すべて既読にする

4. `useUsers.ts`
   - `searchUsers()` - ユーザー検索
   - `fetchUserProfile()` - 公開プロフィール取得
   - `fetchSuggestedUsers()` - おすすめユーザー取得

**更新されたフック:**
1. `useEntries.ts`
   - `fetchPublicTimeline()` - パブリックタイムライン取得（全ユーザーのエントリー + いいね情報）

2. `useProfile.ts`
   - `fetchPublicProfile()` - 統計付き公開プロフィール取得
   - `fetchUserEntries()` - ユーザーのエントリー取得

#### Phase 5: ソーシャルコンポーネント（4ファイル）

1. **LikeButton.tsx**
   - ハートアイコンでいいね表示
   - いいね数表示
   - クリックでトグル
   - アニメーション付き
   - 楽観的UI更新（即座に反映）

2. **FollowButton.tsx**
   - フォロー/フォロー中ボタン
   - UserPlus/UserMinus アイコン
   - クリックでトグル
   - 楽観的UI更新

3. **NotificationList.tsx**
   - 通知一覧表示
   - 未読カウント表示
   - 通知タイプ別アイコン（Heart/UserPlus）
   - 相対時刻表示（"3分前"）
   - クリックで既読化
   - "すべて既読にする"ボタン

4. **UserSearchBar.tsx**
   - リアルタイム検索（300msデバウンス）
   - ドロップダウン結果表示
   - アバター + 名前 + メール表示
   - フォロー状態表示
   - クリックでユーザープロフィールへ遷移

#### Phase 6: 既存コンポーネント更新（3ファイル）

1. **EntryCard.tsx**
   - 著者情報セクション追加（アバター + 名前 + メール）
   - ソーシャル機能セクション追加（LikeButton）
   - `showAuthor` prop で表示/非表示切替
   - `showSocial` prop で表示/非表示切替
   - 型変更: `Entry` → `EntryWithSocialData`

2. **TimelineView.tsx**
   - 型変更: `Entry[]` → `EntryWithSocialData[]`
   - `showAuthor` と `showSocial` props 追加
   - TimelineItem に props を渡す

3. **TimelineItem.tsx**
   - 型変更: `Entry` → `EntryWithSocialData`
   - `showAuthor` と `showSocial` props を EntryCard に渡す

#### Phase 7: ページ実装（4ファイル）

1. **dashboard/timeline/page.tsx**（更新）
   - `fetchEntries()` → `fetchPublicTimeline()` に変更
   - 全ユーザーのエントリーを表示
   - ページネーション実装（20件ずつ）
   - 著者情報とソーシャル機能を表示（showAuthor, showSocial）
   - 編集・削除アクションは非表示

2. **dashboard/users/[userId]/page.tsx**（新規作成）
   - パブリックプロフィール表示
   - アバター（大）+ 名前 + メール
   - 統計表示（エントリー数、フォロワー数、フォロー中数）
   - FollowButton（他ユーザーの場合）
   - "プロフィールを編集"ボタン（自分の場合）
   - 最近のエントリー10件表示

3. **dashboard/notifications/page.tsx**（新規作成）
   - NotificationList コンポーネント配置
   - 通知一覧表示
   - 既読/未読管理

4. **dashboard/discover/page.tsx**（新規作成）
   - UserSearchBar コンポーネント（ユーザー検索）
   - おすすめユーザー一覧（20人）
   - 各ユーザーに FollowButton 配置
   - グリッドレイアウト（モバイル1列、デスクトップ2列）

#### Phase 8: ナビゲーション更新（1ファイル）

**Header.tsx**
1. ナビゲーションに「ユーザー発見」を追加
   - アイコン: Users
   - パス: `/dashboard/discover`

2. 通知ベルアイコン追加
   - アイコン: Bell
   - パス: `/dashboard/notifications`
   - 未読カウントバッジ表示（赤色、9以上は"9+"）
   - 30秒ごとに未読数をポーリング

3. useNotifications フックをインポート
   - `fetchUnreadCount()` で未読通知数を取得
   - `useEffect` で自動更新設定

---

### 技術仕様

#### データベース
- **PostgreSQL** (Supabase)
- **Row Level Security (RLS)** で権限管理
- **Foreign Key Constraints** で参照整合性
- **UNIQUE Constraints** で重複防止
- **CHECK Constraints** で無効データ防止
- **CASCADE DELETE** で関連データ自動削除
- **Triggers** で通知自動作成/削除

#### フロントエンド
- **楽観的UI更新**: いいね・フォローは即座に反映
- **デバウンス**: 検索入力は300msデバウンス
- **ポーリング**: 通知数は30秒ごとに更新
- **ページネーション**: タイムラインは20件ずつ
- **レスポンシブデザイン**: モバイル・デスクトップ対応

#### セキュリティ
- **RLS による厳格な権限管理**
  - SELECT: 全認証ユーザーが閲覧可能
  - INSERT/UPDATE/DELETE: 所有者のみ
- **自己フォロー防止**: CHECK制約
- **重複防止**: UNIQUE制約（いいね、フォロー）

---

### ファイル一覧

#### 新規作成ファイル（25ファイル）

**マイグレーション（5ファイル）**
- `supabase/migrations/006_create_follows_table.sql`
- `supabase/migrations/007_create_likes_table.sql`
- `supabase/migrations/008_create_notifications_table.sql`
- `supabase/migrations/009_update_rls_for_public_access.sql` ⭐ 最重要
- `supabase/migrations/010_create_notification_triggers.sql`

**フック（4ファイル）**
- `src/lib/hooks/useLikes.ts`
- `src/lib/hooks/useFollows.ts`
- `src/lib/hooks/useNotifications.ts`
- `src/lib/hooks/useUsers.ts`

**コンポーネント（4ファイル）**
- `src/components/social/LikeButton.tsx`
- `src/components/social/FollowButton.tsx`
- `src/components/social/NotificationList.tsx`
- `src/components/social/UserSearchBar.tsx`

**ページ（3ファイル）**
- `src/app/dashboard/users/[userId]/page.tsx`
- `src/app/dashboard/notifications/page.tsx`
- `src/app/dashboard/discover/page.tsx`

#### 更新ファイル（9ファイル）

**型定義（1ファイル）**
- `src/lib/types/index.ts` - ソーシャル機能の型追加

**フック（2ファイル）**
- `src/lib/hooks/useEntries.ts` - `fetchPublicTimeline()` 追加
- `src/lib/hooks/useProfile.ts` - `fetchPublicProfile()`, `fetchUserEntries()` 追加

**コンポーネント（4ファイル）**
- `src/components/entries/EntryCard.tsx` - 著者情報とソーシャル機能追加
- `src/components/timeline/TimelineView.tsx` - 型更新、props追加
- `src/components/timeline/TimelineItem.tsx` - 型更新、props追加
- `src/components/layout/Header.tsx` - 通知ベル、ユーザー発見追加

**ページ（1ファイル）**
- `src/app/dashboard/timeline/page.tsx` - パブリックタイムラインへ変更

**ドキュメント（1ファイル）**
- `review.md` - 本ファイル

---

### 重要な注意事項

#### ⚠️ データベースマイグレーションが必須
このコード変更だけでは動作しません。**Supabase Dashboard で5つのマイグレーションを実行する必要があります**。

#### ⚠️ RLSポリシー変更の影響（Migration 009）
- **既存のすべてのエントリーとプロフィールが全ユーザーに公開されます**
- **この変更は不可逆的です**
- プライベートなジャーナルからパブリックなSNSへの移行を意味します

#### 推奨手順
1. ✅ コード実装完了（本実装）
2. ⏭ **データベースマイグレーション実行**（次のステップ）
   - Supabase Dashboard にログイン
   - SQL Editor を開く
   - 006 → 010 の順番でマイグレーションを実行
3. ⏭ ローカルでテスト
4. ⏭ Vercel にデプロイ

---

### テストチェックリスト

#### 機能テスト
- [ ] パブリックタイムラインで全ユーザーのエントリーが表示される
- [ ] いいねボタンが動作する（追加・削除・カウント）
- [ ] フォローボタンが動作する（追加・削除）
- [ ] いいね時に通知が作成される
- [ ] フォロー時に通知が作成される
- [ ] 通知ページで通知一覧が表示される
- [ ] 通知を既読にできる
- [ ] 通知ベルに未読カウントが表示される
- [ ] ユーザー検索が動作する
- [ ] おすすめユーザーが表示される
- [ ] ユーザープロフィールが表示される
- [ ] ユーザーのエントリー一覧が表示される

#### ページ別表示確認
- [ ] `/dashboard` - 自分のエントリーのみ表示
- [ ] `/dashboard/calendar` - 自分のエントリーのみ表示
- [ ] `/dashboard/search` - 自分のエントリーのみ表示
- [ ] `/dashboard/export` - 自分のエントリーのみ表示
- [ ] `/dashboard/timeline` - 全ユーザーのエントリー表示
- [ ] `/dashboard/users/[userId]` - 指定ユーザーのエントリー表示
- [ ] `/dashboard/discover` - おすすめユーザー表示
- [ ] `/dashboard/notifications` - 通知一覧表示

#### セキュリティテスト
- [ ] RLSポリシーが正しく動作する
- [ ] 他ユーザーのエントリーを編集・削除できない
- [ ] 自己フォローができない
- [ ] 重複いいねができない
- [ ] 重複フォローができない

---

## ナビゲーションバーのアイコン化
**実装日**: 2026-02-03

#### 実装内容:
1. **プロフィールテキストの削除**
   - プロフィールアイコンの横に表示されていた「プロフィール」テキストを削除
   - アイコンのみの表示に変更
   - マウスオーバー時に「プロフィール」と表示（title属性）

2. **ナビゲーションボタンのアイコン化**
   - テキストボタンから直感的なアイコンに変更
   - 各アイコンの対応:
     - ダッシュボード → LayoutDashboard アイコン
     - カレンダー → Calendar アイコン
     - タイムライン → Clock アイコン
     - ユーザー発見 → Users アイコン
     - 検索 → Search アイコン
     - エクスポート → Download アイコン

3. **ツールチップ表示**
   - すべてのナビゲーションアイコンに `title` 属性を追加
   - マウスオーバー時に各機能名を表示

4. **レスポンシブ対応**
   - デスクトップ（md以上）: アイコン + テキスト表示
   - モバイル: アイコンのみ表示（スペース効率向上）

#### 技術仕様:
- **アイコンライブラリ**: lucide-react
- **アイコンサイズ**: デスクトップ 20px、モバイル 20px
- **ツールチップ**: HTML標準の `title` 属性を使用

#### 更新ファイル:
- `src/components/layout/Header.tsx` - ナビゲーションバー全体を更新

---

## Three Good Things +1 へのコンセプト変更
**実装日**: 2026-02-03（前回実装済み）

#### 実装内容:
1. **「今日の感謝」フィールドを追加**
   - エントリーフォームに「今日の感謝 (+1)」入力欄を追加
   - 3つの良いことの後に表示
   - 必須入力項目として設定

2. **エントリーカードの表示更新**
   - 感謝フィールドを緑色のバッジ（+1）で表示
   - 3つの良いことと区別するため、セパレーターで区切り
   - 「今日の感謝」というラベル付き

3. **データエクスポート対応**
   - JSON形式: `gratitude` フィールドを追加
   - CSV形式: 「Gratitude」カラムを追加

4. **サイトタイトル変更**
   - ヘッダー: "Three Good Things +1"
   - ランディングページ: "Three Good Things +1"
   - メタデータ: "毎日3つの良いこと + 1つの感謝を記録するアプリ"

---

## プロフィール画像機能
**実装日**: 2026-02-03（前回実装済み）

#### 実装内容:
1. **プロフィールページでの画像登録**
   - カメラアイコンボタンで画像アップロード
   - 画像プレビュー表示（24x24px、円形）
   - 削除ボタン（Xアイコン）で画像削除
   - 対応形式: JPG, PNG, GIF, WEBP（最大2MB）
   - 自動リサイズ: 300x300px（正方形、中央クロップ）

2. **ナビゲーションバーへのアイコン表示**
   - プロフィールリンクにアバター表示（8x8px、円形）
   - 画像未設定時はデフォルトのUserアイコン表示
   - パス変更時に自動リロード

---

## 開発メモ
- ナビゲーションアイコンは lucide-react を使用（軽量でツリーシェイク可能）
- デスクトップではアイコン + テキスト表示で、分かりやすく視認性を確保
- モバイルではアイコンのみでスペース効率を最大化
- title属性によるツールチップは全ブラウザで標準サポート
- 楽観的UI更新により、いいね・フォローは即座に反映され、UX向上
- 通知は30秒ごとのポーリングで更新（将来的にはSupabase Realtimeでリアルタイム化可能）
- RLSポリシーにより、セキュアなデータアクセスを実現

---

## SNS機能実装後の修正（ページ別表示分け）
**実装日**: 2026-02-03

### 問題
RLSポリシーを変更して全エントリーを公開にしたため、`fetchEntries()` と `useSearch` が全ユーザーのエントリーを取得してしまい、ダッシュボード・カレンダー・検索・エクスポートページで他のユーザーのデータが表示される問題が発生。

### 修正内容
フロントエンド側で明示的に現在のユーザーのエントリーのみをフィルタリングするように修正。

#### 更新ファイル:
1. **`src/lib/hooks/useEntries.ts`**
   - `fetchEntries()` に `.eq('user_id', user.id)` を追加
   - `fetchEntryByDate()` に `.eq('user_id', user.id)` を追加
   - 自分のエントリーのみを取得するように修正

2. **`src/lib/hooks/useSearch.ts`**
   - `searchEntries()` に `.eq('user_id', user.id)` を追加
   - 検索も自分のエントリーのみを対象にするように修正

#### 結果:
- ✅ `/dashboard` - 自分のエントリーのみ表示
- ✅ `/dashboard/calendar` - 自分のエントリーのみ表示
- ✅ `/dashboard/search` - 自分のエントリーのみ検索
- ✅ `/dashboard/export` - 自分のエントリーのみエクスポート
- ✅ `/dashboard/timeline` - 全ユーザーのエントリー表示（`fetchPublicTimeline()` を使用）
