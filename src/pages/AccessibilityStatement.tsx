import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AccessibilityStatement = () => {
  const lastAssessmentDate = "December 2025";
  
  return (
    <>
      <SEOHead 
        title="Accessibility Statement | CarbonConstruct"
        description="CarbonConstruct's commitment to digital accessibility and inclusive design for all users in the Australian construction industry. WCAG 2.2 Level AA conformance."
      />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link to="/">
            <Button variant="ghost" className="mb-6 min-h-[44px] min-w-[44px]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          <h1 className="text-4xl font-bold text-foreground mb-4">Accessibility Statement</h1>
          
          <div className="flex flex-wrap gap-2 mb-8">
            <Badge variant="default" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              WCAG 2.2 Level AA
            </Badge>
            <Badge variant="outline">Last assessed: {lastAssessmentDate}</Badge>
          </div>
          
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-8">
            
            {/* Conformance Status Card */}
            <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle className="h-5 w-5" />
                  Conformance Status
                </CardTitle>
              </CardHeader>
              <CardContent className="text-foreground">
                <p className="mb-4">
                  CarbonConstruct aims to conform to the <strong>Web Content Accessibility Guidelines (WCAG) 2.2 Level AA</strong> standards. 
                  This accessibility statement was last reviewed and updated in {lastAssessmentDate}.
                </p>
                <p>
                  We conduct regular accessibility audits using both automated testing tools and manual evaluation to ensure ongoing compliance.
                </p>
              </CardContent>
            </Card>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Our Commitment</h2>
              <p>
                CarbonConstruct is committed to ensuring digital accessibility for people with disabilities. 
                We are continually improving the user experience for everyone and applying the relevant 
                accessibility standards to ensure we provide equal access to all users in the Australian construction industry.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">WCAG 2.2 Compliance Details</h2>
              <p>Our application addresses the following WCAG 2.2 success criteria:</p>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Perceivable</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>1.1.1</strong> Non-text Content (Level A)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>1.3.1</strong> Info and Relationships (Level A)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>1.4.3</strong> Contrast (Minimum) (Level AA)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>1.4.4</strong> Resize Text (Level AA)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>1.4.11</strong> Non-text Contrast (Level AA)</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Operable</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>2.1.1</strong> Keyboard (Level A)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>2.4.1</strong> Bypass Blocks (Level A)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>2.4.7</strong> Focus Visible (Level AA)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>2.4.11</strong> Focus Not Obscured (Minimum) (Level AA) <Badge variant="secondary" className="ml-1 text-xs">NEW</Badge></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>2.5.7</strong> Dragging Movements (Level AA) <Badge variant="secondary" className="ml-1 text-xs">NEW</Badge></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>2.5.8</strong> Target Size (Minimum) (Level AA) <Badge variant="secondary" className="ml-1 text-xs">NEW</Badge></span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Understandable</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>3.1.1</strong> Language of Page (Level A)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>3.3.1</strong> Error Identification (Level A)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>3.3.2</strong> Labels or Instructions (Level A)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>3.3.7</strong> Redundant Entry (Level A) <Badge variant="secondary" className="ml-1 text-xs">NEW</Badge></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>3.3.8</strong> Accessible Authentication (Minimum) (Level AA) <Badge variant="secondary" className="ml-1 text-xs">NEW</Badge></span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Robust</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>4.1.2</strong> Name, Role, Value (Level A)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>4.1.3</strong> Status Messages (Level AA)</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">WCAG 2.2 New Requirements</h2>
              <p>WCAG 2.2 introduces new success criteria that we address:</p>
              
              <div className="space-y-3">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">2.4.11 Focus Not Obscured (Minimum) - Level AA</h3>
                  <p className="text-sm">
                    When a user interface component receives keyboard focus, the component is not entirely hidden due to 
                    author-created content. Our implementation ensures focused elements remain at least partially visible, 
                    with sticky headers and modals designed to avoid obscuring focus.
                  </p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">2.5.7 Dragging Movements - Level AA</h3>
                  <p className="text-sm">
                    All functionality that uses dragging can be operated with a single pointer without dragging. 
                    We provide alternative click/tap mechanisms for any drag-based interactions.
                  </p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">2.5.8 Target Size (Minimum) - Level AA</h3>
                  <p className="text-sm">
                    Interactive targets are at least 24x24 CSS pixels, except where the target is in a sentence/block of text, 
                    has an equivalent larger target, or is determined by the user agent. All buttons and interactive elements 
                    meet the minimum 24px requirement using <code className="bg-muted px-1 rounded">min-h-[44px] min-w-[44px]</code> or equivalent.
                  </p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">3.3.7 Redundant Entry - Level A</h3>
                  <p className="text-sm">
                    Information previously entered by or provided to the user that is required to be entered again 
                    in the same process is either auto-populated or available for selection. We use form autofill 
                    and session persistence to minimize redundant data entry.
                  </p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">3.3.8 Accessible Authentication (Minimum) - Level AA</h3>
                  <p className="text-sm">
                    Authentication does not require cognitive function tests. We support password managers, 
                    copy-paste for credentials, and OAuth social login options (Google) to reduce cognitive burden.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Technical Implementation</h2>
              <p>CarbonConstruct implements the following accessibility features:</p>
              
              <div className="space-y-3">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Semantic HTML & ARIA</h3>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Semantic HTML5 elements: <code className="bg-muted px-1 rounded">&lt;header&gt;</code>, <code className="bg-muted px-1 rounded">&lt;main&gt;</code>, <code className="bg-muted px-1 rounded">&lt;nav&gt;</code>, <code className="bg-muted px-1 rounded">&lt;footer&gt;</code></li>
                    <li>ARIA landmark roles for navigation and content regions</li>
                    <li>ARIA live regions for dynamic content announcements</li>
                    <li>Proper heading hierarchy (h1-h6)</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Keyboard Navigation</h3>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>All interactive elements accessible via keyboard (Tab, Enter, Space, Arrow keys)</li>
                    <li>Visible focus indicators using <code className="bg-muted px-1 rounded">:focus-visible</code> with 2px minimum</li>
                    <li>Logical tab order throughout the application</li>
                    <li>Skip navigation link for bypass blocks</li>
                    <li>Focus not obscured by sticky headers or modals (WCAG 2.4.11)</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Target Size & Touch</h3>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Minimum 24x24px target size for all interactive elements (WCAG 2.5.8)</li>
                    <li>44x44px recommended target size for primary actions</li>
                    <li>Adequate spacing between targets to prevent accidental activation</li>
                    <li>Alternative single-pointer actions for all drag operations (WCAG 2.5.7)</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Forms & Error Handling</h3>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>All form inputs have associated labels</li>
                    <li>Error messages use <code className="bg-muted px-1 rounded">role="alert"</code> for immediate announcement</li>
                    <li>Descriptive error messages explain how to fix issues</li>
                    <li>Required fields clearly indicated</li>
                    <li>Password manager and autofill support (WCAG 3.3.8)</li>
                    <li>Redundant entry minimized via session persistence (WCAG 3.3.7)</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Dynamic Content</h3>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>ARIA live regions announce calculation results to screen readers</li>
                    <li>Loading states include <code className="bg-muted px-1 rounded">role="status"</code> for assistive technology</li>
                    <li>Progress indicators include <code className="bg-muted px-1 rounded">aria-valuenow</code> attributes</li>
                    <li>Toast notifications accessible to screen readers</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Compatibility</h2>
              <p>Our website and application are designed to be compatible with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Screen readers:</strong> VoiceOver (macOS/iOS), NVDA (Windows), JAWS (Windows), TalkBack (Android)</li>
                <li><strong>Browsers:</strong> Chrome, Firefox, Safari, Edge (latest 2 major versions)</li>
                <li><strong>Browser zoom:</strong> Functional up to 400% magnification (WCAG 1.4.10)</li>
                <li><strong>High contrast modes:</strong> Windows High Contrast Mode, macOS Increased Contrast</li>
                <li><strong>Keyboard-only navigation:</strong> Full functionality without mouse</li>
                <li><strong>Voice control:</strong> Dragon NaturallySpeaking, Voice Control (macOS/iOS)</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Known Limitations
              </h2>
              <p>
                While we strive for comprehensive accessibility, some content may have limitations:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>PDF Reports:</strong> Generated PDF reports may not be fully accessible to screen readers. We provide HTML alternatives where possible and are working on improving PDF accessibility.</li>
                <li><strong>Charts and Graphs:</strong> Visual data representations include text alternatives and data tables, but complex interactive charts may require additional context.</li>
                <li><strong>Third-Party Content:</strong> Some embedded content from third-party services may not meet all accessibility standards.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Assessment Methodology</h2>
              <p>Our accessibility assessment includes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Automated Testing:</strong> axe-core accessibility engine, Playwright a11y tests, Lighthouse CI</li>
                <li><strong>Manual Testing:</strong> Keyboard navigation, screen reader testing, colour contrast verification</li>
                <li><strong>User Testing:</strong> Feedback from users with disabilities</li>
                <li><strong>Regular Audits:</strong> Quarterly accessibility reviews and continuous monitoring</li>
                <li><strong>WCAG 2.2 Checklist:</strong> Full compliance review against WCAG 2.2 Level AA criteria</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Australian Standards</h2>
              <p>
                This accessibility statement aligns with Australian requirements including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Disability Discrimination Act 1992 (Cth)</li>
                <li>Web Content Accessibility Guidelines (WCAG) 2.2</li>
                <li>AS EN 301 549:2020 - Accessibility requirements for ICT products and services</li>
                <li>Digital Transformation Agency (DTA) Accessibility Guidelines</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Feedback and Contact</h2>
              <p>
                We welcome your feedback on the accessibility of CarbonConstruct. If you encounter any 
                accessibility barriers or have suggestions for improvement, please contact us:
              </p>
              <Card className="mt-4">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <strong>Accessibility Team:</strong> 
                      <a href="mailto:accessibility@carbonconstruct.com.au" className="text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
                        accessibility@carbonconstruct.com.au
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <strong>General Enquiries:</strong> 
                      <a href="mailto:info@carbonconstruct.com.au" className="text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
                        info@carbonconstruct.com.au
                      </a>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    We aim to respond to accessibility feedback within 5 business days and will work with you 
                    to provide the information or functionality you need.
                  </p>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Continuous Improvement</h2>
              <p>
                We are committed to continually improving accessibility. Our approach includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Regular accessibility audits and testing</li>
                <li>Training our team on accessible design and development practices</li>
                <li>Incorporating accessibility into our design and development processes</li>
                <li>Engaging with users who have disabilities to understand their needs</li>
                <li>Staying current with accessibility standards and best practices</li>
                <li>WCAG 2.2 compliance monitoring and updates</li>
              </ul>
            </section>

            <div className="pt-6 border-t text-sm text-muted-foreground">
              <p>Last updated: {new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccessibilityStatement;