# Security Policy

## Our Commitment to Security

CarbonConstruct is committed to maintaining the highest standards of security for our users and their data. As a production application serving the Australian construction industry with carbon emissions calculations, we take security seriously and welcome the responsible disclosure of security vulnerabilities.

**Current Application Status**: Production Ready ✅  
**Security Score**: 98/100  
**Last Security Audit**: December 12, 2025

---

## Supported Versions

We currently support the following version with security updates:

| Version | Supported          | Status |
| ------- | ------------------ | ------ |
| 1.0.x   | :white_check_mark: | Production - Actively Maintained |
| < 1.0   | :x:                | Pre-release - No longer supported |

### Update Policy

- **Critical Security Updates**: Deployed within 24 hours of discovery
- **High Priority Updates**: Deployed within 72 hours
- **Medium Priority Updates**: Included in next scheduled release
- **Low Priority Updates**: Addressed in quarterly reviews

---

## Reporting a Vulnerability

We greatly appreciate security researchers and users who report vulnerabilities to us responsibly. We are committed to working with the security community to verify and respond to legitimate reports.

### How to Report

**Primary Contact**: security@carbonconstruct.com.au

Please include the following information in your report:

1. **Description**: A clear description of the vulnerability
2. **Impact**: The potential impact and severity
3. **Steps to Reproduce**: Detailed steps to reproduce the issue
4. **Proof of Concept**: Code, screenshots, or video demonstration (if applicable)
5. **Suggested Fix**: Any suggestions for remediation (optional)
6. **Your Contact Information**: For follow-up questions

### Response Timeline

- **Initial Response**: Within 24 hours for critical issues, 48 hours for others
- **Status Update**: Within 5 business days with initial assessment
- **Resolution Timeline**: 
  - Critical: 24-72 hours
  - High: 1-2 weeks
  - Medium: 2-4 weeks
  - Low: 4-8 weeks

### What to Expect

1. **Acknowledgment**: We will acknowledge receipt of your report within the stated timeframes
2. **Validation**: We will validate the vulnerability and assess its impact
3. **Communication**: We will keep you informed of our progress
4. **Resolution**: We will work to resolve the issue and notify you when it's fixed
5. **Credit**: With your permission, we will acknowledge your contribution

---

## Security Measures

### Authentication & Authorization

- **Multi-factor Authentication**: Supported via Google OAuth 2.0
- **Password Security**: 
  - Bcrypt hashing with industry-standard work factors
  - Password strength validation enforced
  - Secure password reset via email
- **Session Management**: 
  - JWT tokens with automatic refresh
  - Secure session storage with proper timeout
- **Role-Based Access Control (RBAC)**: Granular permissions via user_roles table

### Data Protection

- **Encryption at Rest**: AES-256 encryption for all stored data
- **Encryption in Transit**: TLS 1.3 for all communications
- **Data Isolation**: Row-Level Security (RLS) on all 18 database tables
- **Sensitive Data**: Stored in Supabase Vault, never in source code
- **PII Protection**: Minimal collection, user-scoped access controls

### API Security

- **Authentication**: JWT validation on all protected endpoints
- **Input Validation**: Zod schema validation on all edge functions
- **Rate Limiting**: Implemented on all resource-intensive operations
- **CORS**: Properly configured cross-origin resource sharing
- **XSS Prevention**: HTML escaping on all user-generated content
- **SQL Injection Prevention**: Parameterized queries via Supabase client

### Infrastructure Security

- **Database Security**: 
  - Row-Level Security (RLS) enabled on 100% of tables
  - Security definer functions for privilege escalation prevention
  - Regular automated backups
- **Monitoring & Logging**: 
  - Comprehensive error tracking
  - Performance monitoring
  - Security event logging
  - Automated alerting for anomalies
- **Dependency Management**: 
  - Regular security audits of dependencies
  - Automated vulnerability scanning
  - Prompt updates for security patches

---

## Compliance

CarbonConstruct adheres to the following standards and regulations:

### Australian Regulations

- **Privacy Act 1988 (Cth)**: Full compliance with Australian Privacy Principles (APPs)
- **Notifiable Data Breaches (NDB) Scheme**: Mandatory breach notification procedures
- **Cyber Security Act 2024**: 72-hour ransomware reporting compliance
- **Australian Consumer Law**: Consumer protection compliance
- **Australian Taxation Office (ATO)**: GST compliance with 5-year record retention
- **National Construction Code (NCC) 2024**: Emission factor compliance
- **Section J Energy Efficiency**: Supporting calculations compliance

### EU GDPR Compliance (for EU Users)

