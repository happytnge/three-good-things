# Three Good Things +1 - レビュー・改善記録

## ✅ 完了した機能

### Three Good Things +1 へのコンセプト変更
**実装日**: 2026-02-03

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

#### 技術仕様:
- **データベース**: `gratitude TEXT` カラムを entries テーブルに追加
- **バリデーション**: 必須入力（空欄不可）
- **タグ抽出**: 感謝フィールドからも #タグ を抽出

#### 作成・更新ファイル:
- `supabase/migrations/005_add_gratitude_to_entries.sql` - DBスキーマ更新
- `src/lib/types/index.ts` - Entry, EntryFormData に gratitude 追加
- `src/components/entries/EntryForm.tsx` - 感謝入力フィールド追加
- `src/components/entries/EntryCard.tsx` - 感謝表示エリア追加
- `src/lib/hooks/useEntries.ts` - gratitude の保存・更新処理
- `src/lib/utils/validationUtils.ts` - gratitude のバリデーション
- `src/lib/utils/exportUtils.ts` - JSON/CSVエクスポートに gratitude 追加
- `src/components/layout/Header.tsx` - タイトル更新
- `src/app/layout.tsx` - メタデータ更新
- `src/app/page.tsx` - ランディングページ更新

#### セットアップ手順:
```bash
# Supabaseマイグレーション実行
# Supabase Dashboard → SQL Editor で以下を実行:
# - supabase/migrations/005_add_gratitude_to_entries.sql
```

---

### Vercel URL変更ガイド
**ドキュメント作成**: 2026-02-03

`VERCEL_URL_CHANGE.md` を作成しました。

#### 変更手順（概要）:
1. Vercel Dashboard にログイン
2. プロジェクト「three-good-things」を選択
3. Settings → General → Project Name
4. `three-good-things` を `3gt1` に変更
5. Save

**新しいURL**: `https://3gt1-rosy.vercel.app`

詳細は `VERCEL_URL_CHANGE.md` を参照してください。

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
- 「感謝」フィールドは3つの良いことと同じくタグ抽出対象
- EntryCard で緑色のバッジ（+1）を使用して感謝を強調
- 既存のエントリーは gratitude が NULL の可能性あり（EntryCard で条件分岐）
- Vercel URL変更は24時間のクールダウン期間あり
