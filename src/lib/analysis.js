// Built-in client-side scam analysis engine
// This runs in the browser as a fallback when the Supabase Edge Function
// is unavailable (e.g., on Vercel without env vars, or network issues).
// It mirrors the deterministic rules + demo responses from the edge function.

const PHISHING_KEYWORDS = [
  'kyc', 'account will be blocked', 'account is blocked', 'urgent',
  'verify your account', 'click here', 'suspended', 'immediately',
  'otp', 'password', 'login', 'confirm your details', 'update your',
  'verify now', 'action required', 'limited access', 'security alert',
]

const BANKING_KEYWORDS = [
  'sbi', 'hdfc', 'icici', 'axis', 'kotak', 'punjab national', 'bank of baroda',
  'canara', 'union bank', 'bank', 'atm', 'debit card', 'credit card',
  'account', 'cheque', 'ifsc', 'branch',
]

const JOB_KEYWORDS = [
  'job offer', 'selected for', 'congratulations you have been',
  'work from home', 'earn money', 'part time job', 'data entry',
  'salary', 'hiring', 'recruitment', 'candidate selected',
  'company has shortlisted', 'interview scheduled',
]

const UPI_KEYWORDS = [
  'upi', 'paytm', 'phonepe', 'gpay', 'google pay', 'bhim',
  'send money', 'payment', 'transfer', 'refund', 'cashback',
  'receive money', 'payment pending',
]

const LOTTERY_KEYWORDS = [
  'lottery', 'winner', 'congratulations you won', 'prize',
  'lucky draw', 'selected for prize', 'claim your', 'reward',
  'you have won', 'jackpot', 'mega prize',
]

const URGENCY_PHRASES = [
  'urgent', 'immediately', 'today', 'within 24 hours', 'now',
  'before', 'last chance', 'final notice', 'expires', 'hurry',
  'act now', "don't delay", 'limited time',
]

const URL_REGEX = /https?:\/\/[^\s]+|www\.[^\s]+|[a-z0-9-]+\.(com|in|net|org|co|xyz|info|click|top|live|online|site|app|io|me|cc|tk|ml|ga|cf)[^\s]*/gi

function extractUrls(text) {
  return text.match(URL_REGEX) || []
}

function hasKeyword(text, keywords) {
  const lower = text.toLowerCase()
  return keywords.some((k) => lower.includes(k))
}

function countKeywordMatches(text, keywords) {
  const lower = text.toLowerCase()
  return keywords.filter((k) => lower.includes(k))
}

function analyzeUrlString(url) {
  const flags = []
  let score = 0
  const lower = url.toLowerCase()

  if (/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(lower)) {
    flags.push('Uses IP address instead of domain name')
    score += 20
  }

  const subdomainCount = (lower.match(/\./g) || []).length
  if (subdomainCount > 3) {
    flags.push(`Excessive subdomains (${subdomainCount} dots) — possible spoofing`)
    score += 15
  }

  const misleadingPatterns = [
    { pattern: /sb[i1l]/i, real: 'sbi' },
    { pattern: /hdfc|hdfe/i, real: 'hdfc' },
    { pattern: /ic[i1l]c[i1l]/i, real: 'icici' },
    { pattern: /paytm|paytym/i, real: 'paytm' },
    { pattern: /ph0nep[e3]/i, real: 'phonepe' },
  ]
  for (const { pattern, real } of misleadingPatterns) {
    if (pattern.test(lower) && !lower.includes(`${real}.`)) {
      flags.push(`Misspelled/lookalike domain (mimics "${real}")`)
      score += 20
      break
    }
  }

  const suspiciousTlds = ['.xyz', '.top', '.click', '.tk', '.ml', '.ga', '.cf', '.live', '.online', '.site', '.cc']
  if (suspiciousTlds.some((tld) => lower.endsWith(tld) || lower.includes(`${tld}/`) || lower.includes(`${tld}?`))) {
    flags.push('Uses a suspicious top-level domain')
    score += 15
  }

  const paramCount = (url.match(/[?&]/g) || []).length
  if (paramCount > 4) {
    flags.push(`Excessive URL parameters (${paramCount}) — possible tracking/phishing`)
    score += 15
  }

  const urlPhishingKw = ['login', 'verify', 'account', 'update', 'secure', 'confirm', 'kyc', 'otp', 'password', 'unlock', 'activate']
  if (urlPhishingKw.some((kw) => lower.includes(kw))) {
    flags.push('Phishing-related keywords in URL path')
    score += 15
  }

  const shorteners = ['bit.ly', 'tinyurl', 't.co', 'goo.gl', 'shorturl', 'is.gd', 'buff.ly', 'rebrand.ly']
  if (shorteners.some((s) => lower.includes(s))) {
    flags.push('Uses URL shortener — destination is hidden')
    score += 15
  }

  if (lower.startsWith('http://')) {
    flags.push('Not using HTTPS (insecure connection)')
    score += 10
  }

  return { flags, score: Math.min(score, 60) }
}

