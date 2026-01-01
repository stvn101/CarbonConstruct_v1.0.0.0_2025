import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Cookie, Shield, Scale } from "lucide-react";
import { Link } from "react-router-dom";

export default function CookiePolicy() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <Cookie className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-muted-foreground">
          Last Updated: January 2026
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How We Use Cookies</CardTitle>
        <CardDescription>
          This Cookie Policy explains how CarbonConstruct Tech ("we", "us", or "our"), a company of United Facade Pty Ltd (ABN 57 679 602 498), uses cookies and similar tracking technologies when you visit our website and use our Service.
        </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies?</h2>
                <p className="text-muted-foreground mb-4">
                  Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
                </p>
                <p className="text-muted-foreground">
                  Cookies allow websites to recognize your device and remember information about your visit, such as your preferences and settings, which can make your next visit easier and the site more useful to you.
                </p>
              </section>

              {/* GDPR Legal Basis - NEW SECTION */}
              <section className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-4">
                  <Scale className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-semibold">2. Legal Basis for Cookie Use (GDPR)</h2>
                </div>
                
                <p className="text-muted-foreground mb-4">
                  For users in the European Union and European Economic Area, we process cookie data in accordance with the General Data Protection Regulation (GDPR).
                </p>

                <h3 className="text-xl font-semibold mb-3">2.1 Consent (GDPR Article 6(1)(a))</h3>
                <p className="text-muted-foreground mb-4">
                  For non-essential cookies (analytics, functional, and marketing cookies), we rely on your explicit consent as the legal basis for processing. When you first visit our website, you will be presented with a cookie consent banner that allows you to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Accept all cookies</li>
                  <li>Decline non-essential cookies</li>
                  <li>Customize your preferences for each cookie category</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">2.2 Legitimate Interest (GDPR Article 6(1)(f))</h3>
                <p className="text-muted-foreground mb-4">
                  For strictly necessary cookies that are essential for the operation of our website (such as authentication and security cookies), we rely on our legitimate interest in providing a functional and secure service.
                </p>

                <h3 className="text-xl font-semibold mb-3">2.3 Your Right to Withdraw Consent (GDPR Article 7(3))</h3>
                <div className="bg-background p-4 rounded-lg border">
                  <p className="text-muted-foreground mb-3">
                    <strong>You have the right to withdraw your consent at any time.</strong> Withdrawing consent does not affect the lawfulness of processing based on consent before its withdrawal.
                  </p>
                  <p className="text-muted-foreground mb-3">
                    You can withdraw or modify your cookie consent at any time by:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Visiting our <Link to="/settings" className="text-primary hover:underline">Settings page</Link> and clicking "Reset Cookie Consent"</li>
                    <li>Adjusting your preferences in the Cookie Settings panel</li>
                    <li>Clearing cookies through your browser settings</li>
                  </ul>
                </div>
              </section>

              {/* How We Use Cookies */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">3. How We Use Cookies</h2>
                <p className="text-muted-foreground mb-4">
                  CarbonConstruct uses cookies to enhance your experience, improve our Service, and understand how users interact with our platform. We use cookies for the following purposes:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Essential functionality:</strong> To enable core features and keep you logged in</li>
                  <li><strong>Security:</strong> To protect your account and detect fraudulent activity</li>
                  <li><strong>Performance:</strong> To analyze how you use our Service and improve it</li>
                  <li><strong>Preferences:</strong> To remember your settings and choices</li>
                  <li><strong>Analytics:</strong> To understand usage patterns and optimize user experience</li>
                </ul>
              </section>

              {/* Types of Cookies */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Types of Cookies We Use</h2>
                
                <h3 className="text-xl font-semibold mb-3">4.1 Strictly Necessary Cookies</h3>
                <div className="bg-muted/30 p-4 rounded-lg mb-4">
                  <p className="text-sm text-primary font-medium mb-2">Legal Basis: Legitimate Interest</p>
                  <p className="text-muted-foreground mb-3">
                    These cookies are essential for the Service to function properly. They enable core functionality such as security, authentication, and accessibility. Without these cookies, certain features cannot be provided.
                  </p>
                  <p className="text-sm text-muted-foreground font-semibold mb-2">Examples:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li><code className="text-xs bg-muted px-1 py-0.5 rounded">sb-access-token</code> - Authentication and session management</li>
                    <li><code className="text-xs bg-muted px-1 py-0.5 rounded">sb-refresh-token</code> - Session renewal</li>
                    <li>CSRF protection tokens</li>
                    <li>Security and authentication cookies</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-3 italic">
                    Duration: Session or up to 7 days
                  </p>
                </div>

                <h3 className="text-xl font-semibold mb-3">4.2 Performance and Analytics Cookies</h3>
                <div className="bg-muted/30 p-4 rounded-lg mb-4">
                  <p className="text-sm text-primary font-medium mb-2">Legal Basis: Consent (GDPR Article 6(1)(a))</p>
                  <p className="text-muted-foreground mb-3">
                    These cookies collect information about how you use our Service, which pages you visit, and any errors you encounter. This helps us improve the Service and fix issues.
                  </p>
                  <p className="text-sm text-muted-foreground font-semibold mb-2">Examples:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Page view tracking</li>
                    <li>Feature usage analytics</li>
                    <li>Error logging and debugging</li>
                    <li>Performance monitoring</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-3 italic">
                    Duration: Up to 2 years
                  </p>
                </div>

                <h3 className="text-xl font-semibold mb-3">4.3 Functional Cookies</h3>
                <div className="bg-muted/30 p-4 rounded-lg mb-4">
                  <p className="text-sm text-primary font-medium mb-2">Legal Basis: Consent (GDPR Article 6(1)(a))</p>
                  <p className="text-muted-foreground mb-3">
                    These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.
                  </p>
                  <p className="text-sm text-muted-foreground font-semibold mb-2">Examples:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>User interface preferences (light/dark mode)</li>
                    <li>Language selection</li>
                    <li>Recently viewed projects</li>
                    <li>Display settings and layout preferences</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-3 italic">
                    Duration: Up to 1 year
                  </p>
                </div>

                <h3 className="text-xl font-semibold mb-3">4.4 Targeting and Advertising Cookies</h3>
                <div className="bg-muted/30 p-4 rounded-lg mb-4">
                  <p className="text-muted-foreground mb-3">
                    We currently do NOT use targeting or advertising cookies. If this changes in the future, we will update this policy and seek your consent where required.
                  </p>
                </div>
              </section>

              {/* Third-Party Cookies */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Third-Party Cookies</h2>
                <p className="text-muted-foreground mb-4">
                  We use trusted third-party services that may set their own cookies to provide functionality and analyze Service usage. These third parties have their own privacy policies.
                </p>

                <h3 className="text-xl font-semibold mb-3">5.1 Supabase</h3>
                <div className="bg-muted/30 p-4 rounded-lg mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Purpose:</strong> Authentication, database, and cloud infrastructure
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Cookies:</strong> Authentication tokens, session management
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Privacy Policy:</strong> <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">supabase.com/privacy</a>
                  </p>
                </div>

                <h3 className="text-xl font-semibold mb-3">5.2 Stripe</h3>
                <div className="bg-muted/30 p-4 rounded-lg mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Purpose:</strong> Payment processing and fraud detection
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Cookies:</strong> Payment session management, fraud prevention
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Privacy Policy:</strong> <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">stripe.com/privacy</a>
                  </p>
                </div>
              </section>

              {/* Session vs Persistent */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Session vs. Persistent Cookies</h2>
                
                <h3 className="text-xl font-semibold mb-3">6.1 Session Cookies</h3>
                <p className="text-muted-foreground mb-4">
                  Session cookies are temporary and are deleted when you close your browser. They enable core functionality during your browsing session, such as keeping you logged in as you navigate between pages.
                </p>

                <h3 className="text-xl font-semibold mb-3">6.2 Persistent Cookies</h3>
                <p className="text-muted-foreground mb-4">
                  Persistent cookies remain on your device after you close your browser. They are used to remember your preferences and settings for future visits, making your experience more convenient.
                </p>
              </section>

              {/* Managing Cookies */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Managing and Controlling Cookies</h2>
                
                <h3 className="text-xl font-semibold mb-3">7.1 Our Cookie Preferences Tool</h3>
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 mb-4">
                  <p className="text-muted-foreground mb-3">
                    You can manage your cookie preferences directly on our platform:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Visit <Link to="/settings" className="text-primary hover:underline font-medium">Settings → Cookie Settings</Link></li>
                    <li>Toggle individual cookie categories on or off</li>
                    <li>Click "Reset Cookie Consent" to see the consent banner again</li>
                  </ul>
                </div>
                
                <h3 className="text-xl font-semibold mb-3">7.2 Browser Settings</h3>
                <p className="text-muted-foreground mb-3">
                  Most web browsers allow you to control cookies through their settings. You can:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>View and delete cookies stored on your device</li>
                  <li>Block all cookies from being set</li>
                  <li>Block third-party cookies only</li>
                  <li>Clear all cookies when you close your browser</li>
                  <li>Receive a notification before cookies are stored</li>
                </ul>

                <div className="bg-muted/30 p-4 rounded-lg mb-4">
                  <p className="text-sm font-semibold mb-3">Browser-Specific Instructions:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
                    <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                    <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                    <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies</li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold mb-3">7.3 Important Note</h3>
                <p className="text-muted-foreground mb-4">
                  Please note that blocking or deleting essential cookies will prevent you from using certain features of CarbonConstruct, including logging in and accessing your projects. Performance and functional cookies can typically be disabled without affecting core functionality.
                </p>
              </section>

              {/* Do Not Track */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Do Not Track (DNT) Signals</h2>
                <p className="text-muted-foreground mb-4">
                  Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you do not want your online activities tracked. Currently, there is no industry standard for responding to DNT signals, and we do not respond to DNT browser signals at this time.
                </p>
              </section>

              {/* Mobile Devices */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Cookies on Mobile Devices</h2>
                <p className="text-muted-foreground mb-4">
                  When accessing CarbonConstruct through a mobile device or app, we may use similar technologies (such as local storage) to achieve the same purposes as cookies. You can manage these through your device settings or app permissions.
                </p>
              </section>

              {/* Cookie Lifespan */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Cookie Lifespan Table</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border border-border p-3 text-left">Cookie Type</th>
                        <th className="border border-border p-3 text-left">Purpose</th>
                        <th className="border border-border p-3 text-left">Legal Basis</th>
                        <th className="border border-border p-3 text-left">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr>
                        <td className="border border-border p-3">Authentication</td>
                        <td className="border border-border p-3">Keep you logged in</td>
                        <td className="border border-border p-3">Legitimate Interest</td>
                        <td className="border border-border p-3">7 days</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3">Session</td>
                        <td className="border border-border p-3">Maintain active session</td>
                        <td className="border border-border p-3">Legitimate Interest</td>
                        <td className="border border-border p-3">Session</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3">Preferences</td>
                        <td className="border border-border p-3">Remember settings</td>
                        <td className="border border-border p-3">Consent</td>
                        <td className="border border-border p-3">1 year</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3">Analytics</td>
                        <td className="border border-border p-3">Usage tracking</td>
                        <td className="border border-border p-3">Consent</td>
                        <td className="border border-border p-3">2 years</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3">Security</td>
                        <td className="border border-border p-3">Fraud prevention</td>
                        <td className="border border-border p-3">Legitimate Interest</td>
                        <td className="border border-border p-3">Session</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* GDPR Rights Section */}
              <section className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-semibold">11. Your GDPR Rights Regarding Cookies</h2>
                </div>
                
                <p className="text-muted-foreground mb-4">
                  Under GDPR, you have the following rights regarding cookies and the personal data they may collect:
                </p>

                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="font-semibold text-foreground">Right to Access:</span>
                    <span>Request information about what data cookies have collected about you</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-foreground">Right to Erasure:</span>
                    <span>Request deletion of cookie data (use browser settings or our reset tool)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-foreground">Right to Object:</span>
                    <span>Object to processing of cookie data for analytics or marketing</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-foreground">Right to Withdraw Consent:</span>
                    <span>Withdraw consent at any time through our Settings page</span>
                  </li>
                </ul>

                <p className="text-muted-foreground mt-4">
                  To exercise these rights, visit <Link to="/settings" className="text-primary hover:underline">Settings</Link> or contact our Privacy Officer at privacy@carbonconstruct.com.au.
                </p>
              </section>

              {/* Updates */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">12. Changes to This Cookie Policy</h2>
                <p className="text-muted-foreground mb-4">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any significant changes by posting the new policy on this page with an updated "Last Updated" date.
                </p>
                <p className="text-muted-foreground">
                  We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.
                </p>
              </section>

              {/* Your Consent */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">13. Your Consent</h2>
                <p className="text-muted-foreground mb-4">
                  By using CarbonConstruct, you consent to the use of cookies as described in this Cookie Policy. When you first visit our website, you may see a cookie banner allowing you to accept or customize your cookie preferences.
                </p>
                <p className="text-muted-foreground">
                  You can change your cookie preferences at any time through your browser settings or our <Link to="/settings" className="text-primary hover:underline">Settings page</Link>.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">14. Questions About Cookies</h2>
                <p className="text-muted-foreground mb-3">
                  If you have questions about our use of cookies or this Cookie Policy:
                </p>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p className="text-sm"><strong>Company:</strong> CarbonConstruct Tech (a company of United Facade Pty Ltd)</p>
                  <p className="text-sm"><strong>ABN:</strong> 57 679 602 498</p>
                  <p className="text-sm"><strong>Email:</strong> privacy@carbonconstruct.com.au</p>
                  <p className="text-sm"><strong>Phone:</strong> 0459 148 862</p>
                  <p className="text-sm"><strong>Mail:</strong> CarbonConstruct Tech Privacy Officer, Lawnton, Queensland, Australia</p>
                </div>
              </section>

              {/* More Information */}
              <section className="bg-muted/30 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">More Information About Cookies</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  To learn more about cookies and how they work, you can visit:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="https://www.oaic.gov.au/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Office of the Australian Information Commissioner (OAIC)
                    </a>
                  </li>
                  <li>
                    <a href="https://www.allaboutcookies.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      All About Cookies
                    </a>
                  </li>
                  <li>
                    <a href="https://gdpr.eu/cookies/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      GDPR Cookie Requirements
                    </a>
                  </li>
                  <li>
                    <a href="https://ico.org.uk/for-organisations/guide-to-pecr/cookies-and-similar-technologies/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      ICO Cookie Guidance (UK)
                    </a>
                  </li>
                </ul>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
