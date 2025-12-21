# CarbonConstruct Security Incident Response Plan

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** INTERNAL - CONFIDENTIAL

---

## 1. Purpose

This document outlines CarbonConstruct's procedures for responding to security incidents that may or may not involve personal data. For incidents involving personal data breaches, this plan works in conjunction with the [Data Breach Response Plan](./BREACH_RESPONSE.md).

---

## 2. Incident Classification Matrix

### Severity Levels

| Priority | Severity | Description | Response Time | Examples |
|----------|----------|-------------|---------------|----------|
| **P1** | Critical | Service down, active data exfiltration, ransomware | **15 minutes** | Active attack, complete outage, confirmed data theft |
| **P2** | High | Service degraded, suspected breach, security control failure | **1 hour** | Unauthorized access attempt succeeded, critical vulnerability exploited |
| **P3** | Medium | Potential vulnerability, suspicious activity, policy violation | **4 hours** | Failed attack attempts, minor security misconfig, suspicious logs |
| **P4** | Low | Security improvement needed, informational alerts | **24 hours** | Audit findings, minor policy issues, security training gaps |

### Classification Decision Tree

```
┌─────────────────────────────────────────────┐
│ Is the service completely unavailable?       │
│ OR Is there active data exfiltration?        │
└─────────────┬───────────────┬───────────────┘
              │ YES           │ NO
              ▼               ▼
         ┌────────┐    ┌─────────────────────────────────┐
         │   P1   │    │ Has unauthorized access been     │
         └────────┘    │ confirmed to sensitive systems?  │
                       └─────────────┬───────────┬───────┘
                                     │ YES       │ NO
                                     ▼           ▼
                                ┌────────┐ ┌────────────────────────┐
                                │   P2   │ │ Is there evidence of   │
                                └────────┘ │ attack or exploitation? │
                                           └──────┬──────────┬──────┘
                                                  │ YES      │ NO
                                                  ▼          ▼
                                             ┌────────┐ ┌────────┐
                                             │   P3   │ │   P4   │
                                             └────────┘ └────────┘
```

---

## 3. Response Team & Escalation

### Core Response Team

| Role | Responsibilities |
|------|-----------------|
| **Incident Commander** | Overall coordination, decision authority, communications |
| **Technical Lead** | Technical investigation, containment, remediation |
| **Privacy Officer** | Data breach assessment, regulatory notifications |
| **Communications Lead** | Internal/external communications, customer notifications |

### Escalation Matrix

| Priority | Initial Response | Escalation Path |
|----------|-----------------|-----------------|
| P1 | Technical Lead + Incident Commander | → CEO/Founder within 30 min |
| P2 | Technical Lead | → Incident Commander within 1 hour |
| P3 | On-call Engineer | → Technical Lead within 4 hours |
| P4 | Logged for review | → Weekly security review |

---

## 4. Response Procedures

### Phase 1: Detection & Triage

**Objective:** Confirm incident, classify severity, mobilize response.

#### Actions:

1. **Confirm the Incident**
   - [ ] Verify alert is genuine (not false positive)
   - [ ] Document initial observations with timestamps
   - [ ] Take screenshots/export logs immediately

2. **Classify Severity**
   - [ ] Use classification matrix above
   - [ ] Assign incident reference: `INC-[YEAR]-[NUMBER]`
   - [ ] Document classification reasoning

3. **Notify Response Team**
   - [ ] Alert appropriate team members per escalation matrix
   - [ ] Establish communication channel (Slack channel, call, etc.)
   - [ ] Assign Incident Commander for P1/P2

#### Triage Checklist:

```
Incident Reference: INC-______
Detected By: _______________
Detection Time: _______________
Classification: P1 / P2 / P3 / P4
Assigned To: _______________

Initial Description:
_______________________

Affected Systems:
[ ] Production Database
[ ] Authentication System
[ ] Payment Processing
[ ] Edge Functions
[ ] User-facing Application
[ ] Admin Dashboard
[ ] Other: _______________
```

---

### Phase 2: Containment

**Objective:** Prevent further damage while preserving evidence.

#### Short-Term Containment (Immediate)

| Priority | Actions |
|----------|---------|
| P1 | Isolate affected systems, block malicious IPs, disable compromised accounts |
| P2 | Implement targeted blocks, enhance monitoring, restrict access |
| P3 | Enable additional logging, apply temporary mitigations |
| P4 | Schedule remediation, document for review |

#### Long-Term Containment

- [ ] Apply security patches to affected systems
- [ ] Update firewall rules and access controls
- [ ] Implement additional monitoring
- [ ] Prepare clean systems for restoration

#### Evidence Preservation

**CRITICAL:** Always preserve evidence BEFORE making changes.

```
Evidence Checklist:
[ ] Supabase database logs exported
[ ] Auth logs exported
[ ] Edge function logs exported
[ ] Application error logs exported
[ ] Network access logs obtained
[ ] Screenshots of affected systems
[ ] Malware samples (if applicable)
[ ] Timeline of events documented
```

---

### Phase 3: Eradication

**Objective:** Remove threat from environment.

#### Actions:

1. **Identify Root Cause**
   - [ ] How did the attacker/issue gain access?
   - [ ] What vulnerabilities were exploited?
   - [ ] What systems/data were affected?

