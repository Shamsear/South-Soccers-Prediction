import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Calendar, Users, Target, Zap, Award, Trophy, ChevronRight, Star, Globe, ArrowRight } from "lucide-react";

export default async function Home() {
  const supabase = await createServerClient();

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();

  // If logged in, check if admin and redirect accordingly
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const typedProfile = profile as { role: string } | null;
    
    if (typedProfile?.role === 'admin') {
      redirect('/admin');
    } else {
      redirect('/matches');
    }
  }

  // Fetch top 5 users from leaderboard for public view
  const { data: topUsers } = await supabase
    .from('leaderboard')
    .select('*')
    .limit(5);

  // Split top users into podium (top 3) and runner-ups (4th & 5th)
  const podiumUsers = topUsers ? topUsers.slice(0, 3) : [];
  const runnerUpUsers = topUsers ? topUsers.slice(3, 5) : [];

  // Rearrange podium so Rank 2 is left, Rank 1 is middle, Rank 3 is right
  const rearrangedPodium = [];
  if (podiumUsers[1]) rearrangedPodium.push(podiumUsers[1]); // Rank 2
  if (podiumUsers[0]) rearrangedPodium.push(podiumUsers[0]); // Rank 1
  if (podiumUsers[2]) rearrangedPodium.push(podiumUsers[2]); // Rank 3

  return (
    <div className="relative min-h-screen bg-[#050509] overflow-hidden">
      {/* Subtle Background Grid */}
      <div className="absolute inset-0 bg-cyber-pitch opacity-30" />

      {/* Ambient Lighting (Softer) */}
      <div className="absolute top-[-5%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#D80027]/6 blur-[150px] pointer-events-none animate-float-slow" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#0052B4]/6 blur-[150px] pointer-events-none animate-float-medium" />
      <div className="absolute bottom-[-5%] left-[15%] w-[450px] h-[450px] rounded-full bg-[#F3A81D]/5 blur-[140px] pointer-events-none animate-float-slow" />

      {/* Hero Content */}
      <div className="container mx-auto px-4 pt-10 md:pt-16 pb-20 max-w-7xl relative z-10">

        {/* ===== HERO SECTION ===== */}
        <div className="text-center mb-20 max-w-5xl mx-auto">

          {/* Animated Badge */}
          <div className="hero-entrance hero-entrance-1">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 mb-8 rounded-full border border-[#F3A81D]/25 bg-[#F3A81D]/5 badge-pulse-ring">
              <span className="w-2 h-2 rounded-full bg-[#F3A81D] animate-pulse" />
              <span className="text-[11px] font-black text-[#F3A81D] tracking-[0.18em] uppercase">
                FIFA World Cup 2026 - Live Now
              </span>
              <span className="w-2 h-2 rounded-full bg-[#F3A81D] animate-pulse" />
            </div>
          </div>

          {/* FIFA Trophy Centerpiece */}
          <div className="hero-entrance hero-entrance-2 flex justify-center mb-8">
            <div className="hero-trophy-glow relative w-[140px] h-[180px] md:w-[170px] md:h-[220px]">
              <img
                src="/fifalogo.png"
                alt="FIFA World Cup 2026"
                className="w-full h-full object-contain logo-dark-blend relative z-10 drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Brand Lockup: SS Logo + Title */}
          <div className="hero-entrance hero-entrance-3 mb-4">
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 border-white/10 bg-black/30 p-1.5 shadow-xl overflow-hidden">
                <img
                  src="/sslogo.png"
                  alt="South Soccers"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="text-left">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.92] text-white">
                  <span className="text-shimmer">SOUTH SOCCERS</span>
                </h1>
                <span className="block text-sm md:text-lg text-[#C1C5D0] font-heading font-bold tracking-[0.08em] uppercase mt-1">
                  Prediction League
                </span>
              </div>
            </div>
          </div>

          {/* Gradient Divider */}
          <div className="hero-entrance hero-entrance-3 max-w-md mx-auto mb-6">
            <div className="divider-gradient" />
          </div>

          {/* Host Nations */}
          <div className="hero-entrance hero-entrance-4 flex items-center justify-center gap-3 mb-6">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#D80027]/8 border border-[#D80027]/20 rounded-full">
              <span className="text-[9px] font-black text-[#D80027] tracking-wider uppercase">Canada</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#009A44]/8 border border-[#009A44]/20 rounded-full">
              <span className="text-[9px] font-black text-[#009A44] tracking-wider uppercase">Mexico</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0052B4]/8 border border-[#0052B4]/20 rounded-full">
              <span className="text-[9px] font-black text-[#0052B4] tracking-wider uppercase">USA</span>
            </div>
          </div>

          {/* Description */}
          <div className="hero-entrance hero-entrance-4">
            <p className="text-base md:text-lg text-[#9CA3B4] mb-10 max-w-xl mx-auto leading-relaxed">
              Predict match scores, accumulate points, and rise to the top of the global rankings for the biggest World Cup in history.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="hero-entrance hero-entrance-5 flex flex-col sm:flex-row items-center justify-center gap-4 mb-7">
            <Link href="/register">
              <button className="btn-tactile btn-tactile-gold text-sm h-13 px-8 shadow-lg shadow-[#F3A81D]/20">
                <Star className="w-4 h-4" />
                Join League Free
              </button>
            </Link>
            <Link href="/login">
              <button className="btn-tactile btn-tactile-outline text-sm h-13 px-8">
                Sign In to Account
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="hero-entrance hero-entrance-6 flex items-center justify-center gap-6 text-sm">
            <span className="text-[#6B7280]">Quick view:</span>
            <Link href="/public-matches" className="text-[#F3A81D] hover:text-[#FFD700] font-bold transition-all flex items-center gap-1 group">
              All Matches <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/public-leaderboard" className="text-[#F3A81D] hover:text-[#FFD700] font-bold transition-all flex items-center gap-1 group">
              Leaderboard <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ===== TOURNAMENT STATS CARDS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto mb-24 w-full">
          {/* Card 1 - Tournament Dates */}
          <div className="bg-[#0E0E13] border border-white/5 p-6 rounded-xl relative overflow-hidden card-hover-lift group hover:border-[#D80027]/40">
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#D80027] via-[#D80027]/50 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-lg bg-[#D80027]/10 flex items-center justify-center mb-4 border border-[#D80027]/20 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5 text-[#D80027]" />
            </div>
            <h3 className="text-sm font-black text-white mb-2 uppercase tracking-wider">Tournament Dates</h3>
            <p className="text-2xl font-black text-[#F3A81D] stat-glow">June 11 - July 19</p>
            <p className="text-xs text-[#7A8299] mt-2 font-medium">104 matches across 3 host nations</p>
          </div>

          {/* Card 2 - Teams */}
          <div className="bg-[#0E0E13] border border-white/5 p-6 rounded-xl relative overflow-hidden card-hover-lift group hover:border-[#0052B4]/40">
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#0052B4] via-[#0052B4]/50 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-lg bg-[#0052B4]/10 flex items-center justify-center mb-4 border border-[#0052B4]/20 group-hover:scale-110 transition-transform">
              <Globe className="w-5 h-5 text-[#0052B4]" />
            </div>
            <h3 className="text-sm font-black text-white mb-2 uppercase tracking-wider">Competing Teams</h3>
            <p className="text-2xl font-black text-[#F3A81D] stat-glow">48 Global Teams</p>
            <p className="text-xs text-[#7A8299] mt-2 font-medium">Expanded format with 12 groups</p>
          </div>

          {/* Card 3 - Points */}
          <div className="bg-[#0E0E13] border border-white/5 p-6 rounded-xl relative overflow-hidden card-hover-lift group hover:border-[#009A44]/40">
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#009A44] via-[#009A44]/50 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-lg bg-[#009A44]/10 flex items-center justify-center mb-4 border border-[#009A44]/20 group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5 text-[#009A44]" />
            </div>
            <h3 className="text-sm font-black text-white mb-2 uppercase tracking-wider">Points Scheme</h3>
            <p className="text-2xl font-black text-[#F3A81D] stat-glow">3 pts / 1 pt</p>
            <p className="text-xs text-[#7A8299] mt-2 font-medium">Exact score or correct match outcome</p>
          </div>
        </div>

        {/* ===== PODIUM LEADERBOARD PREVIEW ===== */}
        {topUsers && topUsers.length > 0 && (
          <div className="max-w-5xl mx-auto mb-24 w-full">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-white uppercase mb-2 tracking-wide">
                Current Leaders
              </h2>
              <p className="text-[#8A92A6] text-base">
                Top performers earning bragging rights
              </p>
            </div>

            {/* 3D Podium */}
            <div className="flex flex-col md:flex-row items-end justify-center gap-5 mb-10">
              {rearrangedPodium.map((user) => {
                const rank = user.rank || 1;
                const isFirst = rank === 1;
                const isSecond = rank === 2;
                const isThird = rank === 3;

                let podiumClass = 'podium-silver md:w-60 h-44 order-2 md:order-1';
                let badgeText = 'RANK 2';
                let medalIcon = <Award className="w-6 h-6 text-[#C0C0C0]" />;

                if (isFirst) {
                  podiumClass = 'podium-gold md:w-64 h-52 order-1 md:order-2 scale-105';
                  badgeText = 'CHAMPION';
                  medalIcon = <Trophy className="w-6 h-6 text-[#F3A81D]" />;
                } else if (isThird) {
                  podiumClass = 'podium-bronze md:w-56 h-36 order-3';
                  badgeText = 'RANK 3';
                  medalIcon = <Award className="w-6 h-6 text-[#CD7F32]" />;
                }

                return (
                  <div
                    key={user.id}
                    className={`w-full podium-box ${podiumClass} flex flex-col justify-between p-5 text-center`}
                  >
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 bg-black/50 border border-white/10 rounded text-[9px] font-black uppercase text-white tracking-wider">
                        {badgeText}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center pt-2">
                      <div className="mb-2">{medalIcon}</div>
                      <div className="w-14 h-14 rounded border-2 border-white/10 p-1 mb-2.5 bg-black/30 flex items-center justify-center">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.username}
                            className="w-full h-full rounded object-cover"
                          />
                        ) : (
                          <div className="w-full h-full rounded bg-white/5 flex items-center justify-center text-[#F3A81D] font-black text-lg">
                            {user.username[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <h3 className="font-black text-sm text-white truncate max-w-full">
                        {user.username}
                      </h3>
                      <p className="text-[10px] text-[#8A92A6] font-bold uppercase mt-0.5">
                        {user.correct_predictions} Exact
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-white/5 mt-3">
                      <span className="text-2xl font-black text-[#F3A81D]">
                        {user.total_points}
                      </span>
                      <span className="text-xs text-[#8A92A6] ml-1 font-bold">PTS</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Runner Ups */}
            {runnerUpUsers.length > 0 && (
              <div className="space-y-2.5 max-w-2xl mx-auto mb-8">
                {runnerUpUsers.map((user, idx) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3.5 rounded-lg bg-[#0E0E13] border border-white/5 hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="font-black text-sm text-[#F3A81D]">#{idx + 4}</span>
                      <div className="w-8 h-8 rounded bg-[#161620] border border-white/10 flex items-center justify-center overflow-hidden">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[#F3A81D] text-xs font-black">{user.username[0].toUpperCase()}</span>
                        )}
                      </div>
                      <span className="font-bold text-sm text-white">{user.username}</span>
                    </div>
                    <div className="flex items-center gap-3.5">
                      <span className="text-[10px] text-[#8A92A6] font-bold uppercase">{user.correct_predictions} Exact</span>
                      <span className="font-black text-base text-[#F3A81D]">{user.total_points} PTS</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center">
              <Link href="/public-leaderboard">
                <button className="btn-tactile btn-tactile-outline text-xs py-2.5 px-6">
                  View Full Leaderboard
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* ===== HOW TO PLAY ===== */}
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase mb-2 tracking-wide">
              How to Play
            </h2>
            <p className="text-[#8A92A6] text-base">
              Simple steps to championship glory
            </p>
            <div className="divider-gradient max-w-xs mx-auto mt-5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-[#0E0E13] border border-white/5 p-6 rounded-xl relative overflow-hidden card-hover-lift group hover:border-[#F3A81D]/40 step-connector">
              <div className="absolute top-3 right-4 flex items-center gap-1.5">
                <span className="text-[10px] font-black text-[#F3A81D]/40 tracking-widest uppercase">Step</span>
                <span className="text-4xl font-black text-[#F3A81D]/10 leading-none">01</span>
              </div>
              <div className="w-12 h-12 rounded-lg bg-[#F3A81D]/10 flex items-center justify-center mb-4 border border-[#F3A81D]/20 group-hover:scale-110 group-hover:bg-[#F3A81D]/15 transition-all">
                <Zap className="w-5 h-5 text-[#F3A81D]" />
              </div>
              <h3 className="text-base font-black text-white mb-2 uppercase">Predict Scores</h3>
              <p className="text-sm text-[#9CA3B4] leading-relaxed">
                Submit your predictions for matches before kickoff. Enter expected goals for both teams.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#0E0E13] border border-white/5 p-6 rounded-xl relative overflow-hidden card-hover-lift group hover:border-[#D80027]/40 step-connector">
              <div className="absolute top-3 right-4 flex items-center gap-1.5">
                <span className="text-[10px] font-black text-[#D80027]/40 tracking-widest uppercase">Step</span>
                <span className="text-4xl font-black text-[#D80027]/10 leading-none">02</span>
              </div>
              <div className="w-12 h-12 rounded-lg bg-[#D80027]/10 flex items-center justify-center mb-4 border border-[#D80027]/20 group-hover:scale-110 group-hover:bg-[#D80027]/15 transition-all">
                <Award className="w-5 h-5 text-[#D80027]" />
              </div>
              <h3 className="text-base font-black text-white mb-2 uppercase">Score Points</h3>
              <p className="text-sm text-[#9CA3B4] leading-relaxed">
                Earn <strong className="text-[#F3A81D]">3 points</strong> for exact score, <strong className="text-[#F3A81D]">1 point</strong> for correct result.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#0E0E13] border border-white/5 p-6 rounded-xl relative overflow-hidden card-hover-lift group hover:border-[#0052B4]/40">
              <div className="absolute top-3 right-4 flex items-center gap-1.5">
                <span className="text-[10px] font-black text-[#0052B4]/40 tracking-widest uppercase">Step</span>
                <span className="text-4xl font-black text-[#0052B4]/10 leading-none">03</span>
              </div>
              <div className="w-12 h-12 rounded-lg bg-[#0052B4]/10 flex items-center justify-center mb-4 border border-[#0052B4]/20 group-hover:scale-110 group-hover:bg-[#0052B4]/15 transition-all">
                <Trophy className="w-5 h-5 text-[#0052B4]" />
              </div>
              <h3 className="text-base font-black text-white mb-2 uppercase">Climb Rankings</h3>
              <p className="text-sm text-[#9CA3B4] leading-relaxed">
                Compare your scores on the global leaderboard and earn ultimate bragging rights.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
