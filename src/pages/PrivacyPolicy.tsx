import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <Shield className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground">
          Last Updated: December 2025
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Privacy Matters</CardTitle>
          <CardDescription>
            CarbonConstruct is committed to protecting your privacy and ensuring the security of your personal information in accordance with the Australian Privacy Principles (APPs) under the Privacy Act 1988 (Cth).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p className="text-muted-foreground mb-4">
                  This Privacy Policy explains how CarbonConstruct ("we", "us", or "our") collects, uses, discloses, and protects your personal information when you use our carbon emissions calculation platform and related services (the "Service").
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

              {/* How We Use Your Information */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
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
                <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Security</h2>
                
                <h3 className="text-xl font-semibold mb-3">4.1 Data Storage</h3>
                <p className="text-muted-foreground mb-4">
                  Your data is stored on secure cloud infrastructure provided by Supabase. We implement industry-standard security measures including encryption at rest and in transit, regular security audits, and access controls.
                </p>

                <h3 className="text-xl font-semibold mb-3">4.2 Data Location</h3>
                <p className="text-muted-foreground mb-4">
                  Your data may be stored and processed in Australia and other jurisdictions where our service providers operate. We ensure that any international data transfers comply with Australian privacy laws.
                </p>

                <h3 className="text-xl font-semibold mb-3">4.3 Data Retention</h3>
                <p className="text-muted-foreground mb-4">
                  We retain your personal information for as long as necessary to provide our Service and comply with legal obligations. Project data and calculation records are retained for 7 years in accordance with Australian business record-keeping requirements.
                </p>
              </section>

              {/* Information Sharing */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Information Sharing and Disclosure</h2>
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

              {/* Your Rights */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Your Privacy Rights</h2>
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
                <p className="text-muted-foreground">
                  To exercise these rights, contact us at privacy@carbonconstruct.com.au
                </p>
              </section>

              {/* Cookies */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking Technologies</h2>
                <p className="text-muted-foreground mb-4">
                  We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie preferences through your browser settings. For more information, see our Cookie Policy.
                </p>
              </section>

              {/* Third-Party Services */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Third-Party Services</h2>
                <p className="text-muted-foreground mb-3">
                  Our Service integrates with third-party services:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li><strong>Stripe:</strong> Payment processing (subject to Stripe Privacy Policy)</li>
                  <li><strong>Supabase:</strong> Cloud infrastructure and database services</li>
                  <li><strong>Analytics Services:</strong> Usage tracking and performance monitoring</li>
                </ul>
                <p className="text-muted-foreground">
                  These services have their own privacy policies, and we encourage you to review them.
                </p>
              </section>

              {/* Children's Privacy */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Children&apos;s Privacy</h2>
                <p className="text-muted-foreground mb-4">
                  Our Service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                </p>
              </section>

              {/* International Users */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">10. International Users</h2>
                <p className="text-muted-foreground mb-4">
                  If you access our Service from outside Australia, please be aware that your information may be transferred to and processed in Australia. By using our Service, you consent to such transfers.
                </p>
              </section>

              {/* Changes to Policy */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Changes to This Privacy Policy</h2>
                <p className="text-muted-foreground mb-4">
                  We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a prominent notice on our Service. Your continued use of the Service after changes become effective constitutes acceptance of the revised policy.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
                <p className="text-muted-foreground mb-3">
                  If you have questions or concerns about this Privacy Policy or our privacy practices:
                </p>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p className="text-sm"><strong>Email:</strong> privacy@carbonconstruct.com.au</p>
                  <p className="text-sm"><strong>Phone:</strong> 0459 148 862</p>
                  <p className="text-sm"><strong>Mail:</strong> CarbonConstruct Privacy Officer, Lawnton, Queensland, Australia</p>
                </div>
                <p className="text-muted-foreground mt-4 text-sm">
                  You may also lodge a complaint with the Office of the Australian Information Commissioner (OAIC) at www.oaic.gov.au or by calling 1300 363 992.
                </p>
              </section>

              {/* Compliance */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">13. Compliance and Standards</h2>
                <p className="text-muted-foreground mb-3">
                  CarbonConstruct is committed to compliance with:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Privacy Act 1988 (Cth) and Australian Privacy Principles</li>
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
