import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, BookOpen, MessageCircle, ExternalLink, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { restartOnboarding } from "@/components/OnboardingTutorial";
import { ContactSupportDialog } from "@/components/ContactSupportDialog";

const Help = () => {
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <HelpCircle className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Help & Resources</h1>
            <p className="text-muted-foreground">Find answers and learn how to use CarbonConstruct effectively</p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card variant="glass" className="glass-glow-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Getting Started
              </CardTitle>
              <CardDescription>Learn the basics of carbon emission calculations for Australian construction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>CarbonConstruct helps you measure and track greenhouse gas emissions across three scopes, aligned with Australian standards and NCC Section J requirements:</p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li><strong>Scope 1:</strong> Direct emissions from owned or controlled sources (on-site fuel, company vehicles)</li>
                  <li><strong>Scope 2:</strong> Indirect emissions from purchased energy (varies by Australian state grid mix)</li>
                  <li><strong>Scope 3:</strong> All other indirect emissions in your value chain (materials, transport, waste)</li>
                </ul>
                <Button onClick={restartOnboarding} className="w-full sm:w-auto mt-4" variant="outline">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Restart Tutorial
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="glass-glow-hover">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do I create a new project?</AccordionTrigger>
                  <AccordionContent>
                    Click the "New Project" button on your dashboard. Enter project details including name, location (Australian state), size in square metres, and NCC compliance level. Your location determines which state-specific electricity emission factors are applied.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>What emission factors are used in calculations?</AccordionTrigger>
                  <AccordionContent>
                    CarbonConstruct uses Australian National Greenhouse Accounts (NGA) Factors 2023, which are the official Australian government emission factors. State-specific electricity factors account for different grid mixes (e.g., Tasmania's hydro vs Victoria's brown coal). Material embodied carbon uses data from EPDs, AusLCI, and ICE databases.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>How does Section J compliance work?</AccordionTrigger>
                  <AccordionContent>
                    Section J of the National Construction Code (NCC) sets energy efficiency requirements for buildings. CarbonConstruct tracks emissions against Section J benchmarks and provides compliance status indicators. Projects targeting NCC 2022 compliance should aim for reduced operational energy use alongside embodied carbon tracking.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>What are Green Star and NABERS ratings?</AccordionTrigger>
                  <AccordionContent>
                    <strong>Green Star</strong> is the GBCA's rating system: 4-Star is best practice, 5-Star is Australian excellence, 6-Star is world leadership. <strong>NABERS</strong> rates operational performance from 1-6 stars. CarbonConstruct helps track both by providing emission calculations that align with their credit requirements.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>How do I use the AI BOQ Import feature?</AccordionTrigger>
                  <AccordionContent>
                    The AI BOQ Import analyzes your Bill of Quantities text and automatically extracts materials with quantities. Simply paste your BOQ text or upload a file, and our AI will identify construction materials, match them to emission factors, and calculate embodied carbon. It supports Australian material standards and common BOQ formats.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>How do I export my emissions report?</AccordionTrigger>
                  <AccordionContent>
                    Navigate to the Reports section, select your report type (Executive Summary, Detailed Technical, or Compliance-focused), and click "Export as PDF". Reports include all scope breakdowns, compliance status, and methodology notes suitable for regulatory submissions or stakeholder presentations.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card variant="glass" className="glass-glow-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Need More Help?
              </CardTitle>
              <CardDescription>Get additional support and resources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => window.open('https://carbonconstruct.com.au/docs', '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  Documentation
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setContactDialogOpen(true)}
                >
                  <MessageCircle className="h-4 w-4" />
                  Contact Support
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                For technical support or questions about Australian emission calculations and compliance, please reach out to our team.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <ContactSupportDialog 
        open={contactDialogOpen} 
        onOpenChange={setContactDialogOpen}
      />
    </div>
  );
};

export default Help;