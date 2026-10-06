/**
 * Website Scraper and Crawler Utility for Citely.
 * Extracts clean text content from webpages or simulates crawling for live testing.
 */

export interface CrawledPage {
  url: string;
  title: string;
  headings: string[];
  cleanContent: string;
  wordCount: number;
}

/**
 * Cleans HTML markup into structured textual content suitable for RAG chunking.
 */
export function extractTextFromHtml(html: string, url: string): CrawledPage {
  // Remove scripts, styles, svg, and comment tags
  let cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // Extract page title
  const titleMatch = cleaned.match(/<title[^>]*>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname;

  // Extract headings
  const headings: string[] = [];
  const headingMatches = cleaned.matchAll(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi);
  for (const match of headingMatches) {
    const headingText = match[1].replace(/<[^>]+>/g, '').trim();
    if (headingText && !headings.includes(headingText)) {
      headings.push(headingText);
    }
  }

  // Convert break tags and paragraphs to newlines
  cleaned = cleaned
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();

  const words = cleaned.split(/\s+/).filter(Boolean);

  return {
    url,
    title,
    headings,
    cleanContent: cleaned,
    wordCount: words.length,
  };
}

/**
 * Pre-curated website crawl profiles for fast, impressive buyer demonstrations.
 */
export const SAMPLE_CRAWL_PROFILES: Record<string, { title: string; content: string }> = {
  'https://acmecloud.io/pricing': {
    title: 'AcmeCloud — Enterprise Pricing & Plans',
    content: `AcmeCloud Pricing & Subscription Plans (Updated 2026)
Overview:
AcmeCloud offers three core tiers for developer and enterprise workloads: Starter, Growth, and Enterprise.

1. Starter Tier ($29/month):
- Includes 10 GB high-speed NVMe storage.
- 500,000 API requests per month with 99.9% uptime SLA.
- Standard email support with 24-hour turnaround time.
- Community Discord access.

2. Growth Tier ($149/month):
- Includes 100 GB NVMe storage with automated hourly backups.
- 5,000,000 API requests per month with 99.95% uptime SLA.
- Priority email and live chat support with 2-hour response time during business hours.
- Multi-region replication in US East and EU Frankfurt.
- Team workspace with up to 10 member seats.

3. Enterprise Tier (Custom, starting at $799/month):
- Unlimited scale storage with dedicated NVMe clusters.
- 99.999% high-availability SLA with financial penalty credits.
- 24/7 dedicated Slack/Teams bridge with assigned technical account manager.
- HIPAA, SOC-2 Type II, and GDPR compliance certifications with signed BAA.
- Custom single-tenant VPC peering and on-premise hybrid gateway options.

Billing & Refund Policy:
- All plans come with a risk-free 14-day money-back guarantee.
- Annual commitments receive a 20% discount upfront.
- Prorated refunds are issued within the first 30 days upon support ticket review.
- Invoices are generated on the 1st of every calendar month.`,
  },
  'https://acmecloud.io/security': {
    title: 'AcmeCloud — Security Architecture & Compliance',
    content: `AcmeCloud Trust & Security Framework
Data Encryption:
- Data in transit is protected using TLS 1.3 with AES-256-GCM cipher suites.
- Data at rest is encrypted across all databases and snapshots using customer-managed AWS KMS keys or Azure Key Vault.
- Zero-knowledge encryption is available for enterprise health and financial records.

Compliance Certifications:
- SOC 2 Type II certified annually by an independent third-party auditor.
- ISO/IEC 27001:2022 certified covering all global data centers.
- Fully compliant with European GDPR (General Data Protection Regulation) and California CCPA.
- Penetration tests are conducted quarterly by certified ethical security firms.

Access Controls & Multi-Factor Authentication:
- Enterprise SAML 2.0 and OIDC SSO integration (Okta, Microsoft Entra ID, Google Workspace).
- Enforced hardware key (FIDO2 / WebAuthn) support and biometric MFA.
- Granular Role-Based Access Control (RBAC) with audit log immutability stored for 7 years.`,
  },
  'https://acmecloud.io/api-docs': {
    title: 'AcmeCloud — REST API & Rate Limits',
    content: `AcmeCloud Developer Documentation & Rate Limits
Base URL: https://api.acmecloud.io/v2
Authentication: Bearer Token passed via the Authorization header.

Rate Limiting Rules:
- Starter Tier: 60 requests per minute per IP.
- Growth Tier: 600 requests per minute with burst allowance up to 1,000 requests for 30-second spikes.
- Enterprise Tier: 5,000 requests per minute with custom throughput allocation.

Response Headers for Rate Limiting:
- X-RateLimit-Limit: Total allowed requests in the current window.
- X-RateLimit-Remaining: Remaining requests available.
- X-RateLimit-Reset: Epoch timestamp when the quota resets.

Error Codes:
- 400 Bad Request: Malformed JSON payload or missing required parameters.
- 401 Unauthorized: Invalid or expired API token.
- 429 Too Many Requests: Exceeded rate limit. Recommended exponential backoff with jitter.
- 500 Internal Server Error: Handled by automated cluster failover.`,
  }
};
