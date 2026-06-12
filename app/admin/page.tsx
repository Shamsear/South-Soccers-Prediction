/**
 * Admin Home Dashboard
 * 
 * Beautiful admin landing page with analytics, quick actions, and management tools
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createServerClient } from '@/lib/supabase/server'
import { ForceSyncButton } from '@/components/force-sync-button'
import { 
  Users, 
  Target, 
  Trophy, 
  Calendar, 
  Activity, 
  Settings,
  BarChart3,
  Clock,
  Zap,
  Shield,
  ArrowRight
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Admin Home | South Soccers',
  description: 'Admin control center for South Soccers Prediction League',
}

/**
 * Format timestamp for display
 */
function formatTimestamp(isoString: string | null): string {
  if (!isoString) return 'Never'
  
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
}

export default async function AdminHomePage() {
  const supabase = await createServerClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, username')
    .eq('id', user.id)
    .single()

  const typedProfile = profile as { role: string; username: string } | null
  if (!typedProfile || typedProfile.role !== 'admin') {
    redirect('/matches')
  }

  // Query analytics data
  const [
    { count: totalUsers },
    { count: totalPredictions },
    { count: totalMatches },
    { count: liveMatches },
    { data: lastSyncData },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('predictions').select('*', { count: 'exact', head: true }),
    supabase.from('matches').select('*', { count: 'exact', head: true }),
    supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'live'),
    supabase
      .from('matches')
      .select('api_last_polled_at')
      .order('api_last_polled_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
  ])

  const typedLastSyncData = lastSyncData as { api_last_polled_at: string | null } | null
  const lastSyncTime = typedLastSyncData?.api_last_polled_at

  // Get match stats
  const { count: upcomingMatches } = await supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'upcoming')
  const { count: finishedMatches } = await supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'finished')

  return (
    <div className="relative min-h-screen bg-[#030306] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-cyber-pitch opacity-[0.05]" />
      <div className="absolute top-[-5%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#D80027]/6 blur-[150px] pointer-events-none animate-float-slow" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#F3A81D]/6 blur-[150px] pointer-events-none animate-float-medium" />

      <div className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D80027] to-[#8B0A1E] flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F3A81D] to-white uppercase tracking-tight">
                Admin Control Center
              </h1>
              <p className="text-[#C1C5D0] text-sm mt-1">
                Welcome back, <span className="text-[#F3A81D] font-bold">{typedProfile.username}</span> • Full System Access
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Link href="/admin/users" className="group">
            <div className="bg-[#0E0E13] border-2 border-[#0052B4]/20 hover:border-[#0052B4] p-6 rounded-xl transition-all card-hover-lift">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-lg bg-[#0052B4]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-[#0052B4]" />
                </div>
                <ArrowRight className="w-5 h-5 text-[#0052B4]/40 group-hover:text-[#0052B4] group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-wide mb-1">View Users</h3>
              <p className="text-sm text-[#8A92A6]">Browse all registered players</p>
            </div>
          </Link>

          <Link href="/admin/matches" className="group">
            <div className="bg-[#0E0E13] border-2 border-[#D80027]/20 hover:border-[#D80027] p-6 rounded-xl transition-all card-hover-lift">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-lg bg-[#D80027]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Settings className="w-6 h-6 text-[#D80027]" />
                </div>
                <ArrowRight className="w-5 h-5 text-[#D80027]/40 group-hover:text-[#D80027] group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-wide mb-1">Manage Matches</h3>
              <p className="text-sm text-[#8A92A6]">Score finished matches and update data</p>
            </div>
          </Link>

          <Link href="/matches" className="group">
            <div className="bg-[#0E0E13] border-2 border-[#F3A81D]/20 hover:border-[#F3A81D] p-6 rounded-xl transition-all card-hover-lift">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-lg bg-[#F3A81D]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6 text-[#F3A81D]" />
                </div>
                <ArrowRight className="w-5 h-5 text-[#F3A81D]/40 group-hover:text-[#F3A81D] group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-wide mb-1">View Matches</h3>
              <p className="text-sm text-[#8A92A6]">Browse all tournament fixtures</p>
            </div>
          </Link>

          <Link href="/leaderboard" className="group">
            <div className="bg-[#0E0E13] border-2 border-[#009A44]/20 hover:border-[#009A44] p-6 rounded-xl transition-all card-hover-lift">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-lg bg-[#009A44]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Trophy className="w-6 h-6 text-[#009A44]" />
                </div>
                <ArrowRight className="w-5 h-5 text-[#009A44]/40 group-hover:text-[#009A44] group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-wide mb-1">View Leaderboard</h3>
              <p className="text-sm text-[#8A92A6]">Check current rankings</p>
            </div>
          </Link>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          {/* Total Users */}
          <div className="bg-[#0E0E13] border border-white/5 p-6 rounded-xl relative overflow-hidden group hover:border-[#F3A81D]/40 transition-all">
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#F3A81D] via-[#F3A81D]/50 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 right-0 p-4 font-black text-7xl text-white/[0.015] select-none leading-none">👥</div>
            <div className="w-11 h-11 rounded-lg bg-[#F3A81D]/10 flex items-center justify-center mb-4 border border-[#F3A81D]/20">
              <Users className="w-5 h-5 text-[#F3A81D]" />
            </div>
            <p className="text-xs font-black text-[#8A92A6] mb-1 uppercase tracking-wider">Total Users</p>
            <p className="text-3xl font-black text-white stat-glow">{totalUsers || 0}</p>
            <p className="text-xs text-[#8A92A6] mt-2 font-medium">Registered accounts</p>
          </div>

          {/* Total Predictions */}
          <div className="bg-[#0E0E13] border border-white/5 p-6 rounded-xl relative overflow-hidden group hover:border-[#D80027]/40 transition-all">
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#D80027] via-[#D80027]/50 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 right-0 p-4 font-black text-7xl text-white/[0.015] select-none leading-none">🎯</div>
            <div className="w-11 h-11 rounded-lg bg-[#D80027]/10 flex items-center justify-center mb-4 border border-[#D80027]/20">
              <Target className="w-5 h-5 text-[#D80027]" />
            </div>
            <p className="text-xs font-black text-[#8A92A6] mb-1 uppercase tracking-wider">Predictions</p>
            <p className="text-3xl font-black text-white stat-glow">{totalPredictions || 0}</p>
            <p className="text-xs text-[#8A92A6] mt-2 font-medium">Total submissions</p>
          </div>

          {/* Total Matches */}
          <div className="bg-[#0E0E13] border border-white/5 p-6 rounded-xl relative overflow-hidden group hover:border-[#0052B4]/40 transition-all">
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#0052B4] via-[#0052B4]/50 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 right-0 p-4 font-black text-7xl text-white/[0.015] select-none leading-none">⚽</div>
            <div className="w-11 h-11 rounded-lg bg-[#0052B4]/10 flex items-center justify-center mb-4 border border-[#0052B4]/20">
              <Calendar className="w-5 h-5 text-[#0052B4]" />
            </div>
            <p className="text-xs font-black text-[#8A92A6] mb-1 uppercase tracking-wider">Total Matches</p>
            <p className="text-3xl font-black text-white stat-glow">{totalMatches || 0}</p>
            <p className="text-xs text-[#8A92A6] mt-2 font-medium">World Cup 2026</p>
          </div>

          {/* Live Matches */}
          <div className="bg-[#0E0E13] border border-white/5 p-6 rounded-xl relative overflow-hidden group hover:border-[#009A44]/40 transition-all">
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#009A44] via-[#009A44]/50 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 right-0 p-4 font-black text-7xl text-white/[0.015] select-none leading-none">🔴</div>
            <div className="w-11 h-11 rounded-lg bg-[#009A44]/10 flex items-center justify-center mb-4 border border-[#009A44]/20">
              <Activity className="w-5 h-5 text-[#009A44]" />
            </div>
            <p className="text-xs font-black text-[#8A92A6] mb-1 uppercase tracking-wider">Live Now</p>
            <p className="text-3xl font-black text-white stat-glow">{liveMatches || 0}</p>
            <p className="text-xs text-[#8A92A6] mt-2 font-medium">
              {liveMatches && liveMatches > 0 ? 'In progress' : 'No live matches'}
            </p>
          </div>
        </div>

        {/* Match Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          {/* Upcoming Matches */}
          <div className="bg-[#0E0E13] border-2 border-[#F3A81D]/20 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#F3A81D]/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#F3A81D]" />
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wide">Upcoming Matches</h3>
                <p className="text-xs text-[#8A92A6]">Awaiting kickoff</p>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-[#F3A81D]">{upcomingMatches || 0}</span>
              <span className="text-sm text-[#8A92A6] font-bold">matches scheduled</span>
            </div>
          </div>

          {/* Finished Matches */}
          <div className="bg-[#0E0E13] border-2 border-[#009A44]/20 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#009A44]/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#009A44]" />
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wide">Completed Matches</h3>
                <p className="text-xs text-[#8A92A6]">Results available</p>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-[#009A44]">{finishedMatches || 0}</span>
              <span className="text-sm text-[#8A92A6] font-bold">matches scored</span>
            </div>
          </div>
        </div>

        {/* Data Synchronization */}
        <div className="bg-[#0E0E13] border-2 border-white/5 p-8 rounded-xl">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#F3A81D] to-[#D80027] flex items-center justify-center">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-1">
                  Data Synchronization
                </h2>
                <p className="text-sm text-[#8A92A6]">Match data from football-data.org API</p>
              </div>
            </div>
            <ForceSyncButton />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/30 border border-white/5 p-5 rounded-lg">
              <p className="text-xs font-black text-[#F3A81D] uppercase tracking-wider mb-2">Last Sync</p>
              <p className="text-2xl font-black text-white mb-1">
                {formatTimestamp(lastSyncTime ?? null)}
              </p>
              {lastSyncTime && (
                <p className="text-xs text-[#8A92A6] font-medium">
                  {new Date(lastSyncTime).toLocaleString()}
                </p>
              )}
            </div>

            <div className="bg-black/30 border border-white/5 p-5 rounded-lg">
              <p className="text-xs font-black text-[#F3A81D] uppercase tracking-wider mb-3">Sync Strategy</p>
              <ul className="space-y-2 text-xs text-[#C1C5D0]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#009A44]" />
                  Traffic-driven auto-sync
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F3A81D]" />
                  5-minute rate limiting
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0052B4]" />
                  Smart match prioritization
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
