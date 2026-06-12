'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Option {
  value: string
  label: string
  sublabel?: string
}

interface SearchableSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  icon?: React.ReactNode
  label: string
  description?: string
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  disabled = false,
  icon,
  label,
  description,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Get selected option
  const selectedOption = options.find(opt => opt.value === value)

  // Filter options based on search
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    option.sublabel?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <div className="bg-black/30 border border-white/5 rounded-lg p-5 hover:border-[#F3A81D]/30 transition-colors">
      {/* Label */}
      <label className="flex items-center gap-2 text-xs font-black text-[#F3A81D] uppercase tracking-wider mb-3">
        {icon}
        {label}
      </label>

      {/* Custom Dropdown */}
      <div ref={containerRef} className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "w-full bg-[#050508]/60 border border-white/10 rounded-lg px-4 py-3 text-sm font-bold text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between",
            isOpen ? "border-[#F3A81D] ring-2 ring-[#F3A81D]/20" : "hover:border-white/20",
            selectedOption ? "text-white" : "text-[#8A92A6]"
          )}
        >
          <span className="truncate">
            {selectedOption ? (
              <span>
                {selectedOption.label}
                {selectedOption.sublabel && (
                  <span className="text-[#8A92A6] ml-2">({selectedOption.sublabel})</span>
                )}
              </span>
            ) : (
              placeholder
            )}
          </span>
          <ChevronDown className={cn(
            "w-4 h-4 text-[#8A92A6] transition-transform flex-shrink-0",
            isOpen && "rotate-180"
          )} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-[#0D0D12] border border-white/10 rounded-lg shadow-2xl overflow-hidden max-h-[400px] flex flex-col">
            {/* Search Input */}
            <div className="p-3 border-b border-white/10 sticky top-0 bg-[#0D0D12]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A92A6]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-[#8A92A6] focus:outline-none focus:border-[#F3A81D] focus:ring-2 focus:ring-[#F3A81D]/20"
                />
              </div>
            </div>

            {/* Options List */}
            <div className="overflow-y-auto flex-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "w-full px-4 py-3 text-left text-sm transition-colors flex items-center justify-between group",
                      option.value === value
                        ? "bg-[#F3A81D]/10 text-[#F3A81D]"
                        : "text-[#C1C5D0] hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <span className="flex-1 truncate">
                      <span className="font-semibold">{option.label}</span>
                      {option.sublabel && (
                        <span className="text-[#8A92A6] text-xs ml-2 block">
                          {option.sublabel}
                        </span>
                      )}
                    </span>
                    {option.value === value && (
                      <Check className="w-4 h-4 text-[#F3A81D] flex-shrink-0 ml-2" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-[#8A92A6] text-sm">
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs text-[#8A92A6] mt-2">{description}</p>
      )}
    </div>
  )
}
