# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