function getRiskLevel(score) {
  if (score >= 75) return 'CRITICAL'
  if (score >= 50) return 'HIGH'
  if (score >= 25) return 'SUSPICIOUS'
  return 'LOW'
}

function deterministicAnalyze(input) {
  const redFlags = []
  let score = 0
  let category = 'Unknown'

  const urls = extractUrls(input)
  for (const url of urls) {
    const urlAnalysis = analyzeUrlString(url)
    redFlags.push(...urlAnalysis.flags)
    score += urlAnalysis.score
  }

  const urgencyMatches = countKeywordMatches(input, URGENCY_PHRASES)
  if (urgencyMatches.length > 0) {
    redFlags.push(`Urgency/fear manipulation (${urgencyMatches.slice(0, 3).join(', ')})`)
    score += 15
  }

  if (hasKeyword(input, ['send money', 'transfer', 'deposit', 'pay now', 'payment', 'fees', 'registration fee', 'processing fee'])) {
    redFlags.push('Requests for money or payment')
    score += 15
  }

  if (hasKeyword(input, ['otp', 'password', 'pin', 'cvv', 'card number', 'login details', 'credentials'])) {
    redFlags.push('Requests for sensitive credentials (OTP, password, PIN)')
    score += 20
  }

  if (hasKeyword(input, LOTTERY_KEYWORDS)) {
    category = 'Lottery/Prize Scam'
    if (!redFlags.some((f) => f.includes('lottery'))) redFlags.push('False lottery/prize notification')
    score += 15
  } else if (hasKeyword(input, JOB_KEYWORDS)) {
    category = 'Fake Job Offer'
    if (!redFlags.some((f) => f.includes('job'))) redFlags.push('Unsolicited job offer with unrealistic promises')
    score += 15
  } else if (hasKeyword(input, UPI_KEYWORDS)) {
    category = 'UPI/Payment Scam'
    if (!redFlags.some((f) => f.includes('payment'))) redFlags.push('Suspicious payment/UPI request')
    score += 10
  } else if (hasKeyword(input, BANKING_KEYWORDS) || hasKeyword(input, PHISHING_KEYWORDS)) {
    category = 'Banking/Phishing Scam'
    if (!redFlags.some((f) => f.includes('phishing'))) redFlags.push('Banking account phishing attempt')
    score += 10
  } else if (urls.length > 0) {
    category = 'Phishing'
    score += 10
  } else if (score === 0) {
    category = 'Safe/Informational'
  }

  const uniqueFlags = [...new Set(redFlags)]
  return {
    riskScore: Math.min(score, 100),
    category,
    redFlags: uniqueFlags,
  }
}