2. **Remove Threat**
   - [ ] Delete malware/malicious code
   - [ ] Close unauthorized access points
   - [ ] Remove backdoors or persistence mechanisms
   - [ ] Revoke all potentially compromised credentials

3. **Harden Environment**
   - [ ] Patch identified vulnerabilities
   - [ ] Update security configurations
   - [ ] Implement additional controls

---

### Phase 4: Recovery

**Objective:** Restore systems to normal operation safely.

#### Recovery Checklist:

1. **Validate Clean State**
   - [ ] Verify all threats removed
   - [ ] Confirm no backdoors remain
   - [ ] Test security controls

2. **Restore Systems**
   - [ ] Restore from clean backups if needed
   - [ ] Verify data integrity
   - [ ] Test functionality

3. **Enhanced Monitoring**
   - [ ] Implement additional logging
   - [ ] Set up alerts for related indicators
   - [ ] Monitor for recurrence

4. **Communicate Recovery**
   - [ ] Notify stakeholders of resolution
   - [ ] Update status page if applicable
   - [ ] Send customer communications if required

---

### Phase 5: Post-Incident

**Objective:** Learn from incident and improve defenses.

#### Post-Incident Review (Within 7 Days)

1. **Conduct Review Meeting**
   - [ ] What happened (timeline)?
   - [ ] What worked well?
   - [ ] What could be improved?
   - [ ] What actions are needed?

2. **Document Lessons Learned**
   - [ ] Update runbooks and procedures
   - [ ] Identify security improvements
   - [ ] Assign remediation actions

3. **Implement Improvements**
   - [ ] Apply security enhancements
   - [ ] Update detection capabilities
   - [ ] Improve response procedures

#### Incident Report Template:

```
INCIDENT REPORT
===============

Reference: INC-______
Date: _______________
Classification: P1 / P2 / P3 / P4

EXECUTIVE SUMMARY:
_______________________

TIMELINE:
- [Time] Event 1
- [Time] Event 2
- [Time] Resolution

ROOT CAUSE:
_______________________

IMPACT:
- Systems Affected: _______________
- Users Affected: _______________
- Data Affected: _______________
- Downtime: _______________

RESPONSE ACTIONS:
1. _______________
2. _______________
3. _______________

LESSONS LEARNED:
_______________________

REMEDIATION ACTIONS:
| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
|        |       |          |        |

Report Prepared By: _______________
Date: _______________
Approved By: _______________
```

---

## 5. Common Incident Runbooks

### 5.1 Unauthorized Access Attempt

1. Block source IP at CDN/firewall level
2. Review authentication logs for affected account
3. Check for successful authentications from suspicious sources
4. Reset credentials if compromise suspected
5. Notify user if their account was targeted
6. Document and close

### 5.2 Suspicious Database Query

1. Identify query source (user, edge function, external)
2. Review query pattern and data accessed
3. Check for data exfiltration indicators
4. If malicious: revoke access, preserve logs
5. Assess if personal data was accessed (→ Breach Response Plan)
6. Implement query restrictions if needed

### 5.3 Credential Leak Detection

1. Confirm credentials are genuine (not test/dummy)
2. Immediately rotate affected credentials
3. Audit usage of leaked credentials
4. Check for unauthorized access using those credentials
5. Notify affected users to reset passwords
6. Review how leak occurred

### 5.4 Denial of Service (DoS)

1. Confirm attack (vs legitimate traffic spike)
2. Enable rate limiting at CDN level
3. Block attacking IP ranges
4. Scale infrastructure if needed
5. Monitor for attack evolution
6. Preserve logs for analysis

### 5.5 Dependency Vulnerability

1. Assess severity (CVSS score, exploitability)
2. Check if vulnerability affects our usage
3. If critical: patch immediately
4. If high: patch within 24 hours
5. If medium/low: schedule for next sprint
6. Document in security register

---

## 6. Communication Templates

### Internal Notification (P1/P2)

```
Subject: [P1/P2] Security Incident - INC-XXXX

Team,

We have identified a [Priority] security incident.

SUMMARY: [Brief description]
STATUS: [Investigating / Contained / Resolved]
IMPACT: [Affected systems/users]

ACTIONS REQUIRED:
- [Specific actions if any]

NEXT UPDATE: [Time]

Incident Commander: [Name]
```

### Customer Notification (If Required)

```
Subject: Important: CarbonConstruct Security Notice

Dear [Customer],

We are writing to inform you of a security incident that may 
have affected your CarbonConstruct account.

WHAT HAPPENED:
[Clear, non-technical description]

WHAT WE ARE DOING:
[Steps taken to address]

WHAT YOU SHOULD DO:
[Specific recommended actions]

If you have questions, please contact us at:
security@carbonconstruct.com.au

We apologize for any inconvenience caused.

CarbonConstruct Security Team
```

---

## 7. Training & Testing

### Regular Activities

| Activity | Frequency | Responsible |
|----------|-----------|-------------|
| Response team training | Quarterly | Technical Lead |
| Tabletop exercises | Bi-annually | Privacy Officer |
| Plan review and update | Annually | Security Team |
| Contact list verification | Quarterly | All team |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 2025 | Security Team | Initial release |

**Next Review Date:** June 2026
