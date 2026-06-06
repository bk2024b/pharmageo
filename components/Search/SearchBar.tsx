// components/Search/SearchBar.tsx

'use client'

import { useState, useEffect, useRef } from 'react'

type SearchBarProps = {
  onSearch: (query: string) => void
  placeholder?: string
  debounceMs?: number
  loading?: boolean
}

export const SearchBar = ({
  onSearch,
  placeholder = 'Rechercher un médicament, DCI...',
  debounceMs = 400,
  loading = false,
}: SearchBarProps) => {
  const [value, setValue] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.trim().length === 0) {
      onSearch('')
      return
    }

    if (value.trim().length < 2) return

    debounceRef.current = setTimeout(() => {
      onSearch(value.trim())
    }, debounceMs)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value, debounceMs, onSearch])

  const handleClear = () => {
    setValue('')
    onSearch('')
  }

  return (
    <div className="relative w-full">
      {/* Icône loupe */}
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        {loading ? (
          <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-green-500 animate-spin" />
        ) : (
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        )}
      </div>

      {/* Input */}
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="
          w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200
          bg-white text-sm text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent
          transition-all duration-200
        "
      />

      {/* Bouton clear */}
      {value.length > 0 && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Effacer la recherche"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}