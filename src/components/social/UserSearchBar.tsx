'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import Link from 'next/link'
import { useUsers } from '@/lib/hooks/useUsers'
import type { UserSearchResult } from '@/lib/types'
import { cn } from '@/lib/utils/cn'

export default function UserSearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserSearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const { searchUsers, loading } = useUsers()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceTimeout = useRef<NodeJS.Timeout>()

  // 外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // デバウンス付き検索
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }

    if (query.trim().length === 0) {
      setResults([])
      setIsOpen(false)
      return
    }

    debounceTimeout.current = setTimeout(async () => {
      const data = await searchUsers(query.trim())
      setResults(data)
      setIsOpen(data.length > 0)
    }, 300)

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
    }
  }, [query, searchUsers])

  const handleClear = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl">
      {/* 検索バー */}
      <div
        className={cn(
          'relative flex items-center gap-3 px-4 py-3 bg-white rounded-lg border-2 transition-all',
          isFocused ? 'border-blue-500 shadow-md' : 'border-gray-200'
        )}
      >
        <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="ユーザーを検索（名前またはメール）"
          className="flex-1 outline-none text-gray-900 placeholder-gray-400"
        />
        {query && (
          <button
            onClick={handleClear}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
        {loading && (
          <div className="flex-shrink-0 w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* 検索結果ドロップダウン */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {results.map((user) => (
              <Link
                key={user.id}
                href={`/dashboard/users/${user.id}`}
                onClick={() => {
                  setIsOpen(false)
                  setIsFocused(false)
                }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                {/* アバター */}
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.display_name || 'ユーザー'}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                )}

                {/* 情報 */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {user.display_name || 'ユーザー'}
                  </p>
                </div>

                {/* フォロー状態 */}
                <div className="flex-shrink-0">
                  {user.is_following && (
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                      フォロー中
                    </span>
                  )}
                  {user.is_followed_by && (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded ml-1">
                      フォロワー
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 検索結果なし */}
      {isOpen && query.trim() && !loading && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center text-gray-500">
          ユーザーが見つかりませんでした
        </div>
      )}
    </div>
  )
}
