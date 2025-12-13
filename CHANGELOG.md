# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
