# CarbonConstruct Data Breach Response Plan

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** INTERNAL - CONFIDENTIAL  
**Compliance:** Privacy Act 1988 (Cth), Notifiable Data Breaches (NDB) Scheme, Cyber Security Act 2024

---

## 1. Purpose & Scope

This document outlines CarbonConstruct's response procedures for handling data breaches in compliance with:

- **Privacy Act 1988 (Cth)** - Australian Privacy Principles (APPs)
- **Notifiable Data Breaches (NDB) Scheme** - Part IIIC of the Privacy Act
- **Cyber Security Act 2024** - 72-hour ransomware payment reporting
- **GDPR** - For EU-based users (Articles 33-34)

### Scope

This plan applies to all personal information collected, stored, or processed by CarbonConstruct, including:

- User account data (names, emails, contact details)
- Payment information (processed via Stripe)
- Project data containing business-sensitive information
- Technical logs that may contain identifiable information

---

## 2. Key Contacts

### Internal Response Team

| Role | Contact | Phone |
|------|---------|-------|
| Privacy Officer | privacy@carbonconstruct.com.au | +61 459 148 862 |
| Technical Lead | [TBD] | [TBD] |
| Legal Counsel | legal@carbonconstruct.com.au | +61 459 148 862 |

### External Authorities

| Authority | Purpose | Contact |
|-----------|---------|---------|
| **OAIC** (Office of the Australian Information Commissioner) | NDB notifications | 1300 363 992 / enquiries@oaic.gov.au |
| **ASD** (Australian Signals Directorate) | Ransomware reporting | 1300 292 371 / asd.assist@defence.gov.au |
| **ACSC** (Australian Cyber Security Centre) | Cyber incident reporting | cyber.gov.au/report |
| **AFP** (Australian Federal Police) | Criminal cyber activity | 131 AFP (131 237) |

### Third-Party Processors

| Provider | Data Type | Contact |
|----------|-----------|---------|
| Supabase | Database, Auth | support@supabase.io |
| Stripe | Payment data | stripe.com/support |
| Resend | Email data | support@resend.com |

---

## 3. Breach Response Phases

### Phase 1: Immediate Containment (0-2 Hours)

**Objective:** Stop ongoing data exposure and preserve evidence.

#### Actions:

1. **Confirm the Breach**
   - [ ] Verify the incident is a genuine data breach
   - [ ] Document initial discovery (who, what, when, where)
   - [ ] Screenshot/log all relevant evidence before making changes

2. **Contain the Breach**
   - [ ] Isolate affected systems (if applicable)
   - [ ] Revoke compromised credentials immediately
   - [ ] Block suspicious IP addresses at firewall/CDN level
   - [ ] Disable compromised user accounts

3. **Preserve Evidence**
   - [ ] Export and secure relevant logs (do NOT modify originals)
   - [ ] Document all containment actions with timestamps
   - [ ] Enable enhanced logging if not already active

4. **Notify Response Team**
   - [ ] Alert Privacy Officer immediately
   - [ ] Escalate to Technical Lead
   - [ ] Brief Legal Counsel if significant data involved

#### Evidence Preservation Checklist:

```
- [ ] Supabase auth logs (last 7 days)
- [ ] Supabase postgres logs (last 7 days)
- [ ] Edge function logs (last 7 days)
- [ ] Stripe webhook logs (if payment-related)
- [ ] Application error logs
- [ ] Network access logs
- [ ] Screenshots of breach indicators
```

---

### Phase 2: Assessment (1-30 Days)

**Objective:** Determine if breach meets NDB notification threshold.

#### NDB Notification Threshold

A breach is notifiable if it is an **"eligible data breach"** meeting BOTH criteria:

1. **Unauthorized access, disclosure, or loss of personal information**
2. **Likely to result in serious harm** to any affected individual

#### Serious Harm Assessment Factors:

| Factor | Questions to Consider |
|--------|----------------------|
| **Type of Data** | Does it include sensitive info (health, financial, TFN)? |
| **Data Sensitivity** | Could disclosure cause financial loss, identity theft, or reputational harm? |
| **Data Protection** | Was the data encrypted? Was encryption key compromised? |
| **Who Has Access** | Is the recipient known? What are their likely intentions? |
| **Remediation** | Can harm be reduced through action (e.g., password reset)? |

#### Assessment Actions:

1. **Identify Affected Data**
   - [ ] What types of personal information were involved?
   - [ ] How many records/individuals affected?
   - [ ] What systems/tables were accessed?

2. **Identify Affected Individuals**
   - [ ] Australian residents
   - [ ] EU residents (triggers GDPR obligations)
   - [ ] Other jurisdictions

3. **Document Assessment**
   - [ ] Complete Breach Assessment Form (Appendix A)
   - [ ] Obtain Legal Counsel review if significant

4. **Make Notification Decision**
   - If eligible data breach: Proceed to Phase 3
   - If not eligible: Document reasoning and retain for 5 years

---

### Phase 3: Notification (Within 30 Days or ASAP)

**Objective:** Notify OAIC and affected individuals as required.

#### 3.1 OAIC Notification

**Deadline:** As soon as practicable, maximum 30 days from awareness

