import { useEffect, useState } from 'react'

export default function FancyLoader() {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setIsComplete(true)
          return 100
        }
        return prev + 1
      })
    }, 50)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative min-h-[400px] w-full overflow-hidden bg-gradient-to-b from-[#1e2242] to-[#2f3374] p-8">
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
          <h2 className="mb-2 text-3xl font-bold text-white">
            {isComplete ? "Ready to go!" : "Loading your space"}
          </h2>
          <p className="text-lg text-gray-300">
            {isComplete ? "Your virtual HQ is set up." : "Please wait while we prepare everything..."}
          </p>
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

        {/* Complete Message */}
        {isComplete && (
          <div className="mt-4 animate-fadeIn">
            <button className="rounded bg-[#00e5a0] px-4 py-2 font-bold text-[#1e2242] transition-colors hover:bg-[#00c589]">
              Enter Space
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
