import { Shield, AlertTriangle, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-cyber-border/50 bg-cyber-bg/50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-6 h-6 text-cyber-accent" />
              <span className="text-lg font-bold">Cyber<span className="text-cyber-accent">Saathi</span></span>
            </div>
            <p className="text-sm text-cyber-muted leading-relaxed">
              AI-powered cyber-fraud defense platform for Indian users. Think Before You Click.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-cyber-accent mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/analyzer" className="text-sm text-cyber-muted hover:text-cyber-text transition-colors">Analyzer</Link>
              <Link to="/dashboard" className="text-sm text-cyber-muted hover:text-cyber-text transition-colors">Dashboard</Link>
              <Link to="/history" className="text-sm text-cyber-muted hover:text-cyber-text transition-colors">History</Link>
              <Link to="/about" className="text-sm text-cyber-muted hover:text-cyber-text transition-colors">About</Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-cyber-accent mb-3">Report Cybercrime</h4>
            <div className="flex flex-col gap-2 text-sm text-cyber-muted">
              <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-cyber-text transition-colors">
                cybercrime.gov.in
              </a>
              <span>Helpline: 1930</span>
              <span>National Cyber Crime Reporting Portal</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-cyber-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cyber-muted">
            Built for TECH FOR IMPACT — Code Beyond Boundaries
          </p>
          <p className="text-xs text-cyber-muted">
            Defensive cybersecurity tool. For educational use.
          </p>
        </div>
      </div>
    </footer>
  )
}
