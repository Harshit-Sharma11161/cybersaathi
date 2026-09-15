import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalysisResult {
  riskScore: number;
  riskLevel: string;
  category: string;
  summary: string;
  redFlags: string[];
  recommendations: string[];
  hindiExplanation: string;
  demoMode: boolean;
}

function getRiskLevel(score: number): string {
  if (score >= 75) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 25) return "SUSPICIOUS";
  return "LOW";
}

function analyzeUrlString(url: string): { flags: string[]; score: number; category: string } {
  const flags: string[] = [];
  let score = 0;
  let category = "URL Analysis";
  const lower = url.toLowerCase();

  // IP address as domain
  if (/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(lower)) {
    flags.push("Uses IP address instead of domain name");
    score += 20;
    category = "Phishing";
  }

  // Excessive subdomains
  const subdomainCount = (lower.match(/\./g) || []).length;
  if (subdomainCount > 3) {
    flags.push(`Excessive subdomains (${subdomainCount} dots) — possible spoofing`);
    score += 15;
    category = "Phishing";
  }

  // Misleading domain patterns (lookalike domains)
  const misleadingPatterns = [
    { pattern: /sb[i1l]/i, real: "sbi" },
    { pattern: /hdfc|hdfe/i, real: "hdfc" },
    { pattern: /ic[i1l]c[i1l]/i, real: "icici" },
    { pattern: /paytm|paytym/i, real: "paytm" },
    { pattern: /ph0nep[e3]/i, real: "phonepe" },
    { pattern: /amaz0n|amaz[o0]n/i, real: "amazon" },
    { pattern: /g[o0][o0]gle/i, real: "google" },
    { pattern: /faceb[o0][o0]k/i, real: "facebook" },
  ];
  for (const { pattern, real } of misleadingPatterns) {
    if (pattern.test(lower) && !lower.includes(`${real}.`)) {
      flags.push(`Misspelled/lookalike domain (mimics "${real}")`);
      score += 25;
      category = "Phishing";
      break;
    }
  }

  // Suspicious TLDs
  const suspiciousTlds = [".xyz", ".top", ".click", ".tk", ".ml", ".ga", ".cf", ".live", ".online", ".site", ".cc", ".info"];
  if (suspiciousTlds.some((tld) => lower.endsWith(tld) || lower.includes(`${tld}/`) || lower.includes(`${tld}?`))) {
    flags.push("Uses a suspicious top-level domain");
    score += 15;
    category = "Phishing";
  }

  // Excessive URL parameters
  const paramCount = (url.match(/[?&]/g) || []).length;
  if (paramCount > 4) {
    flags.push(`Excessive URL parameters (${paramCount}) — possible tracking/phishing`);
    score += 15;
  }

  // Phishing keywords in URL path
  const urlPhishingKw = ["login", "verify", "account", "update", "secure", "confirm", "kyc", "otp", "password", "unlock", "activate", "signin", "authenticate"];
  const foundKw = urlPhishingKw.filter((kw) => lower.includes(kw));
  if (foundKw.length > 0) {
    flags.push(`Phishing-related keywords in URL (${foundKw.slice(0, 3).join(", ")})`);
    score += 15;
    if (category === "URL Analysis") category = "Phishing";
  }

  // URL shortener
  const shorteners = ["bit.ly", "tinyurl", "t.co", "goo.gl", "shorturl", "is.gd", "buff.ly", "rebrand.ly", "cutt.ly"];
  if (shorteners.some((s) => lower.includes(s))) {
    flags.push("Uses URL shortener — actual destination is hidden");
    score += 15;
  }

  // Non-HTTPS
  if (lower.startsWith("http://")) {
    flags.push("Not using HTTPS (insecure connection)");
    score += 10;
  }

  // @ symbol in URL (can redirect to different site)
  if (url.includes("@")) {
    flags.push("Contains '@' symbol — can hide the real destination");
    score += 15;
    category = "Phishing";
  }

  // Excessive length
  if (url.length > 100) {
    flags.push("Unusually long URL — often used to hide the real destination");
    score += 10;
  }

  // Hex/encoded characters
  if (/%[0-9a-f]{2}/i.test(url)) {
    flags.push("Contains encoded characters — may hide suspicious content");
    score += 10;
  }

  if (score === 0) {
    category = "Safe/Informational";
    flags.push("No significant suspicious indicators detected");
  }

  return { flags, score: Math.min(score, 100), category };
}

function generateRecommendations(redFlags: string[]): string[] {
  const recs: string[] = [];

  if (redFlags.some((f) => f.includes("shortener"))) {
    recs.push("Expand the shortened URL using a URL expander tool before visiting");
  }
  if (redFlags.some((f) => f.includes("HTTPS"))) {
    recs.push("Only enter personal information on HTTPS-secured websites");
  }
  if (redFlags.some((f) => f.includes("lookalike") || f.includes("Misspelled"))) {
    recs.push("Check the domain spelling carefully — scammers use lookalike domains");
  }
  if (redFlags.some((f) => f.includes("IP address"))) {
    recs.push("Legitimate websites use domain names, not raw IP addresses");
  }

  recs.push("Do not enter personal or financial information on this page");
  recs.push("Verify the website through official sources or a search engine");
  recs.push("If suspicious, report to cybercrime.gov.in");

  return [...new Set(recs)];
}

