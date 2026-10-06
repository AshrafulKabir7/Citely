import { IngestedDocument, SourceType } from './types';
import { chunkDocument } from './chunker';

interface SampleDocDefinition {
  id: string;
  title: string;
  sourceType: SourceType;
  sourceUrlOrPath: string;
  content: string;
}

export const SAMPLE_DOCUMENTS: SampleDocDefinition[] = [
  {
    id: 'doc-saas-pricing',
    title: 'AcmeCloud_Pricing_SLA_2026.pdf',
    sourceType: 'pdf',
    sourceUrlOrPath: '/documents/AcmeCloud_Pricing_SLA_2026.pdf',
    content: `AcmeCloud Official Pricing, SLA and Billing Terms

Subscription Tiers:
- Starter Tier: $29 per month. Includes 10 GB NVMe storage, 500k monthly API requests, 99.9% uptime SLA, and 24-hour turnaround email support.
- Growth Tier: $149 per month. Includes 100 GB NVMe storage, 5M monthly API calls, automated hourly snapshots, and 99.95% uptime SLA with 2-hour priority support response.
- Enterprise Tier: Starting at $799 per month. Custom NVMe clusters, 99.999% high availability SLA, dedicated technical account manager, HIPAA/SOC-2 BAA, and 24/7 emergency hotline.

Refund and Cancellation Policy:
- All new subscriptions are eligible for a 14-day 100% money-back guarantee, no questions asked.
- Annual subscriptions receive a 20% upfront discount. If cancelled within 30 days of renewal, an 80% prorated refund is credited to the original payment method.
- Add-on bandwidth and storage overages ($0.08 per GB) are non-refundable once consumed.
- Downgrades take effect at the end of the current billing cycle.`,
  },
  {
    id: 'doc-employee-handbook',
    title: 'Nexus_Employee_Handbook_v4.pdf',
    sourceType: 'pdf',
    sourceUrlOrPath: '/documents/Nexus_Employee_Handbook_v4.pdf',
    content: `Nexus Technologies Employee Policy & Benefits Manual

Paid Time Off (PTO) & Leave Policy:
- Standard full-time team members accrue 22 days of paid time off per calendar year, calculated at 1.83 days per month of active employment.
- Unused PTO rolls over up to a maximum cap of 10 days into the next calendar year. Any additional unused days are forfeited on March 31st.
- Sick Leave: Employees receive 10 paid sick days per year, separate from vacation PTO. Medical certificates are required only for consecutive absences exceeding 3 business days.
- Parental Leave: 16 weeks of fully paid parental leave for primary caregivers, and 8 weeks for secondary caregivers, eligible after 6 months of tenure.

Remote Work & Hardware Allowance:
- Nexus is a remote-first organization. Team members may work from anywhere within authorized payroll tax jurisdictions.
- Home Office Setup Stipend: A one-time tax-free $1,200 reimbursement for ergonomic desk, chair, monitors, and peripherals upon joining.
- Annual Tech Refresh: An annual $600 learning and equipment budget for keyboards, headphones, or books, submitted through the expense portal.
- Working hours are flexible, but core collaboration hours are 10:00 AM to 3:00 PM in the employee's respective regional timezone.`,
  },
  {
    id: 'doc-ecommerce-returns',
    title: 'NovaTech_Warranty_Returns_FAQ.md',
    sourceType: 'document',
    sourceUrlOrPath: '/docs/NovaTech_Warranty_Returns_FAQ.md',
    content: `NovaTech Electronics Return, Replacement and Warranty Guide

30-Day Hassle-Free Returns:
- Items purchased directly from NovaTech.com may be returned within 30 days of delivery for a full refund or exchange.
- Condition Requirement: Products must be in original cosmetic condition with all packaging, manuals, cables, and accessories included.
- Return Shipping: We provide a prepaid FedEx return label for all domestic US returns. International customers are responsible for local return carriage.
- Restocking Fees: NovaTech charges 0% restocking fees on all standard hardware. A 15% open-box fee applies only to custom-configured audio workstations.

Hardware Warranty:
- Standard 2-Year Limited Manufacturer Warranty covers defects in materials, internal circuitry, and power supply failures.
- Accidental damage (spills, drops, or shattered displays) is not covered under the standard warranty, but is covered if NovaCare+ protection was purchased at checkout.
- RMA (Return Merchandise Authorization) process: Submit serial number at support.novatech.com. Replacement units are dispatched via 2-day air within 48 hours of RMA approval.`,
  },
  {
    id: 'doc-website-crawled',
    title: 'https://acmecloud.io/api-docs',
    sourceType: 'website',
    sourceUrlOrPath: 'https://acmecloud.io/api-docs',
    content: `AcmeCloud API Reference and Integration Protocols

Authentication:
- API requests require a Bearer token in the Authorization header: Authorization: Bearer <YOUR_API_KEY>.
- API keys can be generated with Read-Only, Write, or Admin privileges in the Acme Console.

Rate Limits & Error Handling:
- Starter tier allows 60 requests per minute per IP address.
- Growth tier allows 600 requests per minute with burst capacity up to 1,000 requests.
- Enterprise tier allows 5,000 requests per minute.
- Exceeding rate limits returns HTTP 429 Too Many Requests with an 'X-RateLimit-Reset' header indicating seconds until unlock.
- Webhook retries use exponential backoff: retry 1 after 30s, retry 2 after 5m, retry 3 after 30m before failing over to dead-letter queue.`,
  },
  {
    id: 'doc-security',
    title: 'https://acmecloud.io/security',
    sourceType: 'website',
    sourceUrlOrPath: 'https://acmecloud.io/security',
    content: `AcmeCloud Security and Compliance Overview

Encryption:
- Data in transit is protected with TLS 1.3 using AES-256-GCM cipher suites. TLS 1.0 and 1.1 are disabled.
- Data at rest is encrypted with AES-256. Enterprise tenants can use customer-managed keys in AWS KMS.

Certifications and Audits:
- AcmeCloud holds a SOC 2 Type II report, renewed every year, and ISO 27001 certification.
- Enterprise customers can request the latest SOC 2 report under NDA through the Trust Center.

Access Control:
- Single sign-on with SAML 2.0 and OIDC is available on the Growth and Enterprise tiers.
- All AcmeCloud staff with production access must use FIDO2 hardware security keys.

Incident Response:
- Customers affected by a security incident involving their data are notified within 72 hours.`,
  },
];

export function getInitialIngestedDocuments(): IngestedDocument[] {
  return SAMPLE_DOCUMENTS.map(doc => {
    const chunks = chunkDocument(doc.id, doc.title, doc.sourceType, doc.content, doc.sourceUrlOrPath);
    return {
      id: doc.id,
      title: doc.title,
      sourceType: doc.sourceType,
      sourceUrlOrPath: doc.sourceUrlOrPath,
      rawTextLength: doc.content.length,
      chunkCount: chunks.length,
      createdAt: 'Just now',
      status: 'ready',
      chunks,
    };
  });
}
