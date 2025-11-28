import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const AccessibilityStatement = () => {
  return (
    <>
      <SEOHead 
        title="Accessibility Statement | CarbonConstruct"
        description="CarbonConstruct's commitment to digital accessibility and inclusive design for all users in the Australian construction industry."
      />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          <h1 className="text-4xl font-bold text-foreground mb-8">Accessibility Statement</h1>
          
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Our Commitment</h2>
              <p>
                CarbonConstruct is committed to ensuring digital accessibility for people with disabilities. 
                We are continually improving the user experience for everyone and applying the relevant 
                accessibility standards to ensure we provide equal access to all users.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Conformance Status</h2>
              <p>
                We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. 
                These guidelines explain how to make web content more accessible for people with disabilities 
                and more user-friendly for everyone.
              </p>
              <p>
                Our website and application are designed to be compatible with:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Screen readers and other assistive technologies</li>
                <li>Keyboard-only navigation</li>
                <li>Browser zoom functionality up to 200%</li>
                <li>High contrast display settings</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Accessibility Features</h2>
              <p>CarbonConstruct includes the following accessibility features:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Semantic HTML:</strong> Proper heading structure and landmark regions for easy navigation</li>
                <li><strong>Keyboard Navigation:</strong> All interactive elements are accessible via keyboard</li>
                <li><strong>Focus Indicators:</strong> Clear visual indicators for focused elements</li>
                <li><strong>Alt Text:</strong> Descriptive alternative text for images and icons</li>
                <li><strong>Colour Contrast:</strong> Text and interactive elements meet WCAG AA contrast requirements</li>
                <li><strong>Responsive Design:</strong> Content adapts to different screen sizes and orientations</li>
                <li><strong>Form Labels:</strong> All form inputs have associated labels for screen readers</li>
                <li><strong>Error Messages:</strong> Clear and descriptive error messages for form validation</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Known Limitations</h2>
              <p>
                While we strive for comprehensive accessibility, some content may have limitations:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>PDF Reports:</strong> Generated PDF reports may not be fully accessible to screen readers. We are working on improving this.</li>
                <li><strong>Charts and Graphs:</strong> Visual data representations include text alternatives, but complex charts may require additional context.</li>
                <li><strong>Third-Party Content:</strong> Some embedded content from third-party services may not meet all accessibility standards.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Assistive Technology Compatibility</h2>
              <p>
                CarbonConstruct has been tested with the following assistive technologies:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>VoiceOver on macOS and iOS</li>
                <li>NVDA on Windows</li>
                <li>JAWS on Windows</li>
                <li>TalkBack on Android</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Feedback and Contact</h2>
              <p>
                We welcome your feedback on the accessibility of CarbonConstruct. If you encounter any 
                accessibility barriers or have suggestions for improvement, please contact us:
              </p>
              <ul className="list-none space-y-2">
                <li><strong>Email:</strong> <a href="mailto:accessibility@carbonconstruct.com.au" className="text-primary hover:underline">accessibility@carbonconstruct.com.au</a></li>
                <li><strong>General Enquiries:</strong> <a href="mailto:info@carbonconstruct.com.au" className="text-primary hover:underline">info@carbonconstruct.com.au</a></li>
              </ul>
              <p>
                We aim to respond to accessibility feedback within 5 business days and will work with you 
                to provide the information or functionality you need.
              </p>
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
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Australian Standards</h2>
              <p>
                This accessibility statement aligns with Australian requirements including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Disability Discrimination Act 1992 (Cth)</li>
                <li>Web Content Accessibility Guidelines (WCAG) 2.1</li>
                <li>AS EN 301 549 - Accessibility requirements for ICT products and services</li>
              </ul>
            </section>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default AccessibilityStatement;