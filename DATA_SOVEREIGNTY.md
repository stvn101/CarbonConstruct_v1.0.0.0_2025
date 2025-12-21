# Data Sovereignty Documentation

## CarbonConstruct v1.0 - Australian Data Residency Compliance

**Document Version**: 1.0  
**Last Updated**: December 2025  
**Classification**: Internal / Compliance  
**Owner**: CarbonConstruct Security Team

---

## 1. Executive Summary

CarbonConstruct is committed to maintaining Australian data sovereignty for all user data. This document provides transparency about where data is stored, processed, and transmitted to ensure compliance with Australian privacy requirements and user expectations.

---

## 2. Primary Data Storage Location

### 2.1 Database Infrastructure

| Component | Provider | Region | Data Center Location |
|-----------|----------|--------|---------------------|
| **Primary Database** | Supabase (Lovable Cloud) | ap-southeast-2 | Sydney, NSW, Australia |
| **Database Backups** | Supabase | ap-southeast-2 | Sydney, NSW, Australia |
| **File Storage** | Supabase Storage | ap-southeast-2 | Sydney, NSW, Australia |
| **Authentication** | Supabase Auth | ap-southeast-2 | Sydney, NSW, Australia |

### 2.2 Data Types Stored in Sydney

- ✅ User account information (email, profile data)
- ✅ Project data and carbon calculations
- ✅ Materials database and EPD records
- ✅ Reports and calculation history
- ✅ User preferences and settings
- ✅ Subscription and usage records
- ✅ Audit logs and security events
- ✅ Session data and authentication tokens

---

## 3. Third-Party Data Processors

### 3.1 Processor List

| Service | Purpose | Primary Location | Australian Data Handling |
|---------|---------|------------------|-------------------------|
| **Supabase** | Database, Auth, Storage | Sydney (ap-southeast-2) | ✅ Full Australian residency |
| **Stripe** | Payment Processing | USA | ⚠️ SCCs in place, PCI DSS Level 1 |
| **Resend** | Transactional Email | USA | ⚠️ SCCs in place, minimal PII |
| **Google OAuth** | Authentication | Global | ⚠️ SCCs in place, OAuth tokens only |

### 3.2 Data Minimization for Overseas Processors

#### Stripe (Payment Processing)
- **Data Sent**: Name, email, billing address, payment method
- **Purpose**: Subscription management, payment processing
- **Safeguards**: 
  - PCI DSS Level 1 Service Provider
  - Standard Contractual Clauses (SCCs)
  - Data Processing Agreement in place
- **Retention**: Per Stripe's data retention policy

#### Resend (Email Service)
- **Data Sent**: Email address, name (for personalization)
- **Purpose**: Transactional emails (password reset, notifications)
- **Safeguards**:
  - Minimal PII transmitted
  - TLS 1.3 encryption in transit
  - Data Processing Agreement in place
- **Retention**: Email logs retained per Resend policy

#### Google OAuth
- **Data Sent**: OAuth tokens only (no passwords stored)
- **Purpose**: Single sign-on authentication
- **Safeguards**:
  - OAuth 2.0 standard
  - No password data transmitted or stored
  - User-controlled consent

---

## 4. Cross-Border Transfer Mechanisms

### 4.1 Legal Basis for Transfers

For any data transferred outside Australia, we rely on:

1. **Standard Contractual Clauses (SCCs)**: EU-approved clauses adopted for Australian transfers
2. **Binding Corporate Rules**: Where applicable to processor groups
3. **Consent**: User consent obtained during registration
4. **Necessity for Contract**: Transfer necessary for service provision

### 4.2 Privacy Act 1988 Compliance

Under Australian Privacy Principle (APP) 8, we ensure:

- ✅ Reasonable steps to ensure overseas recipients comply with APPs
- ✅ Contractual arrangements requiring APP-equivalent protections
- ✅ Due diligence on third-party security practices
- ✅ Regular review of overseas processor compliance

---

## 5. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER (Australia/Global)                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ HTTPS/TLS 1.3
┌─────────────────────────────────────────────────────────────────────┐
│                    CarbonConstruct Web Application                   │
│                        (CDN - Global Edge)                          │
└─────────────────────────────────────────────────────────────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           │                        │                        │
           ▼                        ▼                        ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│      SUPABASE       │  │       STRIPE        │  │       RESEND        │
│   ap-southeast-2    │  │        (USA)        │  │        (USA)        │
│   Sydney, Australia │  │                     │  │                     │
├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤
│ • Database          │  │ • Payment tokens    │  │ • Email delivery    │
│ • Authentication    │  │ • Subscription data │  │ • Email address     │
│ • File Storage      │  │ • Billing info      │  │ • Name              │
│ • Edge Functions    │  │                     │  │                     │
│ • All user data     │  │ PCI DSS Level 1     │  │ Minimal PII         │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   GOOGLE OAUTH      │
│     (Global)        │
├─────────────────────┤
│ • OAuth tokens      │
│ • No passwords      │
│ • User-controlled   │
└─────────────────────┘
```

---

## 6. Verification Steps

### 6.1 Supabase Region Verification

To verify the Supabase project region:

1. Access the Supabase Dashboard
2. Navigate to Project Settings → General
3. Confirm "Region" shows: `ap-southeast-2 (Sydney)`
4. Database connection string should contain: `db.htruyldcvakkzpykfoxq.supabase.co`

### 6.2 Data Residency Audit Checklist

- [ ] Supabase project confirmed in ap-southeast-2
- [ ] All database tables contain `created_at` timestamps for audit
- [ ] Backup retention configured per Australian requirements
- [ ] Third-party DPAs reviewed annually
- [ ] Cross-border transfer mechanisms documented

---

## 7. User Rights and Data Access

### 7.1 Data Export

Users can request a complete export of their data through:
- Settings → Privacy → Export My Data
- Email request to privacy@carbonconstruct.com.au

### 7.2 Data Deletion

Users can request deletion through:
- Settings → Account → Delete Account
- Email request to privacy@carbonconstruct.com.au

**Retention exceptions**: 
- Financial records retained for 5 years (ATO requirement)
- Security logs retained for 12 months

---

## 8. Incident Response for Data Sovereignty Violations

If a data sovereignty violation is suspected:

1. **Immediate**: Isolate affected systems
2. **Within 24 hours**: Assess scope and impact
3. **Within 72 hours**: Notify affected users if required
4. **Within 30 days**: Report to OAIC if "eligible data breach"

See [BREACH_RESPONSE.md](./BREACH_RESPONSE.md) for full incident response procedures.

---

## 9. Annual Review

This document is reviewed annually or upon:
- Changes to data processors
- Changes to data storage locations
- Regulatory changes affecting data sovereignty
- Security incidents involving data transfers

**Next Review Date**: December 2026

---

## 10. Contact Information

**Data Protection Queries**:  
privacy@carbonconstruct.com.au

**Technical Security**:  
security@carbonconstruct.com.au

**General Support**:  
support@carbonconstruct.com.au

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | CarbonConstruct Security Team | Initial version |

---

*CarbonConstruct - Australian-owned, Australian-hosted, Built for Australian Compliance*
