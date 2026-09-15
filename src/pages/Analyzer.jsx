import { useState } from 'react'
import { analyzeMessage, analyzeUrl } from '../lib/api.js'
import { AnalysisResult } from '../components/index.js'
import { ScanSearch, Link2, Loader2, AlertCircle, FileText, Globe } from 'lucide-react'

const examples = [
  {
    label: 'Banking KYC Phishing',
    text: 'URGENT: Your SBI account will be blocked today. Complete KYC immediately at http://sbi-verify-kyc.xyz/confirm',
  },
  {
    label: 'Fake Job Offer',
    text: 'Congratulations! You have been selected for a work-from-home data entry job. Salary Rs 35,000/week. Pay Rs 1,500 registration fee to confirm. Reply now!',
  },
  {
    label: 'UPI Payment Scam',
    text: 'You have received Rs 5,000! To accept this payment, enter your UPI PIN at http://paytm-receive.in/verify?amount=5000',
  },
  {
    label: 'Lottery Prize Scam',
    text: 'Congratulations! You have won Rs 10,00,000 in the KBC Lucky Draw 2024. To claim your prize, pay Rs 5,000 processing fee. Call 9876543210 now before 6pm today!',
  },
  {
    label: 'Safe Message',
    text: 'Hi, your order has been shipped and will arrive by Thursday. Track it at amazon.in/track/ORDER123. Thank you for shopping with us!',
  },
]

export default function Analyzer() {
  const [mode, setMode] = useState('message')
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleAnalyze() {
    if (!input.trim()) {
      setError('Please paste a message or URL to analyze.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = mode === 'message'
        ? await analyzeMessage(input.trim())
        : await analyzeUrl(input.trim())
      setResult(data)
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-24 pb-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Message Analyzer</h1>
        <p className="text-cyber-muted">Paste a suspicious message or URL to check if it's a scam</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 p-1 bg-cyber-surface/60 rounded-xl border border-cyber-border/50 mb-6 max-w-md mx-auto">
        <button
          onClick={() => { setMode('message'); setResult(null); setError(null) }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            mode === 'message' ? 'bg-cyber-accent text-cyber-bg' : 'text-cyber-muted hover:text-cyber-text'
          }`}
        >
          <FileText className="w-4 h-4" />
          Message
        </button>
        <button
          onClick={() => { setMode('url'); setResult(null); setError(null) }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            mode === 'url' ? 'bg-cyber-accent text-cyber-bg' : 'text-cyber-muted hover:text-cyber-text'
          }`}
        >
          <Globe className="w-4 h-4" />
          URL
        </button>
      </div>

      {/* Input */}
      <div className="glass-card p-6 mb-6">
        {mode === 'message' ? (
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a suspicious SMS, WhatsApp message, email, job offer, or payment message here..."
            rows={6}
            className="input-field resize-none font-mono text-sm"
          />
        ) : (
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a suspicious URL here... (e.g., http://sbi-verify-kyc.xyz/confirm)"
            className="input-field font-mono text-sm"
          />
        )}

        {/* Example buttons */}
        <div className="mt-4">
          <p className="text-xs text-cyber-muted mb-2">Try an example:</p>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => { setInput(ex.text); setResult(null); setError(null) }}
                className="px-3 py-1.5 rounded-lg bg-cyber-surface/60 border border-cyber-border/50 text-xs text-cyber-muted hover:text-cyber-accent hover:border-cyber-accent/40 transition-all"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="btn-primary w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : mode === 'message' ? (
            <>
              <ScanSearch className="w-5 h-5" />
              Analyze Message
            </>
          ) : (
            <>
              <Link2 className="w-5 h-5" />
              Check URL
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="glass-card p-4 mb-6 border-cyber-danger/30 flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-cyber-danger flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-cyber-danger">Analysis Error</p>
            <p className="text-sm text-cyber-muted mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="glass-card p-12 flex flex-col items-center gap-4 animate-fade-in">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-cyber-accent animate-spin" />
          </div>
          <p className="text-sm text-cyber-muted">Running security rules and AI analysis...</p>
          <div className="flex items-center gap-2 text-xs text-cyber-muted font-mono">
            <span className="w-2 h-2 rounded-full bg-cyber-accent animate-pulse" />
            Scanning patterns
          </div>
        </div>
      )}

      {/* Result */}
      {result && !loading && <AnalysisResult result={result} />}
    </div>
  )
}
