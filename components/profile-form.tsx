/**
 * Profile Form Component (FIFA World Cup 2026 Edition)
 * 
 * Interactive client component to manage profile settings,
 * avatar uploads, and notification preferences.
 */

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { updateProfile, uploadAvatar } from '@/app/actions/profile'
import { Camera, Mail, User, Bell, Save, Upload, CheckCircle2 } from 'lucide-react'

interface ProfileFormProps {
  profile: {
    id: string
    username: string
    avatar_url: string | null
    email_notifications_enabled: boolean
  }
  userEmail: string
}

export function ProfileForm({ profile, userEmail }: ProfileFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isUploadingAvatar, startAvatarTransition] = useTransition()
  
  const [username, setUsername] = useState(profile.username)
  const [emailNotifications, setEmailNotifications] = useState(profile.email_notifications_enabled)

  // Handle profile update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const result = await updateProfile(username, emailNotifications)

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.success) {
        toast.success('Profile updated successfully! 🎉')
        router.refresh()
      }
    })
  }

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    
    if (!file) return

    startAvatarTransition(async () => {
      const formData = new FormData()
      formData.append('avatar', file)

      const result = await uploadAvatar(formData)

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.success) {
        toast.success('Avatar uploaded successfully! 📸')
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-6">
      
      {/* Avatar Upload Section */}
      <div className="bg-black/30 border border-white/5 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#F3A81D]/10 flex items-center justify-center">
            <Camera className="w-4 h-4 text-[#F3A81D]" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-wide">Profile Picture</h4>
            <p className="text-xs text-[#8A92A6]">Upload your avatar image</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar Preview */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-[#F3A81D] to-[#D80027] flex items-center justify-center overflow-hidden border-2 border-white/10 shadow-xl group-hover:border-[#F3A81D]/50 transition-all">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.username}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-4xl font-black">
                  {profile.username[0].toUpperCase()}
                </span>
              )}
            </div>
            {profile.avatar_url && (
              <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-lg bg-[#009A44] border-2 border-[#0E0E13] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex-1 w-full">
            <label htmlFor="avatar" className="cursor-pointer block group">
              <div className="border-2 border-dashed border-white/10 hover:border-[#F3A81D]/50 rounded-lg p-6 text-center transition-all bg-black/20 hover:bg-black/40 group-hover:scale-[1.02]">
                <div className="w-12 h-12 rounded-lg bg-[#F3A81D]/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#F3A81D]/20 transition-colors">
                  <Upload className="w-6 h-6 text-[#F3A81D]" />
                </div>
                <p className="text-sm font-bold text-white mb-1">
                  {isUploadingAvatar ? 'Uploading...' : 'Click to upload'}
                </p>
                <p className="text-xs text-[#8A92A6]">
                  JPEG, PNG, GIF, WebP (Max 2MB)
                </p>
              </div>
            </label>
            <input
              id="avatar"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleAvatarUpload}
              disabled={isUploadingAvatar}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Profile Information Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Email Field (Read-only) */}
        <div className="bg-black/30 border border-white/5 rounded-lg p-5">
          <label className="flex items-center gap-2 text-xs font-black text-[#8A92A6] uppercase tracking-wider mb-3">
            <Mail className="w-4 h-4 text-[#8A92A6]" />
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              value={userEmail}
              disabled
              className="w-full bg-[#050508]/60 border border-white/5 rounded-lg px-4 py-3 text-sm font-semibold text-[#8A92A6] cursor-not-allowed focus:outline-none"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#8A92A6]/10 rounded text-[10px] font-bold text-[#8A92A6] uppercase">
              Locked
            </div>
          </div>
          <p className="text-xs text-[#8A92A6] mt-2">
            Email is linked to your account and cannot be changed
          </p>
        </div>

        {/* Username Field */}
        <div className="bg-black/30 border border-white/5 rounded-lg p-5 hover:border-[#F3A81D]/30 transition-colors">
          <label htmlFor="username" className="flex items-center gap-2 text-xs font-black text-[#F3A81D] uppercase tracking-wider mb-3">
            <User className="w-4 h-4 text-[#F3A81D]" />
            Display Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isPending}
            required
            minLength={3}
            maxLength={20}
            className="w-full bg-[#050508]/60 border border-white/10 rounded-lg px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#F3A81D] focus:ring-2 focus:ring-[#F3A81D]/20 transition-all placeholder:text-[#8A92A6]"
            placeholder="Enter your username"
          />
          <p className="text-xs text-[#8A92A6] mt-2">
            3-20 characters • Letters, numbers, and underscores only
          </p>
        </div>

        {/* Email Notifications Toggle */}
        <div className="bg-black/30 border border-white/5 rounded-lg p-5 hover:border-[#D80027]/30 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#D80027]/10 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-[#D80027]" />
                </div>
                <label htmlFor="notifications" className="text-sm font-black text-white uppercase tracking-wide cursor-pointer">
                  Email Notifications
                </label>
              </div>
              <p className="text-xs text-[#8A92A6] pl-10">
                Receive match reminders, results, and prediction updates
              </p>
            </div>
            
            <button
              type="button"
              id="notifications"
              onClick={() => setEmailNotifications(!emailNotifications)}
              disabled={isPending}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0E0E13] ${
                emailNotifications 
                  ? 'bg-[#F3A81D] focus:ring-[#F3A81D]' 
                  : 'bg-[#1D1D2C] focus:ring-white/20'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
                  emailNotifications ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-gradient-to-r from-[#D80027] to-[#8B0A1E] hover:from-[#8B0A1E] hover:to-[#D80027] text-white font-black text-sm uppercase tracking-wider py-4 rounded-lg transition-all duration-300 shadow-lg shadow-[#D80027]/30 hover:shadow-xl hover:shadow-[#D80027]/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
        >
          <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          {isPending ? 'Saving Changes...' : 'Save Profile Settings'}
        </button>
      </form>

    </div>
  )
}