function generateRecommendations(category, redFlags) {
  const recs = []

  if (redFlags.some((f) => f.includes('URL'))) {
    recs.push('Do not click any links in the message')
  }
  if (redFlags.some((f) => f.includes('credential') || f.includes('OTP'))) {
    recs.push('Never share OTP, password, PIN, or CVV with anyone')
  }
  if (redFlags.some((f) => f.includes('money') || f.includes('payment'))) {
    recs.push('Do not send money or make any payments')
  }
  if (redFlags.some((f) => f.includes('Urgency'))) {
    recs.push('Stay calm — scammers create false urgency to force quick action')
  }

  recs.push('Verify through official channels (official website, app, or customer care)')
  recs.push('Report suspicious messages to your bank or to cybercrime.gov.in')
  recs.push('Delete the message and do not forward it to others')

  return [...new Set(recs)]
}

function generateHindiExplanation(category, riskLevel, redFlags) {
  const flagText = redFlags.slice(0, 3).join(', ').toLowerCase()

  let base = ''
  switch (category) {
    case 'Banking/Phishing Scam':
      base = 'यह संदेश एक बैंकिंग फिशिंग घोटाला लगता है। '
      break
    case 'Fake Job Offer':
      base = 'यह संदेश एक नकली नौकरी का ऑफर जैसा दिखता है। '
      break
    case 'UPI/Payment Scam':
      base = 'यह एक UPI/पेमेंट घोटाला हो सकता है। '
      break
    case 'Lottery/Prize Scam':
      base = 'यह एक नकली लॉटरी या इनाम का घोटाला है। '
      break
    case 'Phishing':
      base = 'यह संदेश फिशिंग प्रयास जैसा दिखता है। '
      break
    default:
      base = 'यह संदेश सामान्य जानकारी जैसा दिखता है। '
  }

  const riskMap = {
    CRITICAL: 'रिस्क स्तर बहुत ऊंचा है (CRITICAL)। ',
    HIGH: 'रिस्क स्तर ऊंचा है (HIGH)। ',
    SUSPICIOUS: 'यह संदेश संदिग्ध (suspicious) है। ',
    LOW: 'रिस्क स्तर कम है। ',
  }

  const advice = `मुख्य चेतावनियां: ${flagText || 'कोई विशेष चेतावनी नहीं'}. इस संदेश पर विश्वास न करें। किसी भी लिंक पर क्लिक न करें, OTP या पासवर्ड न बताएं, और आधिकारिक स्रोत से सत्यापित करें। संदिग्ध संदेशों की रिपोर्ट cybercrime.gov.in पर करें।`

  return base + (riskMap[riskLevel] || '') + advice
}

