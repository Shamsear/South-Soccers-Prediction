'use client'

import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'

export default function Loading() {
  // Automatically scroll to top when the loading screen appears
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <div className="relative">
        <div className="absolute inset-0 bg-[#F3A81D]/20 blur-xl rounded-full" />
        <Loader2 className="w-12 h-12 text-[#F3A81D] animate-spin relative z-10" />
      </div>
      <p className="mt-4 text-[#8A92A6] text-sm font-black uppercase tracking-widest animate-pulse">
        Loading...
      </p>
    </div>
  )
}
