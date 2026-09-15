import { useState } from 'react'
import { RiskGauge, AttackChain, DemoBadge } from './index.js'
import { Flag, CheckCircle2, Lightbulb, FileText, Languages, ChevronDown, ChevronUp } from 'lucide-react'

export default function AnalysisResult({ result }) {
  const [showHindi, setShowHindi] = useState(false)
  const [showFullInput, setShowFullInput] = useState(false)

  if (!result) return null

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Demo badge */}
      <div className="flex justify-center">
        <DemoBadge show={result.demoMode} />
      </div>

      {/* Risk score gauge */}
      <RiskGauge score={result.riskScore} level={result.riskLevel} />

      {/* Category + Summary */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono uppercase tracking-widest text-cyber-accent">Scam Category</span>
        </div>
        <h3 className="text-xl font-bold mb-3">{result.category}</h3>
        <p className="text-sm text-cyber-muted leading-relaxed">{result.summary}</p>
      </div>

      {/* Red Flags */}
      {result.redFlags && result.redFlags.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Flag className="w-5 h-5 text-cyber-danger" />
            <h3 className="text-lg font-bold">Red Flags</h3>
          </div>
          <div className="space-y-2">
            {result.redFlags.map((flag, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-cyber-danger/5 border border-cyber-danger/20 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-cyber-danger mt-1.5" />
                <span className="text-sm text-cyber-text">{flag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-cyber-success" />
            <h3 className="text-lg font-bold">What Should I Do?</h3>
          </div>
          <div className="space-y-2">
            {result.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-cyber-success/5 border border-cyber-success/20 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <CheckCircle2 className="flex-shrink-0 w-4 h-4 text-cyber-success mt-0.5" />
                <span className="text-sm text-cyber-text">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hindi Explanation */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-cyber-accent" />
            <h3 className="text-lg font-bold">Hindi Explanation</h3>
          </div>
          <button
            onClick={() => setShowHindi(!showHindi)}
            className="btn-secondary text-sm py-2 px-4 inline-flex items-center gap-2"
          >
            {showHindi ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showHindi ? 'Hide' : '🇮🇳 समझाएं हिंदी में'}
          </button>
        </div>
        {showHindi && (
          <div className="p-4 rounded-lg bg-cyber-accent/5 border border-cyber-accent/20 animate-fade-in">
            <p className="text-sm text-cyber-text leading-relaxed" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              {result.hindiExplanation}
            </p>
          </div>
        )}
      </div>

      {/* Attack Chain */}
      <AttackChain category={result.category} />
    </div>
  )
}