function getDemoResponse(input) {
  const lower = input.toLowerCase()

  if (hasKeyword(lower, LOTTERY_KEYWORDS) || lower.includes('won') || lower.includes('lottery')) {
    return {
      riskScore: 95,
      riskLevel: 'CRITICAL',
      category: 'Lottery/Prize Scam',
      summary: "This message is a classic lottery/prize scam. You are told you've won something you never entered, and will be asked to pay 'fees' or share bank details to claim it.",
      redFlags: [
        'False lottery/prize notification',
        'Requests for money or payment (processing fee)',
        'Unsolicited — you did not enter any lottery',
        'Urgency to claim before deadline',
      ],
      recommendations: [
        "Do not pay any 'processing fee' or 'registration fee'",
        'Do not share bank account or card details',
        'Remember: you cannot win a lottery you never entered',
        'Block and report the sender',
        'Report to cybercrime.gov.in',
      ],
      hindiExplanation: 'यह एक नकली लॉटरी या इनाम का घोटाला है। आपने कभी लॉटरी नहीं खरीदी, फिर भी आपको इनाम दिलाया जा रहा है। यह धोखाधड़ी है। कोई फीस न दें, बैंक विवरण न बताएं। इसे cybercrime.gov.in पर रिपोर्ट करें।',
    }
  }

  if (hasKeyword(lower, JOB_KEYWORDS)) {
    return {
      riskScore: 88,
      riskLevel: 'HIGH',
      category: 'Fake Job Offer',
      summary: 'This message appears to be a fake job offer. Scammers send unsolicited job offers promising high salary for minimal work, then ask for registration fees or personal documents.',
      redFlags: [
        'Unsolicited job offer with unrealistic promises',
        'High salary for minimal work (too good to be true)',
        'Requests for money (registration fee)',
        'No proper company verification',
        'Urgency to respond immediately',
      ],
      recommendations: [
        'Do not pay any registration or processing fee',
        'Do not share Aadhaar, PAN, or bank details',
        'Verify the company on the official MCA portal',
        'Real companies never ask for fees before hiring',
        'Report to cybercrime.gov.in',
      ],
      hindiExplanation: 'यह एक नकली नौकरी का ऑफर है। अचानक नौकरी का प्रस्ताव, ज्यादा तनख्वाह और रजिस्ट्रेशन फीस मांगना — ये सब घोटाले के संकेत हैं। कोई फीस न दें, निजी दस्तावेज न बताएं। असली कंपनियां नौकरी देने से पहले फीस नहीं मांगतीं।',
    }
  }

  if (hasKeyword(lower, UPI_KEYWORDS)) {
    return {
      riskScore: 90,
      riskLevel: 'CRITICAL',
      category: 'UPI/Payment Scam',
      summary: "This message shows signs of a UPI/payment scam. Scammers may ask you to send money, accept a payment request, or 'verify' your UPI ID — all designed to steal funds.",
      redFlags: [
        'Suspicious payment/UPI request',
        'Requests for money or payment',
        'Requests for sensitive credentials (OTP, password, PIN)',
        'Urgency/fear manipulation',
      ],
      recommendations: [
        "Never enter your UPI PIN to 'receive' money — receiving money never requires a PIN",
        'Do not accept unknown payment requests',
        'Do not share OTP or UPI PIN with anyone',
        'Verify the requester through official channels',
        'Report to your bank and cybercrime.gov.in',
      ],
      hindiExplanation: 'यह एक UPI/पेमेंट घोटाला हो सकता है। याद रखें: पैसे पाने के लिए कभी PIN नहीं लगाता। अगर आपसे पैसे भेजने या receive करने के लिए PIN मांगा जाए, तो यह धोखाधड़ी है। OTP या PIN किसी को न बताएं।',
    }
  }

  if (hasKeyword(lower, BANKING_KEYWORDS) || hasKeyword(lower, PHISHING_KEYWORDS)) {
    return {
      riskScore: 92,
      riskLevel: 'CRITICAL',
      category: 'Banking/Phishing Scam',
      summary: 'This message shows multiple phishing indicators commonly used in banking scams. It creates urgency, threatens account suspension, and directs you to a fake link to steal credentials.',
      redFlags: [
        'Urgency/fear manipulation (account will be blocked)',
        'Suspicious URL in message',
        'Requests for sensitive credentials (OTP, password)',
        'Banking account phishing attempt',
        'Misspelled/lookalike domain',
      ],
      recommendations: [
        'Do not click the link in the message',
        'Do not share OTP, password, or PIN with anyone',
        "Verify through your bank's official app or website directly",
        'Banks never ask for KYC via SMS links',
        'Report to your bank and cybercrime.gov.in',
      ],
      hindiExplanation: 'यह संदेश एक बैंकिंग फिशिंग घोटाला लगता है। रिस्क स्तर बहुत ऊंचा है (CRITICAL)। मुख्य चेतावनियां: खाता ब्लॉक होने की धमकी, संदिग्ध लिंक, OTP/पासवर्ड मांगना। इस संदेश पर विश्वास न करें। किसी भी लिंक पर क्लिक न करें, OTP या पासवर्ड न बताएं, और बैंक के आधिकारिक ऐप से सत्यापित करें। संदिग्ध संदेशों की रिपोर्ट cybercrime.gov.in पर करें।',
    }
  }

  return {
    riskScore: 12,
    riskLevel: 'LOW',
    category: 'Safe/Informational',
    summary: 'This message does not show significant scam indicators. It appears to be a normal informational message. Always stay cautious with unexpected messages.',
    redFlags: [
      'No significant scam indicators detected',
    ],
    recommendations: [
      'Stay cautious with unexpected messages',
      'If in doubt, verify through official channels',
      'Never share OTP or passwords with anyone',
    ],
    hindiExplanation: 'यह संदेश सामान्य जानकारी जैसा दिखता है। रिस्क स्तर कम है। इसमें कोई विशेष घोटाले के संकेत नहीं मिले। फिर भी, अचानक आने वाले संदेशों के प्रति सतर्क रहें।',
  }
}

