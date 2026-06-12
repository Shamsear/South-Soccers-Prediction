/**
 * Countdown Timer Component
 * 
 * Client component displaying time remaining until match kickoff
 * with visual digit boxes and color-coded urgency states.
 */

'use client'

import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  kickoffTime: string
  onLockout?: () => void
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  isLocked: boolean
}

/**
 * Calculate time remaining until kickoff
 */
function calculateTimeRemaining(kickoffTime: string): TimeRemaining {
  const now = new Date().getTime()
  const kickoff = new Date(kickoffTime).getTime()
  const diff = kickoff - now

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isLocked: true,
    }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return {
    days,
    hours,
    minutes,
    seconds,
    isLocked: false,
  }
}

export function CountdownTimer({ kickoffTime, onLockout }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(kickoffTime)
  )

  useEffect(() => {
    // Update every second
    const interval = setInterval(() => {
      const newTime = calculateTimeRemaining(kickoffTime)
      setTimeRemaining(newTime)

      // Emit lockout callback when countdown reaches zero
      if (newTime.isLocked && !timeRemaining.isLocked && onLockout) {
        onLockout()
      }
    }, 1000)

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [kickoffTime, onLockout, timeRemaining.isLocked])

  // Color coding based on urgency
  const getBoxStyle = () => {
    if (timeRemaining.isLocked) {
      return 'border-zinc-800 bg-zinc-900/60 text-zinc-500'
    }
    // Less than 1 hour: red animate pulse
    if (timeRemaining.days === 0 && timeRemaining.hours === 0 && timeRemaining.minutes < 60) {
      return 'border-[#C8102E]/60 bg-[#C8102E]/10 text-[#C8102E] animate-pulse'
    }
    // Less than 1 day: orange
    if (timeRemaining.days === 0 && timeRemaining.hours < 24) {
      return 'border-orange-500/40 bg-orange-500/10 text-orange-400'
    }
    // Default Gold theme
    return 'border-[#FFD700]/30 bg-[#FFD700]/5 text-[#FFD700]'
  }

  const pad = (num: number) => String(num).padStart(2, '0')

  if (timeRemaining.isLocked) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/40 border border-red-500/30 text-red-400 font-bold text-xs uppercase tracking-wider">
          🔒 Predictions Closed
        </div>
      </div>
    )
  }

  const boxStyle = getBoxStyle()

  return (
    <div className="text-center max-w-sm mx-auto">
      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">
        Predictions close in
      </p>
      
      <div className="flex gap-2.5 justify-center">
        {/* Days Box */}
        <div className={`flex flex-col items-center justify-center w-[68px] h-[68px] border-2 rounded-xl backdrop-blur-sm transition-all duration-300 ${boxStyle}`}>
          <span className="text-2xl font-black font-heading leading-none">
            {pad(timeRemaining.days)}
          </span>
          <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mt-1.5">
            Days
          </span>
        </div>

        {/* Hours Box */}
        <div className={`flex flex-col items-center justify-center w-[68px] h-[68px] border-2 rounded-xl backdrop-blur-sm transition-all duration-300 ${boxStyle}`}>
          <span className="text-2xl font-black font-heading leading-none">
            {pad(timeRemaining.hours)}
          </span>
          <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mt-1.5">
            Hours
          </span>
        </div>

        {/* Minutes Box */}
        <div className={`flex flex-col items-center justify-center w-[68px] h-[68px] border-2 rounded-xl backdrop-blur-sm transition-all duration-300 ${boxStyle}`}>
          <span className="text-2xl font-black font-heading leading-none">
            {pad(timeRemaining.minutes)}
          </span>
          <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mt-1.5">
            Mins
          </span>
        </div>

        {/* Seconds Box */}
        <div className={`flex flex-col items-center justify-center w-[68px] h-[68px] border-2 rounded-xl backdrop-blur-sm transition-all duration-300 ${boxStyle}`}>
          <span className="text-2xl font-black font-heading leading-none">
            {pad(timeRemaining.seconds)}
          </span>
          <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mt-1.5">
            Secs
          </span>
        </div>
      </div>
    </div>
  )
}
