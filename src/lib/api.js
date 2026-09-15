import { supabase } from './supabase.js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

async function callEdgeFunction(slug, body) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.')
  }

  const url = `${SUPABASE_URL}/functions/v1/${slug}`
  const headers = {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    let errMsg = `Request failed (${response.status})`
    try {
      const errBody = await response.json()
      if (errBody.error) errMsg = errBody.error
    } catch {
      // response wasn't JSON
    }
    throw new Error(errMsg)
  }

  const data = await response.json()

  if (!data || typeof data.riskScore !== 'number') {
    throw new Error('Invalid response from analysis service')
  }

  return data
}

export async function analyzeMessage(input) {
  return callEdgeFunction('analyze-message', { input })
}

export async function analyzeUrl(input) {
  return callEdgeFunction('analyze-url', { input })
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