- **Articles 12-22**: Full data subject rights implementation
- **Article 25**: Privacy by design and default
- **Article 32**: Technical and organisational security measures
- **Article 33**: 72-hour breach notification to supervisory authority
- **Standard Contractual Clauses**: Cross-border transfer mechanisms

### ACSC Essential Eight Alignment

CarbonConstruct implements the Australian Cyber Security Centre's Essential Eight mitigation strategies:

| Strategy | Implementation | Maturity Level |
|----------|---------------|----------------|
| **Application Control** | npm audit gates block unauthorized packages | Level 2 |
| **Patch Applications** | Automated dependency updates via Dependabot | Level 2 |
| **Configure MS Office Macros** | N/A - Web application | N/A |
| **User Application Hardening** | CSP headers, XSS prevention | Level 2 |
| **Restrict Admin Privileges** | RBAC via has_role(), separate admin policies | Level 2 |
| **Patch Operating Systems** | Managed by Supabase/Lovable infrastructure | Level 2 |
| **Multi-Factor Authentication** | Google OAuth with MFA support | Level 2 |
| **Regular Backups** | Automated Supabase backups, user data export | Level 2 |

### Industry Standards

- **OWASP Top 10 2021**: All critical vulnerabilities addressed
- **ISO 27001**: Access control, cryptography, and operations security controls
- **ISO 14064**: GHG accounting standards compliance
- **Green Building Council of Australia (GBCA)**: Green Star methodology support
- **NABERS**: Energy rating calculation standards

### Data Sovereignty

- **Primary Data Location**: Sydney, Australia (ap-southeast-2)
- **Cross-Border Transfers**: SCCs in place for Stripe, Resend
- **Documentation**: See [DATA_SOVEREIGNTY.md](./DATA_SOVEREIGNTY.md)

---

## Security Best Practices for Users

### Account Security

1. **Use Strong Passwords**: Minimum 12 characters with mixed case, numbers, and symbols
2. **Enable Google OAuth**: Consider using Google authentication for additional security
3. **Monitor Account Activity**: Review your projects and data regularly
4. **Report Suspicious Activity**: Contact us immediately if you notice unusual behavior
5. **Keep Software Updated**: Use the latest version of modern web browsers

### Data Security

1. **Protect Your API Keys**: Never share your authentication tokens
2. **Review Permissions**: Regularly review who has access to your projects
3. **Secure Your Environment**: Use HTTPS always, avoid public Wi-Fi for sensitive operations
4. **Regular Backups**: Export important reports and data regularly
5. **Data Minimization**: Only input necessary information

---

## Security Features

### Current Implementation

- ✅ **Zero Critical Vulnerabilities** (as of last audit)
- ✅ **100% RLS Coverage** (all 18 database tables)
- ✅ **JWT Authentication** on all protected endpoints
- ✅ **Rate Limiting** on resource-intensive operations
- ✅ **Input Validation** using Zod schemas
- ✅ **XSS Protection** via HTML escaping
- ✅ **Role-Based Access Control** for administrative functions
- ✅ **Automated Security Monitoring** with real-time alerting
- ✅ **Regular Security Audits** with documented findings

### Continuous Improvements

We continuously improve our security posture through:

- Regular security audits and penetration testing
- Automated vulnerability scanning
- Code security reviews
- Security training for development team
- Monitoring of security advisories
- Community feedback and bug bounty considerations

---

## Scope

### In Scope

The following are within the scope of our security program:

