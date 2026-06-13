'use client'

import { useActionState, useState } from 'react'
import { loginAction } from '@/app/actions/auth'
import { lookupUsernameByPhone } from '@/app/actions/lookup-username'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { KeyRound, User, LogIn, Eye, EyeOff, Phone, Search } from 'lucide-react'

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showUsernameLookup, setShowUsernameLookup] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [rememberMe, setRememberMe] = useState(true) // Default to true for better UX
  
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

  const handleUsernameLookup = async () => {
    if (!phoneNumber) {
      toast.error('Please enter your phone number')
      return
    }

    setIsLookingUp(true)
    try {
      const result = await lookupUsernameByPhone(phoneNumber)
      
      if (result.success && result.username) {
        toast.success(`Your username is: ${result.username}`, {
          duration: 10000,
          description: result.fullName ? `Account name: ${result.fullName}` : undefined,
        })
        setShowUsernameLookup(false)
        setPhoneNumber('')
      } else {
        toast.error(result.error || 'Username not found')
      }
    } catch (error) {
      toast.error('Failed to look up username')
    } finally {
      setIsLookingUp(false)
    }
  }

  return (
    <div className="bg-[#0E0E13] border border-white/5 rounded-xl p-4 md:p-8 shadow-2xl">
      <div className="mb-4 md:mb-6">
        <h2 className="text-lg md:text-2xl font-black text-white uppercase tracking-wide">Sign In</h2>
        <p className="text-[#8A92A6] text-[10px] md:text-xs mt-1">
          Enter your credentials to access your account
        </p>
      </div>

      <form action={formAction} className="space-y-3 md:space-y-4">
        
        {/* Username */}
        <div>
          <label htmlFor="username" className="flex items-center gap-1.5 text-[10px] md:text-xs font-black text-[#F3A81D] uppercase tracking-wider mb-1.5 md:mb-2">
            <User className="w-3 h-3 md:w-4 md:h-4 text-[#F3A81D]" />
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="johndoe123"
            disabled={isPending}
            required
            autoComplete="username"
            className="w-full bg-[#050508]/60 border border-white/10 rounded-lg px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-bold text-white focus:outline-none focus:border-[#F3A81D] focus:ring-2 focus:ring-[#F3A81D]/20 transition-all placeholder:text-[#8A92A6] disabled:opacity-50"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="flex items-center gap-1.5 text-[10px] md:text-xs font-black text-[#F3A81D] uppercase tracking-wider mb-1.5 md:mb-2">
            <KeyRound className="w-3 h-3 md:w-4 md:h-4 text-[#F3A81D]" />
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
              className="w-full bg-[#050508]/60 border border-white/10 rounded-lg px-3 py-2 pr-10 md:px-4 md:py-3 md:pr-12 text-xs md:text-sm font-bold text-white focus:outline-none focus:border-[#F3A81D] focus:ring-2 focus:ring-[#F3A81D]/20 transition-all placeholder:text-[#8A92A6] disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-[#8A92A6] hover:text-[#F3A81D] transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 md:w-5 md:h-5" />
              ) : (
                <Eye className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            value="true"
            className="w-4 h-4 rounded border-white/10 bg-[#050508]/60 text-[#F3A81D] focus:ring-2 focus:ring-[#F3A81D]/20 focus:ring-offset-0 cursor-pointer"
          />
          <label htmlFor="rememberMe" className="text-xs md:text-sm text-[#C1C5D0] cursor-pointer select-none">
            Remember me for 30 days
          </label>
        </div>

        {/* Forgot Username Link */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowUsernameLookup(!showUsernameLookup)}
            className="text-[10px] md:text-xs text-[#F3A81D] hover:text-[#FFD700] font-bold transition-colors"
          >
            {showUsernameLookup ? 'Back to Login' : 'Forgot Username? Find it using phone number'}
          </button>
        </div>

        {/* Username Lookup Panel */}
        {showUsernameLookup && (
          <div className="bg-[#F3A81D]/5 border-2 border-[#F3A81D]/20 rounded-lg p-3 md:p-4">
            <h3 className="text-xs md:text-sm font-black text-[#F3A81D] uppercase tracking-wider mb-2 md:mb-3 flex items-center gap-1.5">
              <Search className="w-3 h-3 md:w-4 md:h-4" />
              Find Your Username
            </h3>
            <p className="text-[10px] md:text-xs text-[#8A92A6] mb-2 md:mb-3">
              Enter your phone number to retrieve your username
            </p>
            <div className="flex gap-1.5 md:gap-2">
              <div className="relative flex-1">
                <Phone className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-[#8A92A6]" />
                <input
                  type="tel"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isLookingUp}
                  className="w-full pl-8 md:pl-10 pr-2 md:pr-4 py-2 md:py-2.5 bg-[#050508]/60 border border-white/10 focus:border-[#F3A81D] focus:ring-2 focus:ring-[#F3A81D]/20 rounded-lg text-xs md:text-sm font-bold text-white placeholder-[#8A92A6] focus:outline-none transition-all disabled:opacity-50"
                />
              </div>
              <button
                type="button"
                onClick={handleUsernameLookup}
                disabled={isLookingUp || !phoneNumber}
                className="px-3 md:px-4 py-2 md:py-2.5 bg-[#F3A81D] hover:bg-[#FFD700] text-black font-black text-[10px] md:text-xs uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isLookingUp ? 'Searching...' : 'Find'}
              </button>
            </div>
          </div>
        )}

        {state?.error && (
          <div className="bg-[#D80027]/10 border border-[#D80027]/30 rounded-lg p-2 md:p-3" role="alert">
            <p className="text-xs md:text-sm text-[#D80027] font-semibold">{state.error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-gradient-to-r from-[#F3A81D] to-[#D80027] hover:from-[#D80027] hover:to-[#F3A81D] text-white font-black text-xs md:text-sm uppercase tracking-wider py-3 md:py-4 rounded-lg transition-all duration-300 shadow-lg shadow-[#F3A81D]/30 hover:shadow-xl hover:shadow-[#F3A81D]/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 md:gap-2 group"
        >
          <LogIn className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
          {isPending ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
