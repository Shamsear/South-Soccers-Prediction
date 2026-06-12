/**
 * Profile Settings Page (FIFA World Cup 2026 Edition)
 * 
 * Server component managing user profile states and displaying
 * dashboard statistics cards.
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/profile-form'
import { ArrowLeft, Trophy, Award, Shield, Bell, User, Mail, Phone, Target } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Profile Settings | South Soccers',
  description: 'Manage your profile and preferences',
}

export default async function ProfilePage() {
  const supabase = await createServerClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.error('Error fetching profile:', profileError)
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-[#D80027] font-black uppercase">Failed to load profile. Please reload the page.</p>
      </div>
    )
  }

  const typedProfile = profile as {
    id: string
    username: string
    full_name: string | null
    phone_number: string | null
    avatar_url: string | null
    total_points: number
    correct_predictions: number
    role: 'user' | 'admin'
    email_notifications_enabled: boolean
  }

  const isAdmin = typedProfile.role === 'admin'

  return (
    <div className="relative min-h-screen bg-[#030306] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-cyber-pitch opacity-[0.05]" />
      <div className="absolute top-[-5%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#F3A81D]/6 blur-[150px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#0052B4]/6 blur-[150px] pointer-events-none animate-float-medium" />

      <div className="container mx-auto px-4 py-12 max-w-5xl relative z-10">
        
        {/* Header */}
        <div className="mb-12">
          <Link
            href={isAdmin ? "/admin" : "/matches"}
            className="inline-flex items-center gap-2 text-[#C1C5D0] hover:text-[#F3A81D] font-bold mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to {isAdmin ? "Admin Home" : "Matches"}
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#F3A81D] to-[#D80027] flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F3A81D] to-white uppercase tracking-tight">
                Profile Settings
              </h1>
              <p className="text-[#C1C5D0] text-sm mt-1">
                Manage your account information and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {/* Points Card */}
          <div className="bg-[#0E0E13] border border-white/5 p-5 rounded-xl hover:border-[#F3A81D]/40 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#F3A81D] via-[#F3A81D]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-r-xl" />
            <div className="w-10 h-10 rounded-lg bg-[#F3A81D]/10 flex items-center justify-center mb-3 border border-[#F3A81D]/20">
              <Trophy className="w-5 h-5 text-[#F3A81D]" />
            </div>
            <p className="text-xs font-black text-[#8A92A6] mb-1 uppercase tracking-wider">Total Points</p>
            <p className="text-3xl font-black text-white">{typedProfile.total_points}</p>
          </div>
          
          {/* Exact Scores */}
          <div className="bg-[#0E0E13] border border-white/5 p-5 rounded-xl hover:border-[#009A44]/40 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#009A44] via-[#009A44]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-r-xl" />
            <div className="w-10 h-10 rounded-lg bg-[#009A44]/10 flex items-center justify-center mb-3 border border-[#009A44]/20">
              <Target className="w-5 h-5 text-[#009A44]" />
            </div>
            <p className="text-xs font-black text-[#8A92A6] mb-1 uppercase tracking-wider">Exact Scores</p>
            <p className="text-3xl font-black text-white">{typedProfile.correct_predictions}</p>
          </div>
          
          {/* Role */}
          <div className="bg-[#0E0E13] border border-white/5 p-5 rounded-xl hover:border-[#0052B4]/40 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#0052B4] via-[#0052B4]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-r-xl" />
            <div className="w-10 h-10 rounded-lg bg-[#0052B4]/10 flex items-center justify-center mb-3 border border-[#0052B4]/20">
              <Shield className="w-5 h-5 text-[#0052B4]" />
            </div>
            <p className="text-xs font-black text-[#8A92A6] mb-1 uppercase tracking-wider">Role</p>
            <p className="text-lg font-black text-white uppercase">
              {isAdmin ? 'Administrator' : 'Player'}
            </p>
          </div>
          
          {/* Notifications */}
          <div className="bg-[#0E0E13] border border-white/5 p-5 rounded-xl hover:border-[#D80027]/40 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#D80027] via-[#D80027]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-r-xl" />
            <div className="w-10 h-10 rounded-lg bg-[#D80027]/10 flex items-center justify-center mb-3 border border-[#D80027]/20">
              <Bell className="w-5 h-5 text-[#D80027]" />
            </div>
            <p className="text-xs font-black text-[#8A92A6] mb-1 uppercase tracking-wider">Email Alerts</p>
            <p className="text-lg font-black text-white uppercase">
              {typedProfile.email_notifications_enabled ? 'Active' : 'Muted'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-1">
            <div className="bg-[#0E0E13] border border-white/5 rounded-xl p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#F3A81D]/10 flex items-center justify-center border border-[#F3A81D]/20">
                  <User className="w-5 h-5 text-[#F3A81D]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wide">
                    Account Info
                  </h3>
                  <p className="text-xs text-[#8A92A6]">Your personal details</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Username */}
                <div className="bg-black/30 border border-white/5 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-[#8A92A6]" />
                    <p className="text-xs font-black text-[#8A92A6] uppercase tracking-wider">Username</p>
                  </div>
                  <p className="text-sm font-bold text-white uppercase">{typedProfile.username}</p>
                </div>

                {/* Email */}
                <div className="bg-black/30 border border-white/5 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-[#8A92A6]" />
                    <p className="text-xs font-black text-[#8A92A6] uppercase tracking-wider">Email</p>
                  </div>
                  <p className="text-sm font-bold text-white break-all">{user.email}</p>
                </div>

                {/* Full Name */}
                {typedProfile.full_name && (
                  <div className="bg-black/30 border border-white/5 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-[#8A92A6]" />
                      <p className="text-xs font-black text-[#8A92A6] uppercase tracking-wider">Full Name</p>
                    </div>
                    <p className="text-sm font-bold text-white">{typedProfile.full_name}</p>
                  </div>
                )}

                {/* Phone */}
                {typedProfile.phone_number && (
                  <div className="bg-black/30 border border-white/5 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4 text-[#8A92A6]" />
                      <p className="text-xs font-black text-[#8A92A6] uppercase tracking-wider">Phone</p>
                    </div>
                    <p className="text-sm font-bold text-white">{typedProfile.phone_number}</p>
                  </div>
                )}

                {/* Admin Badge */}
                {isAdmin && (
                  <div className="bg-gradient-to-br from-[#D80027]/10 to-[#D80027]/5 border border-[#D80027]/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-[#D80027]" />
                      <div>
                        <p className="text-xs font-black text-[#D80027] uppercase tracking-wider">Administrator</p>
                        <p className="text-xs text-[#8A92A6] mt-0.5">Full system access</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-[#0E0E13] border border-white/5 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#0052B4]/10 flex items-center justify-center border border-[#0052B4]/20">
                  <Target className="w-5 h-5 text-[#0052B4]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wide">
                    Edit Profile
                  </h3>
                  <p className="text-xs text-[#8A92A6]">Update your information and settings</p>
                </div>
              </div>

              <ProfileForm profile={profile} userEmail={user.email || ''} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {!isAdmin && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/my-predictions" className="group">
              <div className="bg-[#0E0E13] border-2 border-white/5 hover:border-[#F3A81D]/50 p-6 rounded-xl transition-all card-hover-lift">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[#F3A81D]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Award className="w-6 h-6 text-[#F3A81D]" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-white uppercase">My Predictions</h4>
                      <p className="text-xs text-[#8A92A6]">View your prediction history</p>
                    </div>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-[#F3A81D] rotate-180 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link href="/leaderboard" className="group">
              <div className="bg-[#0E0E13] border-2 border-white/5 hover:border-[#009A44]/50 p-6 rounded-xl transition-all card-hover-lift">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[#009A44]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Trophy className="w-6 h-6 text-[#009A44]" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-white uppercase">Leaderboard</h4>
                      <p className="text-xs text-[#8A92A6]">Check your ranking</p>
                    </div>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-[#009A44] rotate-180 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