**Submission:** https://forms.business.gov.au/smartforms/servlet/SmartForm.html?formCode=OAIC-NDB

**Required Information:**

1. Organization identity and contact details
2. Description of the breach
3. Types of personal information involved
4. Recommended steps for individuals to take

#### 3.2 Individual Notification

**Who:** All individuals whose information was part of the breach

**How:** Email notification (preferred) or alternative contact method

**Template:** See Appendix B - Individual Notification Template

**Content Requirements:**

- Description of the breach
- Types of information involved
- Steps CarbonConstruct is taking
- Steps the individual should take
- Contact information for questions

---

## 4. Ransomware-Specific Response

### Cyber Security Act 2024 - 72-Hour Reporting

**If CarbonConstruct is subject to a ransomware attack AND makes a payment (or becomes aware of payment by insurer/third party):**

#### Mandatory Reporting Timeline:

| Event | Deadline | Authority |
|-------|----------|-----------|
| Payment made | **72 hours** | ASD (Australian Signals Directorate) |

#### Reporting Method:

1. **Primary:** ASD Cyber Assist Portal - cyber.gov.au/report
2. **Phone:** 1300 292 371 (ASD Assist)
3. **Email:** asd.assist@defence.gov.au

#### Required Information:

- Ransomware group/variant (if known)
- Payment amount and method
- Cryptocurrency wallet addresses
- Timeline of attack
- Systems affected

### Ransomware Response Actions:

1. **DO NOT** pay ransom without legal/executive approval and ASD consultation
2. **DO** isolate affected systems immediately
3. **DO** contact ASD for guidance before payment
4. **DO** preserve all evidence including ransom notes
5. **DO** report to AFP if criminal activity confirmed

---

## 5. GDPR Obligations (EU Users)

If breach affects EU-resident users:

| Requirement | Deadline | Authority |
|-------------|----------|-----------|
| Supervisory Authority notification | 72 hours | Relevant EU DPA |
| Individual notification (if high risk) | Without undue delay | Affected individuals |

**Note:** CarbonConstruct's lead EU supervisory authority should be determined based on main establishment or processing location.

---

## 6. Post-Breach Actions

### Immediate (Within 7 Days)

- [ ] Conduct root cause analysis
- [ ] Implement immediate security patches
- [ ] Update access controls as needed
- [ ] Brief all staff on incident (sanitized version)

### Short-Term (Within 30 Days)

- [ ] Complete incident report
- [ ] Review and update security policies
- [ ] Implement additional monitoring
- [ ] Conduct vulnerability assessment

### Long-Term (Within 90 Days)

- [ ] Review and update this Breach Response Plan
- [ ] Conduct lessons-learned session
- [ ] Update staff training materials
- [ ] Consider penetration testing
- [ ] Review third-party processor agreements

---

## 7. Documentation & Retention

### Breach Register

All breaches (notifiable or not) must be logged in the Breach Register with:

- Date of breach and discovery
- Description of incident
- Data types involved
- Number of individuals affected
- Assessment of seriousness
- Actions taken
- Notification decisions and dates

### Retention Period

All breach documentation must be retained for **5 years** per Privacy Act requirements.

---

## Appendix A: Breach Assessment Form

```
BREACH ASSESSMENT FORM
======================

Incident Reference: BR-[YEAR]-[NUMBER]
Date Discovered: _______________
Discovered By: _______________

INCIDENT DESCRIPTION:
_______________________

DATA INVOLVED:
[ ] Names
[ ] Email addresses
[ ] Phone numbers
[ ] Physical addresses
[ ] Payment information
[ ] Project data
[ ] Login credentials
[ ] Other: _______________

NUMBER OF INDIVIDUALS AFFECTED: _______________

JURISDICTIONS:
[ ] Australia
[ ] EU/EEA
[ ] Other: _______________

SERIOUS HARM ASSESSMENT:
[ ] Likely to cause serious harm
[ ] Unlikely to cause serious harm

REASONING:
_______________________

NOTIFICATION DECISION:
[ ] Notify OAIC and individuals
[ ] No notification required

Assessed By: _______________
Date: _______________
Approved By: _______________
Date: _______________
```

---

## Appendix B: Individual Notification Template

**Subject:** Important: Data Security Incident Notification

Dear [Name],

We are writing to inform you of a data security incident that may have affected your personal information held by CarbonConstruct.

**What Happened**
[Description of the breach - when, how discovered]

**What Information Was Involved**
[List specific types of personal information affected]

**What We Are Doing**
[Steps CarbonConstruct is taking to respond and prevent recurrence]

**What You Can Do**
We recommend you take the following precautionary steps:
- [Specific recommendations based on data type involved]
- Monitor your accounts for unusual activity
- Consider updating your password

**For More Information**
If you have questions, please contact our Privacy Officer:
- Email: privacy@carbonconstruct.com.au
- Phone: +61 459 148 862

You may also contact the Office of the Australian Information Commissioner (OAIC):
- Website: www.oaic.gov.au
- Phone: 1300 363 992

We sincerely apologize for any concern or inconvenience this may cause.

Sincerely,
CarbonConstruct Privacy Officer

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 2025 | Privacy Officer | Initial release |

**Next Review Date:** June 2026
