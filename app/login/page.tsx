import { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from './login-form'
import { ArrowLeft, Trophy } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Login | South Soccers Prediction League',
  description: 'Sign in to your account to make predictions',
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-[#030306] overflow-hidden flex items-center justify-center p-3 md:p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-cyber-pitch opacity-[0.05]" />
      <div className="absolute top-[-5%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#F3A81D]/6 blur-[150px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-[-5%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#D80027]/6 blur-[150px] pointer-events-none animate-float-medium" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[#C1C5D0] hover:text-[#F3A81D] font-bold mb-4 md:mb-8 transition-colors group text-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-4 md:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-[#F3A81D] to-[#D80027] mb-2 md:mb-4 shadow-2xl shadow-[#F3A81D]/30">
            <Trophy className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F3A81D] to-white uppercase tracking-tight mb-1.5 md:mb-3">
            Welcome Back
          </h1>
          <p className="text-[#C1C5D0] text-xs md:text-sm">
            Sign in to continue making predictions
          </p>
          <p className="text-[#F3A81D] font-black text-[10px] md:text-xs uppercase tracking-wider mt-1 md:mt-2">
            FIFA World Cup 2026™
          </p>
        </div>
        
        <LoginForm />
        
        <p className="text-center text-xs md:text-sm text-[#8A92A6] mt-4 md:mt-6">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="text-[#F3A81D] hover:text-[#FFD700] font-bold transition-colors"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}
