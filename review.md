http://localhost:3000/dashboard/calendar

１．カレンダーに登録されているデータが、１日ずれています。2月1日のデータが、2月2日のカレンダーに表示されています。

## 修正完了

### 1. カレンダー日付のズレ問題（✅ 修正済み）

**問題:** カレンダーに表示されるエントリーの日付が1日ずれていた

**原因:** `Date.toISOString().split('T')[0]` を使用していたため、UTCタイムゾーンに変換され、日本時間（UTC+9）との時差で日付がずれていた

**修正内容:**
- `dateUtils.ts` に `toLocalDateString()` 関数を追加
- すべての `toISOString().split('T')[0]` を `toLocalDateString()` に置き換え
- 影響したファイル:
  - `src/components/calendar/CalendarView.tsx`
  - `src/components/entries/EntryForm.tsx`
  - `src/app/dashboard/calendar/page.tsx`
  - `src/app/dashboard/export/page.tsx`

**結果:** ローカルタイムゾーンで正しく日付が表示されるようになりました