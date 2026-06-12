'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Trophy, Award, Home, Shield, Users, Target, ChevronDown, Upload, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface NavLinksProps {
  isAdmin: boolean
}

export function NavLinks({ isAdmin }: NavLinksProps) {
  const pathname = usePathname()
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false)
  
  const isActive = (path: string) => {
    if (path === '/matches') {
      return pathname === path || pathname.startsWith('/matches/')
    }
    if (path === '/admin') {
      return pathname === path
    }
    if (path === '/admin/users') {
      return pathname.startsWith('/admin/users')
    }
    if (path === '/admin/matches') {
      return pathname.startsWith('/admin/matches')
    }
    if (path === '/admin/import-predictions') {
      return pathname.startsWith('/admin/import-predictions')
    }
    return pathname === path
  }

  // Check if any "More" menu item is active for admin
  const isMoreActive = () => {
    if (isAdmin) {
      return isActive('/admin/import-predictions') || isActive('/scoring-rules')
    }
    return false
  }

  return (
    <div className="flex items-center gap-1.5">
      {isAdmin ? (
        /* Admin Navigation */
        <>
          <NavLink 
            href="/admin" 
            icon={<Home className="w-4 h-4" />}
            active={isActive('/admin')}
            isAdminHome={true}
          >
            Home
          </NavLink>
          
          <NavLink 
            href="/admin/users" 
            icon={<Users className="w-4 h-4" />}
            active={isActive('/admin/users')}
          >
            Users
          </NavLink>

          <NavLink 
            href="/admin/matches" 
            icon={<Shield className="w-4 h-4" />}
            active={isActive('/admin/matches')}
          >
            Manage
          </NavLink>
          
          <NavLink 
            href="/matches" 
            icon={<Calendar className="w-4 h-4" />}
            active={isActive('/matches')}
          >
            Matches
          </NavLink>
          
          <NavLink 
            href="/leaderboard" 
            icon={<Trophy className="w-4 h-4" />}
            active={isActive('/leaderboard')}
          >
            Leaderboard
          </NavLink>

          {/* More Dropdown for Admin */}
          <div className="relative">
            <button
              onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
              onBlur={() => setTimeout(() => setMoreDropdownOpen(false), 250)}
              className={cn(
                "nav-link-desktop group",
                isMoreActive() && "text-[#F3A81D] bg-white/5"
              )}
            >
              <span className="flex items-center gap-1.5 relative z-10">
                <MoreHorizontal className="w-4 h-4" />
                <span>More</span>
                <ChevronDown className={cn("w-3 h-3 transition-transform", moreDropdownOpen && "rotate-180")} />
              </span>
            </button>

            {moreDropdownOpen && (
              <div 
                className="absolute top-full right-0 mt-2 w-52 bg-[#0D0D12] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50"
                onMouseDown={(e) => e.preventDefault()}
              >
                <Link
                  href="/admin/import-predictions"
                  onClick={() => setMoreDropdownOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors",
                    isActive('/admin/import-predictions') 
                      ? "bg-[#F3A81D]/10 text-[#F3A81D]" 
                      : "text-[#C1C5D0] hover:bg-white/5 hover:text-[#F3A81D]"
                  )}
                >
                  <Upload className="w-4 h-4" />
                  <span>Import Predictions</span>
                </Link>
                <Link
                  href="/scoring-rules"
                  onClick={() => setMoreDropdownOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors",
                    isActive('/scoring-rules') 
                      ? "bg-[#F3A81D]/10 text-[#F3A81D]" 
                      : "text-[#C1C5D0] hover:bg-white/5 hover:text-[#F3A81D]"
                  )}
                >
                  <Target className="w-4 h-4" />
                  <span>Scoring Rules</span>
                </Link>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Regular User Navigation */
        <>
          <NavLink 
            href="/matches" 
            icon={<Calendar className="w-4 h-4" />}
            active={isActive('/matches')}
          >
            Matches
          </NavLink>
          
          <NavLink 
            href="/my-predictions" 
            icon={<Award className="w-4 h-4" />}
            active={isActive('/my-predictions')}
          >
            My Predictions
          </NavLink>

          <NavLink 
            href="/leaderboard" 
            icon={<Trophy className="w-4 h-4" />}
            active={isActive('/leaderboard')}
          >
            Leaderboard
          </NavLink>

          <NavLink 
            href="/scoring-rules" 
            icon={<Target className="w-4 h-4" />}
            active={isActive('/scoring-rules')}
          >
            Rules
          </NavLink>
        </>
      )}
    </div>
  )
}

function NavLink({ 
  href, 
  icon, 
  active,
  children,
  isAdminHome = false
}: { 
  href: string
  icon: React.ReactNode
  active: boolean
  children: React.ReactNode
  isAdminHome?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "nav-link-desktop group",
        active && "text-[#F3A81D] bg-white/5",
        isAdminHome && active && "text-[#F3A81D] bg-gradient-to-r from-[#D80027]/10 to-transparent border-l-2 border-[#F3A81D]"
      )}
    >
      <span className="flex items-center gap-2 relative z-10">
        {icon}
        <span>{children}</span>
      </span>
    </Link>
  )
}
