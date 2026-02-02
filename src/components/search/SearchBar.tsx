'use client'

import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  debounceMs?: number
}

export default function SearchBar({
  onSearch,
  placeholder = '検索...',
  debounceMs = 300
}: SearchBarProps) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, debounceMs, onSearch])

  return (
    <Input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder={placeholder}
      className="w-full"
    />
  )
}
