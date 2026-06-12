/**
 * Admin Users List Page
 * 
 * Shows all registered users with their profile information
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createServerClient } from '@/lib/supabase/server'
import { Users, Trophy, Target, Calendar, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Registered Users | Admin | South Soccers',
  description: 'View all registered users',
}

type Profile = {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  total_points: number
  correct_predictions: number
  role: string
  created_at: string
}

export default async function AdminUsersPage() {
  const supabase = await createServerClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const typedProfile = profile as { role: string } | null
  if (!typedProfile || typedProfile.role !== 'admin') {
    redirect('/matches')
  }

  // Fetch all users (exclude admins as they don't participate)
  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'user')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
  }

  const typedUsers = (users as Profile[]) || []

  // Count predictions per user
  const { data: predictionCounts } = await supabase
    .from('predictions')
    .select('user_id')

  const predictionCountMap = new Map<string, number>()
  predictionCounts?.forEach(pred => {
    const count = predictionCountMap.get(pred.user_id) || 0
    predictionCountMap.set(pred.user_id, count + 1)
  })

  return (
    <div className="relative min-h-screen bg-[#030306] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-cyber-pitch opacity-[0.05]" />
      <div className="absolute top-[-5%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#F3A81D]/6 blur-[150px] pointer-events-none animate-float-slow" />

      <div className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-[#F3A81D] hover:text-[#FFD700] font-bold mb-4 transition-colors text-sm"
          >
            ← Back to Admin Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0052B4] to-[#0041A8] flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F3A81D] to-white uppercase tracking-tight">
                Registered Users
              </h1>
              <p className="text-[#C1C5D0] text-sm mt-1">
                {typedUsers.length} total members • View player details and statistics
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#0E0E13] border border-white/5 p-5 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-[#F3A81D]" />
              <p className="text-xs font-black text-[#8A92A6] uppercase">Total Players</p>
            </div>
            <p className="text-3xl font-black text-white">{typedUsers.length}</p>
          </div>

          <div className="bg-[#0E0E13] border border-white/5 p-5 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-5 h-5 text-[#009A44]" />
              <p className="text-xs font-black text-[#8A92A6] uppercase">Active Players</p>
            </div>
            <p className="text-3xl font-black text-white">
              {typedUsers.filter(u => u.total_points > 0).length}
            </p>
          </div>

          <div className="bg-[#0E0E13] border border-white/5 p-5 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-[#0052B4]" />
              <p className="text-xs font-black text-[#8A92A6] uppercase">Total Predictions</p>
            </div>
            <p className="text-3xl font-black text-white">
              {predictionCounts?.length || 0}
            </p>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {typedUsers.map(user => {
            const predictionCount = predictionCountMap.get(user.id) || 0

            return (
              <Link
                key={user.id}
                href={`/admin/users/${user.id}`}
                className="group"
              >
                <div className="bg-[#0E0E13] border-2 border-white/5 hover:border-[#F3A81D]/40 p-6 rounded-xl transition-all card-hover-lift">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl border-2 border-white/10 bg-black/30 flex items-center justify-center overflow-hidden">
                        {user.avatar_url ? (
                          <Image
                            src={user.avatar_url}
                            alt={user.username}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-black text-[#F3A81D]">
                            {user.username[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-wide">
                          {user.username}
                        </h3>
                        {user.full_name && (
                          <p className="text-xs text-[#8A92A6] font-medium">
                            {user.full_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#8A92A6] group-hover:text-[#F3A81D] group-hover:translate-x-1 transition-all" />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
                    <div className="text-center">
                      <p className="text-2xl font-black text-[#F3A81D]">{user.total_points}</p>
                      <p className="text-[9px] text-[#8A92A6] font-bold uppercase tracking-wider mt-0.5">Points</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-[#009A44]">{user.correct_predictions}</p>
                      <p className="text-[9px] text-[#8A92A6] font-bold uppercase tracking-wider mt-0.5">Exact</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-[#0052B4]">{predictionCount}</p>
                      <p className="text-[9px] text-[#8A92A6] font-bold uppercase tracking-wider mt-0.5">Predicts</p>
                    </div>
                  </div>

                  {/* Joined Date */}
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-[#8A92A6]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {typedUsers.length === 0 && (
          <div className="bg-[#0E0E13] border-2 border-white/5 max-w-md mx-auto text-center p-12 rounded-xl">
            <Users className="w-16 h-16 text-[#8A92A6] mx-auto mb-4" />
            <p className="text-[#8A92A6] text-lg font-black uppercase">No users registered yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
