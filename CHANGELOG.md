# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - December 2025

### CarbonConstruct v1.0 Production Remediation

This release represents comprehensive security, compliance, and accessibility hardening for Australian/EU production deployment.

---

### Security

#### CI/CD Security Hardening
- Added CodeQL SAST analysis as a blocking gate in GitHub Actions
- Removed `continue-on-error: true` from security scans (`npm audit`, `trufflehog`)
- Security scans now block PRs when critical vulnerabilities are detected
- Created `GITHUB_ENVIRONMENTS_SETUP.md` with 90-day secret rotation policy

#### Database Security (RLS Fixes)
- Fixed `material_verification_history` RLS policies - previously publicly readable
- Hardened `rate_limits` SELECT policies to prevent enumeration attacks
- Added explicit admin-only policies for sensitive tables
- All user data tables now enforce `auth.uid() = user_id` checks

#### Documentation
- Created `BREACH_RESPONSE.md` - Notifiable Data Breach (NDB) Scheme compliance
- Created `INCIDENT_RESPONSE.md` - Security incident procedures with severity classification
- Created `DATA_SOVEREIGNTY.md` - Sydney (ap-southeast-2) data residency documentation
- Updated `SECURITY.md` with Essential Eight alignment references
- Created `SECURITY_DOCUMENTATION.md` - Comprehensive security architecture

---

### Compliance

#### Australian Consumer Law (ACL)
- Updated `TermsOfService.tsx` with explicit ACL Section 12
- Added major/minor failure consumer guarantee language
- Removed conflicting "no refunds" language per ACL requirements
- Added refund policy in accordance with Australian Consumer Law

#### GST/ATO Compliance
- Added `decimal.js` for precision arithmetic (prevents floating-point GST errors)
- Created `payment_tax_records` database table for 5-year ATO record retention
- Created `AustralianTaxInvoice.tsx` component - ATO Division 29 compliant
- Created `GST_COMPLIANCE.md` documentation with ATO rounding rules
- Added ABN validation to supplier contact management

#### Privacy Act 1988 / OAIC
- Updated `PrivacyPolicy.tsx` with explicit Sydney data residency statement
- Added 24-month inactive account deletion policy
- Added 5-year financial record retention (ATO requirement)
- Added OAIC contact information and complaint procedures
- Created GDPR section for EU users (Articles 12-22)

#### Cyber Security Act 2024
- Added 72-hour ransomware notification requirement to breach response
- Added ASD contact (1300 292 371) for critical infrastructure incidents

---

### GDPR Compliance (EU Users)

#### Cookie Policy Updates
- Added GDPR Article 6(1)(a) consent as legal basis for non-essential cookies
- Added GDPR Article 7(3) right to withdraw consent section
- Added granular consent options (Essential, Analytics, Marketing)
- Added links to Settings page for managing preferences
- Created GDPR Rights section (Access, Erasure, Object, Withdraw Consent)

#### Privacy Policy Updates
- Added explicit GDPR Section 14 for EU data subjects
- Documented legal basis for processing (Articles 6, 7)
- Added data subject rights (Articles 12-22)
- Added information about cross-border data transfers

#### Cookie Consent Enhancement
- Enhanced `CookieConsent.tsx` with granular preference management
- Added consent version tracking for audit purposes
- Added "Manage Preferences" functionality

---

### Accessibility (WCAG 2.2 Level AA)

#### Updated Success Criteria
- Updated `AccessibilityStatement.tsx` to reference WCAG 2.2 (not just 2.1)
- **2.4.11 Focus Not Obscured (Minimum)** - Ensured sticky footer doesn't hide focus
- **2.5.7 Dragging Movements** - Provided click alternatives
- **2.5.8 Target Size (Minimum)** - All interactive elements now 24x24px minimum
- **3.3.7 Redundant Entry** - Reduced duplicate data entry requirements

#### Component Updates
- All buttons now have `min-h-[44px]` for WCAG touch target compliance
- Focus indicators visible across all interactive elements
- Skip-to-content link provided for keyboard users

---

### Features

