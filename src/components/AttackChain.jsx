import { AlertTriangle, ArrowDown, MessageSquare, Brain, Clock, Link2, Globe, KeyRound, ShieldX } from 'lucide-react'

const chainTemplates = {
  'Banking/Phishing Scam': [
    { icon: MessageSquare, label: 'Suspicious Message', desc: 'SMS or email received' },
    { icon: Brain, label: 'Social Engineering', desc: 'Impersonates your bank' },
    { icon: Clock, label: 'Urgency / Fear', desc: 'Account will be blocked' },
    { icon: Link2, label: 'Phishing Link', desc: 'Fake verification URL' },
    { icon: Globe, label: 'Fake Website', desc: 'Looks like real bank portal' },
    { icon: KeyRound, label: 'Credentials / OTP', desc: 'Asked to enter password/OTP' },
    { icon: ShieldX, label: 'Account Compromise', desc: 'Funds stolen, identity theft' },
  ],
  'Fake Job Offer': [
    { icon: MessageSquare, label: 'Suspicious Message', desc: 'Unsolicited job offer' },
    { icon: Brain, label: 'Social Engineering', desc: 'High salary, easy work' },
    { icon: Clock, label: 'Urgency / Greed', desc: 'Limited positions, act now' },
    { icon: Link2, label: 'Registration Link', desc: 'Fake company portal' },
    { icon: Globe, label: 'Fake Website', desc: 'Looks like real company' },
    { icon: KeyRound, label: 'Fees / Documents', desc: 'Asked for money and Aadhaar/PAN' },
    { icon: ShieldX, label: 'Financial Loss', desc: 'Money stolen, identity theft' },
  ],
  'UPI/Payment Scam': [
    { icon: MessageSquare, label: 'Suspicious Message', desc: 'Payment request or link' },
    { icon: Brain, label: 'Social Engineering', desc: 'Poses as known contact or official' },
    { icon: Clock, label: 'Urgency / Trust', desc: 'Send money now, verify UPI' },
    { icon: Link2, label: 'Payment Link', desc: 'Fake UPI collect request' },
    { icon: KeyRound, label: 'PIN / OTP', desc: 'Asked to enter PIN to "receive"' },
    { icon: ShieldX, label: 'Money Stolen', desc: 'Funds debited from account' },
  ],
  'Lottery/Prize Scam': [
    { icon: MessageSquare, label: 'Suspicious Message', desc: 'You won a lottery/prize' },
    { icon: Brain, label: 'Social Engineering', desc: 'Excitement and greed' },
    { icon: Clock, label: 'Urgency / Deadline', desc: 'Claim before time expires' },
    { icon: Link2, label: 'Claim Link', desc: 'Fake lottery website' },
    { icon: Globe, label: 'Fake Website', desc: 'Looks like official lottery' },
    { icon: KeyRound, label: 'Processing Fee', desc: 'Asked to pay to claim prize' },
    { icon: ShieldX, label: 'Financial Loss', desc: 'Money stolen, no prize exists' },
  ],
  'Phishing': [
    { icon: MessageSquare, label: 'Suspicious Message', desc: 'Unexpected message received' },
    { icon: Brain, label: 'Social Engineering', desc: 'Manipulation tactics' },
    { icon: Clock, label: 'Urgency / Fear', desc: 'Action required immediately' },
    { icon: Link2, label: 'Phishing Link', desc: 'Malicious URL in message' },
    { icon: Globe, label: 'Fake Website', desc: 'Counterfeit login page' },
    { icon: KeyRound, label: 'Credentials Stolen', desc: 'Login info captured by attacker' },
    { icon: ShieldX, label: 'Account Compromise', desc: 'Unauthorized access gained' },
  ],
  'Safe/Informational': [
    { icon: MessageSquare, label: 'Normal Message', desc: 'No suspicious indicators' },
    { icon: ShieldX, label: 'No Attack Chain', desc: 'Message appears safe' },
  ],
}

export default function AttackChain({ category }) {
  const chain = chainTemplates[category] || chainTemplates['Phishing']

  return (
    <div className="glass-card p-6 animate-slide-up">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="w-5 h-5 text-cyber-accent" />
        <h3 className="text-lg font-bold">Attack Chain</h3>
      </div>

      <div className="flex flex-col items-center gap-0">
        {chain.map((step, i) => {
          const Icon = step.icon
          const isLast = i === chain.length - 1
          const isDanger = i >= chain.length - 2

          return (
            <div key={i} className="flex flex-col items-center w-full max-w-md animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border w-full transition-all ${
                isDanger
                  ? 'bg-cyber-danger/10 border-cyber-danger/30'
                  : 'bg-cyber-surface/60 border-cyber-border/50'
              }`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                  isDanger ? 'bg-cyber-danger/20' : 'bg-cyber-accent/10'
                }`}>
                  <Icon className={`w-5 h-5 ${isDanger ? 'text-cyber-danger' : 'text-cyber-accent'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-cyber-text">{step.label}</div>
                  <div className="text-xs text-cyber-muted">{step.desc}</div>
                </div>
              </div>
              {!isLast && (
                <div className="py-1">
                  <ArrowDown className="w-5 h-5 text-cyber-muted/50" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
