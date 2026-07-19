import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Search, ChevronDown } from 'lucide-react'

type Option = {
  value: string
  label: string
}

type Props = {
  options: Option[]
  value: string | null
  onChange: (value: string | null) => void
  placeholder: string
  className?: string
  additionalComponent?: React.ReactNode
}

export const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder,
  className,
  additionalComponent
}: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setSearch('')
    }
  }, [isOpen])

  const selectedOpt = options.find((opt) => opt.value === value)
  const filteredOpts = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div ref={containerRef} className={cn('relative inline-block w-full', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring text-left transition-all',
          isOpen && 'border-blue-500 ring-1 ring-blue-500'
        )}
      >
        <span className={cn(!selectedOpt && 'text-gray-500')}>
          {selectedOpt ? selectedOpt.label : placeholder}
        </span>
        <ChevronDown
          className="h-4 w-4 opacity-50 transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-80 w-full overflow-auto rounded-md border bg-white p-1 text-popover-foreground shadow-md animate-in fade-in-50 slide-in-from-top-1">
          <div className="flex items-center border-b px-2 pb-1 mb-1">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              type="text"
              placeholder="Cari..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-8 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOpts.length === 0 ? (
              <div className="py-2 text-center text-sm text-gray-500">Tidak ada hasil.</div>
            ) : (
              filteredOpts.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'relative flex w-full select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:!bg-blue-100/90 cursor-pointer transition-colors',
                    value === opt.value && 'bg-blue-50 font-semibold text-blue-600'
                  )}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
          {additionalComponent && <div className="border-t mt-1 pt-1">{additionalComponent}</div>}
        </div>
      )}
    </div>
  )
}
