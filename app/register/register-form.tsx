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
    { code: '+93', name: 'Afghanistan', flag: '🇦🇫' },
    { code: '+355', name: 'Albania', flag: '🇦🇱' },
    { code: '+213', name: 'Algeria', flag: '🇩🇿' },
    { code: '+376', name: 'Andorra', flag: '🇦🇩' },
    { code: '+244', name: 'Angola', flag: '🇦🇴' },
    { code: '+54', name: 'Argentina', flag: '🇦🇷' },
    { code: '+374', name: 'Armenia', flag: '🇦🇲' },
    { code: '+61', name: 'Australia', flag: '🇦🇺' },
    { code: '+43', name: 'Austria', flag: '🇦🇹' },
    { code: '+994', name: 'Azerbaijan', flag: '🇦🇿' },
    { code: '+973', name: 'Bahrain', flag: '🇧🇭' },
    { code: '+880', name: 'Bangladesh', flag: '🇧🇩' },
    { code: '+375', name: 'Belarus', flag: '🇧🇾' },
    { code: '+32', name: 'Belgium', flag: '🇧🇪' },
    { code: '+501', name: 'Belize', flag: '🇧🇿' },
    { code: '+229', name: 'Benin', flag: '🇧🇯' },
    { code: '+975', name: 'Bhutan', flag: '🇧🇹' },
    { code: '+591', name: 'Bolivia', flag: '🇧🇴' },
    { code: '+387', name: 'Bosnia', flag: '🇧🇦' },
    { code: '+267', name: 'Botswana', flag: '🇧🇼' },
    { code: '+55', name: 'Brazil', flag: '🇧🇷' },
    { code: '+673', name: 'Brunei', flag: '🇧🇳' },
    { code: '+359', name: 'Bulgaria', flag: '🇧🇬' },
    { code: '+226', name: 'Burkina Faso', flag: '🇧🇫' },
    { code: '+257', name: 'Burundi', flag: '🇧🇮' },
    { code: '+855', name: 'Cambodia', flag: '🇰🇭' },
    { code: '+237', name: 'Cameroon', flag: '🇨🇲' },
    { code: '+1', name: 'Canada/USA', flag: '🇨🇦🇺🇸' },
    { code: '+238', name: 'Cape Verde', flag: '🇨🇻' },
    { code: '+236', name: 'Central African Rep', flag: '🇨🇫' },
    { code: '+235', name: 'Chad', flag: '🇹🇩' },
    { code: '+56', name: 'Chile', flag: '🇨🇱' },
    { code: '+86', name: 'China', flag: '🇨🇳' },
    { code: '+57', name: 'Colombia', flag: '🇨🇴' },
    { code: '+269', name: 'Comoros', flag: '🇰🇲' },
    { code: '+242', name: 'Congo', flag: '🇨🇬' },
    { code: '+506', name: 'Costa Rica', flag: '🇨🇷' },
    { code: '+385', name: 'Croatia', flag: '🇭🇷' },
    { code: '+53', name: 'Cuba', flag: '🇨🇺' },
    { code: '+357', name: 'Cyprus', flag: '🇨🇾' },
    { code: '+420', name: 'Czech Republic', flag: '🇨🇿' },
    { code: '+45', name: 'Denmark', flag: '🇩🇰' },
    { code: '+253', name: 'Djibouti', flag: '🇩🇯' },
    { code: '+593', name: 'Ecuador', flag: '🇪🇨' },
    { code: '+20', name: 'Egypt', flag: '🇪🇬' },
    { code: '+503', name: 'El Salvador', flag: '🇸🇻' },
    { code: '+240', name: 'Equatorial Guinea', flag: '🇬🇶' },
    { code: '+291', name: 'Eritrea', flag: '🇪🇷' },
    { code: '+372', name: 'Estonia', flag: '🇪🇪' },
    { code: '+251', name: 'Ethiopia', flag: '🇪🇹' },
    { code: '+358', name: 'Finland', flag: '🇫🇮' },
    { code: '+33', name: 'France', flag: '🇫🇷' },
    { code: '+241', name: 'Gabon', flag: '🇬🇦' },
    { code: '+220', name: 'Gambia', flag: '🇬🇲' },
    { code: '+995', name: 'Georgia', flag: '🇬🇪' },
    { code: '+49', name: 'Germany', flag: '🇩🇪' },
    { code: '+233', name: 'Ghana', flag: '🇬🇭' },
    { code: '+30', name: 'Greece', flag: '🇬🇷' },
    { code: '+502', name: 'Guatemala', flag: '🇬🇹' },
    { code: '+224', name: 'Guinea', flag: '🇬🇳' },
    { code: '+245', name: 'Guinea-Bissau', flag: '🇬🇼' },
    { code: '+592', name: 'Guyana', flag: '🇬🇾' },
    { code: '+509', name: 'Haiti', flag: '🇭🇹' },
    { code: '+504', name: 'Honduras', flag: '🇭🇳' },
    { code: '+852', name: 'Hong Kong', flag: '🇭🇰' },
    { code: '+36', name: 'Hungary', flag: '🇭🇺' },
    { code: '+354', name: 'Iceland', flag: '🇮🇸' },
    { code: '+91', name: 'India', flag: '🇮🇳' },
    { code: '+62', name: 'Indonesia', flag: '🇮🇩' },
    { code: '+98', name: 'Iran', flag: '🇮🇷' },
    { code: '+964', name: 'Iraq', flag: '🇮🇶' },
    { code: '+353', name: 'Ireland', flag: '🇮🇪' },
    { code: '+972', name: 'Israel', flag: '🇮🇱' },
    { code: '+39', name: 'Italy', flag: '🇮🇹' },
    { code: '+225', name: 'Ivory Coast', flag: '🇨🇮' },
    { code: '+81', name: 'Japan', flag: '🇯🇵' },
    { code: '+962', name: 'Jordan', flag: '🇯🇴' },
    { code: '+7', name: 'Kazakhstan/Russia', flag: '🇰🇿🇷🇺' },
    { code: '+254', name: 'Kenya', flag: '🇰🇪' },
    { code: '+965', name: 'Kuwait', flag: '🇰🇼' },
    { code: '+996', name: 'Kyrgyzstan', flag: '🇰🇬' },
    { code: '+856', name: 'Laos', flag: '🇱🇦' },
    { code: '+371', name: 'Latvia', flag: '🇱🇻' },
    { code: '+961', name: 'Lebanon', flag: '🇱🇧' },
    { code: '+266', name: 'Lesotho', flag: '🇱🇸' },
    { code: '+231', name: 'Liberia', flag: '🇱🇷' },
    { code: '+218', name: 'Libya', flag: '🇱🇾' },
    { code: '+423', name: 'Liechtenstein', flag: '🇱🇮' },
    { code: '+370', name: 'Lithuania', flag: '🇱🇹' },
    { code: '+352', name: 'Luxembourg', flag: '🇱🇺' },
    { code: '+261', name: 'Madagascar', flag: '🇲🇬' },
    { code: '+265', name: 'Malawi', flag: '🇲🇼' },
    { code: '+60', name: 'Malaysia', flag: '🇲🇾' },
    { code: '+960', name: 'Maldives', flag: '🇲🇻' },
    { code: '+223', name: 'Mali', flag: '🇲🇱' },
    { code: '+356', name: 'Malta', flag: '🇲🇹' },
    { code: '+222', name: 'Mauritania', flag: '🇲🇷' },
    { code: '+230', name: 'Mauritius', flag: '🇲🇺' },
    { code: '+52', name: 'Mexico', flag: '🇲🇽' },
    { code: '+373', name: 'Moldova', flag: '🇲🇩' },
    { code: '+377', name: 'Monaco', flag: '🇲🇨' },
    { code: '+976', name: 'Mongolia', flag: '🇲🇳' },
    { code: '+382', name: 'Montenegro', flag: '🇲🇪' },
    { code: '+212', name: 'Morocco', flag: '🇲🇦' },
    { code: '+258', name: 'Mozambique', flag: '🇲🇿' },
    { code: '+95', name: 'Myanmar', flag: '🇲🇲' },
    { code: '+264', name: 'Namibia', flag: '🇳🇦' },
    { code: '+977', name: 'Nepal', flag: '🇳🇵' },
    { code: '+31', name: 'Netherlands', flag: '🇳🇱' },
    { code: '+64', name: 'New Zealand', flag: '🇳🇿' },
    { code: '+505', name: 'Nicaragua', flag: '🇳🇮' },
    { code: '+227', name: 'Niger', flag: '🇳🇪' },
    { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
    { code: '+850', name: 'North Korea', flag: '🇰🇵' },
    { code: '+389', name: 'North Macedonia', flag: '🇲🇰' },
    { code: '+47', name: 'Norway', flag: '🇳🇴' },
    { code: '+968', name: 'Oman', flag: '🇴🇲' },
    { code: '+92', name: 'Pakistan', flag: '🇵🇰' },
    { code: '+970', name: 'Palestine', flag: '🇵🇸' },
    { code: '+507', name: 'Panama', flag: '🇵🇦' },
    { code: '+675', name: 'Papua New Guinea', flag: '🇵🇬' },
    { code: '+595', name: 'Paraguay', flag: '🇵🇾' },
    { code: '+51', name: 'Peru', flag: '🇵🇪' },
    { code: '+63', name: 'Philippines', flag: '🇵🇭' },
    { code: '+48', name: 'Poland', flag: '🇵🇱' },
    { code: '+351', name: 'Portugal', flag: '🇵🇹' },
    { code: '+974', name: 'Qatar', flag: '🇶🇦' },
    { code: '+40', name: 'Romania', flag: '🇷🇴' },
    { code: '+250', name: 'Rwanda', flag: '🇷🇼' },
    { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+221', name: 'Senegal', flag: '🇸🇳' },
    { code: '+381', name: 'Serbia', flag: '🇷🇸' },
    { code: '+248', name: 'Seychelles', flag: '🇸🇨' },
    { code: '+232', name: 'Sierra Leone', flag: '🇸🇱' },
    { code: '+65', name: 'Singapore', flag: '🇸🇬' },
    { code: '+421', name: 'Slovakia', flag: '🇸🇰' },
    { code: '+386', name: 'Slovenia', flag: '🇸🇮' },
    { code: '+252', name: 'Somalia', flag: '🇸🇴' },
    { code: '+27', name: 'South Africa', flag: '🇿🇦' },
    { code: '+82', name: 'South Korea', flag: '🇰🇷' },
    { code: '+211', name: 'South Sudan', flag: '🇸🇸' },
    { code: '+34', name: 'Spain', flag: '🇪🇸' },
    { code: '+94', name: 'Sri Lanka', flag: '🇱🇰' },
    { code: '+249', name: 'Sudan', flag: '🇸🇩' },
    { code: '+597', name: 'Suriname', flag: '🇸🇷' },
    { code: '+46', name: 'Sweden', flag: '🇸🇪' },
    { code: '+41', name: 'Switzerland', flag: '🇨🇭' },
    { code: '+963', name: 'Syria', flag: '🇸🇾' },
    { code: '+886', name: 'Taiwan', flag: '🇹🇼' },
    { code: '+992', name: 'Tajikistan', flag: '🇹🇯' },
    { code: '+255', name: 'Tanzania', flag: '🇹🇿' },
    { code: '+66', name: 'Thailand', flag: '🇹🇭' },
    { code: '+228', name: 'Togo', flag: '🇹🇬' },
    { code: '+216', name: 'Tunisia', flag: '🇹🇳' },
    { code: '+90', name: 'Turkey', flag: '🇹🇷' },
    { code: '+993', name: 'Turkmenistan', flag: '🇹🇲' },
    { code: '+256', name: 'Uganda', flag: '🇺🇬' },
    { code: '+380', name: 'Ukraine', flag: '🇺🇦' },
    { code: '+971', name: 'UAE', flag: '🇦🇪' },
    { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
    { code: '+598', name: 'Uruguay', flag: '🇺🇾' },
    { code: '+998', name: 'Uzbekistan', flag: '🇺🇿' },
    { code: '+58', name: 'Venezuela', flag: '🇻🇪' },
    { code: '+84', name: 'Vietnam', flag: '🇻🇳' },
    { code: '+967', name: 'Yemen', flag: '🇾🇪' },
    { code: '+260', name: 'Zambia', flag: '🇿🇲' },
    { code: '+263', name: 'Zimbabwe', flag: '🇿🇼' },
  ]

  // Convert to searchable select options
  const countryOptions = countryCodes.map(country => ({
    value: country.code,
    label: `${country.flag} ${country.code}`,
    sublabel: country.name,
  }))

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

        // First, upload avatar to ImageKit if provided (optional, non-blocking)
        let avatarUrl: string | null = null
        
        // Only attempt upload if user selected an avatar file
        if (avatarFile && avatarFile.size > 0) {
          try {
            console.log('Starting avatar upload...')
            
            // Convert file to base64
            const reader = new FileReader()
            const base64Promise = new Promise<string>((resolve, reject) => {
              reader.onloadend = () => resolve(reader.result as string)
              reader.onerror = () => reject(new Error('Failed to read file'))
              reader.readAsDataURL(avatarFile)
            })

            const base64Data = await base64Promise
            
            // Upload to ImageKit via API route with extended timeout
            const uploadController = new AbortController()
            const uploadTimeout = setTimeout(() => uploadController.abort(), 30000) // 30s timeout for large images
            
            try {
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
              
              // Check if response is ok and contains JSON
              const contentType = uploadResponse.headers.get('content-type')
              if (!uploadResponse.ok || !contentType?.includes('application/json')) {
                console.warn('Avatar upload failed - invalid response', {
                  status: uploadResponse.status,
                  contentType
                })
              } else {
                const uploadResult = await uploadResponse.json()
                if (uploadResult.success && uploadResult.url) {
                  avatarUrl = uploadResult.url
                  console.log('Avatar uploaded successfully')
                } else {
                  console.warn('Avatar upload failed:', uploadResult.error)
                }
              }
            } catch (fetchError) {
              clearTimeout(uploadTimeout)
              throw fetchError
            }
          } catch (error) {
            // Log but don't block registration
            if (error instanceof Error && error.name === 'AbortError') {
              console.warn('Avatar upload timed out - continuing without avatar')
            } else {
              console.warn('Avatar upload failed:', error)
            }
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
          console.log('Registration will include avatar')
        } else {
          console.log('Registration will proceed without avatar')
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
          // Show success message
          if (!avatarUrl && avatarFile) {
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

          {/* Phone Number with Country Code */}
          <SearchableSelect
            options={countryOptions}
            value={countryCode}
            onChange={setCountryCode}
            placeholder="Select country code..."
            disabled={isPending}
            icon={<Globe className="w-4 h-4 text-[#F3A81D]" />}
            label="Country Code"
            description="Select your country dialing code"
          />

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="flex items-center gap-2 text-xs font-black text-[#F3A81D] uppercase tracking-wider mb-2">
              <Phone className="w-4 h-4 text-[#F3A81D]" />
              Phone Number (Optional)
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="555-123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isPending}
              autoComplete="tel"
              className="w-full bg-[#050508]/60 border border-white/10 rounded-lg px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#F3A81D] focus:ring-2 focus:ring-[#F3A81D]/20 transition-all placeholder:text-[#8A92A6] disabled:opacity-50"
            />
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
