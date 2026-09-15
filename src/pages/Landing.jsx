import { Link } from 'react-router-dom'
import { Shield, ScanSearch, BarChart3, History, ArrowRight, Lock, Brain, Eye, AlertTriangle, Zap } from 'lucide-react'

export default function Landing() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center justify-center px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-accent2/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center py-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyber-accent/10 border border-cyber-accent/30 mb-8 animate-fade-in">
            <Shield className="w-4 h-4 text-cyber-accent" />
            <span className="text-sm text-cyber-accent font-medium">Tech for Impact — Code Beyond Boundaries</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-4 animate-slide-up">
            CYBER<span className="text-cyber-accent">SAATHI</span>
          </h1>

          <p className="text-xl sm:text-2xl text-cyber-muted mb-6 font-medium animate-slide-up" style={{ animationDelay: '100ms' }}>
            Think Before You Click.
          </p>

          <p className="text-base sm:text-lg text-cyber-muted max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '200ms' }}>
            AI-powered protection against phishing, online scams and social engineering.
            Built for Indian users. Paste a suspicious message or URL — get an instant risk analysis.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <Link to="/analyzer" className="btn-primary inline-flex items-center gap-2 text-base">
              Analyze a Message
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/dashboard" className="btn-secondary inline-flex items-center gap-2 text-base">
              <BarChart3 className="w-5 h-5" />
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-cyber-muted max-w-2xl mx-auto">
            Three layers of defense — deterministic security rules, AI semantic analysis, and educational insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card-hover p-8 group">
            <div className="w-14 h-14 rounded-xl bg-cyber-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ScanSearch className="w-7 h-7 text-cyber-accent" />
            </div>
            <h3 className="text-xl font-bold mb-3">Message & URL Analysis</h3>
            <p className="text-sm text-cyber-muted leading-relaxed">
              Paste any suspicious SMS, WhatsApp message, email, job offer, or URL. Get an instant risk score, scam category, and red flags.
            </p>
          </div>

          <div className="glass-card-hover p-8 group">
            <div className="w-14 h-14 rounded-xl bg-cyber-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Brain className="w-7 h-7 text-cyber-accent" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI + Rule-Based Detection</h3>
            <p className="text-sm text-cyber-muted leading-relaxed">
              Combines LLM semantic analysis with deterministic security rules for accurate detection. Works in Demo Mode without an API key.
            </p>
          </div>

          <div className="glass-card-hover p-8 group">
            <div className="w-14 h-14 rounded-xl bg-cyber-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Eye className="w-7 h-7 text-cyber-accent" />
            </div>
            <h3 className="text-xl font-bold mb-3">Educational Attack Chain</h3>
            <p className="text-sm text-cyber-muted leading-relaxed">
              Visualizes how a scam works step-by-step — from social engineering to account compromise — so you learn to spot threats.
            </p>
          </div>
        </div>
      </section>

      {/* Defense Layers */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Defense Architecture</h2>
          <p className="text-cyber-muted">Every message passes through multiple analysis layers</p>
        </div>

        <div className="glass-card p-8">
          <div className="flex flex-col items-center gap-4">
            {[
              { icon: ScanSearch, label: 'User Input', desc: 'Paste suspicious message or URL' },
              { icon: Lock, label: 'Security Rules', desc: 'Deterministic pattern matching & heuristics' },
              { icon: Brain, label: 'AI Analysis', desc: 'LLM semantic understanding (or Demo Mode)' },
              { icon: Zap, label: 'Risk Scoring', desc: 'Combined score from 0 to 100' },
              { icon: Shield, label: 'Final Result', desc: 'Risk level, red flags, recommendations, attack chain' },
            ].map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} className="flex flex-col items-center w-full max-w-md">
                  <div className="flex items-center gap-4 px-6 py-4 rounded-xl bg-cyber-surface/60 border border-cyber-border/50 w-full">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-cyber-accent/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-cyber-accent" />
                    </div>
                    <div>
                      <div className="font-semibold">{step.label}</div>
                      <div className="text-sm text-cyber-muted">{step.desc}</div>
                    </div>
                  </div>
                  {i < 4 && <ArrowRight className="w-5 h-5 text-cyber-muted/50 my-1 rotate-90" />}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="glass-card p-12">
          <AlertTriangle className="w-12 h-12 text-cyber-accent mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Stay One Step Ahead</h2>
          <p className="text-cyber-muted mb-8 max-w-xl mx-auto">
            Scammers are getting smarter. CyberSaathi helps you think before you click — analyze any suspicious message in seconds.
          </p>
          <Link to="/analyzer" className="btn-primary inline-flex items-center gap-2">
            Start Analyzing
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
