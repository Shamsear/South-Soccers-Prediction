'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { KeyRound, Mail, User, ShieldAlert, Phone, UserCircle, Image as ImageIcon, Eye, EyeOff, Globe } from 'lucide-react'
import { SearchableSelect } from '@/components/searchable-select'

export function RegisterForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [countryCode, setCountryCode] = useState('+1')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Common country codes
  const countryCodes = [
    { code: '+1', name: 'US/Canada' },
    { code: '+44', name: 'UK' },
    { code: '+91', name: 'India' },
    { code: '+86', name: 'China' },
    { code: '+81', name: 'Japan' },
    { code: '+49', name: 'Germany' },
    { code: '+33', name: 'France' },
    { code: '+39', name: 'Italy' },
    { code: '+34', name: 'Spain' },
    { code: '+61', name: 'Australia' },
    { code: '+55', name: 'Brazil' },
    { code: '+52', name: 'Mexico' },
    { code: '+7', name: 'Russia' },
    { code: '+27', name: 'South Africa' },
    { code: '+82', name: 'South Korea' },
  ]

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
        return
      }

      // Validate file size (max 2MB)
      const maxSize = 2 * 1024 * 1024
      if (file.size > maxSize) {
        toast.error('Image size must be less than 2MB')
        return
      }

      setAvatarFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validation
    if (!fullName || !username || !email || !password) {
      toast.error('Please fill in all required fields')
      return
    }

    if (fullName.trim().length < 2) {
      toast.error('Full name must be at least 2 characters')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address')
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    if (!usernameRegex.test(username.trim())) {
      toast.error('Username must be 3-20 characters (letters, numbers, underscores only)')
      return
    }

    // Validate phone if provided
    if (phone && phone.trim().length > 0) {
      const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/
      if (!phoneRegex.test(phone.trim())) {
        toast.error('Please enter a valid phone number')
        return
      }
    }

    startTransition(async () => {
      try {
        const supabase = createClient()

        // First, upload avatar to ImageKit if provided
        let avatarUrl: string | null = null
        let uploadError: string | null = null
        
        if (avatarFile) {
          try {
            // Convert file to base64
            const reader = new FileReader()
            const base64Promise = new Promise<string>((resolve, reject) => {
              reader.onloadend = () => resolve(reader.result as string)
              reader.onerror = reject
              reader.readAsDataURL(avatarFile)
            })

            const base64Data = await base64Promise
            
            // Upload to ImageKit via API route with timeout
            const uploadController = new AbortController()
            const uploadTimeout = setTimeout(() => uploadController.abort(), 10000) // 10s timeout
            
            const uploadResponse = await fetch('/api/upload-avatar', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                file: base64Data,
                fileName: avatarFile.name,
              }),
              signal: uploadController.signal,
            })

            clearTimeout(uploadTimeout)
            
            // Check if response is ok and is JSON
            if (!uploadResponse.ok) {
              uploadError = `Upload failed with status ${uploadResponse.status}`
              console.error('Avatar upload error:', uploadError)
            } else {
              try {
                const uploadResult = await uploadResponse.json()
                if (uploadResult.success) {
                  avatarUrl = uploadResult.url
                } else {
                  uploadError = uploadResult.error || 'Upload failed'
                  console.error('Avatar upload error:', uploadError)
                }
              } catch (parseError) {
                uploadError = 'Invalid response from server'
                console.error('Avatar upload parse error:', parseError)
              }
            }
          } catch (error) {
            if (error instanceof Error) {
              if (error.name === 'AbortError') {
                uploadError = 'Upload timed out'
              } else {
                uploadError = error.message
              }
            } else {
              uploadError = 'Unknown upload error'
            }
            console.error('Avatar upload error:', error)
          }
        }

        // Continue with registration even if avatar upload fails
        // Prepare user metadata
        const userMetadata: Record<string, any> = {
          full_name: fullName.trim(),
          username: username.trim(),
          phone_number: phone.trim() ? `${countryCode}${phone.trim()}` : null,
        }

        // Only include avatar_url if upload succeeded
        if (avatarUrl) {
          userMetadata.avatar_url = avatarUrl
        } else if (uploadError) {
          // Log warning but continue
          console.warn('Proceeding with registration without avatar:', uploadError)
        }

        // Register user with metadata
        // The database trigger will handle profile creation atomically
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: userMetadata,
          },
        })

        if (error) {
          // Show avatar upload error as warning if registration might succeed
          if (uploadError && !avatarUrl) {
            toast.warning(`Avatar upload failed: ${uploadError}. Continuing registration...`)
          }
          
          if (error.message.toLowerCase().includes('already registered') || 
              error.message.toLowerCase().includes('already exists') ||
              error.status === 422) {
            toast.error('This email is already registered. Please login instead.')
            return
          }
          
          toast.error(error.message || 'Registration failed. Please try again.')
          return
        }

        if (data.user) {
          // Show success with warning if avatar failed
          if (uploadError && !avatarUrl) {
            toast.success('Registration successful! (Avatar upload failed - you can update it later)')
          } else {
            toast.success('Registration successful! Welcome to South Soccers!')
          }
          
          router.push('/matches')
          router.refresh()
        }
      } catch (error) {
        console.error('Registration error:', error)
        toast.error('An unexpected error occurred. Please try again.')
      }
    })
  }

  return (
    <div className="bg-[#0E0E13] border border-white/5 rounded-xl p-6 sm:p-8 shadow-2xl">
      <div className="mb-5">
        <h2 className="text-2xl font-black text-white uppercase tracking-wide">Create Account</h2>
        <p className="text-[#8A92A6] text-xs mt-1">
          Join the South Soccers prediction competition
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Upload */}
          <div>
            <label htmlFor="avatar" className="flex items-center gap-2 text-xs font-black text-[#F3A81D] uppercase tracking-wider mb-2">
              <ImageIcon className="w-4 h-4 text-[#F3A81D]" />
              Profile Photo (Optional)
            </label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#F3A81D] to-[#D80027] flex items-center justify-center overflow-hidden border-2 border-white/10 shadow-lg flex-shrink-0">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="w-10 h-10 text-white/40" />
                )}
              </div>
              <div className="flex-1">
                <input
                  id="avatar"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleAvatarChange}
                  disabled={isPending}
                  className="w-full bg-[#050508]/60 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#F3A81D] focus:ring-2 focus:ring-[#F3A81D]/20 transition-all file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-bold file:bg-[#F3A81D]/10 file:text-[#F3A81D] hover:file:bg-[#F3A81D]/20 file:cursor-pointer disabled:opacity-50"
                />
                <p className="text-[10px] text-[#8A92A6] mt-1">Max 2MB</p>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="flex items-center gap-2 text-xs font-black text-[#F3A81D] uppercase tracking-wider mb-2">
              <UserCircle className="w-4 h-4 text-[#F3A81D]" />
              Full Name <span className="text-[#D80027] ml-1">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isPending}
              required
              autoComplete="name"
              minLength={2}
              className="w-full bg-[#050508]/60 border border-white/10 rounded-lg px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#F3A81D] focus:ring-2 focus:ring-[#F3A81D]/20 transition-all placeholder:text-[#8A92A6] disabled:opacity-50"
            />
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="flex items-center gap-2 text-xs font-black text-[#F3A81D] uppercase tracking-wider mb-2">
              <User className="w-4 h-4 text-[#F3A81D]" />
              Username <span className="text-[#D80027] ml-1">*</span>
            </label>
            <input
              id="username"
              type="text"
              placeholder="johndoe123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isPending}
              required
              autoComplete="username"
              minLength={3}
              maxLength={20}
              className="w-full bg-[#050508]/60 border border-white/10 rounded-lg px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#F3A81D] focus:ring-2 focus:ring-[#F3A81D]/20 transition-all placeholder:text-[#8A92A6] disabled:opacity-50"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="flex items-center gap-2 text-xs font-black text-[#F3A81D] uppercase tracking-wider mb-2">
              <Mail className="w-4 h-4 text-[#F3A81D]" />
              Email Address <span className="text-[#D80027] ml-1">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
              required
              autoComplete="email"
              className="w-full bg-[#050508]/60 border border-white/10 rounded-lg px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#F3A81D] focus:ring-2 focus:ring-[#F3A81D]/20 transition-all placeholder:text-[#8A92A6] disabled:opacity-50"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="flex items-center gap-2 text-xs font-black text-[#F3A81D] uppercase tracking-wider mb-2">
              <Phone className="w-4 h-4 text-[#F3A81D]" />
              Phone Number (Optional)
            </label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                disabled={isPending}
                className="bg-[#050508]/60 border border-white/10 rounded-lg px-3 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#F3A81D] focus:ring-2 focus:ring-[#F3A81D]/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {countryCodes.map(country => (
                  <option key={country.code} value={country.code} className="bg-[#0E0E13] text-white">
                    {country.code} {country.name}
                  </option>
                ))}
              </select>
              <input
                id="phone"
                type="tel"
                placeholder="555-123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isPending}
                autoComplete="tel"
                className="flex-1 bg-[#050508]/60 border border-white/10 rounded-lg px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#F3A81D] focus:ring-2 focus:ring-[#F3A81D]/20 transition-all placeholder:text-[#8A92A6] disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="flex items-center gap-2 text-xs font-black text-[#F3A81D] uppercase tracking-wider mb-2">
              <KeyRound className="w-4 h-4 text-[#F3A81D]" />
              Password <span className="text-[#D80027] ml-1">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                required
                autoComplete="new-password"
                minLength={8}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-[#F3A81D] to-[#D80027] hover:from-[#D80027] hover:to-[#F3A81D] text-white font-black text-sm uppercase tracking-wider py-4 rounded-lg transition-all duration-300 shadow-lg shadow-[#F3A81D]/30 hover:shadow-xl hover:shadow-[#F3A81D]/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-6"
          >
            <ShieldAlert className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {isPending ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
    </div>
  )
}
