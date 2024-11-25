'use client'

import { useEffect, useState } from 'react'

export default function FancyLoader() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1))
    }, 30)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#1e2242] to-[#2f3374] p-8">
      {/* Stars */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-twinkle"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        >
          <div className="h-1 w-1 rounded-full bg-white opacity-70" />
        </div>
      ))}
      
      <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
        {/* Loading Text */}
        <div className="text-center">
          <h2 className="mb-2 text-3xl font-bold text-white">Loading your space</h2>
          <p className="text-lg text-gray-300">Please wait while we prepare everything...</p>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-64 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full bg-[#00e5a0] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress Text */}
        <div className="text-sm font-medium text-white">{progress}%</div>
      </div>
    </div>
  )
}

