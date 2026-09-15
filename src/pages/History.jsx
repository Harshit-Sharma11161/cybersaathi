import { useEffect, useState } from 'react'
import { getHistory } from '../lib/api.js'
import { Loader2, AlertCircle, Trash2, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase.js'

const RISK_COLORS = {
  LOW: '#10b981',
  SUSPICIOUS: '#f59e0b',
  HIGH: '#ef4444',
  CRITICAL: '#dc2626',
}

export default function History() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    loadHistory()
  }, [])

  async function loadHistory() {
    setLoading(true)
    setError(null)
    try {
      const data = await getHistory()
      setItems(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('analyses').delete().eq('id', id)
    if (error) {
      setError(error.message)
      return
    }
    setItems(items.filter((item) => item.id !== id))
  }

  if (loading) {
    return (
      <div className="pt-24 pb-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyber-accent animate-spin" />
      </div>
    )
  }

  return (
    <div className="pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analysis History</h1>
        <p className="text-cyber-muted">All previous scam analyses saved in the database</p>
      </div>

      {error && (
        <div className="glass-card p-4 mb-6 border-cyber-danger/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-cyber-danger flex-shrink-0 mt-0.5" />
          <p className="text-sm text-cyber-danger">{error}</p>
        </div>
      )}

      {items.length === 0 && !error ? (
        <div className="glass-card p-12 text-center">
          <Clock className="w-12 h-12 text-cyber-muted mx-auto mb-4" />
          <p className="text-cyber-muted">No analyses yet. Head to the Analyzer to check your first message!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="glass-card-hover overflow-hidden">
              <div
                className="flex items-start gap-4 p-4 cursor-pointer"
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
              >
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-lg"
                  style={{
                    background: `${RISK_COLORS[item.risk_level]}20`,
                    color: RISK_COLORS[item.risk_level],
                  }}
                >
                  {item.risk_score}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium" style={{
                      background: `${RISK_COLORS[item.risk_level]}20`,
                      color: RISK_COLORS[item.risk_level],
                    }}>
                      {item.risk_level}
                    </span>
                    <span className="text-xs text-cyber-muted capitalize">{item.type}</span>
                    <span className="text-xs text-cyber-muted">·</span>
                    <span className="text-xs text-cyber-muted">{item.category}</span>
                  </div>
                  <p className="text-sm text-cyber-text truncate">{item.input}</p>
                  <p className="text-xs text-cyber-muted mt-1">
                    {new Date(item.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}
                    className="p-2 rounded-lg text-cyber-muted hover:text-cyber-danger hover:bg-cyber-danger/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {expanded === item.id ? <ChevronUp className="w-5 h-5 text-cyber-muted" /> : <ChevronDown className="w-5 h-5 text-cyber-muted" />}
                </div>
              </div>

              {expanded === item.id && (
                <div className="px-4 pb-4 space-y-4 animate-fade-in border-t border-cyber-border/30 pt-4">
                  <div>
                    <div className="section-title">Summary</div>
                    <p className="text-sm text-cyber-text">{item.summary}</p>
                  </div>

                  {item.red_flags && item.red_flags.length > 0 && (
                    <div>
                      <div className="section-title">Red Flags</div>
                      <ul className="space-y-1">
                        {item.red_flags.map((flag, i) => (
                          <li key={i} className="text-sm text-cyber-text flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyber-danger mt-1.5 flex-shrink-0" />
                            {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.recommendations && item.recommendations.length > 0 && (
                    <div>
                      <div className="section-title">Recommendations</div>
                      <ul className="space-y-1">
                        {item.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-cyber-text flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyber-success mt-1.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.hindi_explanation && (
                    <div>
                      <div className="section-title">🇮🇳 Hindi Explanation</div>
                      <p className="text-sm text-cyber-text">{item.hindi_explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
