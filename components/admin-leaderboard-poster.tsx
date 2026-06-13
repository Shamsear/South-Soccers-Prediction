'use client'

import { useState, useRef, useEffect } from 'react'
import { toPng, toBlob } from 'html-to-image'
import { Image as ImageIcon, X, Download, Copy, Trophy, CheckCircle2, Loader2, Target, Sliders, Sparkles } from 'lucide-react'

type LeaderboardEntry = {
  rank: number
  username: string
  full_name: string | null
  avatar_url: string | null
  total_points: number
  correct_predictions: number
  scored_count: number
}

interface AdminLeaderboardPosterProps {
  leaderboard: LeaderboardEntry[]
}

// Generate stable, gorgeous gradient for user initials
const getAvatarGradient = (username: string) => {
  const colors = [
    'from-[#0052FF] to-[#00F482]',
    'from-[#00F482] to-[#FF1E27]',
    'from-[#FF1E27] to-[#0052FF]',
    'from-[#0052FF] to-[#FF1E27]',
    'from-[#FF1E27] to-[#00F482]',
    'from-[#00F482] to-[#0052FF]',
    'from-[#0052FF] via-[#00F482] to-[#FF1E27]',
  ]
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

export function AdminLeaderboardPoster({ leaderboard }: AdminLeaderboardPosterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [topCount, setTopCount] = useState<5 | 10 | 15 | 30 | 'full'>(10)
  const [isGenerating, setIsGenerating] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [zoom, setZoom] = useState(0.4)
  const [unscaledHeight, setUnscaledHeight] = useState(1350)
  
  const posterRef = useRef<HTMLDivElement>(null)
  
  const slicedData = topCount === 'full' ? leaderboard : leaderboard.slice(0, topCount)
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  // ResizeObserver to track unscaled height of the poster dynamically
  useEffect(() => {
    if (!posterRef.current || !isOpen) return

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setUnscaledHeight(entry.target.clientHeight || entry.contentRect.height)
      }
    })

    observer.observe(posterRef.current)
    return () => observer.disconnect()
  }, [slicedData, isOpen])

  const handleDownload = async () => {
    if (!posterRef.current) return
    setIsGenerating(true)
    try {
      // Small delay to ensure render states are complete
      await new Promise((resolve) => setTimeout(resolve, 300))
      
      const dataUrl = await toPng(posterRef.current, { 
        cacheBust: true, 
        pixelRatio: 2.5, // High resolution output
        quality: 1.0, 
        backgroundColor: '#000000' 
      })
      
      const link = document.createElement('a')
      link.download = `southsoccers-standings-${new Date().toISOString().split('T')[0]}.png`
      link.href = dataUrl
      link.click()
      
      setDownloadSuccess(true)
      setTimeout(() => setDownloadSuccess(false), 2500)
    } catch (err) {
      console.error('Failed to generate poster:', err)
      alert('Failed to generate poster image. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (!posterRef.current) return
    setIsGenerating(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      
      const blob = await toBlob(posterRef.current, { 
        cacheBust: true, 
        pixelRatio: 2.0, 
        quality: 0.95, 
        backgroundColor: '#000000' 
      })
      
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ])
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2500)
      }
    } catch (err) {
      console.error('Failed to copy poster:', err)
      alert('Failed to copy poster to clipboard. Your browser might not support writing images to clipboard.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="w-full">
      <div className="flex justify-end">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-[#00F482] hover:bg-[#00D772] text-black px-5 py-2.5 rounded-xl font-black transition-all shadow-[0_0_20px_rgba(0,244,130,0.25)] hover:shadow-[0_0_25px_rgba(0,244,130,0.4)] border border-[#00F482]/40"
        >
          <ImageIcon className="w-5 h-5" />
          {isOpen ? 'Close Poster Studio' : 'Open Poster Studio'}
        </button>
      </div>

      {isOpen && (
        <div className="w-full mt-4 mb-8 bg-[#0C0B10]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 fade-in duration-300 backdrop-blur-xl">
            
            {/* Studio Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center border border-indigo-500/30">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">Poster Studio</h3>
                  <p className="text-xs text-zinc-400">Generate and export premium World Cup matchday leaderboards</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Studio Workspace */}
            <div className="flex flex-col lg:flex-row h-auto lg:h-[700px]">
              
              {/* Left Column: Interactive Canvas Viewport */}
              <div className="flex-1 bg-[#050508] relative overflow-hidden flex flex-col items-center justify-center p-6 min-h-[500px]">
                {/* Board grid background pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                
                {/* Device/Canvas mock frame */}
                <div className="w-full h-full flex flex-col items-center justify-center relative">
                  
                  {/* Top bar indicators */}
                  <div className="mb-3 flex items-center gap-4 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                    <span>Preview Canvas</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00F482]" />
                    <span>1080 x {unscaledHeight} px</span>
                  </div>

                  {/* Scrollable Viewport Frame */}
                  <div className="w-full flex-1 max-h-[480px] lg:max-h-[520px] overflow-auto bg-black/60 rounded-2xl border border-white/5 shadow-2xl flex justify-center items-start p-6 relative group">
                    
                    {/* The Scaled Canvas Element */}
                    <div 
                      style={{ 
                        width: `${1080 * zoom}px`, 
                        height: `${unscaledHeight * zoom}px`,
                        transition: 'width 0.15s ease-out, height 0.15s ease-out'
                      }} 
                      className="relative shrink-0 select-none shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                    >
                      <div 
                        className="origin-top-left"
                        style={{ 
                          transform: `scale(${zoom})`, 
                          width: '1080px',
                          position: 'absolute',
                          top: 0,
                          left: 0
                        }}
                      >
                        <PosterTemplate data={slicedData} date={currentDate} innerRef={posterRef} />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Spinning Loading Overlay */}
                {isGenerating && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-200">
                    <div className="w-14 h-14 rounded-full border-4 border-t-[#00F482] border-r-[#0052FF] border-b-[#FF1E27] border-l-white/20 animate-spin" />
                    <span className="text-white font-black text-xs tracking-widest uppercase animate-pulse">Rendering Image...</span>
                  </div>
                )}
              </div>

              {/* Right Column: Controls Panel */}
              <div className="w-full lg:w-80 p-6 flex flex-col gap-6 bg-[#0B0B0F] border-t lg:border-t-0 lg:border-l border-white/10 shrink-0 z-10 relative">
                
                {/* Filter Controls */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Sliders className="w-4 h-4 text-[#00F482]" />
                    <label className="text-xs font-black uppercase tracking-wider">Number of Players</label>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 bg-black/50 p-1.5 rounded-xl border border-white/5">
                    {[5, 10, 15, 30, 'full'].map((count) => (
                      <button
                        key={count}
                        onClick={() => setTopCount(count as any)}
                        className={`py-2 text-xs font-black rounded-lg transition-all ${
                          topCount === count 
                            ? 'bg-[#00F482] text-black font-black shadow-[0_0_12px_rgba(0,244,130,0.2)]' 
                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                        } ${count === 'full' ? 'col-span-2' : ''}`}
                      >
                        {count === 'full' ? 'All Players' : `Top ${count}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Zoom Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-zinc-400">
                    <span>Preview Zoom</span>
                    <span className="text-[#00E5FF]">{Math.round(zoom * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.25" 
                    max="0.80" 
                    step="0.05" 
                    value={zoom} 
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-black/60 border border-white/10 rounded-lg appearance-none cursor-pointer accent-[#00F482] focus:outline-none"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-bold uppercase">
                    <span>25%</span>
                    <span>50%</span>
                    <span>80%</span>
                  </div>
                </div>

                {/* Export Options */}
                <div className="mt-auto pt-6 border-t border-white/5 space-y-3">
                  <button
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm bg-white text-black hover:bg-zinc-200 transition-all transform active:scale-95 disabled:opacity-50"
                  >
                    {downloadSuccess ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-bounce" />
                        <span>Downloaded!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>Download PNG</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCopy}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all transform active:scale-95 disabled:opacity-50"
                  >
                    {copySuccess ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-[#00F482] animate-bounce" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        <span>Copy to Clipboard</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          </div>
      )}
    </div>
  )
}

/**
 * The actual Poster Template that gets exported
 * Optimized to output consistent solid backgrounds and sharp typography
 */
const PosterTemplate = ({ data, date, innerRef }: { data: LeaderboardEntry[], date: string, innerRef: any }) => {
  const isCompact = data.length > 15

  return (
    <div 
      ref={innerRef}
      className="relative overflow-hidden flex flex-col border-t-[10px] border-b-[10px] border-t-[#00F482] border-b-[#FF1E27]"
      style={{ width: '1080px', minHeight: '1350px', backgroundColor: '#000000' }}
    >
      {/* Decorative Sport Diagonal Grids & Mesh Highlights */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: '#000000' }} />
      
      {/* Glowing Ambient Orbs */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[500px] bg-[#00F482]/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute -top-[100px] -right-[100px] w-[700px] h-[700px] bg-[#FF1E27]/12 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-200px] w-[800px] h-[800px] bg-[#0052FF]/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-[-100px] w-[600px] h-[500px] bg-[#0052FF]/6 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Diagonal stripes texture overlay */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none" style={{
        backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)`,
        backgroundSize: '80px 80px'
      }} />

      {/* FIFA 2026 Watermark Image - Highly Opaque and Beautiful */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.14] pointer-events-none overflow-hidden mt-32">
        <img src="/fifalogo.png" alt="FIFA 26" className="w-[850px] h-[850px] object-contain" />
      </div>

      {/* Header */}
      <div className="px-20 pt-24 pb-12 relative z-10 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-3 bg-white/5 border border-[#00F482]/30 px-6 py-2.5 rounded-full mb-6 shadow-[0_0_20px_rgba(0,244,130,0.1)] backdrop-blur-md">
          <Target className="w-5 h-5 text-[#00F482] animate-pulse" />
          <span className="text-white font-black tracking-[0.25em] text-sm uppercase">South Soccers</span>
        </div>
        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-400 uppercase tracking-tight leading-none mb-3">
          Leaderboard
        </h1>
        <p className="text-xl font-black text-[#00F482] tracking-[0.3em] uppercase drop-shadow-[0_0_8px_rgba(0,244,130,0.3)]">
          {date}
        </p>
      </div>

      {/* Leaderboard List */}
      <div 
        className={`flex-1 px-16 pb-16 relative z-10 ${
          isCompact 
            ? 'grid grid-flow-col gap-x-6 gap-y-3.5 items-start content-start' 
            : 'flex flex-col gap-4'
        }`}
        style={isCompact ? { 
          gridTemplateRows: `repeat(${Math.ceil(data.length / 2)}, minmax(0, auto))`,
          gridAutoColumns: 'minmax(0, 1fr)'
        } : undefined}
      >
        {data.map((user, idx) => {
          const isTop3 = idx < 3
          const predictionStats = isCompact 
            ? `${user.correct_predictions} Perfect • ${user.scored_count} Preds`
            : `${user.correct_predictions} Perfect • ${user.scored_count} Predictions`
          
          // Outer border & shadow styles based on rank
          const cardStyle = idx === 0 
            ? 'bg-gradient-to-r from-[#FFD700]/15 via-white/[0.02] to-white/[0.01] border-[#FFD700]/40 shadow-[0_0_25px_rgba(255,215,0,0.1)]' 
            : idx === 1 
            ? 'bg-gradient-to-r from-zinc-400/10 via-white/[0.02] to-white/[0.01] border-zinc-400/30 shadow-[0_0_20px_rgba(192,192,192,0.06)]' 
            : idx === 2 
            ? 'bg-gradient-to-r from-[#CD7F32]/10 via-white/[0.02] to-white/[0.01] border-[#CD7F32]/30 shadow-[0_0_20px_rgba(205,127,50,0.06)]' 
            : 'bg-white/[0.02] border-white/5'

          const avatarRing = idx === 0 ? 'border-2 border-[#FFD700] shadow-[0_0_12px_rgba(255,215,0,0.4)]' :
                             idx === 1 ? 'border-2 border-[#C0C0C0] shadow-[0_0_10px_rgba(192,192,192,0.3)]' :
                             idx === 2 ? 'border-2 border-[#CD7F32] shadow-[0_0_10px_rgba(205,127,50,0.3)]' :
                             'border border-white/20'

          // Get dynamic gradient
          const gradientClass = isTop3 ? (
            idx === 0 ? 'bg-gradient-to-br from-[#FFE066] to-[#D87000]' :
            idx === 1 ? 'bg-gradient-to-br from-[#E2E8F0] to-[#475569]' :
            'bg-gradient-to-br from-[#FFD3B6] to-[#8B4513]'
          ) : getAvatarGradient(user.username)

          return (
            <div 
              key={user.rank} 
              className={`flex items-center justify-between rounded-2xl border ${isCompact ? 'p-3 px-4' : 'p-5 px-6'} ${cardStyle} backdrop-blur-md`}
            >
              <div className={`flex items-center ${isCompact ? 'gap-4' : 'gap-6'} truncate`}>
                
                {/* Styled Rank Badge */}
                {idx === 0 ? (
                  <div className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-[#FFE066] to-[#D87000] text-black font-black ${isCompact ? 'w-10 h-10 text-xl' : 'w-14 h-14 text-3xl'} shadow-[0_0_15px_rgba(255,215,0,0.4)] shrink-0`}>
                    1
                  </div>
                ) : idx === 1 ? (
                  <div className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-[#E2E8F0] to-[#475569] text-white font-black ${isCompact ? 'w-9 h-9 text-lg' : 'w-12 h-12 text-2xl'} shadow-[0_0_10px_rgba(192,192,192,0.3)] shrink-0`}>
                    2
                  </div>
                ) : idx === 2 ? (
                  <div className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-[#FFD3B6] to-[#8B4513] text-white font-black ${isCompact ? 'w-9 h-9 text-lg' : 'w-12 h-12 text-2xl'} shadow-[0_0_10px_rgba(205,127,50,0.3)] shrink-0`}>
                    3
                  </div>
                ) : (
                  <div className={`font-black text-center shrink-0 ${isCompact ? 'w-9 text-lg text-[#0052FF]/60' : 'w-12 text-2xl text-[#0052FF]/80'}`}>
                    {user.rank}
                  </div>
                )}
                
                {/* Fallback avatar block (with robust CORS safety handling) */}
                <div className={`${isCompact ? 'w-10 h-10 text-xs' : 'w-16 h-16 text-base'} rounded-full overflow-hidden shrink-0 flex items-center justify-center relative bg-zinc-900 ${avatarRing}`}>
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.username} 
                      crossOrigin="anonymous"
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const sibling = e.currentTarget.nextElementSibling as HTMLElement
                        if (sibling) sibling.classList.remove('hidden')
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${gradientClass} ${user.avatar_url ? 'hidden' : ''}`}>
                    <span className="font-black text-white uppercase tracking-wider">
                      {user.username.substring(0, 2)}
                    </span>
                  </div>
                </div>
                
                {/* Username & Metadata */}
                <div className="flex flex-col truncate">
                  <span className={`${isCompact ? 'text-xl max-w-[240px]' : 'text-3xl max-w-[600px]'} font-black text-white uppercase tracking-wide truncate`}>
                    {user.username}
                  </span>
                  <span className={`${isCompact ? 'text-[10px] max-w-[240px]' : 'text-base max-w-[600px]'} font-bold text-zinc-400 uppercase tracking-widest mt-0.5 truncate`}>
                    {user.full_name ? `${user.full_name} • ` : ''}{predictionStats}
                  </span>
                </div>
              </div>

              {/* Total points badge */}
              <div className="flex items-center gap-1.5 shrink-0 bg-white/5 border border-white/10 rounded-xl px-3.5 py-1.5">
                <span className={`${isCompact ? 'text-2xl' : 'text-4xl'} font-black text-[#00F482] drop-shadow-[0_0_8px_rgba(0,244,130,0.3)]`}>
                  {user.total_points}
                </span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase mt-2">pts</span>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
