import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <FileText className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground">
          Last Updated: November 2024
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agreement to Terms</CardTitle>
          <CardDescription>
            Please read these Terms of Service carefully before using CarbonConstruct. By accessing or using our Service, you agree to be bound by these terms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p className="text-muted-foreground mb-4">
                  These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "you", or "your") and CarbonConstruct ("we", "us", or "our") regarding your access to and use of the CarbonConstruct platform, website, and related services (collectively, the "Service").
                </p>
                <p className="text-muted-foreground">
                  These Terms are governed by the laws of Australia, and any disputes will be subject to the exclusive jurisdiction of the courts of New South Wales, Australia.
                </p>
              </section>

              {/* Acceptance */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Acceptance of Terms</h2>
                <p className="text-muted-foreground mb-4">
                  By creating an account, accessing, or using CarbonConstruct, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you must not use the Service.
                </p>
                <p className="text-muted-foreground">
                  We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the revised Terms.
                </p>
              </section>

              {/* Eligibility */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Eligibility</h2>
                <p className="text-muted-foreground mb-4">
                  You must be at least 18 years old and have the legal capacity to enter into binding contracts to use our Service. By using CarbonConstruct, you represent and warrant that:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>You are legally capable of entering into binding contracts</li>
                  <li>All information you provide is accurate and complete</li>
                  <li>You will comply with all applicable laws and regulations</li>
                  <li>You are authorized to use the Service on behalf of your organization (if applicable)</li>
                </ul>
              </section>

              {/* Account Registration */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Account Registration and Security</h2>
                
                <h3 className="text-xl font-semibold mb-3">4.1 Account Creation</h3>
                <p className="text-muted-foreground mb-4">
                  To access certain features, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
                </p>

                <h3 className="text-xl font-semibold mb-3">4.2 Account Security</h3>
                <p className="text-muted-foreground mb-3">
                  You are responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized access or security breach</li>
                  <li>Ensuring that you log out at the end of each session</li>
                </ul>
              </section>

              {/* Service Description */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Service Description</h2>
                <p className="text-muted-foreground mb-3">
                  CarbonConstruct provides:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Carbon emissions calculation tools for construction projects</li>
                  <li>Life Cycle Assessment (LCA) capabilities</li>
                  <li>Compliance reporting for NCC Section J, Green Star, and NABERS</li>
                  <li>Material database with embodied carbon data</li>
                  <li>Project management and reporting features</li>
                  <li>AI-assisted analysis and recommendations</li>
                </ul>
                <p className="text-muted-foreground">
                  We reserve the right to modify, suspend, or discontinue any part of the Service at any time with or without notice.
                </p>
              </section>

              {/* Subscription Plans */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Subscription Plans and Payments</h2>
                
                <h3 className="text-xl font-semibold mb-3">6.1 Subscription Tiers</h3>
                <p className="text-muted-foreground mb-4">
                  CarbonConstruct offers Free and Pro subscription tiers. Features, limitations, and pricing are detailed on our Pricing page and may be updated from time to time.
                </p>

                <h3 className="text-xl font-semibold mb-3">6.2 Payment Terms</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Subscription fees are charged monthly or annually in advance</li>
                  <li>All payments are processed securely through Stripe</li>
                  <li>Prices are in Australian Dollars (AUD) unless otherwise stated</li>
                  <li>You authorize us to charge your payment method for recurring subscription fees</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">6.3 Trial Period</h3>
                <p className="text-muted-foreground mb-4">
                  Pro subscriptions may include a 14-day free trial. You will be charged at the end of the trial unless you cancel before the trial expires. One trial per user or organization.
                </p>

                <h3 className="text-xl font-semibold mb-3">6.4 Cancellation and Refunds</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>You may cancel your subscription at any time through your account settings</li>
                  <li>Cancellations take effect at the end of the current billing period</li>
                  <li>No refunds are provided for partial subscription periods</li>
                  <li>Upon cancellation, you will retain access until the end of the paid period</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">6.5 Price Changes</h3>
                <p className="text-muted-foreground mb-4">
                  We reserve the right to change subscription fees with 30 days notice. Continued use after price changes constitutes acceptance of new fees.
                </p>
              </section>

              {/* User Responsibilities */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">7. User Responsibilities and Prohibited Conduct</h2>
                
                <h3 className="text-xl font-semibold mb-3">7.1 Acceptable Use</h3>
                <p className="text-muted-foreground mb-3">
                  You agree to use CarbonConstruct only for lawful purposes and in accordance with these Terms. You agree NOT to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Violate any applicable laws, regulations, or third-party rights</li>
                  <li>Use the Service for any illegal or unauthorized purpose</li>
                  <li>Attempt to gain unauthorized access to any part of the Service</li>
                  <li>Interfere with or disrupt the Service or servers</li>
                  <li>Upload malicious code, viruses, or harmful content</li>
                  <li>Scrape, data mine, or extract data without authorization</li>
                  <li>Reverse engineer or decompile any part of the Service</li>
                  <li>Share your account with others or allow multiple users per account (unless authorized)</li>
                  <li>Misrepresent your identity or affiliation</li>
                  <li>Use the Service to compete with us or develop competing products</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">7.2 Data Accuracy</h3>
                <p className="text-muted-foreground mb-4">
                  You are responsible for the accuracy and quality of data you input into the Service. We do not guarantee the accuracy of calculations based on incorrect or incomplete data.
                </p>
              </section>

              {/* Intellectual Property */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property Rights</h2>
                
                <h3 className="text-xl font-semibold mb-3">8.1 Our Rights</h3>
                <p className="text-muted-foreground mb-4">
                  CarbonConstruct and all related content, features, functionality, source code, databases, and software are owned by us and are protected by Australian and international copyright, trademark, and other intellectual property laws.
                </p>

                <h3 className="text-xl font-semibold mb-3">8.2 Your Rights</h3>
                <p className="text-muted-foreground mb-4">
                  You retain all rights to your project data and content you input into the Service. By using CarbonConstruct, you grant us a limited license to use, store, and process your data solely to provide the Service.
                </p>

                <h3 className="text-xl font-semibold mb-3">8.3 Feedback</h3>
                <p className="text-muted-foreground mb-4">
                  Any feedback, suggestions, or ideas you provide about CarbonConstruct become our property, and we may use them without compensation or attribution.
                </p>
              </section>

              {/* Disclaimers */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Disclaimers and Limitations</h2>
                
                <h3 className="text-xl font-semibold mb-3">9.1 Professional Advice</h3>
                <p className="text-muted-foreground mb-4">
                  CarbonConstruct provides calculation tools and information but does NOT provide professional engineering, environmental, or legal advice. You should consult qualified professionals for project-specific guidance.
                </p>

                <h3 className="text-xl font-semibold mb-3">9.2 Accuracy and Reliability</h3>
                <p className="text-muted-foreground mb-4">
                  While we strive for accuracy using industry-standard emission factors and methodologies, we make no warranties regarding the accuracy, reliability, or completeness of calculations, data, or reports. Users are responsible for verifying all outputs.
                </p>

                <h3 className="text-xl font-semibold mb-3">9.3 Compliance</h3>
                <p className="text-muted-foreground mb-4">
                  CarbonConstruct assists with compliance documentation, but we do not guarantee that use of our Service will ensure compliance with NCC, Green Star, NABERS, or other regulatory requirements. Final compliance is the responsibility of qualified professionals and certifying authorities.
                </p>

                <h3 className="text-xl font-semibold mb-3">9.4 Service Availability</h3>
                <p className="text-muted-foreground mb-4">
                  The Service is provided "AS IS" and "AS AVAILABLE". We do not guarantee uninterrupted or error-free operation. We may suspend the Service for maintenance or updates without notice.
                </p>
              </section>

              {/* Limitation of Liability */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
                <p className="text-muted-foreground mb-4">
                  To the maximum extent permitted by Australian law, CarbonConstruct and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, use, or goodwill, arising out of or related to your use of the Service.
                </p>
                <p className="text-muted-foreground mb-4">
                  Our total liability for any claim related to the Service is limited to the amount you paid us in the 12 months preceding the claim, or AUD $100, whichever is greater.
                </p>
                <p className="text-muted-foreground mb-4 text-sm italic">
                  Note: Some jurisdictions do not allow the exclusion or limitation of certain warranties or liabilities. In such cases, our liability will be limited to the maximum extent permitted by law.
                </p>
              </section>

              {/* Indemnification */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Indemnification</h2>
                <p className="text-muted-foreground mb-4">
                  You agree to indemnify, defend, and hold harmless CarbonConstruct and its affiliates from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Your use of the Service</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any rights of third parties</li>
                  <li>Your data, content, or project information</li>
                  <li>Your breach of applicable laws or regulations</li>
                </ul>
              </section>

              {/* Termination */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">12. Termination</h2>
                
                <h3 className="text-xl font-semibold mb-3">12.1 By You</h3>
                <p className="text-muted-foreground mb-4">
                  You may terminate your account at any time by canceling your subscription through account settings or contacting support.
                </p>

                <h3 className="text-xl font-semibold mb-3">12.2 By Us</h3>
                <p className="text-muted-foreground mb-4">
                  We may suspend or terminate your access immediately without notice if you breach these Terms, engage in fraudulent activity, or for any other reason at our sole discretion.
                </p>

                <h3 className="text-xl font-semibold mb-3">12.3 Effect of Termination</h3>
                <p className="text-muted-foreground mb-4">
                  Upon termination, your right to access the Service ceases immediately. We may delete your account and data after a reasonable period, subject to legal retention requirements. You may request a data export before termination.
                </p>
              </section>

              {/* Dispute Resolution */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">13. Dispute Resolution</h2>
                
                <h3 className="text-xl font-semibold mb-3">13.1 Governing Law</h3>
                <p className="text-muted-foreground mb-4">
                  These Terms are governed by the laws of New South Wales, Australia, without regard to conflict of law principles.
                </p>

                <h3 className="text-xl font-semibold mb-3">13.2 Informal Resolution</h3>
                <p className="text-muted-foreground mb-4">
                  Before initiating formal proceedings, you agree to contact us to seek informal resolution of any dispute.
                </p>

                <h3 className="text-xl font-semibold mb-3">13.3 Jurisdiction</h3>
                <p className="text-muted-foreground mb-4">
                  Any legal action arising from these Terms must be brought exclusively in the courts of New South Wales, Australia, and you consent to the personal jurisdiction of such courts.
                </p>
              </section>

              {/* General Provisions */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">14. General Provisions</h2>
                
                <h3 className="text-xl font-semibold mb-3">14.1 Entire Agreement</h3>
                <p className="text-muted-foreground mb-4">
                  These Terms, together with our Privacy Policy and Cookie Policy, constitute the entire agreement between you and CarbonConstruct regarding the Service.
                </p>

                <h3 className="text-xl font-semibold mb-3">14.2 Severability</h3>
                <p className="text-muted-foreground mb-4">
                  If any provision of these Terms is found invalid or unenforceable, the remaining provisions will remain in full force and effect.
                </p>

                <h3 className="text-xl font-semibold mb-3">14.3 Waiver</h3>
                <p className="text-muted-foreground mb-4">
                  Our failure to enforce any right or provision of these Terms will not constitute a waiver of such right or provision.
                </p>

                <h3 className="text-xl font-semibold mb-3">14.4 Assignment</h3>
                <p className="text-muted-foreground mb-4">
                  You may not assign or transfer these Terms or your rights hereunder without our prior written consent. We may assign these Terms at any time without notice.
                </p>

                <h3 className="text-xl font-semibold mb-3">14.5 Force Majeure</h3>
                <p className="text-muted-foreground mb-4">
                  We shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including natural disasters, acts of government, strikes, or technical failures.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">15. Contact Information</h2>
                <p className="text-muted-foreground mb-3">
                  For questions about these Terms of Service:
                </p>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p className="text-sm"><strong>Email:</strong> legal@carbonconstruct.com.au</p>
                  <p className="text-sm"><strong>Phone:</strong> 1300 CARBON (227 266)</p>
                  <p className="text-sm"><strong>Mail:</strong> CarbonConstruct Legal Department, Sydney, NSW, Australia</p>
                </div>
              </section>

              {/* Acknowledgment */}
              <section className="bg-muted/30 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Acknowledgment</h3>
                <p className="text-muted-foreground text-sm">
                  BY USING CARBONCONSTRUCT, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE, UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM. IF YOU DO NOT AGREE TO THESE TERMS, YOU MUST NOT USE THE SERVICE.
                </p>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
