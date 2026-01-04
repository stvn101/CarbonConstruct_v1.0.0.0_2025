---
applyTo: "**/*"
---

# Compliance Requirements for CarbonConstruct

## EN 15978 Lifecycle Stages

All carbon calculations must follow EN 15978 structure:

### Product Stage (A1-A3)
- **A1**: Raw material extraction
- **A2**: Transport to manufacturer  
- **A3**: Manufacturing

### Construction Stage (A4-A5)
- **A4**: Transport to site
- **A5**: Construction installation process

### Use Stage (B1-B7)
- **B1**: Use (carbonation, etc.)
- **B2**: Maintenance
- **B3**: Repair
- **B4**: Replacement
- **B5**: Refurbishment
- **B6**: Operational energy use
- **B7**: Operational water use

### End of Life Stage (C1-C4)
- **C1**: Deconstruction/demolition
- **C2**: Transport to waste processing
- **C3**: Waste processing
- **C4**: Disposal

### Benefits Beyond System Boundary (D)
- Recycling potential
- Reuse benefits
- Energy recovery
- **IMPORTANT**: Module D must be reported separately per EN 15978

## Australian Regulatory Compliance

### Privacy Act 1988 / OAIC

```typescript
// Data retention requirements
const RETENTION_PERIODS = {
  activeAccount: 24, // months
  financialRecords: 60, // months (5 years - ATO)
  deletedAccount: 30, // days before permanent deletion
};

// Notifiable Data Breach (30-day notification)
const BREACH_NOTIFICATION_DEADLINE = 30; // days
const OAIC_CONTACT = '1300 363 992';
```

### Australian Consumer Law (ACL)

Required language in Terms of Service:
- Major Failure vs Minor Failure distinction
- No "no refunds" blanket statements
- Clear refund policy with reasonable timeframes

```typescript
// ACL-compliant refund language
const ACL_REFUND_TEXT = `
  If there is a major failure with our service, you are entitled to:
  - Cancel the service and receive a refund for unused portion, or
  - Request the service be provided again at no additional cost.
  
  For minor failures, we will fix the issue within a reasonable time.
`;
```

### GST Compliance

```typescript
import Decimal from 'decimal.js';

// ABN must be displayed in footer
const ABN = '12 345 678 901'; // Replace with actual ABN

// GST calculation (always use Decimal.js)
function calculateGST(netAmount: number): { net: string; gst: string; gross: string } {
  const net = new Decimal(netAmount);
  const gst = net.mul(0.10).toDecimalPlaces(2);
  const gross = net.plus(gst);
  
  return {
    net: net.toFixed(2),
    gst: gst.toFixed(2),
    gross: gross.toFixed(2),
  };
}
```

### Cyber Security Act 2024

```typescript
// Ransomware reporting deadline
const RANSOMWARE_REPORT_DEADLINE = 72; // hours

// Required breach response contacts
const BREACH_CONTACTS = {
  acsc: 'cyber.gov.au',
  oaic: '1300 363 992',
};
```

### Data Sovereignty

```typescript
// All data must reside in Sydney region
const AWS_REGION = 'ap-southeast-2';
const SUPABASE_REGION = 'ap-southeast-2';

// Never route Australian PII outside Australia
// Flag any external APIs that may route data overseas
```

## EU GDPR Compliance

### Articles 12-22 Requirements

```typescript
// Data subject rights
const GDPR_RIGHTS = {
  access: true,        // Article 15
  rectification: true, // Article 16
  erasure: true,       // Article 17 (Right to be forgotten)
  portability: true,   // Article 20
  objection: true,     // Article 21
};

// Lawful basis must be recorded
type LawfulBasis = 
  | 'consent'
  | 'contract'
  | 'legal_obligation'
  | 'vital_interests'
  | 'public_task'
  | 'legitimate_interests';
```

### Cookie Consent

```typescript
// Granular consent required
interface CookieConsent {
  necessary: true; // Always required
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: string;
}
```

## NCC 2024 Section J

Building class-specific embodied carbon limits:

```typescript
const NCC_2024_LIMITS = {
  class2: 700,  // kgCO2e/m2
  class3: 850,
  class5: 650,
  class6: 550,
  class7: 500,
  class8: 450,
  class9: 750,
};
```

## Green Star Compliance

```typescript
const GREEN_STAR_CREDITS = {
  '15A': 'Life Cycle Assessment',
  '15B': 'Responsible Building Materials',
  // EPD requirements for credits
};

// Material data quality requirements
const GREEN_STAR_DATA_QUALITY = {
  epdRequired: true,
  maxAge: 5, // years
  thirdPartyVerified: true,
};
```

## Code Compliance Checklist

When writing code, verify:

- [ ] EN 15978 stages correctly referenced
- [ ] Module D reported separately
- [ ] GST uses Decimal.js (never floating point)
- [ ] ABN displayed in footer
- [ ] ACL language in refund policies
- [ ] OAIC contact info in breach notices
- [ ] Data stored in ap-southeast-2 only
- [ ] Cookie consent granular and recorded
- [ ] User data export functionality works
- [ ] Account deletion properly scheduled
- [ ] Financial records retained 5 years
- [ ] Breach notification within 30 days