function getDemoUrlResponse(url) {
  const lower = url.toLowerCase()
  const { flags, score, category } = analyzeUrlFull(url)

  if (score === 0) {
    return {
      riskScore: 10,
      riskLevel: 'LOW',
      category: 'Safe/Informational',
      summary: 'This URL does not show significant suspicious indicators. It appears to be a normal URL. Always stay cautious with unexpected links.',
      redFlags: flags.length > 0 ? flags : ['No significant suspicious indicators detected'],
      recommendations: [
        'Stay cautious with unexpected links',
        'If in doubt, verify through official sources',
        'Do not enter personal information on unfamiliar sites',
      ],
      hindiExplanation: 'यह URL सामान्य दिखता है। रिस्क स्तर कम है। इसमें कोई विशेष संदिग्ध संकेत नहीं मिले। फिर भी, अचानक मिले लिंक पर विश्वास न करें।',
    }
  }

  return {
    riskScore: score,
    riskLevel: getRiskLevel(score),
    category,
    summary: `This URL shows ${flags.length} suspicious indicator(s): ${flags.slice(0, 3).join(', ')}.`,
    redFlags: flags,
    recommendations: generateRecommendations(category, flags),
    hindiExplanation: generateHindiExplanation(getRiskLevel(score), flags),
  }
}