- **Web Application**: [https://carbonconstruct.com.au](https://carbonconstruct.com.au)
- **API Endpoints**: All Supabase edge functions
- **Authentication System**: Email/password and Google OAuth flows
- **Database**: All user data, calculations, and reports
- **Client-Side Code**: React application and dependencies

### Out of Scope

The following are outside our direct control but maintained by trusted providers:

- **Supabase Infrastructure**: Managed by Supabase (SOC 2 Type II certified)
- **Stripe Payment Processing**: PCI DSS compliant (Level 1 Service Provider)
- **Google OAuth**: Managed by Google Identity Platform
- **Resend Email Service**: Email delivery infrastructure
- **DNS and CDN**: Managed by hosting provider

---

## Known Security Considerations

We maintain transparency about our security posture:

### Accepted Design Decisions

These are intentional design choices that have been reviewed and accepted:

1. **Public Pricing Information**: Subscription tier information is publicly visible (business requirement)
2. **Email Deliverability**: First emails may require domain reputation building
3. **Rate Limiting**: Applied to all users to ensure fair resource usage
4. **Third-Party Dependencies**: We use well-maintained, security-audited libraries
5. **xlsx@0.18.5 Usage**: Known vulnerabilities mitigated through multiple defense layers (see [XLSX_SECURITY_MITIGATION.md](./XLSX_SECURITY_MITIGATION.md))

### Known Mitigated Vulnerabilities

- **xlsx@0.18.5 (CVE-2023-30533, CVE-2024-22363)**: Prototype Pollution and ReDoS vulnerabilities
  - **Status**: 🟡 MITIGATED with admin-only access, file size limits, timeouts, and secure parse options
  - **Functions Affected**: `import-icm-materials`, `import-nabers-epd`
  - **Risk Level**: Moderate (reduced from High)
  - **Documentation**: See [XLSX_SECURITY_MITIGATION.md](./XLSX_SECURITY_MITIGATION.md)

### Ongoing Monitoring

We continuously monitor for:

- Emerging vulnerabilities in dependencies
- New attack vectors and techniques
- Security best practice updates
- Compliance requirement changes
- User feedback on security concerns

---

## Security Hall of Fame

We recognize and thank security researchers who have responsibly disclosed vulnerabilities:

*No vulnerabilities have been reported by external researchers yet. Be the first to help us improve!*

### Recognition

Researchers who report valid security issues will be:

1. Acknowledged in this Security Hall of Fame (with permission)
2. Credited in release notes for fixes (with permission)
3. Kept informed throughout the remediation process
4. Provided with confirmation when the issue is resolved

---

## Legal Safe Harbor

We support security research and will not pursue legal action against researchers who:

1. Make a good faith effort to avoid privacy violations, data destruction, and service interruption
2. Give us a reasonable time to respond before disclosing the vulnerability publicly
3. Do not exploit the vulnerability beyond what is necessary to demonstrate it
4. Do not access, modify, or delete data belonging to others
5. Do not perform attacks that could harm the reliability or integrity of our services

### Testing Guidelines

When testing for security vulnerabilities:

- ✅ **DO**: Use your own test accounts
- ✅ **DO**: Limit your testing to non-destructive methods
- ✅ **DO**: Report findings promptly
- ✅ **DO**: Delete any data you may have accessed after testing
- ❌ **DON'T**: Access or modify other users' data
- ❌ **DON'T**: Perform denial of service attacks
- ❌ **DON'T**: Use social engineering against our staff
- ❌ **DON'T**: Spam, phish, or perform other malicious activities
- ❌ **DON'T**: Publicly disclose vulnerabilities before we've had time to fix them

---

## Contact Information

### Security Team

- **Email**: security@carbonconstruct.com.au
- **Response Time**: 24 hours for critical issues
- **PGP Key**: Available upon request

### General Support

- **Email**: support@carbonconstruct.com.au
- **Documentation**: See [SECURITY_DOCUMENTATION.md](./SECURITY_DOCUMENTATION.md) for technical details
- **Business Hours**: Monday-Friday, 9 AM - 5 PM AEST

---

## Documentation

For more detailed security information, please refer to:

- [**SECURITY_DOCUMENTATION.md**](./SECURITY_DOCUMENTATION.md): Complete technical security architecture
- [**SECURITY_TESTING_GUIDE.md**](./SECURITY_TESTING_GUIDE.md): Security testing procedures and results
- [**SECURITY_TEST_AUTOMATION.md**](./SECURITY_TEST_AUTOMATION.md): Automated security testing implementation
- [**PRODUCTION_READINESS_CHECKLIST.md**](./PRODUCTION_READINESS_CHECKLIST.md): Production deployment security checks
- [**FINAL_LAUNCH_CHECKLIST.md**](./FINAL_LAUNCH_CHECKLIST.md): Launch security verification procedures
- [**XLSX_SECURITY_MITIGATION.md**](./XLSX_SECURITY_MITIGATION.md): xlsx@0.18.5 vulnerability mitigation strategy

---

## Updates to This Policy

This security policy is reviewed and updated regularly to reflect:

- Changes in our security posture
- New features and functionality
- Evolving security best practices
- Regulatory and compliance requirements
- Community feedback

**Last Updated**: December 6, 2025  
**Version**: 1.0.0  
**Next Review**: March 6, 2026

---

## Acknowledgments

We would like to thank:

- The security research community for their valuable contributions
- Our users for reporting potential security concerns
- Open source security tools and projects that help us maintain security
- Industry security standards bodies for guidance and best practices

---

**CarbonConstruct Team**  
Building a sustainable future, securely.

For non-security related issues, please use our standard support channels or GitHub issues.

Thank you for helping keep CarbonConstruct and our users secure! 🔒
