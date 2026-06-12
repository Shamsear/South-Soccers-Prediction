'use client'

import { useActionState, useState } from 'react'
import { loginAction } from '@/app/actions/auth'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { KeyRound, Mail, LogIn, Eye, EyeOff } from 'lucide-react'

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [state, formAction, isPending] = useActionState<
    { error?: string } | undefined,
    FormData
  >(
    async (prevState, formData) => {
      try {
        return await loginAction(formData)
      } catch (error) {
        if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
          throw error
        }
        return { error: 'An unexpected error occurred. Please try again.' }
      }
    },
    undefined
  )

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    }
  }, [state])

  return (
    <div className="bg-[#0E0E13] border border-white/5 rounded-xl p-8 shadow-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white uppercase tracking-wide">Sign In</h2>
        <p className="text-[#8A92A6] text-xs mt-1">
          Enter your credentials to access your account
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        
        {/* Email Address */}
        <div>
          <label htmlFor="email" className="flex items-center gap-2 text-xs font-black text-[#F3A81D] uppercase tracking-wider mb-2">
            <Mail className="w-4 h-4 text-[#F3A81D]" />
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            disabled={isPending}
            required
            autoComplete="email"
            className="w-full bg-[#050508]/60 border border-white/10 rounded-lg px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#F3A81D] focus:ring-2 focus:ring-[#F3A81D]/20 transition-all placeholder:text-[#8A92A6] disabled:opacity-50"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="flex items-center gap-2 text-xs font-black text-[#F3A81D] uppercase tracking-wider mb-2">
            <KeyRound className="w-4 h-4 text-[#F3A81D]" />
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              disabled={isPending}
              required
              autoComplete="current-password"
              className="w-full bg-[#050508]/60 border border-white/10 rounded-lg px-4 py-3 pr-12 text-sm font-bold text-white focus:outline-none focus:border-[#F3A81D] focus:ring-2 focus:ring-[#F3A81D]/20 transition-all placeholder:text-[#8A92A6] disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A92A6] hover:text-[#F3A81D] transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {state?.error && (
          <div className="bg-[#D80027]/10 border border-[#D80027]/30 rounded-lg p-3" role="alert">
            <p className="text-sm text-[#D80027] font-semibold">{state.error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-gradient-to-r from-[#F3A81D] to-[#D80027] hover:from-[#D80027] hover:to-[#F3A81D] text-white font-black text-sm uppercase tracking-wider py-4 rounded-lg transition-all duration-300 shadow-lg shadow-[#F3A81D]/30 hover:shadow-xl hover:shadow-[#F3A81D]/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
        >
          <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          {isPending ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
