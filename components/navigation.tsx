/**
 * Navigation Component (FIFA World Cup 2026 Edition)
 * 
 * Provides responsive main navigation with World Cup brand elements,
 * active path states, and clean mobile bottom navigation.
 */

import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { MobileNav } from './mobile-nav'
import { NavLinks } from './nav-links'
import { UserDropdown } from './user-dropdown'
import { LogIn, Calendar, Trophy, Target } from 'lucide-react'

export async function Navigation() {
  const supabase = await createServerClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check if user is admin and fetch profile if logged in
  let profile = null
  let isAdmin = false
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role, username, avatar_url')
      .eq('id', user.id)
      .single()
    profile = data
    isAdmin = profile?.role === 'admin'
  }
  
  return (
    <>
      {/* Desktop Navigation - Hidden on mobile */}
      <nav className="glass-header border-b border-white/5 relative z-50 hidden lg:block">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex h-20 items-center justify-between">
          
          {/* Logo / Brand */}
          <div className="flex items-center">
            <Link href={user ? "/matches" : "/"} className="flex items-center gap-3.5 group">
              <div className="w-12 h-12 relative flex items-center justify-center bg-gradient-to-br from-black/40 to-black/20 rounded-lg border-2 border-white/10 p-2 group-hover:border-[#F3A81D]/60 group-hover:scale-105 transition-all duration-300 shadow-lg">
                <img 
                  src="/sslogo.png" 
                  alt="South Soccers" 
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-heading font-black tracking-tight leading-none text-white group-hover:text-[#F3A81D] transition-colors">
                  SOUTH <span className="text-[#F3A81D]">SOCCERS</span>
                </span>
                <span className="text-[9px] font-bold text-[#7A8299] tracking-[0.15em] uppercase mt-0.5">
                  World Cup 26™
                </span>
              </div>
            </Link>
          </div>
          
          {/* Centered Navigation Links */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {user ? (
              <NavLinks isAdmin={isAdmin} />
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/"
                  className="nav-link-desktop group"
                >
                  <span className="flex items-center gap-2 relative z-10">
                    <span>Home</span>
                  </span>
                </Link>
                
                <Link
                  href="/public-matches"
                  className="nav-link-desktop group"
                >
                  <span className="flex items-center gap-2 relative z-10">
                    <Calendar className="w-4 h-4" />
                    <span>Matches</span>
                  </span>
                </Link>
                
                <Link
                  href="/public-leaderboard"
                  className="nav-link-desktop group"
                >
                  <span className="flex items-center gap-2 relative z-10">
                    <Trophy className="w-4 h-4" />
                    <span>Leaderboard</span>
                  </span>
                </Link>
                
                <Link
                  href="/scoring-rules"
                  className="nav-link-desktop group"
                >
                  <span className="flex items-center gap-2 relative z-10">
                    <span>Rules</span>
                  </span>
                </Link>
              </div>
            )}
          </div>
          
          {/* Right Actions */}
          <div className="flex items-center gap-5">
            {user ? (
              <div className="hidden lg:flex items-center">
                <UserDropdown 
                  username={profile?.username || 'User'} 
                  isAdmin={isAdmin}
                  avatarUrl={profile?.avatar_url}
                />
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-4">
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-[#C1C5D0] hover:text-[#F3A81D] uppercase tracking-wide transition-all duration-200 hover:bg-white/5 rounded-lg"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Link href="/register" className="btn-tactile btn-tactile-gold text-xs py-3 px-6 shadow-lg hover:shadow-xl">
                  🚀 Register Free
                </Link>
              </div>
            )}
          </div>
        </div>
        </div>
      </nav>

      {/* Mobile Header - Minimal logo only */}
      <div className="lg:hidden glass-header border-b border-white/5 relative z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-center">
            <Link href={user ? "/matches" : "/"} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 relative flex items-center justify-center bg-gradient-to-br from-black/40 to-black/20 rounded-lg border-2 border-white/10 p-1.5 group-hover:border-[#F3A81D]/60 transition-all duration-300 shadow-lg">
                <img 
                  src="/sslogo.png" 
                  alt="South Soccers" 
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-heading font-black tracking-tight leading-none text-white">
                  SOUTH <span className="text-[#F3A81D]">SOCCERS</span>
                </span>
                <span className="text-[8px] font-bold text-[#7A8299] tracking-[0.15em] uppercase">
                  World Cup 26™
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Component */}
      <MobileNav user={user} profile={profile} isAdmin={isAdmin} />
    </>
  )
}
