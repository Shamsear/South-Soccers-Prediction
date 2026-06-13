'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Trophy, User, Home, LogIn, Award, Shield, Users, Target } from 'lucide-react'

interface MobileNavProps {
  user: any
  profile: any
  isAdmin: boolean
}

export function MobileNav({ user, profile, isAdmin }: MobileNavProps) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === path
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
    return pathname === path
  }

  return (
    <>
      {/* ==========================================
         FLOATING BOTTOM NAVIGATION BAR
         Clean, modern mobile navigation
         ========================================== */}
      <div className="mobile-bottom-nav lg:hidden">
        {user ? (
          /* Authenticated Mobile Bottom Nav */
          <>
            {isAdmin ? (
              /* Admin Mobile Nav - 5 items */
              <>
                <Link
                  href="/admin"
                  className={`mobile-bottom-nav-item ${isActive('/admin') ? 'active' : ''}`}
                >
                  <Home className="w-[18px] h-[18px]" />
                  <span>Home</span>
                </Link>

                <Link
                  href="/admin/users"
                  className={`mobile-bottom-nav-item ${isActive('/admin/users') ? 'active' : ''}`}
                >
                  <Users className="w-[18px] h-[18px]" />
                  <span>Users</span>
                </Link>

                <Link
                  href="/admin/matches"
                  className={`mobile-bottom-nav-item ${isActive('/admin/matches') ? 'active' : ''}`}
                >
                  <Shield className="w-[18px] h-[18px]" />
                  <span>Manage</span>
                </Link>

                <Link
                  href="/matches"
                  className={`mobile-bottom-nav-item ${isActive('/matches') || pathname.startsWith('/matches/') ? 'active' : ''}`}
                >
                  <Calendar className="w-[18px] h-[18px]" />
                  <span>View</span>
                </Link>

                <Link
                  href="/leaderboard"
                  className={`mobile-bottom-nav-item ${isActive('/leaderboard') ? 'active' : ''}`}
                >
                  <Trophy className="w-[18px] h-[18px]" />
                  <span>Board</span>
                </Link>
              </>
            ) : (
              /* Regular User Mobile Nav - 5 items */
              <>
                <Link
                  href="/dashboard"
                  className={`mobile-bottom-nav-item ${isActive('/dashboard') ? 'active' : ''}`}
                >
                  <Home className="w-[18px] h-[18px]" />
                  <span>Home</span>
                </Link>

                <Link
                  href="/matches"
                  className={`mobile-bottom-nav-item ${isActive('/matches') || pathname.startsWith('/matches/') ? 'active' : ''}`}
                >
                  <Calendar className="w-[18px] h-[18px]" />
                  <span>Matches</span>
                </Link>

                <Link
                  href="/all-predictions"
                  className={`mobile-bottom-nav-item ${isActive('/all-predictions') ? 'active' : ''}`}
                >
                  <Award className="w-[18px] h-[18px]" />
                  <span>Predicts</span>
                </Link>

                <Link
                  href="/leaderboard"
                  className={`mobile-bottom-nav-item ${isActive('/leaderboard') ? 'active' : ''}`}
                >
                  <Trophy className="w-[18px] h-[18px]" />
                  <span>Board</span>
                </Link>

                <Link
                  href="/profile"
                  className={`mobile-bottom-nav-item ${isActive('/profile') ? 'active' : ''}`}
                >
                  <User className="w-[18px] h-[18px]" />
                  <span>Profile</span>
                </Link>
              </>
            )}
          </>
        ) : (
          /* Guest Mobile Bottom Nav - 5 items */
          <>
            <Link
              href="/"
              className={`mobile-bottom-nav-item ${isActive('/') ? 'active' : ''}`}
            >
              <Home className="w-[18px] h-[18px]" />
              <span>Home</span>
            </Link>

            <Link
              href="/public-matches"
              className={`mobile-bottom-nav-item ${isActive('/public-matches') ? 'active' : ''}`}
            >
              <Calendar className="w-[18px] h-[18px]" />
              <span>Matches</span>
            </Link>

            <Link
              href="/public-leaderboard"
              className={`mobile-bottom-nav-item ${isActive('/public-leaderboard') ? 'active' : ''}`}
            >
              <Trophy className="w-[18px] h-[18px]" />
              <span>Board</span>
            </Link>

            <Link
              href="/scoring-rules"
              className={`mobile-bottom-nav-item ${isActive('/scoring-rules') ? 'active' : ''}`}
            >
              <Target className="w-[18px] h-[18px]" />
              <span>Rules</span>
            </Link>

            <Link
              href="/login"
              className={`mobile-bottom-nav-item ${isActive('/login') ? 'active' : ''}`}
            >
              <LogIn className="w-[18px] h-[18px]" />
              <span>Sign In</span>
            </Link>
          </>
        )}
      </div>
    </>
  )
}
