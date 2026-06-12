import { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from './register-form'
import { ArrowLeft, UserPlus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Register | South Soccers Prediction League',
  description: 'Create an account to join the FIFA World Cup 2026 prediction competition',
}

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen bg-[#030306] overflow-hidden flex items-center justify-center p-4 py-12">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-cyber-pitch opacity-[0.05]" />
      <div className="absolute top-[-5%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#D80027]/6 blur-[150px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-[-5%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#0052B4]/6 blur-[150px] pointer-events-none animate-float-medium" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#C1C5D0] hover:text-[#F3A81D] font-bold mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-[#0052B4] to-[#003D8C] mb-4 shadow-2xl shadow-[#0052B4]/30">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F3A81D] to-white uppercase tracking-tight mb-3">
            Join The League
          </h1>
          <p className="text-[#C1C5D0] text-sm">
            Create your account and start predicting
          </p>
          <p className="text-[#F3A81D] font-black text-xs uppercase tracking-wider mt-2">
            FIFA World Cup 2026™
          </p>
        </div>
        
        <RegisterForm />
        
        <p className="text-center text-sm text-[#8A92A6] mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-[#F3A81D] hover:text-[#FFD700] font-bold transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
}
