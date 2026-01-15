import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Database, Globe, Clock } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <Shield className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground">
          Last Updated: January 2026
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Privacy Matters</CardTitle>
          <CardDescription>
            CarbonConstruct is committed to protecting your privacy and ensuring the security of your personal information in accordance with the Australian Privacy Principles (APPs) under the Privacy Act 1988 (Cth) and the EU General Data Protection Regulation (GDPR).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-8">
              {/* Data Sovereignty Notice */}
              <section className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Database className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Data Sovereignty Statement</h3>
                    <p className="text-sm text-muted-foreground">
                      All primary data is stored in <strong>Sydney, Australia (ap-southeast-2 region)</strong> to comply with Australian data sovereignty requirements. This ensures your data remains within Australian jurisdiction and is subject to Australian privacy laws.
                    </p>
                  </div>
                </div>
              </section>

              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p className="text-muted-foreground mb-4">
                  This Privacy Policy explains how CarbonConstruct Tech, a company of United Facade Pty Ltd (ABN 57 679 602 498) ("we", "us", or "our") collects, uses, discloses, and protects your personal information when you use our carbon emissions calculation platform and related services (the "Service").
                </p>
                <p className="text-muted-foreground">
                  By using CarbonConstruct, you consent to the collection and use of your information as described in this Privacy Policy. If you do not agree with this policy, please do not use our Service.
                </p>
              </section>

              {/* Information We Collect */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                
                <h3 className="text-xl font-semibold mb-3">2.1 Personal Information</h3>
                <p className="text-muted-foreground mb-3">
                  We collect the following types of personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Account Information: Name, email address, company name, and contact details</li>
                  <li>Payment Information: Billing details and payment card information (processed securely through Stripe)</li>
                  <li>Professional Information: Job title, industry sector, and organization details</li>
                  <li>Authentication Data: Login credentials, session tokens, and authentication records</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">2.2 Project Data</h3>
                <p className="text-muted-foreground mb-3">
                  When you use our Service, we collect and store:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Construction project details and specifications</li>
                  <li>Carbon emission calculations and reports</li>
                  <li>Material quantities and types</li>
                  <li>Energy consumption data</li>
                  <li>Transport and logistics information</li>
                  <li>Life Cycle Assessment (LCA) data</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">2.3 Technical Information</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Device information and browser type</li>
                  <li>IP address and location data</li>
                  <li>Usage patterns and feature interactions</li>
                  <li>Log data and error reports</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </section>

              {/* Legal Basis for Processing (GDPR) */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Legal Basis for Processing</h2>
                <p className="text-muted-foreground mb-3">
                  Under the GDPR and Australian Privacy Act, we process your personal information based on the following legal grounds:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li><strong>Contract Performance:</strong> To provide our Service and fulfill our contractual obligations</li>
                  <li><strong>Legitimate Interests:</strong> To improve our Service, ensure security, and communicate with you</li>
                  <li><strong>Legal Obligations:</strong> To comply with Australian and applicable international laws</li>
                  <li><strong>Consent:</strong> For marketing communications and optional analytics (you can withdraw at any time)</li>
                </ul>
              </section>

              {/* How We Use Your Information */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">4. How We Use Your Information</h2>
                <p className="text-muted-foreground mb-3">
                  We use your personal information for the following purposes:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li><strong>Service Provision:</strong> To provide, operate, and maintain our carbon calculation platform</li>
                  <li><strong>Account Management:</strong> To create and manage your user account and subscription</li>
                  <li><strong>Communication:</strong> To send you service updates, technical notices, and support messages</li>
                  <li><strong>Payment Processing:</strong> To process payments and prevent fraudulent transactions</li>
                  <li><strong>Compliance:</strong> To ensure compliance with NCC Section J, Green Star, and NABERS requirements</li>
                  <li><strong>Analytics:</strong> To analyze usage patterns and improve our Service</li>
                  <li><strong>Security:</strong> To protect against unauthorized access and ensure data integrity</li>
                  <li><strong>Legal Obligations:</strong> To comply with applicable laws and regulations</li>
                </ul>
              </section>

              {/* Data Storage and Security */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Data Storage and Security</h2>
                
                <h3 className="text-xl font-semibold mb-3">5.1 Data Storage Location</h3>
                <div className="bg-muted/50 p-4 rounded-lg mb-4 flex items-start gap-3">
                  <Database className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <p className="text-muted-foreground">
                    Your primary data is stored in the <strong>Sydney, Australia (ap-southeast-2)</strong> region on secure cloud infrastructure. This ensures compliance with Australian data sovereignty requirements and keeps your data subject to Australian privacy laws.
                  </p>
                </div>

                <h3 className="text-xl font-semibold mb-3">5.2 Security Measures</h3>
                <p className="text-muted-foreground mb-4">
                  We implement industry-standard security measures including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Encryption at rest and in transit (TLS 1.3)</li>
                  <li>Row-Level Security (RLS) database policies</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Access controls and authentication requirements</li>
                  <li>Automated threat monitoring and logging</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">5.3 Third-Party Processors</h3>
                <p className="text-muted-foreground mb-4">
                  Some data may be processed by third-party services in other jurisdictions with appropriate safeguards:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li><strong>Stripe (USA):</strong> Payment processing - PCI-DSS compliant with Standard Contractual Clauses</li>
                  <li><strong>Resend (USA):</strong> Transactional emails - with data processing agreements</li>
                </ul>
              </section>

              {/* Data Retention */}
              <section className="border-2 border-primary/20 rounded-lg p-6 bg-primary/5">
                <div className="flex items-start gap-3 mb-4">
                  <Clock className="h-6 w-6 text-primary shrink-0" />
                  <h2 className="text-2xl font-semibold">6. Data Retention Schedule</h2>
                </div>
                
                <p className="text-muted-foreground mb-4">
                  We retain your personal information for the following periods:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-semibold">Data Type</th>
                        <th className="text-left py-2 font-semibold">Retention Period</th>
                        <th className="text-left py-2 font-semibold">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b">
                        <td className="py-2">Active account data</td>
                        <td className="py-2">Duration of account + 30 days</td>
                        <td className="py-2">Service provision</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Inactive accounts</td>
                        <td className="py-2"><strong>24 months</strong> then deletion</td>
                        <td className="py-2">Account recovery</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Project data & calculations</td>
                        <td className="py-2">7 years</td>
                        <td className="py-2">Business records</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Financial records (invoices, payments)</td>
                        <td className="py-2"><strong>5 years minimum</strong></td>
                        <td className="py-2">ATO requirements</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Security & audit logs</td>
                        <td className="py-2">2 years</td>
                        <td className="py-2">Security compliance</td>
                      </tr>
                      <tr>
                        <td className="py-2">Marketing consent records</td>
                        <td className="py-2">Duration of consent + 2 years</td>
                        <td className="py-2">GDPR compliance</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Information Sharing */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Information Sharing and Disclosure</h2>
                <p className="text-muted-foreground mb-3">
                  We do not sell your personal information. We may share your information with:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li><strong>Service Providers:</strong> Third-party vendors who assist in operating our Service (e.g., Stripe for payments, cloud hosting providers)</li>
                  <li><strong>Professional Advisors:</strong> Lawyers, auditors, and consultants who require access for professional services</li>
                  <li><strong>Regulatory Authorities:</strong> When required by law or to comply with legal processes</li>
                  <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets</li>
                </ul>
              </section>

              {/* Your Rights - Australian */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Your Privacy Rights (Australia)</h2>
                <p className="text-muted-foreground mb-3">
                  Under the Australian Privacy Act 1988 and APPs, you have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li><strong>Access:</strong> Request access to your personal information</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal retention requirements)</li>
                  <li><strong>Data Portability:</strong> Request a copy of your data in a machine-readable format</li>
                  <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                  <li><strong>Complain:</strong> Lodge a complaint with us or the Office of the Australian Information Commissioner (OAIC)</li>
                </ul>
              </section>

              {/* GDPR Rights */}
              <section className="border-2 border-primary/20 rounded-lg p-6 bg-primary/5">
                <div className="flex items-start gap-3 mb-4">
                  <Globe className="h-6 w-6 text-primary shrink-0" />
                  <h2 className="text-2xl font-semibold">9. Your Rights Under GDPR (EU/EEA Users)</h2>
                </div>
                
                <p className="text-muted-foreground mb-4">
                  If you are located in the European Union or European Economic Area, you have additional rights under the General Data Protection Regulation (GDPR), Articles 12-22:
                </p>

                <h3 className="text-xl font-semibold mb-3">9.1 Right of Access (Article 15)</h3>
                <p className="text-muted-foreground mb-4">
                  You have the right to obtain confirmation as to whether we are processing your personal data and, if so, access to that data and information about how it is processed.
                </p>

                <h3 className="text-xl font-semibold mb-3">9.2 Right to Rectification (Article 16)</h3>
                <p className="text-muted-foreground mb-4">
                  You have the right to obtain rectification of inaccurate personal data and to have incomplete data completed.
                </p>

                <h3 className="text-xl font-semibold mb-3">9.3 Right to Erasure / "Right to be Forgotten" (Article 17)</h3>
                <p className="text-muted-foreground mb-4">
                  You have the right to request erasure of your personal data when the data is no longer necessary, you withdraw consent, or the data has been unlawfully processed. Note: This right is subject to our legal retention obligations.
                </p>

                <h3 className="text-xl font-semibold mb-3">9.4 Right to Restriction of Processing (Article 18)</h3>
                <p className="text-muted-foreground mb-4">
                  You have the right to request restriction of processing in certain circumstances, such as when you contest the accuracy of your data.
                </p>

                <h3 className="text-xl font-semibold mb-3">9.5 Right to Data Portability (Article 20)</h3>
                <p className="text-muted-foreground mb-4">
                  You have the right to receive your personal data in a structured, commonly used, machine-readable format (JSON) and to transmit that data to another controller. Use Settings → Export Data to exercise this right.
                </p>

                <h3 className="text-xl font-semibold mb-3">9.6 Right to Object (Article 21)</h3>
                <p className="text-muted-foreground mb-4">
                  You have the right to object to processing based on legitimate interests, including profiling. You also have the right to object to processing for direct marketing purposes at any time.
                </p>

                <h3 className="text-xl font-semibold mb-3">9.7 Rights Related to Automated Decision-Making (Article 22)</h3>
                <p className="text-muted-foreground mb-4">
                  CarbonConstruct does not make decisions based solely on automated processing that produce legal effects or similarly significantly affect you. Carbon calculations are tools to assist your decision-making, not automated decisions about you.
                </p>

                <h3 className="text-xl font-semibold mb-3">9.8 Right to Lodge a Complaint (Article 77)</h3>
                <p className="text-muted-foreground mb-4">
                  You have the right to lodge a complaint with a supervisory authority in the EU Member State of your habitual residence, place of work, or place of the alleged infringement.
                </p>

                <div className="bg-background/50 p-4 rounded-lg mt-4">
                  <p className="text-sm text-foreground">
                    <strong>Exercising Your GDPR Rights:</strong> To exercise any of these rights, contact us at privacy@carbonconstruct.com.au. We will respond within 30 days. There is no fee for exercising your rights unless requests are manifestly unfounded or excessive.
                  </p>
                </div>
              </section>

              {/* International Data Transfers */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">10. International Data Transfers</h2>
                <p className="text-muted-foreground mb-4">
                  Your primary data is stored in Sydney, Australia. When we transfer data to third-party processors outside Australia/EU, we ensure appropriate safeguards are in place:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                  <li>Data Processing Agreements with all processors</li>
                  <li>Adequacy decisions where applicable</li>
                  <li>Supplementary measures for high-risk transfers</li>
                </ul>
              </section>

              {/* Cookies */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Cookies and Tracking Technologies</h2>
                <p className="text-muted-foreground mb-4">
                  We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can manage cookie preferences through our Cookie Settings or your browser. For more information, see our <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a>.
                </p>
              </section>

              {/* Third-Party Services */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">12. Third-Party Services</h2>
                <p className="text-muted-foreground mb-3">
                  Our Service integrates with third-party services:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li><strong>Stripe:</strong> Payment processing (subject to Stripe Privacy Policy)</li>
                  <li><strong>Supabase:</strong> Cloud infrastructure and database services (Sydney region)</li>
                  <li><strong>Analytics Services:</strong> Usage tracking and performance monitoring (with consent)</li>
                </ul>
                <p className="text-muted-foreground">
                  These services have their own privacy policies, and we encourage you to review them.
                </p>
              </section>

              {/* Children's Privacy */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">13. Children&apos;s Privacy</h2>
                <p className="text-muted-foreground mb-4">
                  Our Service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                </p>
              </section>

              {/* Cyber Security Act 2024 */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">14. Data Breach Notification</h2>
                <p className="text-muted-foreground mb-4">
                  In accordance with the Notifiable Data Breaches (NDB) scheme under the Privacy Act 1988 and the Cyber Security Act 2024, we will notify you and the Office of the Australian Information Commissioner (OAIC) if we experience a data breach that is likely to result in serious harm to you.
                </p>
                <p className="text-muted-foreground mb-4">
                  For ransomware incidents, we comply with the 72-hour mandatory reporting requirements to the Australian Signals Directorate (ASD).
                </p>
              </section>

              {/* Changes to Policy */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">15. Changes to This Privacy Policy</h2>
                <p className="text-muted-foreground mb-4">
                  We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a prominent notice on our Service. Your continued use of the Service after changes become effective constitutes acceptance of the revised policy.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">16. Contact Us</h2>
                <p className="text-muted-foreground mb-3">
                  If you have questions or concerns about this Privacy Policy or our privacy practices:
                </p>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p className="text-sm"><strong>Legal Entity:</strong> CarbonConstruct Tech (a company of United Facade Pty Ltd)</p>
                  <p className="text-sm"><strong>ABN:</strong> 57 679 602 498</p>
                  <p className="text-sm"><strong>Privacy Officer Email:</strong> privacy@carbonconstruct.com.au</p>
                  <p className="text-sm"><strong>Phone:</strong> 0459 148 862</p>
                  <p className="text-sm"><strong>Mail:</strong> CarbonConstruct Tech Privacy Officer, Lawnton, Queensland, Australia</p>
                </div>
                <p className="text-muted-foreground mt-4 text-sm">
                  You may also lodge a complaint with the Office of the Australian Information Commissioner (OAIC) at <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.oaic.gov.au</a> or by calling 1300 363 992.
                </p>
              </section>

              {/* Compliance */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">17. Compliance and Standards</h2>
                <p className="text-muted-foreground mb-3">
                  CarbonConstruct Tech is committed to compliance with:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Privacy Act 1988 (Cth) and Australian Privacy Principles</li>
                  <li>Notifiable Data Breaches (NDB) Scheme</li>
                  <li>Cyber Security Act 2024</li>
                  <li>EU General Data Protection Regulation (GDPR)</li>
                  <li>Spam Act 2003 (Cth)</li>
                  <li>ISO 27001 information security standards</li>
                  <li>Industry best practices for data protection and privacy</li>
                </ul>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