function analyzeUrlFull(url) {
  const flags = []
  let score = 0
  let category = 'URL Analysis'
  const lower = url.toLowerCase()

  if (/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(lower)) {
    flags.push('Uses IP address instead of domain name')
    score += 20
    category = 'Phishing'
  }

  const subdomainCount = (lower.match(/\./g) || []).length
  if (subdomainCount > 3) {
    flags.push(`Excessive subdomains (${subdomainCount} dots) — possible spoofing`)
    score += 15
    category = 'Phishing'
  }

  const misleadingPatterns = [
    { pattern: /sb[i1l]/i, real: 'sbi' },
    { pattern: /hdfc|hdfe/i, real: 'hdfc' },
    { pattern: /ic[i1l]c[i1l]/i, real: 'icici' },
    { pattern: /paytm|paytym/i, real: 'paytm' },
    { pattern: /ph0nep[e3]/i, real: 'phonepe' },
    { pattern: /amaz0n|amaz[o0]n/i, real: 'amazon' },
    { pattern: /g[o0][o0]gle/i, real: 'google' },
    { pattern: /faceb[o0][o0]k/i, real: 'facebook' },
  ]
  for (const { pattern, real } of misleadingPatterns) {
    if (pattern.test(lower) && !lower.includes(`${real}.`)) {
      flags.push(`Misspelled/lookalike domain (mimics "${real}")`)
      score += 25
      category = 'Phishing'
      break
    }
  }

  const suspiciousTlds = ['.xyz', '.top', '.click', '.tk', '.ml', '.ga', '.cf', '.live', '.online', '.site', '.cc', '.info']
  if (suspiciousTlds.some((tld) => lower.endsWith(tld) || lower.includes(`${tld}/`) || lower.includes(`${tld}?`))) {
    flags.push('Uses a suspicious top-level domain')
    score += 15
    category = 'Phishing'
  }

  const paramCount = (url.match(/[?&]/g) || []).length
  if (paramCount > 4) {
    flags.push(`Excessive URL parameters (${paramCount}) — possible tracking/phishing`)
    score += 15
  }

  const urlPhishingKw = ['login', 'verify', 'account', 'update', 'secure', 'confirm', 'kyc', 'otp', 'password', 'unlock', 'activate', 'signin', 'authenticate']
  const foundKw = urlPhishingKw.filter((kw) => lower.includes(kw))
  if (foundKw.length > 0) {
    flags.push(`Phishing-related keywords in URL (${foundKw.slice(0, 3).join(', ')})`)
    score += 15
    if (category === 'URL Analysis') category = 'Phishing'
  }

  const shorteners = ['bit.ly', 'tinyurl', 't.co', 'goo.gl', 'shorturl', 'is.gd', 'buff.ly', 'rebrand.ly', 'cutt.ly']
  if (shorteners.some((s) => lower.includes(s))) {
    flags.push('Uses URL shortener — actual destination is hidden')
    score += 15
  }

  if (lower.startsWith('http://')) {
    flags.push('Not using HTTPS (insecure connection)')
    score += 10
  }

  if (url.includes('@')) {
    flags.push("Contains '@' symbol — can hide the real destination")
    score += 15
    category = 'Phishing'
  }

  if (url.length > 100) {
    flags.push('Unusually long URL — often used to hide the real destination')
    score += 10
  }

  if (/%[0-9a-f]{2}/i.test(url)) {
    flags.push('Contains encoded characters — may hide suspicious content')
    score += 10
  }

  if (score === 0) {
    category = 'Safe/Informational'
    flags.push('No significant suspicious indicators detected')
  }

  return { flags, score: Math.min(score, 100), category }
}

// ─── Public API ─────────────────────────────────────────────────────

export function analyzeMessageLocal(input) {
  const detResult = deterministicAnalyze(input)
  const demo = getDemoResponse(input)

  const mergedFlags = [...new Set([...demo.redFlags, ...detResult.redFlags])]
  const mergedScore = Math.max(demo.riskScore, detResult.riskScore || 0)

  let result = {
    ...demo,
    redFlags: mergedFlags,
    riskScore: mergedScore,
    riskLevel: getRiskLevel(mergedScore),
    demoMode: true,
  }

  if (!result.recommendations || result.recommendations.length === 0) {
    result.recommendations = generateRecommendations(result.category, result.redFlags)
  }
  if (!result.hindiExplanation) {
    result.hindiExplanation = generateHindiExplanation(result.category, result.riskLevel, result.redFlags)
  }
  result.riskLevel = getRiskLevel(result.riskScore)

  return result
}

export function analyzeUrlLocal(input) {
  let url = input.trim()
  if (!url.match(/^https?:\/\//i) && !url.startsWith('www.')) {
    url = 'http://' + url
  }

  const demo = getDemoUrlResponse(url)
  const { flags: detFlags, score: detScore, category: detCategory } = analyzeUrlFull(url)

  const mergedFlags = [...new Set([...demo.redFlags, ...detFlags])]
  const mergedScore = Math.max(demo.riskScore, detScore || 0)

  let result = {
    ...demo,
    redFlags: mergedFlags,
    riskScore: mergedScore,
    riskLevel: getRiskLevel(mergedScore),
    category: detCategory !== 'Safe/Informational' ? detCategory : demo.category,
    demoMode: true,
  }

  if (!result.recommendations || result.recommendations.length === 0) {
    result.recommendations = generateRecommendations(result.category, result.redFlags)
  }
  if (!result.hindiExplanation) {
    result.hindiExplanation = generateHindiExplanation(result.category, result.riskLevel, result.redFlags)
  }
  result.riskLevel = getRiskLevel(result.riskScore)

  return result
}
