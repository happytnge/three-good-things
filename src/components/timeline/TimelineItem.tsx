import EntryCard from '@/components/entries/EntryCard'
import type { Entry, EntryWithSocialData } from '@/lib/types'

interface TimelineItemProps {
  entry: EntryWithSocialData
  onEdit?: (entry: Entry) => void
  onDelete?: (id: string) => void
  showAuthor?: boolean
  showSocial?: boolean
}

export default function TimelineItem({
  entry,
  onEdit,
  onDelete,
  showAuthor = false,
  showSocial = false,
}: TimelineItemProps) {
  return (
    <div className="relative pl-8 pb-8">
      {/* タイムライン線 */}
      <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-300" />

      {/* タイムラインドット */}
      <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-blue-600 border-4 border-white" />

      {/* エントリーカード */}
      <EntryCard
        entry={entry}
        onEdit={onEdit}
        onDelete={onDelete}
        showAuthor={showAuthor}
        showSocial={showSocial}
      />
    </div>
  )
}
