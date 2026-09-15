import { supabase } from './supabase.js'
import { analyzeMessageLocal, analyzeUrlLocal } from './analysis.js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

function isConfigured() {
  return SUPABASE_URL && SUPABASE_ANON_KEY
}

async function callEdgeFunction(slug, body, localFallback) {
  // If Supabase is not configured, skip straight to local analysis
  if (!isConfigured()) {
    return localFallback()
  }

  try {
    const url = `${SUPABASE_URL}/functions/v1/${slug}`
    const headers = {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      // Edge function returned an error — fall back to local analysis
      return localFallback()
    }

    const data = await response.json()

    if (!data || typeof data.riskScore !== 'number') {
      return localFallback()
    }

    return data
  } catch {
    // Network error, timeout, CORS, or any other failure — fall back to local analysis
    return localFallback()
  }
}

export async function analyzeMessage(input) {
  return callEdgeFunction('analyze-message', { input }, () => analyzeMessageLocal(input))
}

export async function analyzeUrl(input) {
  return callEdgeFunction('analyze-url', { input }, () => analyzeUrlLocal(input))
}

export async function getHistory() {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw new Error(error.message)
  return data || []
}

export async function getDashboardStats() {
  const { data, error } = await supabase
    .from('analyses')
    .select('risk_level, risk_score, category, type, created_at')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) throw new Error(error.message)
  return data || []
}
