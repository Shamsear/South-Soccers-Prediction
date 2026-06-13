import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Calendar, Target, Star, Globe, ArrowRight, ChevronRight } from "lucide-react";

export default async function Home() {
  const supabase = await createServerClient();

  // Check if user is logged in (handle expired tokens gracefully)
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // If logged in and no error, check if admin and redirect accordingly
  if (user && !userError) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const typedProfile = profile as { role: string } | null;
    
    if (typedProfile?.role === 'admin') {
      redirect('/admin');
    } else {
      redirect('/dashboard');
    }
  }

  return (
    <div className="relative min-h-screen bg-[#050509] overflow-hidden flex items-center justify-center">
      {/* Subtle Background Grid */}
      <div className="absolute inset-0 bg-cyber-pitch opacity-20" />

      {/* Ambient Lighting */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#F3A81D]/8 blur-[150px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#0052B4]/8 blur-[150px] pointer-events-none animate-float-medium" />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
        
        <div className="text-center">
          
          {/* FIFA World Cup Logo */}
          <div className="flex justify-center -mb-4 md:-mb-8">
            <div className="relative w-[180px] h-[220px] md:w-[220px] md:h-[280px]">
              <img
                src="/fifalogo.png"
                alt="FIFA World Cup 2026"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl border-2 border-white/10 bg-black/30 p-2 shadow-xl">
                <img
                  src="/sslogo.png"
                  alt="South Soccers"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F3A81D] to-white uppercase tracking-tight leading-tight mb-3">
              South Soccers
            </h1>
            <p className="text-lg md:text-xl text-[#F3A81D] font-bold uppercase tracking-wider mb-2">
              Prediction League
            </p>
            <div className="max-w-md mx-auto">
              <div className="h-[2px] bg-gradient-to-r from-transparent via-[#F3A81D] to-transparent mb-6" />
            </div>
            <p className="text-base md:text-lg text-[#C1C5D0] max-w-2xl mx-auto leading-relaxed">
              Predict match scores, compete with friends, and climb to the top of the leaderboard for FIFA World Cup 2026
            </p>
          </div>

          {/* Host Nations */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="px-3 py-1.5 bg-[#D80027]/10 border border-[#D80027]/30 rounded-full">
              <span className="text-xs font-black text-[#D80027] tracking-wider uppercase">Canada</span>
            </div>
            <div className="px-3 py-1.5 bg-[#009A44]/10 border border-[#009A44]/30 rounded-full">
              <span className="text-xs font-black text-[#009A44] tracking-wider uppercase">Mexico</span>
            </div>
            <div className="px-3 py-1.5 bg-[#0052B4]/10 border border-[#0052B4]/30 rounded-full">
              <span className="text-xs font-black text-[#0052B4] tracking-wider uppercase">USA</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/register">
              <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#F3A81D] to-[#D80027] hover:from-[#D80027] hover:to-[#F3A81D] text-white font-black text-base uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-[#F3A81D]/30 hover:shadow-xl hover:shadow-[#F3A81D]/50 flex items-center justify-center gap-2">
                <Star className="w-5 h-5" />
                Join Free
              </button>
            </Link>
            <Link href="/login">
              <button className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-[#F3A81D]/50 text-white font-bold text-base uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2">
                Sign In
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <Link href="/public-matches" className="text-[#8A92A6] hover:text-[#F3A81D] font-bold transition-colors flex items-center gap-1 group">
              View Matches
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <span className="text-[#8A92A6]">•</span>
            <Link href="/public-leaderboard" className="text-[#8A92A6] hover:text-[#F3A81D] font-bold transition-colors flex items-center gap-1 group">
              Leaderboard
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <span className="text-[#8A92A6]">•</span>
            <Link href="/scoring-rules" className="text-[#8A92A6] hover:text-[#F3A81D] font-bold transition-colors flex items-center gap-1 group">
              How It Works
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Tournament Info Cards - Compact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 max-w-3xl mx-auto">
            
            {/* Dates */}
            <div className="bg-[#0E0E13]/80 backdrop-blur-sm border border-white/5 rounded-xl p-5 hover:border-[#F3A81D]/30 transition-colors">
              <Calendar className="w-6 h-6 text-[#F3A81D] mx-auto mb-2" />
              <p className="text-xs font-black text-[#8A92A6] uppercase tracking-wider mb-1">Tournament</p>
              <p className="text-lg font-black text-white">June 11 - July 19</p>
            </div>

            {/* Teams */}
            <div className="bg-[#0E0E13]/80 backdrop-blur-sm border border-white/5 rounded-xl p-5 hover:border-[#0052B4]/30 transition-colors">
              <Globe className="w-6 h-6 text-[#0052B4] mx-auto mb-2" />
              <p className="text-xs font-black text-[#8A92A6] uppercase tracking-wider mb-1">Teams</p>
              <p className="text-lg font-black text-white">48 Nations</p>
            </div>

            {/* Points */}
            <div className="bg-[#0E0E13]/80 backdrop-blur-sm border border-white/5 rounded-xl p-5 hover:border-[#10B981]/30 transition-colors">
              <Target className="w-6 h-6 text-[#10B981] mx-auto mb-2" />
              <p className="text-xs font-black text-[#8A92A6] uppercase tracking-wider mb-1">Points</p>
              <p className="text-lg font-black text-white">3 pts / 1 pt</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