function generateHindiExplanation(riskLevel: string, redFlags: string[]): string {
  const flagText = redFlags.slice(0, 3).join(", ").toLowerCase();

  const riskMap: Record<string, string> = {
    CRITICAL: `यह URL बहुत खतरनाक (CRITICAL) लगता है। `,
    HIGH: `यह URL संदिग्ध (HIGH risk) है। `,
    SUSPICIOUS: `यह URL संदिग्ध (suspicious) है। `,
    LOW: `यह URL सामान्य दिखता है। `,
  };

  return (riskMap[riskLevel] || "") +
    `मुख्य चेतावनियां: ${flagText}. इस वेबसाइट पर व्यक्तिगत जानकारी या बैंक विवरण न दें। डोमेन नाम की वर्तनी ध्यान से जांचें। संदिग्ध URL की रिपोर्ट cybercrime.gov.in पर करें।`;
}

// ─── AI analysis ────────────────────────────────────────────────────
async function getAIAnalysis(url: string): Promise<AnalysisResult | null> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) return null;

  try {
    const prompt = `You are a cybersecurity expert analyzing a suspicious URL for Indian users. Analyze this URL and respond with ONLY valid JSON (no markdown, no code fences).

URL to analyze: ${url}

Respond with this exact JSON structure:
{
  "riskScore": <0-100 integer>,
  "riskLevel": "<LOW|SUSPICIOUS|HIGH|CRITICAL>",
  "category": "<short category name>",
  "summary": "<2-3 sentence explanation in English>",
  "redFlags": ["<flag 1>", "<flag 2>", ...],
  "recommendations": ["<action 1>", "<action 2>", ...],
  "hindiExplanation": "<Hindi/Hinglish explanation>"
}

Rules:
- riskScore 0-20 = LOW, 21-49 = SUSPICIOUS, 50-74 = HIGH, 75-100 = CRITICAL
- Never claim a URL is definitely malicious — use "suspicious", "likely phishing", "high risk"
- If the URL appears safe, give a low score`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a cybersecurity URL analysis expert. Respond only with valid JSON." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 600,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const cleanJson = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    if (typeof parsed.riskScore !== "number" || !parsed.riskLevel) return null;

    return {
      riskScore: Math.max(0, Math.min(100, parsed.riskScore)),
      riskLevel: parsed.riskLevel.toUpperCase(),
      category: parsed.category || "URL Analysis",
      summary: parsed.summary || "",
      redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      hindiExplanation: parsed.hindiExplanation || "",
      demoMode: false,
    };
  } catch (err) {
    console.error("AI URL analysis failed:", err.message);
    return null;
  }
}

// ─── Main handler ───────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { input } = await req.json();

    if (!input || typeof input !== "string" || input.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let url = input.trim();
    if (!url.match(/^https?:\/\//i) && !url.startsWith("www.")) {
      url = "http://" + url;
    }

    // 1. Deterministic analysis
    const detResult = analyzeUrlString(url);

    // 2. Try AI
    const aiResult = await getAIAnalysis(url);

    let finalResult: AnalysisResult;

    if (aiResult) {
      const mergedFlags = [...new Set([...aiResult.redFlags, ...detResult.flags])];
      finalResult = {
        ...aiResult,
        redFlags: mergedFlags,
        demoMode: false,
      };
    } else {
      finalResult = {
        riskScore: detResult.score,
        riskLevel: getRiskLevel(detResult.score),
        category: detResult.category,
        summary: detResult.score === 0
          ? "This URL does not show significant suspicious indicators. It appears to be a normal URL. Always stay cautious with unexpected links."
          : `This URL shows ${detResult.flags.length} suspicious indicator(s): ${detResult.flags.slice(0, 3).join(", ")}.`,
        redFlags: detResult.flags,
        recommendations: generateRecommendations(detResult.flags),
        hindiExplanation: generateHindiExplanation(getRiskLevel(detResult.score), detResult.flags),
        demoMode: true,
      };
    }

    if (!finalResult.recommendations || finalResult.recommendations.length === 0) {
      finalResult.recommendations = generateRecommendations(finalResult.redFlags);
    }
    if (!finalResult.hindiExplanation) {
      finalResult.hindiExplanation = generateHindiExplanation(finalResult.riskLevel, finalResult.redFlags);
    }
    finalResult.riskLevel = getRiskLevel(finalResult.riskScore);

    // 3. Save to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && serviceRoleKey) {
      try {
        const supabase = createClient(supabaseUrl, serviceRoleKey);
        await supabase.from("analyses").insert({
          input: url.substring(0, 5000),
          type: "url",
          risk_score: finalResult.riskScore,
          risk_level: finalResult.riskLevel,
          category: finalResult.category,
          summary: finalResult.summary,
          red_flags: finalResult.redFlags,
          recommendations: finalResult.recommendations,
          hindi_explanation: finalResult.hindiExplanation,
        });
      } catch (dbErr) {
        console.error("Database save failed:", dbErr.message);
      }
    }

    return new Response(
      JSON.stringify(finalResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
