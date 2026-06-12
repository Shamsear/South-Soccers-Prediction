import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'

export async function FooterContent() {
  const supabase = await createServerClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check if user is admin
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    isAdmin = (profile as { role: string } | null)?.role === 'admin'
  }

  return (
    <div className="container mx-auto px-4 max-w-7xl relative z-10">
      
      {/* Main Footer Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
        
        {/* Brand Column */}
        <div className="md:col-span-4 flex flex-col items-center md:items-start">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 relative flex items-center justify-center bg-black/30 rounded-lg border border-white/10 p-2">
              <img 
                src="/sslogo.png" 
                alt="South Soccers" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-black text-lg text-white tracking-tight uppercase">
                SOUTH <span className="text-[#F3A81D]">SOCCERS</span>
              </span>
              <span className="text-[9px] font-bold text-[#7A8299] tracking-[0.12em] uppercase">
                Prediction League
              </span>
            </div>
          </div>
          <p className="text-sm text-[#8A92A6] leading-relaxed max-w-xs text-center md:text-left mb-6">
            The ultimate FIFA World Cup 2026™ prediction experience. Compete globally, earn points, claim glory.
          </p>
          
          {/* Host Nations Badge */}
          <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
            <div className="px-2.5 py-1.5 bg-[#D80027]/10 border border-[#D80027]/30 rounded text-[10px] font-black text-[#D80027] tracking-wide">
              CANADA
            </div>
            <div className="px-2.5 py-1.5 bg-[#009A44]/10 border border-[#009A44]/30 rounded text-[10px] font-black text-[#009A44] tracking-wide">
              MEXICO
            </div>
            <div className="px-2.5 py-1.5 bg-[#0052B4]/10 border border-[#0052B4]/30 rounded text-[10px] font-black text-[#0052B4] tracking-wide">
              USA
            </div>
          </div>
        </div>

        {/* Quick Links Column - Different for each user type */}
        <div className="md:col-span-4 flex flex-col items-center md:items-start">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-5 border-b border-white/10 pb-2">
            Quick Navigation
          </h3>
          <div className="flex flex-col gap-3 text-sm font-semibold">
            {!user ? (
              // Public/Guest Links
              <>
                <Link href="/" className="text-[#C1C5D0] hover:text-[#F3A81D] transition-colors flex items-center gap-2 group">
                  <span className="text-[#F3A81D] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  <span>Home</span>
                </Link>
                <Link href="/public-matches" className="text-[#C1C5D0] hover:text-[#F3A81D] transition-colors flex items-center gap-2 group">
                  <span className="text-[#F3A81D] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  <span>View Matches</span>
                </Link>
                <Link href="/public-leaderboard" className="text-[#C1C5D0] hover:text-[#F3A81D] transition-colors flex items-center gap-2 group">
                  <span className="text-[#F3A81D] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  <span>Leaderboard</span>
                </Link>
                <Link href="/scoring-rules" className="text-[#C1C5D0] hover:text-[#F3A81D] transition-colors flex items-center gap-2 group">
                  <span className="text-[#F3A81D] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  <span>Scoring Rules</span>
                </Link>
                <Link href="/login" className="text-[#C1C5D0] hover:text-[#F3A81D] transition-colors flex items-center gap-2 group">
                  <span className="text-[#F3A81D] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  <span>Sign In</span>
                </Link>
                <Link href="/register" className="text-[#C1C5D0] hover:text-[#F3A81D] transition-colors flex items-center gap-2 group">
                  <span className="text-[#F3A81D] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  <span>Register</span>
                </Link>
              </>
            ) : isAdmin ? (
              // Admin Links
              <>
                <Link href="/admin" className="text-[#C1C5D0] hover:text-[#F3A81D] transition-colors flex items-center gap-2 group">
                  <span className="text-[#F3A81D] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  <span>Admin Dashboard</span>
                </Link>
                <Link href="/admin/users" className="text-[#C1C5D0] hover:text-[#F3A81D] transition-colors flex items-center gap-2 group">
                  <span className="text-[#F3A81D] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  <span>Manage Users</span>
                </Link>
                <Link href="/admin/matches" className="text-[#C1C5D0] hover:text-[#F3A81D] transition-colors flex items-center gap-2 group">
                  <span className="text-[#F3A81D] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  <span>Manage Matches</span>
                </Link>
                <Link href="/matches" className="text-[#C1C5D0] hover:text-[#F3A81D] transition-colors flex items-center gap-2 group">
                  <span className="text-[#F3A81D] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  <span>View Matches</span>
                </Link>
                <Link href="/leaderboard" className="text-[#C1C5D0] hover:text-[#F3A81D] transition-colors flex items-center gap-2 group">
                  <span className="text-[#F3A81D] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  <span>Leaderboard</span>
                </Link>
                <Link href="/scoring-rules" className="text-[#C1C5D0] hover:text-[#F3A81D] transition-colors flex items-center gap-2 group">
                  <span className="text-[#F3A81D] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  <span>Scoring Rules</span>
                </Link>
              </>
            ) : (
              // Authenticated User Links
              <>
                <Link href="/matches" className="text-[#C1C5D0] hover:text-[#F3A81D] transition-colors flex items-center gap-2 group">
                  <span className="text-[#F3A81D] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  <span>View All Matches</span>
                </Link>
                <Link href="/my-predictions" className="text-[#C1C5D0] hover:text-[#F3A81D] transition-colors flex items-center gap-2 group">
                  <span className="text-[#F3A81D] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  <span>My Predictions</span>
                </Link>
                <Link href="/leaderboard" className="text-[#C1C5D0] hover:text-[#F3A81D] transition-colors flex items-center gap-2 group">
                  <span className="text-[#F3A81D] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  <span>Leaderboard</span>
                </Link>
                <Link href="/scoring-rules" className="text-[#C1C5D0] hover:text-[#F3A81D] transition-colors flex items-center gap-2 group">
                  <span className="text-[#F3A81D] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  <span>Scoring Rules</span>
                </Link>
                <Link href="/profile" className="text-[#C1C5D0] hover:text-[#F3A81D] transition-colors flex items-center gap-2 group">
                  <span className="text-[#F3A81D] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  <span>Profile Settings</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Tournament Info Column */}
        <div className="md:col-span-4 flex flex-col items-center md:items-start">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-5 border-b border-white/10 pb-2">
            Tournament Info
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded bg-[#F3A81D]/10 border border-[#F3A81D]/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#F3A81D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-white">FIFA World Cup 26™</p>
                <p className="text-xs text-[#8A92A6] mt-0.5">June 11 - July 19, 2026</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded bg-[#F3A81D]/10 border border-[#F3A81D]/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#F3A81D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-white">48 Teams Competing</p>
                <p className="text-xs text-[#8A92A6] mt-0.5">104 matches across 3 nations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-[#586175] font-medium text-center md:text-left">
          &copy; {new Date().getFullYear()} South Soccers Prediction League. All rights reserved. Designed for FIFA World Cup 26™
        </p>
        <div className="flex items-center gap-4 text-xs text-[#7A8299]">
          <span className="px-3 py-1.5 bg-black/40 border border-white/5 rounded font-bold">
            Made with passion for football fans
          </span>
        </div>
      </div>
    </div>
  )
}