#### Tax Invoice System
- Created `AustralianTaxInvoice.tsx` - ATO-compliant tax invoice component
- Added `useTaxInvoices()` hook for fetching user invoice history
- Added `TaxInvoiceList` component for Settings page integration
- Invoices display GST breakdown separately (ATO requirement)
- Print and PDF download functionality

#### Settings Page Enhancements
- Added Tax Invoices section with invoice list and detail view
- Enhanced subscription management UI
- Improved cookie consent reset functionality

---

### Documentation Created

| Document | Purpose |
|----------|---------|
| `BREACH_RESPONSE.md` | NDB Scheme compliance, OAIC notification procedures |
| `INCIDENT_RESPONSE.md` | Security incident classification and response |
| `DATA_SOVEREIGNTY.md` | Sydney data residency verification |
| `GST_COMPLIANCE.md` | ATO rounding rules, BAS reporting |
| `GITHUB_ENVIRONMENTS_SETUP.md` | Production environment configuration |
| `SECURITY_DOCUMENTATION.md` | Comprehensive security architecture |

---

### Files Modified

| File | Changes |
|------|---------|
| `src/pages/AccessibilityStatement.tsx` | Updated to WCAG 2.2 Level AA |
| `src/pages/CookiePolicy.tsx` | Added GDPR Articles 6(1)(a), 7(3) compliance |
| `src/pages/PrivacyPolicy.tsx` | Added Sydney residency, GDPR section |
| `src/pages/TermsOfService.tsx` | Added ACL consumer guarantees |
| `src/pages/Settings.tsx` | Added Tax Invoices section |
| `src/components/AustralianTaxInvoice.tsx` | ATO-compliant invoice component |
| `src/components/Footer.tsx` | Added ABN and data sovereignty statement |
| `.github/workflows/ci.yml` | Added CodeQL, removed continue-on-error |

---

### Dependencies Added

| Package | Version | Purpose |
|---------|---------|---------|
| `decimal.js` | ^10.6.0 | Precision arithmetic for GST calculations |

---

## [Unreleased]

### Security

#### Fixed python-jose Algorithm Confusion Vulnerability (December 12, 2025)

**CVE-2024-33663**: Migrated from vulnerable `python-jose` to secure `PyJWT` library to address critical algorithm confusion vulnerability with OpenSSH ECDSA keys.

**Impact:** 
- **Severity:** Critical
- **Vulnerability:** python-jose through version 3.3.0 has algorithm confusion issues with OpenSSH ECDSA keys and other key formats (similar to CVE-2022-29217)
- **Risk:** Could allow attackers to forge JWT tokens by exploiting key format confusion

**Resolution:**
- Replaced `python-jose[cryptography]==3.3.0` with `pyjwt[crypto]==2.8.0` in requirements.txt
- PyJWT is actively maintained and does not have this vulnerability
- This change is preemptive as Python dependencies are planned for future authentication features
- Current application uses Supabase for authentication (unaffected)

**Files updated:**
- `requirements.txt` - Migrated to PyJWT for future Python backend authentication

**Note:** This fix addresses a dependency listed for future use. The current production application uses Supabase for all authentication and is not vulnerable.

### Changed

#### Stripe Climate Contribution Rate Update (December 11, 2025)

The documented Stripe Climate contribution rate has been corrected from 1% to **0.5%** across all user-facing materials.

**Context:** This change reflects the actual contribution rate that has been in effect. The previous 1% figure displayed in the UI was inaccurate and has been updated to correctly show 0.5% of every subscription goes to carbon removal through Stripe Climate.

**What this means for users:**
- Our commitment to supporting carbon removal technologies through Stripe Climate remains active and ongoing
- 0.5% of every subscription continues to fund verified carbon removal projects
- This update corrects the displayed percentage to match our actual implementation
- No change to the actual contribution amount - only the displayed percentage was corrected

**Files updated:**
- `src/pages/Impact.tsx` - Stripe Climate partnership section
- `src/pages/Index.tsx` - Subscription feature description
- `src/pages/Pricing.tsx` - Carbon removal commitment details

**Related commit:** a88a7fe

---

For questions or concerns about our environmental commitments, please visit our [Stripe Climate dashboard](https://climate.stripe.com/qDm9Cw) for transparent, verified impact metrics.
