import { Shield, Brain, Lock, Eye, AlertTriangle, Heart, Github, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyber-accent/10 border border-cyber-accent/30 mb-6">
          <Shield className="w-4 h-4 text-cyber-accent" />
          <span className="text-sm text-cyber-accent font-medium">Tech for Impact — Code Beyond Boundaries</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">About CyberSaathi</h1>
        <p className="text-lg text-cyber-muted max-w-2xl mx-auto">
          An AI-powered cyber-fraud defense platform built to protect Indian users from phishing, online scams, and social engineering.
        </p>
      </div>

      {/* Mission */}
      <div className="glass-card p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
        <p className="text-cyber-muted leading-relaxed mb-4">
          India has seen a massive surge in cyber fraud — from fake banking KYC messages to UPI scams, job offer frauds, and lottery scams.
          Millions of users, especially those less tech-savvy, fall victim every day.
        </p>
        <p className="text-cyber-muted leading-relaxed">
          CyberSaathi (meaning "cyber companion" in Hindi) is built to be that trusted friend who helps you think before you click.
          Paste any suspicious message and get an instant, easy-to-understand risk analysis — in English and Hindi.
        </p>
      </div>

      {/* How it works */}
      <div className="glass-card p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6">How It Works</h2>
        <div className="space-y-6">
          <FeatureRow
            icon={Lock}
            title="Deterministic Security Rules"
            desc="Pattern matching, URL analysis, keyword detection, and heuristics catch known scam signatures instantly."
          />
          <FeatureRow
            icon={Brain}
            title="AI Semantic Analysis"
            desc="An LLM understands the message context, intent, and manipulation tactics that simple rules can't catch. Falls back to Demo Mode without an API key."
          />
          <FeatureRow
            icon={Eye}
            title="Educational Attack Chain"
            desc="Visualizes the scam step-by-step — from social engineering to account compromise — so users learn to recognize threats."
          />
          <FeatureRow
            icon={AlertTriangle}
            title="Bilingual Explanations"
            desc="Every analysis includes a Hindi/Hinglish explanation so the message is accessible to users across India."
          />
        </div>
      </div>

      {/* What it detects */}
      <div className="glass-card p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">What It Detects</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            'Banking/KYC phishing',
            'Fake job offers',
            'UPI/payment scams',
            'Lottery/prize scams',
            'Suspicious URLs',
            'Lookalike domains',
            'Credential harvesting',
            'Social engineering',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-cyber-surface/40 border border-cyber-border/30">
              <div className="w-2 h-2 rounded-full bg-cyber-accent" />
              <span className="text-sm text-cyber-text">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Important note */}
      <div className="glass-card p-8 mb-8 border-cyber-warning/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-cyber-warning flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold mb-2">Important Disclaimer</h3>
            <p className="text-sm text-cyber-muted leading-relaxed">
              CyberSaathi is a defensive cybersecurity tool for educational purposes. It provides risk assessments based on
              pattern analysis and AI — it does not guarantee that any message is safe or malicious. Always verify through
              official channels. If you've been scammed, report to cybercrime.gov.in or call 1930.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="glass-card p-8 text-center">
        <Heart className="w-10 h-10 text-cyber-accent mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Ready to Stay Safe?</h2>
        <p className="text-cyber-muted mb-6">Start analyzing suspicious messages and URLs right now.</p>
        <Link to="/analyzer" className="btn-primary inline-flex items-center gap-2">
          Try the Analyzer
        </Link>
      </div>
    </div>
  )
}

function FeatureRow({ icon: Icon, title, desc }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-cyber-accent/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-cyber-accent" />
      </div>
      <div>
        <h3 className="font-bold mb-1">{title}</h3>
        <p className="text-sm text-cyber-muted leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
