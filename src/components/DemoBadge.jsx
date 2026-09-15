import { Info } from 'lucide-react'

export default function DemoBadge({ show }) {
  if (!show) return null

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-warning/10 border border-cyber-warning/30 text-cyber-warning text-xs font-medium animate-fade-in">
      <Info className="w-3.5 h-3.5" />
      Demo Mode — AI API not configured. Using built-in pattern analysis.
    </div>
  )
}
