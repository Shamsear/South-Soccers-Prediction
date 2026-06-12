/**
 * Admin Import Predictions Page
 * 
 * Allows admins to bulk import predictions from external sources (like Google Forms)
 * and automatically calculate points based on match results.
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { ImportPredictionsForm } from '@/components/import-predictions-form'
import { ArrowLeft, Upload, Shield, AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Import Predictions | Admin | South Soccers',
  description: 'Bulk import predictions from external sources',
}

export default async function ImportPredictionsPage() {
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

  // Fetch all users for dropdown
  const { data: users } = await supabase
    .from('profiles')
    .select('id, username, full_name')
    .neq('role', 'admin')
    .order('username', { ascending: true })

  const typedUsers = (users || []) as Array<{
    id: string
    username: string
    full_name: string | null
  }>

  // Fetch all matches for dropdown
  const { data: matches } = await supabase
    .from('matches')
    .select('id, home_team, away_team, kickoff_time, status, home_score, away_score, competition_round, group_name')
    .order('kickoff_time', { ascending: false })

  const typedMatches = (matches || []) as Array<{
    id: string
    home_team: string
    away_team: string
    kickoff_time: string
    status: 'upcoming' | 'live' | 'finished'
    home_score: number | null
    away_score: number | null
    competition_round: string
    group_name: string | null
  }>

  return (
    <div className="relative min-h-screen bg-[#030306] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-cyber-pitch opacity-[0.05]" />
      <div className="absolute top-[-5%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#0052B4]/6 blur-[150px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#F3A81D]/6 blur-[150px] pointer-events-none animate-float-medium" />

      <div className="container mx-auto px-4 py-12 max-w-5xl relative z-10">
        
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-[#C1C5D0] hover:text-[#F3A81D] font-bold mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Admin Home
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0052B4] to-[#003D8C] flex items-center justify-center">
              <Upload className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F3A81D] to-white uppercase tracking-tight">
                Import Predictions
              </h1>
              <p className="text-[#C1C5D0] text-sm mt-1">
                Bulk import predictions from external sources (Google Forms, etc.)
              </p>
            </div>
          </div>
        </div>

        {/* Warning Notice */}
        <div className="bg-[#D80027]/10 border-2 border-[#D80027]/30 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#D80027]/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-[#D80027]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#D80027] uppercase tracking-wide mb-2">
                Important: Admin Only Feature
              </h3>
              <div className="space-y-2 text-sm text-[#C1C5D0]">
                <p>• This tool is for importing predictions collected externally (e.g., Google Forms)</p>
                <p>• Points will be calculated automatically based on match results</p>
                <p>• Existing predictions for the same user/match combination will be skipped</p>
                <p>• Only matches with final scores can have points calculated</p>
              </div>
            </div>
          </div>
        </div>

        {/* Import Form */}
        <div className="bg-[#0E0E13] border border-white/5 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-[#0052B4]/10 flex items-center justify-center border border-[#0052B4]/20">
              <Shield className="w-5 h-5 text-[#0052B4]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wide">
                Add Single Prediction
              </h2>
              <p className="text-xs text-[#8A92A6]">Import one prediction at a time</p>
            </div>
          </div>

          <ImportPredictionsForm users={typedUsers} matches={typedMatches} />
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-[#0E0E13] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-black text-[#F3A81D] uppercase tracking-wider mb-4">
            How It Works
          </h3>
          <ol className="space-y-3 text-sm text-[#C1C5D0]">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F3A81D]/10 flex items-center justify-center text-xs font-black text-[#F3A81D]">1</span>
              <span>Select the user who made the prediction</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F3A81D]/10 flex items-center justify-center text-xs font-black text-[#F3A81D]">2</span>
              <span>Select the match they predicted</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F3A81D]/10 flex items-center justify-center text-xs font-black text-[#F3A81D]">3</span>
              <span>Enter their predicted scores (Home and Away)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F3A81D]/10 flex items-center justify-center text-xs font-black text-[#F3A81D]">4</span>
              <span>Click "Import Prediction" - the system will automatically calculate points if the match has finished</span>
            </li>
          </ol>
        </div>

      </div>
    </div>
  )
}
