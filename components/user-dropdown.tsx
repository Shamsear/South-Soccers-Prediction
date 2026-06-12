'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User, LogOut, ChevronDown, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LogoutButton } from './logout-button'

interface UserDropdownProps {
  username: string
  isAdmin: boolean
  avatarUrl?: string | null
}

export function UserDropdown({ username, isAdmin, avatarUrl }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className={cn(
          "flex items-center gap-3 px-3.5 py-2 rounded-lg transition-all duration-200 group",
          isOpen 
            ? "bg-white/10 text-[#F3A81D]" 
            : "text-[#C1C5D0] hover:text-[#F3A81D] hover:bg-white/5"
        )}
      >
        {/* Avatar */}
        <div className={cn(
          "w-10 h-10 rounded-lg bg-gradient-to-br from-[#1D1D2C] to-[#16162A] border-2 flex items-center justify-center transition-all shadow-lg overflow-hidden",
          isOpen 
            ? "border-[#F3A81D] scale-110" 
            : "border-[#F3A81D]/60 group-hover:border-[#F3A81D] group-hover:scale-105"
        )}>
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={username}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[#F3A81D] font-black text-sm">
              {username[0].toUpperCase()}
            </span>
          )}
        </div>

        {/* Username & Role */}
        <div className="flex flex-col items-start">
          <span className="font-bold text-sm uppercase tracking-wide leading-tight">
            {username}
          </span>
          {isAdmin && (
            <span className="text-[10px] font-black text-[#D80027] uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Admin
            </span>
          )}
        </div>

        {/* Chevron */}
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-[#0D0D12] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-white/5 bg-gradient-to-br from-[#1D1D2C] to-[#16162A]">
            <p className="text-xs font-black text-[#8A92A6] uppercase tracking-wider mb-1">
              Signed in as
            </p>
            <p className="text-sm font-bold text-white truncate">
              {username}
            </p>
            {isAdmin && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-[#D80027]/10 border border-[#D80027]/30 rounded text-[10px] font-black text-[#D80027] uppercase">
                <Shield className="w-3 h-3" />
                Administrator
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors text-[#C1C5D0] hover:bg-white/5 hover:text-[#F3A81D] group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#F3A81D]/10 flex items-center justify-center group-hover:bg-[#F3A81D]/20 transition-colors">
                <User className="w-4 h-4 text-[#F3A81D]" />
              </div>
              <span>View Profile</span>
            </Link>

            <div className="h-px bg-white/5 my-2 mx-4" />

            {/* Logout */}
            <div className="px-2">
              <LogoutButton variant="dropdown" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
