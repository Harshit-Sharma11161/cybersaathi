import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Shield, Menu, X } from 'lucide-react'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/analyzer', label: 'Analyzer' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/history', label: 'History' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cyber-bg/80 backdrop-blur-xl border-b border-cyber-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setOpen(false)}>
            <div className="relative">
              <Shield className="w-8 h-8 text-cyber-accent transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-cyber-accent/20 rounded-full blur-md group-hover:bg-cyber-accent/30 transition-all" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Cyber<span className="text-cyber-accent">Saathi</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-cyber-accent bg-cyber-accent/10'
                      : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-surface/50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-cyber-muted hover:text-cyber-text hover:bg-cyber-surface/50"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 flex flex-col gap-1 animate-fade-in">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-cyber-accent bg-cyber-accent/10'
                      : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-surface/50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
