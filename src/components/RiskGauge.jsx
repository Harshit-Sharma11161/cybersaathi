import { useEffect, useState } from 'react'

const levelConfig = {
  LOW: { color: '#10b981', bg: 'from-emerald-500/20 to-emerald-500/5', label: 'LOW RISK', text: 'text-emerald-400' },
  SUSPICIOUS: { color: '#f59e0b', bg: 'from-amber-500/20 to-amber-500/5', label: 'SUSPICIOUS', text: 'text-amber-400' },
  HIGH: { color: '#ef4444', bg: 'from-red-500/20 to-red-500/5', label: 'HIGH RISK', text: 'text-red-400' },
  CRITICAL: { color: '#dc2626', bg: 'from-red-600/30 to-red-600/5', label: 'CRITICAL RISK', text: 'text-red-500' },
}

export default function RiskGauge({ score, level }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const config = levelConfig[level] || levelConfig.LOW

  useEffect(() => {
    const duration = 1000
    const steps = 60
    const increment = score / steps
    let current = 0
    const interval = setInterval(() => {
      current += increment
      if (current >= score) {
        setAnimatedScore(score)
        clearInterval(interval)
      } else {
        setAnimatedScore(Math.round(current))
      }
    }, duration / steps)
    return () => clearInterval(interval)
  }, [score])

  const radius = 80
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedScore / 100) * circumference

  return (
    <div className={`relative flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-b ${config.bg} border border-cyber-border/50`}>
      <div className="relative w-48 h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="#2a3454"
            strokeWidth="12"
          />
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke={config.color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.05s linear', filter: `drop-shadow(0 0 8px ${config.color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold font-mono" style={{ color: config.color }}>
            {animatedScore}
          </span>
          <span className="text-sm text-cyber-muted font-mono">/ 100</span>
        </div>
      </div>
      <div className={`mt-4 text-2xl font-bold tracking-wide ${config.text}`}>
        {config.label}
      </div>
    </div>
  )
}
