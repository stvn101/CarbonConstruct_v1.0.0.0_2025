# Australian Compliance Snippet

Reference this file in other prompts using: `@australian-compliance.md`

## Privacy Act 1988 / OAIC Requirements

### Data Collection Principles
- [ ] Only collect data necessary for the stated purpose
- [ ] Inform users what data is collected and why
- [ ] Provide access to collected personal information
- [ ] Allow correction of personal information
- [ ] Secure storage with encryption at rest

### Retention Periods
```typescript
const RETENTION_PERIODS = {
  financial_records: '5 years',      // ATO requirement
  calculation_history: '24 months',  // Business need
  session_logs: '90 days',           // Security audit
  error_logs: '12 months',           // Debugging
  inactive_accounts: '24 months'     // Then anonymize
};
```

### Notifiable Data Breach (NDB) Scheme
- [ ] 30-day notification deadline to OAIC
- [ ] Contact: 1300 363 992
- [ ] Assess breach severity within 30 days
- [ ] Notify affected individuals if serious harm likely

## Australian Consumer Law (ACL)

### Required Refund Language
```typescript
// ✅ CORRECT: ACL-compliant language
const REFUND_POLICY = `
## Consumer Guarantees

Under Australian Consumer Law, you have rights that cannot be excluded:

**Major Failure**: You may choose a refund or replacement.
**Minor Failure**: We will repair within a reasonable time, 
or you may have it done elsewhere and recover costs.

These rights apply in addition to any voluntary warranty.
`;

// ❌ WRONG: "No refunds" or "All sales final"
```

### Prohibited Terms
- "No refunds under any circumstances"
- "All sales are final"
- "No returns accepted"
- Terms that limit statutory guarantees

## GST Compliance

### Calculation Requirements
```typescript
import Decimal from 'decimal.js';

const GST_RATE = new Decimal('0.10'); // 10% GST

interface TaxInvoice {
  netAmount: Decimal;
  gstAmount: Decimal;
  grossAmount: Decimal;
  abnDisplayed: boolean; // Must be true
}

function calculateGST(netAmountCents: number): TaxInvoice {
  const net = new Decimal(netAmountCents);
  const gst = net.times(GST_RATE).round();
  const gross = net.plus(gst);
  
  return {
    netAmount: net,
    gstAmount: gst,
    grossAmount: gross,
    abnDisplayed: true
  };
}
```

### ABN Display Requirements
- [ ] ABN displayed in footer on all pages
- [ ] ABN on all invoices and receipts
- [ ] Format: XX XXX XXX XXX (11 digits with spaces)
- [ ] ABN validation using modulus 89 algorithm

### Tax Invoice Requirements
- [ ] Supplier ABN
- [ ] Date of issue
- [ ] Description of goods/services
- [ ] GST amount shown separately
- [ ] Total amount payable

## Cyber Security Act 2024

### Ransomware Reporting
- [ ] 72-hour reporting deadline
- [ ] Report to: Australian Signals Directorate
- [ ] Contact: cyber.gov.au
- [ ] Document all ransom demands

### Required Breach Contacts
```typescript
const BREACH_CONTACTS = {
  oaic: '1300 363 992',
  acsc: 'asd.gov.au/report',
  afp_cybercrime: '1300 292 371',
  internal: 'contact@carbonconstruct.net'
};
```

## Data Sovereignty

### Storage Requirements
```typescript
const DATA_SOVEREIGNTY = {
  region: 'ap-southeast-2',        // Sydney
  provider: 'Supabase (AWS)',
  encryption: 'AES-256 at rest',
  transit: 'TLS 1.3',
  backups: 'Same region only'
};
```

### Prohibited Actions
- [ ] Never route Australian PII through overseas servers
- [ ] No third-party analytics that store data outside Australia
- [ ] Verify all SDK/API data residency before integration
- [ ] Document any exceptions with legal approval

## Accessibility (DDA Compliance)

### WCAG 2.2 AA Requirements
- [ ] Minimum touch target: 24x24px (44x44px recommended)
- [ ] Color contrast: 4.5:1 for normal text, 3:1 for large
- [ ] Focus indicators visible and not obscured
- [ ] All interactive elements keyboard accessible
- [ ] Alt text on all meaningful images
- [ ] Semantic HTML structure (header, main, nav, footer)

### Required ARIA Labels
```typescript
// ✅ CORRECT: Accessible icon button
<Button 
  variant="ghost" 
  size="icon"
  aria-label="Delete material"
  onClick={handleDelete}
>
  <Trash2 className="h-4 w-4" />
</Button>
```

## EN 15978 Carbon Reporting

### Lifecycle Stages (Must Report Separately)
```typescript
const EN15978_STAGES = {
  product: ['A1', 'A2', 'A3'],           // Raw materials, transport, manufacturing
  construction: ['A4', 'A5'],             // Transport to site, construction
  use: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7'], // Maintenance, repair, replacement
  endOfLife: ['C1', 'C2', 'C3', 'C4'],   // Demolition, transport, processing, disposal
  benefits: ['D']                         // Recycling/reuse credits - REPORT SEPARATELY
};
```

### Module D Requirement
- [ ] Module D (benefits beyond system boundary) MUST be reported separately
- [ ] Never include Module D in total without clear separation
- [ ] Display as "Net Carbon = Total + Module D Credits"

## NCC 2024 Section J

### Embodied Carbon Limits (kgCO2e/m²)
```typescript
const NCC_2024_LIMITS = {
  class_2: { base: 1000, stretch: 800 },  // Apartments
  class_3: { base: 1100, stretch: 900 },  // Hotels
  class_5: { base: 850, stretch: 700 },   // Offices
  class_6: { base: 750, stretch: 600 },   // Retail
  class_9a: { base: 1200, stretch: 1000 } // Healthcare
};
```

## Compliance Verification Checklist

Before any PR merge, verify:

### Privacy & Data
- [ ] No PII logged to console
- [ ] Data encrypted at rest and in transit
- [ ] Retention periods enforced
- [ ] User consent captured and timestamped

### Consumer Protection
- [ ] ACL-compliant refund language
- [ ] ABN displayed correctly
- [ ] GST calculated with Decimal.js
- [ ] Tax invoices meet ATO requirements

### Security
- [ ] RLS policies on all tables
- [ ] JWT verification in edge functions
- [ ] Rate limiting on public endpoints
- [ ] No secrets in client code

### Carbon Reporting
- [ ] EN 15978 stages correctly labeled
- [ ] Module D reported separately
- [ ] Units consistent (kgCO2e internally, tCO2e for display)
- [ ] Data sources attributed
