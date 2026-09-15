import { useEffect, useState } from 'react'
import { getDashboardStats } from '../lib/api.js'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, AlertTriangle, ShieldCheck, Activity, Loader2, AlertCircle } from 'lucide-react'

const RISK_COLORS = {
  LOW: '#10b981',
  SUSPICIOUS: '#f59e0b',
  HIGH: '#ef4444',
  CRITICAL: '#dc2626',
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getDashboardStats()
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="pt-24 pb-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyber-accent animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-24 pb-20 max-w-3xl mx-auto px-4">
        <div className="glass-card p-6 border-cyber-danger/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-cyber-danger flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-cyber-danger">Failed to load dashboard</p>
            <p className="text-sm text-cyber-muted mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const total = stats.length
  const counts = { LOW: 0, SUSPICIOUS: 0, HIGH: 0, CRITICAL: 0 }
  const categoryMap = {}

  stats.forEach((row) => {
    const level = row.risk_level
    if (counts[level] !== undefined) counts[level]++
    categoryMap[row.category] = (categoryMap[row.category] || 0) + 1
  })

  const riskData = Object.entries(counts).map(([name, value]) => ({ name, value }))
  const categoryData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const recent = stats.slice(0, 8)

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-cyber-muted">Overview of all scam analyses</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Activity} label="Total Analyses" value={total} color="text-cyber-accent" bg="bg-cyber-accent/10" />
        <StatCard icon={AlertTriangle} label="High Risk" value={counts.HIGH} color="text-red-400" bg="bg-red-500/10" />
        <StatCard icon={AlertTriangle} label="Critical Risk" value={counts.CRITICAL} color="text-red-500" bg="bg-red-600/10" />
        <StatCard icon={ShieldCheck} label="Low Risk" value={counts.LOW} color="text-emerald-400" bg="bg-emerald-500/10" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Risk distribution */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-cyber-accent" />
            <h3 className="text-lg font-bold">Risk Distribution</h3>
          </div>
          {total === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  paddingAngle={3}
                >
                  {riskData.map((entry) => (
                    <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1a2035', border: '1px solid #2a3454', borderRadius: '8px', color: '#e2e8f0' }}
                />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category distribution */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-cyber-accent" />
            <h3 className="text-lg font-bold">Scam Category Distribution</h3>
          </div>
          {total === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3454" />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={120} tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ background: '#1a2035', border: '1px solid #2a3454', borderRadius: '8px', color: '#e2e8f0' }}
                  cursor={{ fill: 'rgba(0,212,255,0.05)' }}
                />
                <Bar dataKey="value" fill="#00d4ff" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent analyses */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold mb-4">Recent Analyses</h3>
        {total === 0 ? (
          <p className="text-sm text-cyber-muted text-center py-8">No analyses yet. Start by analyzing a message!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-cyber-muted border-b border-cyber-border/50">
                  <th className="pb-3 pr-4 font-medium">Input</th>
                  <th className="pb-3 pr-4 font-medium">Type</th>
                  <th className="pb-3 pr-4 font-medium">Category</th>
                  <th className="pb-3 pr-4 font-medium">Score</th>
                  <th className="pb-3 font-medium">Level</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((row) => (
                  <tr key={row.id} className="border-b border-cyber-border/30 hover:bg-cyber-surface/30 transition-colors">
                    <td className="py-3 pr-4 max-w-xs truncate text-cyber-text">{row.input}</td>
                    <td className="py-3 pr-4 text-cyber-muted capitalize">{row.type}</td>
                    <td className="py-3 pr-4 text-cyber-muted">{row.category}</td>
                    <td className="py-3 pr-4 font-mono font-bold" style={{ color: RISK_COLORS[row.risk_level] }}>{row.risk_score}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-md text-xs font-medium" style={{
                        background: `${RISK_COLORS[row.risk_level]}20`,
                        color: RISK_COLORS[row.risk_level],
                      }}>
                        {row.risk_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="glass-card-hover p-5">
      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="text-2xl font-bold font-mono">{value}</div>
      <div className="text-xs text-cyber-muted mt-1">{label}</div>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="h-[300px] flex items-center justify-center text-sm text-cyber-muted">
      No data yet. Analyze some messages to see charts.
    </div>
  )
}
