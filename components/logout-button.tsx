/**
 * Logout Button Component
 * 
 * Requirements:
 * - 1.6 (User logout)
 * - 15 (Toast notifications)
 * 
 * Client component that handles logout action and displays success message.
 */

'use client'

import { useTransition } from 'react'
import { logoutAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { LogOut } from 'lucide-react'

interface LogoutButtonProps {
  variant?: 'default' | 'dropdown' | 'mobile'
}

export function LogoutButton({ variant = 'default' }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      try {
        // Display success toast before redirect
        toast.success('Logged out successfully!')
        
        // Call logout server action
        await logoutAction()
      } catch (error) {
        // Catch the redirect error (Next.js throws on redirect)
        if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
          // This is expected, the redirect is happening
          return
        }
        
        // If it's a real error, show error toast
        console.error('Logout error:', error)
        toast.error('Failed to logout. Please try again.')
      }
    })
  }

  if (variant === 'dropdown') {
    return (
      <button
        onClick={handleLogout}
        disabled={isPending}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors text-[#D80027] hover:bg-[#D80027]/10 rounded-lg group disabled:opacity-50"
      >
        <div className="w-8 h-8 rounded-lg bg-[#D80027]/10 flex items-center justify-center group-hover:bg-[#D80027]/20 transition-colors">
          <LogOut className="w-4 h-4 text-[#D80027]" />
        </div>
        <span>{isPending ? 'Logging out...' : 'Logout'}</span>
      </button>
    )
  }

  if (variant === 'mobile') {
    return (
      <button
        onClick={handleLogout}
        disabled={isPending}
        className="flex flex-col items-center justify-center gap-0.5 w-full h-full text-[#D80027] disabled:opacity-50"
      >
        <LogOut className="w-[18px] h-[18px]" />
        <span className="text-[10px] font-semibold">
          {isPending ? 'Wait...' : 'Logout'}
        </span>
      </button>
    )
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={isPending}
      variant="outline"
      size="sm"
      className="border-[#C8102E] text-[#C8102E] hover:bg-[#C8102E] hover:text-white font-bold transition-all shadow-sm hover:shadow-lg hover:shadow-[#C8102E]/20"
    >
      {isPending ? 'Logging out...' : 'Logout'}
    </Button>
  )
}
