/**
 * Scoring Rules Page
 * 
 * Displays the point system and scoring rules
 * Accessible to everyone (public, authenticated users, admins)
 */

import { Metadata } from 'next'
import Link from 'next/link'
import { Trophy, Target, Award, TrendingUp, Info, CheckCircle, XCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Scoring Rules | South Soccers Prediction League',
  description: 'Learn how points are calculated and maximize your score',
}

export default function ScoringRulesPage() {
  return (
    <div className="relative min-h-screen bg-[#030306] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-cyber-pitch opacity-[0.05]" />
      <div className="absolute top-[-5%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#F3A81D]/6 blur-[150px] pointer-events-none animate-float-slow" />

      <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#F3A81D] hover:text-[#FFD700] font-bold transition-colors text-sm"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F3A81D] to-[#FFA500] flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F3A81D] to-white uppercase tracking-tight">
                Scoring Rules
              </h1>
              <p className="text-[#C1C5D0] text-sm mt-1">
                Understand how points are calculated and maximize your score
              </p>
            </div>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="bg-gradient-to-br from-[#0E0E13] to-[#1A1A24] border-2 border-[#F3A81D]/30 p-8 rounded-xl mb-12">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-[#F3A81D] flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-black text-white uppercase mb-3">How to Win Points</h2>
              <p className="text-[#C1C5D0] mb-4">
                Our advanced scoring system rewards accuracy and strategic prediction. The more accurate your prediction, the more points you earn. Knockout matches offer bonus opportunities!
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="px-3 py-1.5 bg-[#009A44]/20 border border-[#009A44]/40 rounded-lg">
                  <span className="text-xs font-black text-[#009A44] uppercase">Max: 9 Points</span>
                </div>
                <div className="px-3 py-1.5 bg-[#F3A81D]/20 border border-[#F3A81D]/40 rounded-lg">
                  <span className="text-xs font-black text-[#F3A81D] uppercase">Bonuses Available</span>
                </div>
                <div className="px-3 py-1.5 bg-[#0052B4]/20 border border-[#0052B4]/40 rounded-lg">
                  <span className="text-xs font-black text-[#0052B4] uppercase">Penalty Predictions</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Scoring Rules */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-[#F3A81D] uppercase mb-6 flex items-center gap-3">
            <Target className="w-6 h-6" />
            Complete Point System - All 11 Scenarios
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Scenario 1: Exact Score */}
            <div className="bg-[#0E0E13] border-2 border-[#009A44]/40 p-6 rounded-xl hover:border-[#009A44] transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#009A44]/20 flex items-center justify-center">
                    <span className="text-lg font-black text-[#009A44]">1</span>
                  </div>
                  <h3 className="text-lg font-black text-white uppercase">Exact Score</h3>
                </div>
                <div className="px-3 py-1 bg-[#009A44] rounded-lg">
                  <span className="text-xl font-black text-white">5</span>
                </div>
              </div>
              <p className="text-[#C1C5D0] text-sm mb-3">
                Predict the exact final score correctly
              </p>
              <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                <p className="text-xs font-bold text-[#8A92A6] uppercase mb-1">Example</p>
                <p className="text-sm text-white">
                  <span className="text-[#009A44]">✓</span> Predicted: Brazil 2-1 Argentina<br />
                  <span className="text-[#009A44]">✓</span> Actual: Brazil 2-1 Argentina<br />
                  <span className="text-[#F3A81D] font-black">= 5 points</span>
                </p>
              </div>
            </div>

            {/* Scenario 2 & 7: Correct Result Only / Correct Winner */}
            <div className="bg-[#0E0E13] border-2 border-[#0052B4]/40 p-6 rounded-xl hover:border-[#0052B4] transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0052B4]/20 flex items-center justify-center">
                    <span className="text-lg font-black text-[#0052B4]">2</span>
                  </div>
                  <h3 className="text-lg font-black text-white uppercase">Correct Winner/Draw</h3>
                </div>
                <div className="px-3 py-1 bg-[#0052B4] rounded-lg">
                  <span className="text-xl font-black text-white">3</span>
                </div>
              </div>
              <p className="text-[#C1C5D0] text-sm mb-3">
                Predict the correct winner or draw, but not the exact score
              </p>
              <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                <p className="text-xs font-bold text-[#8A92A6] uppercase mb-1">Example</p>
                <p className="text-sm text-white">
                  <span className="text-[#0052B4]">✓</span> Predicted: Spain 3-1 Portugal<br />
                  <span className="text-[#0052B4]">✓</span> Actual: Spain 2-0 Portugal<br />
                  <span className="text-[#F3A81D] font-black">= 3 points</span>
                </p>
              </div>
            </div>

            {/* Scenario 3: Goal Difference Bonus */}
            <div className="bg-[#0E0E13] border-2 border-[#F3A81D]/40 p-6 rounded-xl hover:border-[#F3A81D] transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F3A81D]/20 flex items-center justify-center">
                    <span className="text-lg font-black text-[#F3A81D]">3</span>
                  </div>
                  <h3 className="text-lg font-black text-white uppercase">Goal Diff Bonus</h3>
                </div>
                <div className="px-3 py-1 bg-[#F3A81D] rounded-lg">
                  <span className="text-xl font-black text-white">+1</span>
                </div>
              </div>
              <p className="text-[#C1C5D0] text-sm mb-3">
                Extra point when winning margin matches (added to result points)
              </p>
              <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                <p className="text-xs font-bold text-[#8A92A6] uppercase mb-1">Example</p>
                <p className="text-sm text-white">
                  <span className="text-[#0052B4]">✓</span> Predicted: England 3-1 (2-goal margin)<br />
                  <span className="text-[#0052B4]">✓</span> Actual: England 2-0 (2-goal margin)<br />
                  <span className="text-[#F3A81D] font-black">= 3 + 1 bonus = 4 points</span>
                </p>
              </div>
            </div>

            {/* Scenario 8: Result + Goal Diff */}
            <div className="bg-[#0E0E13] border-2 border-[#F3A81D]/40 p-6 rounded-xl hover:border-[#F3A81D] transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F3A81D]/20 flex items-center justify-center">
                    <span className="text-lg font-black text-[#F3A81D]">8</span>
                  </div>
                  <h3 className="text-lg font-black text-white uppercase">Winner + Goal Diff</h3>
                </div>
                <div className="px-3 py-1 bg-[#F3A81D] rounded-lg">
                  <span className="text-xl font-black text-white">4</span>
                </div>
              </div>
              <p className="text-[#C1C5D0] text-sm mb-3">
                Correct winner/draw + correct winning margin
              </p>
              <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                <p className="text-xs font-bold text-[#8A92A6] uppercase mb-1">Breakdown</p>
                <p className="text-sm text-white">
                  3 pts (correct result)<br />
                  + 1 pt (goal difference bonus)<br />
                  <span className="text-[#F3A81D] font-black">= 4 points total</span>
                </p>
              </div>
            </div>

            {/* Scenario 4: Knockout Bonus */}
            <div className="bg-[#0E0E13] border-2 border-[#D80027]/40 p-6 rounded-xl hover:border-[#D80027] transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#D80027]/20 flex items-center justify-center">
                    <span className="text-lg font-black text-[#D80027]">4</span>
                  </div>
                  <h3 className="text-lg font-black text-white uppercase">Knockout Bonus</h3>
                </div>
                <div className="px-3 py-1 bg-[#D80027] rounded-lg">
                  <span className="text-xl font-black text-white">+2</span>
                </div>
              </div>
              <p className="text-[#C1C5D0] text-sm mb-3">
                Extra 2 points for exact score in knockout stages (R32, R16, QF, SF, Final)
              </p>
              <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                <p className="text-xs font-bold text-[#8A92A6] uppercase mb-1">Example</p>
                <p className="text-sm text-white">
                  Round of 16 exact prediction<br />
                  <span className="text-[#009A44]">✓</span> France 2-1 Germany<br />
                  <span className="text-[#F3A81D] font-black">= 5 + 2 bonus = 7 points</span>
                </p>
              </div>
            </div>

            {/* Scenario 5: Penalty Bonus */}
            <div className="bg-[#0E0E13] border-2 border-[#8B0A1E]/40 p-6 rounded-xl hover:border-[#8B0A1E] transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#8B0A1E]/20 flex items-center justify-center">
                    <span className="text-lg font-black text-[#8B0A1E]">5</span>
                  </div>
                  <h3 className="text-lg font-black text-white uppercase">Penalty Winner</h3>
                </div>
                <div className="px-3 py-1 bg-[#8B0A1E] rounded-lg">
                  <span className="text-xl font-black text-white">+2</span>
                </div>
              </div>
              <p className="text-[#C1C5D0] text-sm mb-3">
                Extra 2 points for correctly predicting penalty shootout winner (knockout only)
              </p>
              <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                <p className="text-xs font-bold text-[#8A92A6] uppercase mb-1">Example</p>
                <p className="text-sm text-white">
                  Italy 1-1 England<br />
                  <span className="text-[#8B0A1E]">✓</span> Penalties: Italy wins<br />
                  <span className="text-[#F3A81D] font-black">= +2 bonus points</span>
                </p>
              </div>
            </div>

            {/* Scenario 6: Wrong Result */}
            <div className="bg-[#0E0E13] border-2 border-[#6B7280]/40 p-6 rounded-xl hover:border-[#6B7280] transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#6B7280]/20 flex items-center justify-center">
                    <span className="text-lg font-black text-[#6B7280]">6</span>
                  </div>
                  <h3 className="text-lg font-black text-white uppercase">Wrong Result</h3>
                </div>
                <div className="px-3 py-1 bg-[#6B7280] rounded-lg">
                  <span className="text-xl font-black text-white">0</span>
                </div>
              </div>
              <p className="text-[#C1C5D0] text-sm mb-3">
                Incorrect winner/draw prediction
              </p>
              <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                <p className="text-xs font-bold text-[#8A92A6] uppercase mb-1">Example</p>
                <p className="text-sm text-white">
                  <span className="text-[#6B7280]">✗</span> Predicted: Mexico wins<br />
                  <span className="text-[#6B7280]">✗</span> Actual: USA wins<br />
                  <span className="text-[#8A92A6] font-black">= 0 points</span>
                </p>
              </div>
            </div>

            {/* Scenario 9: Group Stage Exact */}
            <div className="bg-[#0E0E13] border-2 border-[#009A44]/40 p-6 rounded-xl hover:border-[#009A44] transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#009A44]/20 flex items-center justify-center">
                    <span className="text-lg font-black text-[#009A44]">9</span>
                  </div>
                  <h3 className="text-lg font-black text-white uppercase">Group Stage Exact</h3>
                </div>
                <div className="px-3 py-1 bg-[#009A44] rounded-lg">
                  <span className="text-xl font-black text-white">5</span>
                </div>
              </div>
              <p className="text-[#C1C5D0] text-sm mb-3">
                Exact score in group stage matches
              </p>
              <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                <p className="text-xs font-bold text-[#8A92A6] uppercase mb-1">Example</p>
                <p className="text-sm text-white">
                  Group A: Brazil 2-1 Serbia<br />
                  <span className="text-[#009A44]">✓</span> Exact prediction<br />
                  <span className="text-[#F3A81D] font-black">= 5 points (base only)</span>
                </p>
              </div>
            </div>

            {/* Scenario 10: Knockout Exact (No Penalty) */}
            <div className="bg-[#0E0E13] border-2 border-[#D80027]/40 p-6 rounded-xl hover:border-[#D80027] transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#D80027]/20 flex items-center justify-center">
                    <span className="text-lg font-black text-[#D80027]">10</span>
                  </div>
                  <h3 className="text-lg font-black text-white uppercase">Knockout Exact</h3>
                </div>
                <div className="px-3 py-1 bg-[#D80027] rounded-lg">
                  <span className="text-xl font-black text-white">7</span>
                </div>
              </div>
              <p className="text-[#C1C5D0] text-sm mb-3">
                Exact score in knockout stage (no penalties)
              </p>
              <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                <p className="text-xs font-bold text-[#8A92A6] uppercase mb-1">Breakdown</p>
                <p className="text-sm text-white">
                  5 pts (exact score)<br />
                  + 2 pts (knockout bonus)<br />
                  <span className="text-[#F3A81D] font-black">= 7 points total</span>
                </p>
              </div>
            </div>

            {/* Scenario 11: Maximum Points */}
            <div className="bg-[#0E0E13] border-2 border-[#8B0A1E]/40 p-6 rounded-xl hover:border-[#8B0A1E] transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#8B0A1E]/20 flex items-center justify-center">
                    <span className="text-lg font-black text-[#8B0A1E]">11</span>
                  </div>
                  <h3 className="text-lg font-black text-white uppercase">Maximum Points</h3>
                </div>
                <div className="px-3 py-1 bg-gradient-to-r from-[#D80027] to-[#8B0A1E] rounded-lg">
                  <span className="text-xl font-black text-white">9</span>
                </div>
              </div>
              <p className="text-[#C1C5D0] text-sm mb-3">
                Exact score in knockout + correct penalty winner
              </p>
              <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                <p className="text-xs font-bold text-[#8A92A6] uppercase mb-1">Breakdown</p>
                <p className="text-sm text-white">
                  5 pts (exact score)<br />
                  + 2 pts (knockout bonus)<br />
                  + 2 pts (penalty bonus)<br />
                  <span className="text-[#F3A81D] font-black">= 9 points (MAXIMUM!)</span>
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Bonus Points Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-[#D80027] uppercase mb-6 flex items-center gap-3">
            <Award className="w-6 h-6" />
            Knockout Stage Bonuses
          </h2>

          <div className="bg-gradient-to-br from-[#D80027]/10 to-[#8B0A1E]/10 border-2 border-[#D80027]/40 p-8 rounded-xl mb-6">
            <p className="text-[#C1C5D0] mb-6">
              Knockout matches (Round of 32, Round of 16, Quarter Finals, Semi Finals, Final) offer additional bonus points for accurate predictions:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Knockout Bonus */}
              <div className="bg-black/40 p-6 rounded-xl border border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-black text-white uppercase">Knockout Exact Score</h3>
                  <div className="px-3 py-1 bg-[#D80027] rounded-lg">
                    <span className="text-xl font-black text-white">+2</span>
                  </div>
                </div>
                <p className="text-[#C1C5D0] text-sm mb-3">
                  Extra 2 points for predicting exact score in knockout stages
                </p>
                <div className="bg-black/60 p-3 rounded-lg border border-white/10">
                  <p className="text-xs font-bold text-[#8A92A6] uppercase mb-1">Example</p>
                  <p className="text-sm text-white">
                    Exact score in Round of 16<br />
                    <span className="text-[#009A44]">✓</span> France 2-1 Germany<br />
                    <span className="text-[#F3A81D] font-black">Total: 7 points (5+2)</span>
                  </p>
                </div>
              </div>

              {/* Penalty Bonus */}
              <div className="bg-black/40 p-6 rounded-xl border border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-black text-white uppercase">Penalty Shootout</h3>
                  <div className="px-3 py-1 bg-[#8B0A1E] rounded-lg">
                    <span className="text-xl font-black text-white">+2</span>
                  </div>
                </div>
                <p className="text-[#C1C5D0] text-sm mb-3">
                  Extra 2 points for correctly predicting penalty shootout winner
                </p>
                <div className="bg-black/60 p-3 rounded-lg border border-white/10">
                  <p className="text-xs font-bold text-[#8A92A6] uppercase mb-1">Example</p>
                  <p className="text-sm text-white">
                    Match: Italy 1-1 England<br />
                    <span className="text-[#8B0A1E]">✓</span> Penalty Winner: Italy<br />
                    <span className="text-[#F3A81D] font-black">Bonus: +2 points</span>
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Maximum Points Examples */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-[#009A44] uppercase mb-6">
            Maximum Points Scenarios
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Scenario 1 */}
            <div className="bg-[#0E0E13] border-2 border-[#009A44]/40 p-6 rounded-xl">
              <div className="mb-4">
                <div className="inline-block px-3 py-1 bg-[#009A44] rounded-lg mb-3">
                  <span className="text-2xl font-black text-white">5 pts</span>
                </div>
                <h3 className="text-lg font-black text-white uppercase">Group Stage</h3>
              </div>
              <ul className="space-y-2 text-sm text-[#C1C5D0]">
                <li className="flex items-start gap-2">
                  <span className="text-[#009A44]">✓</span>
                  <span>Exact score: 5 points</span>
                </li>
              </ul>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs font-bold text-[#8A92A6] uppercase mb-1">Example</p>
                <p className="text-xs text-white">Brazil 2-1 Serbia</p>
              </div>
            </div>

            {/* Scenario 2 */}
            <div className="bg-[#0E0E13] border-2 border-[#D80027]/40 p-6 rounded-xl">
              <div className="mb-4">
                <div className="inline-block px-3 py-1 bg-[#D80027] rounded-lg mb-3">
                  <span className="text-2xl font-black text-white">7 pts</span>
                </div>
                <h3 className="text-lg font-black text-white uppercase">Knockout (No Penalty)</h3>
              </div>
              <ul className="space-y-2 text-sm text-[#C1C5D0]">
                <li className="flex items-start gap-2">
                  <span className="text-[#009A44]">✓</span>
                  <span>Exact score: 5 points</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D80027]">+</span>
                  <span>Knockout bonus: 2 points</span>
                </li>
              </ul>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs font-bold text-[#8A92A6] uppercase mb-1">Example</p>
                <p className="text-xs text-white">Argentina 3-0 Poland (R16)</p>
              </div>
            </div>

            {/* Scenario 3 */}
            <div className="bg-[#0E0E13] border-2 border-[#8B0A1E]/40 p-6 rounded-xl">
              <div className="mb-4">
                <div className="inline-block px-3 py-1 bg-[#8B0A1E] rounded-lg mb-3">
                  <span className="text-2xl font-black text-white">9 pts</span>
                </div>
                <h3 className="text-lg font-black text-white uppercase">Maximum Possible</h3>
              </div>
              <ul className="space-y-2 text-sm text-[#C1C5D0]">
                <li className="flex items-start gap-2">
                  <span className="text-[#009A44]">✓</span>
                  <span>Exact score: 5 points</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D80027]">+</span>
                  <span>Knockout bonus: 2 points</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8B0A1E]">+</span>
                  <span>Penalty bonus: 2 points</span>
                </li>
              </ul>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs font-bold text-[#8A92A6] uppercase mb-1">Example</p>
                <p className="text-xs text-white">England 1-1 Italy (Final)<br />Penalties: England wins</p>
              </div>
            </div>

          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-br from-[#0052B4]/10 to-[#0041A8]/10 border-2 border-[#0052B4]/40 p-8 rounded-xl">
          <h2 className="text-2xl font-black text-[#0052B4] uppercase mb-6">
            Pro Tips for Maximum Points
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#0052B4] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-black text-white">1</span>
              </div>
              <p className="text-[#C1C5D0] text-sm">
                <span className="text-white font-bold">Predict early:</span> Submit predictions before kickoff to qualify for points
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#0052B4] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-black text-white">2</span>
              </div>
              <p className="text-[#C1C5D0] text-sm">
                <span className="text-white font-bold">Focus on knockouts:</span> More bonus opportunities in elimination rounds
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#0052B4] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-black text-white">3</span>
              </div>
              <p className="text-[#C1C5D0] text-sm">
                <span className="text-white font-bold">Penalty predictions:</span> Optional but can add crucial points
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#0052B4] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-black text-white">4</span>
              </div>
              <p className="text-[#C1C5D0] text-sm">
                <span className="text-white font-bold">Goal difference matters:</span> Even if score is wrong, correct margin earns bonus
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
