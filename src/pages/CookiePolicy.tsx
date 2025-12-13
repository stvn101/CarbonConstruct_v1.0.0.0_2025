import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Cookie } from "lucide-react";

export default function CookiePolicy() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <Cookie className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-muted-foreground">
          Last Updated: December 2025
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How We Use Cookies</CardTitle>
          <CardDescription>
            This Cookie Policy explains how CarbonConstruct uses cookies and similar tracking technologies when you visit our website and use our Service.
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

              {/* How We Use Cookies */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">2. How We Use Cookies</h2>
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
                <h2 className="text-2xl font-semibold mb-4">3. Types of Cookies We Use</h2>
                
                <h3 className="text-xl font-semibold mb-3">3.1 Strictly Necessary Cookies</h3>
                <div className="bg-muted/30 p-4 rounded-lg mb-4">
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

                <h3 className="text-xl font-semibold mb-3">3.2 Performance and Analytics Cookies</h3>
                <div className="bg-muted/30 p-4 rounded-lg mb-4">
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

                <h3 className="text-xl font-semibold mb-3">3.3 Functional Cookies</h3>
                <div className="bg-muted/30 p-4 rounded-lg mb-4">
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

                <h3 className="text-xl font-semibold mb-3">3.4 Targeting and Advertising Cookies</h3>
                <div className="bg-muted/30 p-4 rounded-lg mb-4">
                  <p className="text-muted-foreground mb-3">
                    We currently do NOT use targeting or advertising cookies. If this changes in the future, we will update this policy and seek your consent where required.
                  </p>
                </div>
              </section>

              {/* Third-Party Cookies */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Third-Party Cookies</h2>
                <p className="text-muted-foreground mb-4">
                  We use trusted third-party services that may set their own cookies to provide functionality and analyze Service usage. These third parties have their own privacy policies.
                </p>

                <h3 className="text-xl font-semibold mb-3">4.1 Supabase</h3>
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

                <h3 className="text-xl font-semibold mb-3">4.2 Stripe</h3>
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
                <h2 className="text-2xl font-semibold mb-4">5. Session vs. Persistent Cookies</h2>
                
                <h3 className="text-xl font-semibold mb-3">5.1 Session Cookies</h3>
                <p className="text-muted-foreground mb-4">
                  Session cookies are temporary and are deleted when you close your browser. They enable core functionality during your browsing session, such as keeping you logged in as you navigate between pages.
                </p>

                <h3 className="text-xl font-semibold mb-3">5.2 Persistent Cookies</h3>
                <p className="text-muted-foreground mb-4">
                  Persistent cookies remain on your device after you close your browser. They are used to remember your preferences and settings for future visits, making your experience more convenient.
                </p>
              </section>

              {/* Managing Cookies */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Managing and Controlling Cookies</h2>
                
                <h3 className="text-xl font-semibold mb-3">6.1 Browser Settings</h3>
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

                <h3 className="text-xl font-semibold mb-3">6.2 Important Note</h3>
                <p className="text-muted-foreground mb-4">
                  Please note that blocking or deleting essential cookies will prevent you from using certain features of CarbonConstruct, including logging in and accessing your projects. Performance and functional cookies can typically be disabled without affecting core functionality.
                </p>
              </section>

              {/* Do Not Track */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Do Not Track (DNT) Signals</h2>
                <p className="text-muted-foreground mb-4">
                  Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you do not want your online activities tracked. Currently, there is no industry standard for responding to DNT signals, and we do not respond to DNT browser signals at this time.
                </p>
              </section>

              {/* Mobile Devices */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Cookies on Mobile Devices</h2>
                <p className="text-muted-foreground mb-4">
                  When accessing CarbonConstruct through a mobile device or app, we may use similar technologies (such as local storage) to achieve the same purposes as cookies. You can manage these through your device settings or app permissions.
                </p>
              </section>

              {/* Cookie Lifespan */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Cookie Lifespan Table</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border border-border p-3 text-left">Cookie Type</th>
                        <th className="border border-border p-3 text-left">Purpose</th>
                        <th className="border border-border p-3 text-left">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr>
                        <td className="border border-border p-3">Authentication</td>
                        <td className="border border-border p-3">Keep you logged in</td>
                        <td className="border border-border p-3">7 days</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3">Session</td>
                        <td className="border border-border p-3">Maintain active session</td>
                        <td className="border border-border p-3">Session</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3">Preferences</td>
                        <td className="border border-border p-3">Remember settings</td>
                        <td className="border border-border p-3">1 year</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3">Analytics</td>
                        <td className="border border-border p-3">Usage tracking</td>
                        <td className="border border-border p-3">2 years</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3">Security</td>
                        <td className="border border-border p-3">Fraud prevention</td>
                        <td className="border border-border p-3">Session</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Updates */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Changes to This Cookie Policy</h2>
                <p className="text-muted-foreground mb-4">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any significant changes by posting the new policy on this page with an updated "Last Updated" date.
                </p>
                <p className="text-muted-foreground">
                  We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.
                </p>
              </section>

              {/* Your Consent */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Your Consent</h2>
                <p className="text-muted-foreground mb-4">
                  By using CarbonConstruct, you consent to the use of cookies as described in this Cookie Policy. When you first visit our website, you may see a cookie banner allowing you to accept or customize your cookie preferences.
                </p>
                <p className="text-muted-foreground">
                  You can change your cookie preferences at any time through your browser settings as described above.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">12. Questions About Cookies</h2>
                <p className="text-muted-foreground mb-3">
                  If you have questions about our use of cookies or this Cookie Policy:
                </p>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p className="text-sm"><strong>Email:</strong> privacy@carbonconstruct.com.au</p>
                  <p className="text-sm"><strong>Phone:</strong> 0459 148 862</p>
                  <p className="text-sm"><strong>Mail:</strong> CarbonConstruct Privacy Officer, Lawnton, Queensland, Australia</p>
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
                    <a href="https://youronlinechoices.com.au/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Your Online Choices Australia
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
