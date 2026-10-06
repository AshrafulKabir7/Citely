import { ExecutiveDefinition } from './types';

export const EXECUTIVES: ExecutiveDefinition[] = [
  {
    id: 'chief_of_staff',
    name: 'Chief of Staff',
    role: 'People Ops & Company Governance',
    department: 'Executive Office',
    badge: '8',
    badgeType: 'count',
    iconType: 'briefcase',
    color: '#8C9E5E', // Olive
    description: 'Specializes in company policies, PTO allocation, remote work allowances, employee code of conduct, and executive briefs.',
    sourceFileFocus: 'Nexus_Employee_Handbook_v4.pdf',
    samplePrompts: [
      'What is our annual PTO and sick leave accrual policy?',
      'What is the remote work hardware stipend and learning refresh budget?',
      'What are our core collaboration hours for distributed teams?',
      'Can I claim personal pet food on company expenses? (Guardrail test)',
    ],
  },
  {
    id: 'chief_of_engineering',
    name: 'Chief of Engineering',
    role: 'Systems Architecture & APIs',
    department: 'Engineering & Product',
    badge: '7',
    badgeType: 'count',
    iconType: 'terminal',
    color: '#A68A68', // Warm Ochre
    description: 'Expert on REST APIs, rate limiting rules, burst quotas, webhook retries, token authentication, and cluster failover.',
    sourceFileFocus: 'https://acmecloud.io/api-docs',
    samplePrompts: [
      'What are the API rate limits for Starter vs Growth tiers?',
      'How does the webhook retry backoff policy work upon failure?',
      'What headers are returned for rate limit quota monitoring?',
      'Does our API support quantum entanglement RPC? (Guardrail test)',
    ],
  },
  {
    id: 'chief_of_it',
    name: 'Chief of IT & Security',
    role: 'Infrastructure & SOC-2 Compliance',
    department: 'Security & IT Ops',
    badge: '',
    badgeType: 'check',
    iconType: 'server',
    color: '#6B7A82', // Slate Taupe
    description: 'Governs SOC 2 Type II, ISO 27001, TLS 1.3/AES-256 encryption, SAML SSO, hardware MFA, and audit log retention.',
    sourceFileFocus: 'https://acmecloud.io/security',
    samplePrompts: [
      'What encryption ciphers and KMS keys protect data at rest?',
      'What compliance certifications (SOC 2, ISO, GDPR) are verified?',
      'How long are immutable enterprise audit logs retained?',
      'Are default admin passwords written on sticky notes? (Guardrail test)',
    ],
  },
  {
    id: 'chief_of_accounts',
    name: 'Chief of Accounts',
    role: 'Financials, Pricing & SLA',
    department: 'Finance & Operations',
    badge: '2',
    badgeType: 'count',
    iconType: 'chart',
    color: '#8A624A', // Espresso Terracotta
    description: 'Directs subscription pricing tiers, 14-day money-back guarantee, SLA penalty credits, invoice schedules, and return warranties.',
    sourceFileFocus: 'AcmeCloud_Pricing_SLA_2026.pdf',
    samplePrompts: [
      'What are the pricing tiers and what is included in the Growth plan?',
      'What is the refund and cancellation policy for annual commitments?',
      'What is the uptime SLA percentage for Enterprise clients?',
      'Can clients pay for enterprise servers in magic beans? (Guardrail test)',
    ],
  },
];

/** Two-letter avatar initials, skipping filler words: "Chief of Staff" -> "CS". */
export function executiveInitials(name: string): string {
  const words = name.split(/\s+/).filter((w) => !['of', '&', 'and', 'the'].includes(w.toLowerCase()));
  return words.slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}
